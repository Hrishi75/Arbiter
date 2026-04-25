// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AgentRegistry} from "./AgentRegistry.sol";

/// @title  BondVault
/// @notice Holds ETH bonds that back each Arbiter agent. Bonds are slashed
///         by SlashVerifier when an uncontested misbehaviour report executes.
contract BondVault is Ownable {
    uint256 public constant MIN_BOND = 0.1 ether;
    uint256 public constant UNSTAKE_DELAY = 7 days;
    uint256 public constant SLASH_DELAY = 48 hours;

    /// @notice Registry used to resolve agent ownership.
    AgentRegistry public immutable registry;

    /// @notice Recipient of all slashed ETH. Immutable for governance simplicity.
    address public immutable treasury;

    /// @notice The sole verifier permitted to call {slash}.
    address public slashVerifier;

    /// @dev Current locked bond per agent account.
    mapping(address account => uint256) public bonds;

    /// @dev Timestamp of the pending unstake request, 0 if none.
    mapping(address account => uint64) public unstakeRequestedAt;

    /// @dev Permanent slash flag. Once true, agent cannot restake or withdraw.
    mapping(address account => bool) public slashed;

    event SlashVerifierSet(address indexed verifier);
    event Staked(address indexed agent, address indexed from, uint256 amount);
    event UnstakeRequested(address indexed agent, uint64 requestedAt);
    event Withdrawn(address indexed agent, address indexed to, uint256 amount);
    event AgentSlashed(address indexed agent, uint256 amount, address treasury);

    error NotVerifier();
    error NotAgentOwner();
    error AgentIsSlashed();
    error VerifierAlreadySet();
    error UnstakeAlreadyRequested();
    error UnstakeNotRequested();
    error UnstakeDelayNotElapsed();
    error NothingToWithdraw();
    error ZeroAmount();
    error ZeroAddress();
    error TransferFailed();

    constructor(address initialOwner, AgentRegistry _registry, address _treasury)
        Ownable(initialOwner)
    {
        if (address(_registry) == address(0) || _treasury == address(0)) revert ZeroAddress();
        registry = _registry;
        treasury = _treasury;
    }

    /// @notice Wire the slash verifier. Owner-only, one-shot.
    function setSlashVerifier(address verifier) external onlyOwner {
        if (verifier == address(0)) revert ZeroAddress();
        if (slashVerifier != address(0)) revert VerifierAlreadySet();
        slashVerifier = verifier;
        emit SlashVerifierSet(verifier);
    }

    /// @notice Stake ETH on behalf of an agent account.
    /// @dev    Anyone can top up any agent's bond. The msg.value is credited
    ///         to `agent`, not to msg.sender.
    function stake(address agent) external payable {
        if (msg.value == 0) revert ZeroAmount();
        if (slashed[agent]) revert AgentIsSlashed();
        bonds[agent] += msg.value;
        emit Staked(agent, msg.sender, msg.value);
    }

    /// @notice Start the 7-day cooldown before bond can be withdrawn.
    /// @dev    Callable only by the agent's owner (per AgentRegistry).
    function requestUnstake(address agent) external {
        _onlyAgentOwner(agent);
        if (unstakeRequestedAt[agent] != 0) revert UnstakeAlreadyRequested();
        unstakeRequestedAt[agent] = uint64(block.timestamp);
        emit UnstakeRequested(agent, uint64(block.timestamp));
    }

    /// @notice Withdraw bond after the unstake delay has elapsed.
    /// @dev    Sends ETH to `to` (owner chooses destination).
    function withdrawBond(address agent, address to) external {
        _onlyAgentOwner(agent);
        if (to == address(0)) revert ZeroAddress();
        if (slashed[agent]) revert AgentIsSlashed();

        uint64 requested = unstakeRequestedAt[agent];
        if (requested == 0) revert UnstakeNotRequested();
        if (block.timestamp < requested + UNSTAKE_DELAY) revert UnstakeDelayNotElapsed();

        uint256 amount = bonds[agent];
        if (amount == 0) revert NothingToWithdraw();

        bonds[agent] = 0;
        unstakeRequestedAt[agent] = 0;

        (bool ok, ) = to.call{value: amount}("");
        if (!ok) revert TransferFailed();

        emit Withdrawn(agent, to, amount);
    }

    /// @notice Slash an agent's bond. Verifier-only.
    /// @param  agent  The agent account being slashed.
    /// @param  amount Requested slash amount; capped at current bond.
    function slash(address agent, uint256 amount) external {
        if (msg.sender != slashVerifier) revert NotVerifier();
        if (slashed[agent]) revert AgentIsSlashed();
        if (amount == 0) revert ZeroAmount();

        uint256 bal = bonds[agent];
        uint256 take = amount > bal ? bal : amount;

        bonds[agent] = bal - take;
        slashed[agent] = true;

        (bool ok, ) = treasury.call{value: take}("");
        if (!ok) revert TransferFailed();

        emit AgentSlashed(agent, take, treasury);
    }

    /// @notice Bond balance of an agent.
    function getBond(address agent) external view returns (uint256) {
        return bonds[agent];
    }

    /// @notice True iff agent has been slashed.
    function isSlashed(address agent) external view returns (bool) {
        return slashed[agent];
    }

    /// @notice True iff agent currently meets the minimum bond.
    function hasMinBond(address agent) external view returns (bool) {
        return bonds[agent] >= MIN_BOND && !slashed[agent];
    }

    function _onlyAgentOwner(address agent) internal view {
        if (registry.getAgent(agent).owner != msg.sender) revert NotAgentOwner();
    }
}
