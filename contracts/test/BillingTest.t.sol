// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Fixture} from "./utils/Fixture.sol";
import {AgentAccount} from "../src/AgentAccount.sol";
import {AgentPaymaster} from "../src/AgentPaymaster.sol";

import {IPaymaster} from "@account-abstraction/contracts/interfaces/IPaymaster.sol";
import {PackedUserOperation} from "@account-abstraction/contracts/interfaces/PackedUserOperation.sol";

contract BillingTest is Fixture {
    address internal owner;
    address internal payer;
    AgentAccount internal agent;

    bytes32 internal constant FAKE_OP_HASH = keccak256("op-hash");

    function setUp() public {
        _deploy();
        owner = makeAddr("owner");
        payer = makeAddr("payer");
        // Stake 2 ETH so bond covers any test bill plus MIN_BOND.
        agent = _createAgent(owner, keccak256("a"), 2 ether);
    }

    // ---------------------------------------------------------------
    // Validation
    // ---------------------------------------------------------------

    function testValidatePassesBondedAgent() public {
        PackedUserOperation memory op = _emptyOp(address(agent));

        vm.prank(address(entryPoint));
        (bytes memory ctx, uint256 vd) = paymaster.validatePaymasterUserOp(op, FAKE_OP_HASH, 0);

        assertEq(vd, 0); // SIG_VALIDATION_SUCCESS
        assertGt(ctx.length, 0); // context = encoded agent address
        assertEq(abi.decode(ctx, (address)), address(agent));
    }

    function testValidateRejectsUnregistered() public {
        PackedUserOperation memory op = _emptyOp(makeAddr("random"));

        vm.prank(address(entryPoint));
        (, uint256 vd) = paymaster.validatePaymasterUserOp(op, FAKE_OP_HASH, 0);

        assertEq(vd, 1);
    }

    function testValidateRejectsAgentWithOutstandingBill() public {
        _accrue(address(agent), 1 ether);
        vm.warp(block.timestamp + 30 days + 1);
        paymaster.generateBill(address(agent));

        PackedUserOperation memory op = _emptyOp(address(agent));
        vm.prank(address(entryPoint));
        (, uint256 vd) = paymaster.validatePaymasterUserOp(op, FAKE_OP_HASH, 0);

        assertEq(vd, 1);
    }

    // ---------------------------------------------------------------
    // Accrual + bill generation
    // ---------------------------------------------------------------

    function testPostOpAccruesGas() public {
        _accrue(address(agent), 0.001 ether);
        assertEq(paymaster.unbilledGasCost(address(agent)), 0.001 ether);
    }

    function testGenerateBillRequiresCycleElapsed() public {
        _accrue(address(agent), 0.001 ether);

        vm.expectRevert(AgentPaymaster.CycleNotElapsed.selector);
        paymaster.generateBill(address(agent));
    }

    function testGenerateBillCreatesGasAndFee() public {
        _accrue(address(agent), 1 ether);
        vm.warp(block.timestamp + 30 days + 1);

        paymaster.generateBill(address(agent));

        // 1% protocol fee on 1 ether = 0.01 ether.
        assertEq(paymaster.outstandingGas(address(agent)), 1 ether);
        assertEq(paymaster.outstandingFee(address(agent)), 0.01 ether);
        assertEq(paymaster.unbilledGasCost(address(agent)), 0);
        assertEq(paymaster.billOf(address(agent)), 1.01 ether);
    }

    // ---------------------------------------------------------------
    // payBill
    // ---------------------------------------------------------------

    function testPayBillSplitsGasAndFee() public {
        _accrue(address(agent), 1 ether);
        vm.warp(block.timestamp + 30 days + 1);
        paymaster.generateBill(address(agent));

        vm.deal(payer, 2 ether);
        uint256 epDepositBefore = entryPoint.balanceOf(address(paymaster));
        uint256 treasuryBefore = treasury.balance;

        vm.prank(payer);
        paymaster.payBill{value: 1.01 ether}(address(agent));

        assertEq(paymaster.outstandingGas(address(agent)), 0);
        assertEq(paymaster.outstandingFee(address(agent)), 0);
        assertEq(entryPoint.balanceOf(address(paymaster)), epDepositBefore + 1 ether);
        assertEq(treasury.balance, treasuryBefore + 0.01 ether);
    }

    function testPayBillRefundsOverpayment() public {
        _accrue(address(agent), 1 ether);
        vm.warp(block.timestamp + 30 days + 1);
        paymaster.generateBill(address(agent));

        vm.deal(payer, 2 ether);
        uint256 payerBefore = payer.balance;

        vm.prank(payer);
        paymaster.payBill{value: 1.5 ether}(address(agent));

        // Spent 1.01, refunded 0.49.
        assertEq(payer.balance, payerBefore - 1.01 ether);
    }

    function testPayBillRevertsOnInsufficient() public {
        _accrue(address(agent), 1 ether);
        vm.warp(block.timestamp + 30 days + 1);
        paymaster.generateBill(address(agent));

        vm.deal(payer, 2 ether);
        vm.expectRevert(AgentPaymaster.InsufficientPayment.selector);
        vm.prank(payer);
        paymaster.payBill{value: 0.5 ether}(address(agent));
    }

    // ---------------------------------------------------------------
    // autoSettleFromBond
    // ---------------------------------------------------------------

    function testAutoSettleRevertsBeforeGrace() public {
        _accrue(address(agent), 0.5 ether);
        vm.warp(block.timestamp + 30 days + 1);
        paymaster.generateBill(address(agent));

        vm.expectRevert(AgentPaymaster.GraceNotElapsed.selector);
        paymaster.autoSettleFromBond(address(agent));
    }

    function testAutoSettleAfterGracePullsFromBond() public {
        _accrue(address(agent), 0.5 ether);
        vm.warp(block.timestamp + 30 days + 1);
        paymaster.generateBill(address(agent));

        // Total bill: 0.5 (gas) + 0.005 (1% fee) = 0.505 ether.
        vm.warp(block.timestamp + 7 days + 1);

        uint256 bondBefore = bondVault.getBond(address(agent));
        uint256 epDepositBefore = entryPoint.balanceOf(address(paymaster));
        uint256 treasuryBefore = treasury.balance;

        paymaster.autoSettleFromBond(address(agent));

        assertEq(paymaster.outstandingGas(address(agent)), 0);
        assertEq(paymaster.outstandingFee(address(agent)), 0);
        assertEq(bondVault.getBond(address(agent)), bondBefore - 0.505 ether);
        assertEq(entryPoint.balanceOf(address(paymaster)), epDepositBefore + 0.5 ether);
        assertEq(treasury.balance, treasuryBefore + 0.005 ether);
    }

    // ---------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------

    function _accrue(address a, uint256 cost) internal {
        bytes memory ctx = abi.encode(a);
        vm.prank(address(entryPoint));
        paymaster.postOp(IPaymaster.PostOpMode.opSucceeded, ctx, cost, 0);
    }

    function _emptyOp(address sender) internal pure returns (PackedUserOperation memory) {
        return PackedUserOperation({
            sender: sender,
            nonce: 0,
            initCode: "",
            callData: "",
            accountGasLimits: bytes32(0),
            preVerificationGas: 0,
            gasFees: bytes32(0),
            paymasterAndData: "",
            signature: ""
        });
    }
}
