// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {BasePaymaster} from "@account-abstraction/contracts/core/BasePaymaster.sol";
import {IEntryPoint} from "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {IPaymaster} from "@account-abstraction/contracts/interfaces/IPaymaster.sol";
import {PackedUserOperation} from "@account-abstraction/contracts/interfaces/PackedUserOperation.sol";
import {SIG_VALIDATION_FAILED, SIG_VALIDATION_SUCCESS} from "@account-abstraction/contracts/core/Helpers.sol";

import {AgentRegistry} from "./AgentRegistry.sol";
import {BondVault} from "./BondVault.sol";

/// @title  AgentPaymaster
/// @notice Credit-card-style billing paymaster. Sponsors gas for bonded
///         agents during a 30-day cycle, then bills the cumulative gas cost
///         plus a small protocol fee. Bills are paid by the agent's owner
///         or auto-settled from the agent's bond after a 7-day grace period.
contract AgentPaymaster is BasePaymaster {
    uint256 public constant BILLING_CYCLE = 30 days;
    uint256 public constant GRACE_PERIOD = 7 days;
    uint256 public constant MAX_PROTOCOL_FEE_BPS = 1_000; // 10% hard cap
    uint256 public constant BPS_DENOMINATOR = 10_000;

    AgentRegistry public immutable registry;
    BondVault public immutable bondVault;

    address public treasury;
    uint256 public protocolFeeBps;

    mapping(address agent => uint256) public unbilledGasCost;
    mapping(address agent => uint256) public outstandingGas;
    mapping(address agent => uint256) public outstandingFee;
    mapping(address agent => uint256) public lastBillAt;

    event TreasurySet(address indexed treasury);
    event ProtocolFeeBpsSet(uint256 bps);
    event GasAccrued(address indexed agent, uint256 amount);
    event BillGenerated(address indexed agent, uint256 gas, uint256 fee, uint256 cycleAnchor);
    event BillPaid(address indexed agent, address indexed payer, uint256 gas, uint256 fee);
    event BillSettledFromBond(address indexed agent, uint256 gas, uint256 fee);

    error ZeroAddress();
    error FeeTooHigh();
    error CycleNotElapsed();
    error NoBill();
    error NoUnbilledGas();
    error InsufficientPayment();
    error GraceNotElapsed();
    error TransferFailed();

    constructor(
        IEntryPoint _entryPoint,
        AgentRegistry _registry,
        BondVault _bondVault,
        address _treasury,
        uint256 _protocolFeeBps
    ) BasePaymaster(_entryPoint, msg.sender) {
        if (
            address(_registry) == address(0) ||
            address(_bondVault) == address(0) ||
            _treasury == address(0)
        ) revert ZeroAddress();
        if (_protocolFeeBps > MAX_PROTOCOL_FEE_BPS) revert FeeTooHigh();

        registry = _registry;
        bondVault = _bondVault;
        treasury = _treasury;
        protocolFeeBps = _protocolFeeBps;
    }

    /// @notice Accept inbound ETH from BondVault.debitBond during auto-settle.
    receive() external payable {}

    // -------------------------------------------------------------
    // Owner controls
    // -------------------------------------------------------------

    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert ZeroAddress();
        treasury = newTreasury;
        emit TreasurySet(newTreasury);
    }

    function setProtocolFeeBps(uint256 newBps) external onlyOwner {
        if (newBps > MAX_PROTOCOL_FEE_BPS) revert FeeTooHigh();
        protocolFeeBps = newBps;
        emit ProtocolFeeBpsSet(newBps);
    }

    // -------------------------------------------------------------
    // ERC-4337 paymaster hooks
    // -------------------------------------------------------------

    /// @notice Approve sponsorship iff agent is live, bonded, and has no
    ///         outstanding bill. Returns the agent address as context so
    ///         _postOp can attribute the gas cost.
    function _validatePaymasterUserOp(
        PackedUserOperation calldata userOp,
        bytes32 /* userOpHash */,
        uint256 /* maxCost */
    ) internal view override returns (bytes memory context, uint256 validationData) {
        address agent = userOp.sender;
        if (!registry.isRegistered(agent)) return ("", SIG_VALIDATION_FAILED);
        if (!bondVault.hasMinBond(agent)) return ("", SIG_VALIDATION_FAILED);
        if (outstandingGas[agent] + outstandingFee[agent] > 0) {
            return ("", SIG_VALIDATION_FAILED);
        }
        return (abi.encode(agent), SIG_VALIDATION_SUCCESS);
    }

    /// @notice Accrue actualGasCost into the agent's unbilled balance.
    function _postOp(
        IPaymaster.PostOpMode /* mode */,
        bytes calldata context,
        uint256 actualGasCost,
        uint256 /* actualUserOpFeePerGas */
    ) internal override {
        address agent = abi.decode(context, (address));
        unbilledGasCost[agent] += actualGasCost;
        if (lastBillAt[agent] == 0) {
            // Anchor the first cycle to the first sponsored op.
            lastBillAt[agent] = block.timestamp;
        }
        emit GasAccrued(agent, actualGasCost);
    }

    // -------------------------------------------------------------
    // Billing
    // -------------------------------------------------------------

    /// @notice Generate the agent's bill for the elapsed cycle. Permissionless.
    function generateBill(address agent) external {
        if (unbilledGasCost[agent] == 0) revert NoUnbilledGas();
        uint256 anchor = lastBillAt[agent];
        if (anchor == 0 || block.timestamp < anchor + BILLING_CYCLE) revert CycleNotElapsed();

        uint256 gas = unbilledGasCost[agent];
        uint256 fee = (gas * protocolFeeBps) / BPS_DENOMINATOR;

        outstandingGas[agent] += gas;
        outstandingFee[agent] += fee;
        unbilledGasCost[agent] = 0;
        lastBillAt[agent] = block.timestamp;

        emit BillGenerated(agent, gas, fee, block.timestamp);
    }

    /// @notice Pay an agent's outstanding bill. Anyone may pay (typically
    ///         the agent's owner from their EOA).
    /// @dev    Gas portion refunds the paymaster's EntryPoint deposit; fee
    ///         portion is sent to the treasury. Excess is refunded to payer.
    function payBill(address agent) external payable {
        uint256 gas = outstandingGas[agent];
        uint256 fee = outstandingFee[agent];
        uint256 total = gas + fee;
        if (total == 0) revert NoBill();
        if (msg.value < total) revert InsufficientPayment();

        outstandingGas[agent] = 0;
        outstandingFee[agent] = 0;

        if (gas > 0) entryPoint().depositTo{value: gas}(address(this));
        if (fee > 0) {
            (bool ok, ) = treasury.call{value: fee}("");
            if (!ok) revert TransferFailed();
        }
        if (msg.value > total) {
            (bool ok, ) = msg.sender.call{value: msg.value - total}("");
            if (!ok) revert TransferFailed();
        }

        emit BillPaid(agent, msg.sender, gas, fee);
    }

    /// @notice After GRACE_PERIOD, settle the bill from the agent's bond.
    ///         Permissionless — any keeper may invoke.
    function autoSettleFromBond(address agent) external {
        uint256 gas = outstandingGas[agent];
        uint256 fee = outstandingFee[agent];
        uint256 total = gas + fee;
        if (total == 0) revert NoBill();
        if (block.timestamp < lastBillAt[agent] + GRACE_PERIOD) revert GraceNotElapsed();

        outstandingGas[agent] = 0;
        outstandingFee[agent] = 0;

        bondVault.debitBond(agent, total, payable(address(this)));

        if (gas > 0) entryPoint().depositTo{value: gas}(address(this));
        if (fee > 0) {
            (bool ok, ) = treasury.call{value: fee}("");
            if (!ok) revert TransferFailed();
        }

        emit BillSettledFromBond(agent, gas, fee);
    }

    /// @notice Total wei owed for an agent (gas + fee).
    function billOf(address agent) external view returns (uint256) {
        return outstandingGas[agent] + outstandingFee[agent];
    }
}
