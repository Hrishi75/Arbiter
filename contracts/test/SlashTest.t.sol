// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Fixture} from "./utils/Fixture.sol";
import {AgentAccount} from "../src/AgentAccount.sol";
import {SlashVerifier} from "../src/SlashVerifier.sol";

contract SlashTest is Fixture {
    address internal owner;
    address internal reporter;
    AgentAccount internal agent;

    function setUp() public {
        _deploy();
        owner = makeAddr("owner");
        reporter = makeAddr("reporter");
        agent = _createAgent(owner, keccak256("agent-1"), 1 ether);
    }

    // ---------------------------------------------------------------
    // report()
    // ---------------------------------------------------------------

    function testFileReport() public {
        vm.expectEmit(true, true, true, true);
        emit SlashVerifier.ReportCreated(
            0,
            address(agent),
            reporter,
            0.5 ether,
            "test reason",
            "ipfs://evidence"
        );

        uint256 id = _fileReport(reporter, address(agent), 0.5 ether);
        assertEq(id, 0);
        assertEq(slashVerifier.reportsCount(), 1);

        SlashVerifier.SlashReport memory r = slashVerifier.getReport(id);
        assertEq(r.agent, address(agent));
        assertEq(r.reporter, reporter);
        assertEq(r.amount, 0.5 ether);
        assertFalse(r.disputed);
        assertFalse(r.executed);
    }

    function testReportRevertsForUnregisteredAgent() public {
        address random = makeAddr("random");
        vm.expectRevert(SlashVerifier.AgentNotRegistered.selector);
        vm.prank(reporter);
        slashVerifier.report(random, 0.5 ether, "r", "ipfs://e");
    }

    function testReportRevertsForZeroAmount() public {
        vm.expectRevert(SlashVerifier.ZeroAmount.selector);
        vm.prank(reporter);
        slashVerifier.report(address(agent), 0, "r", "ipfs://e");
    }

    function testReportRevertsForEmptyEvidence() public {
        vm.expectRevert(SlashVerifier.EmptyEvidence.selector);
        vm.prank(reporter);
        slashVerifier.report(address(agent), 0.5 ether, "r", "");
    }

    // ---------------------------------------------------------------
    // dispute()
    // ---------------------------------------------------------------

    function testDisputeWithinWindow() public {
        uint256 id = _fileReport(reporter, address(agent), 0.5 ether);

        vm.expectEmit(true, true, false, false);
        emit SlashVerifier.ReportDisputed(id, owner);

        vm.prank(owner);
        slashVerifier.dispute(id);

        assertTrue(slashVerifier.getReport(id).disputed);
    }

    function testDisputeRevertsAfterWindow() public {
        uint256 id = _fileReport(reporter, address(agent), 0.5 ether);
        vm.warp(block.timestamp + 48 hours + 1);

        vm.expectRevert(SlashVerifier.DisputeWindowClosed.selector);
        vm.prank(owner);
        slashVerifier.dispute(id);
    }

    function testDisputeRevertsForNonOwner() public {
        uint256 id = _fileReport(reporter, address(agent), 0.5 ether);
        address attacker = makeAddr("attacker");

        vm.expectRevert(SlashVerifier.NotAgentOwner.selector);
        vm.prank(attacker);
        slashVerifier.dispute(id);
    }

    // ---------------------------------------------------------------
    // executeSlash()
    // ---------------------------------------------------------------

    function testExecuteBeforeWindowReverts() public {
        uint256 id = _fileReport(reporter, address(agent), 0.5 ether);

        vm.expectRevert(SlashVerifier.DisputeWindowOpen.selector);
        slashVerifier.executeSlash(id);
    }

    function testExecuteAfterWindowSlashesBond() public {
        uint256 id = _fileReport(reporter, address(agent), 0.5 ether);
        vm.warp(block.timestamp + 48 hours + 1);

        uint256 bondBefore = bondVault.getBond(address(agent));
        uint256 treasuryBefore = treasury.balance;

        vm.expectEmit(true, true, false, true);
        emit SlashVerifier.SlashExecuted(id, address(agent), 0.5 ether);

        slashVerifier.executeSlash(id);

        assertEq(bondVault.getBond(address(agent)), bondBefore - 0.5 ether);
        assertEq(treasury.balance, treasuryBefore + 0.5 ether);
        assertTrue(bondVault.isSlashed(address(agent)));
        assertTrue(slashVerifier.getReport(id).executed);
    }

    function testExecuteAfterDisputeReverts() public {
        uint256 id = _fileReport(reporter, address(agent), 0.5 ether);

        vm.prank(owner);
        slashVerifier.dispute(id);

        vm.warp(block.timestamp + 48 hours + 1);

        vm.expectRevert(SlashVerifier.AlreadyDisputed.selector);
        slashVerifier.executeSlash(id);
    }

    function testExecuteOnAlreadySlashedAgentIsNoOp() public {
        // First slash: drains 0.5 ETH and marks agent slashed.
        uint256 id1 = _fileReport(reporter, address(agent), 0.5 ether);
        vm.warp(block.timestamp + 48 hours + 1);
        slashVerifier.executeSlash(id1);
        assertTrue(bondVault.isSlashed(address(agent)));

        // Second report on the same agent.
        uint256 id2 = _fileReport(reporter, address(agent), 0.3 ether);
        vm.warp(block.timestamp + 48 hours + 1);

        // executeSlash should succeed but be a no-op (amount = 0).
        vm.expectEmit(true, true, false, true);
        emit SlashVerifier.SlashExecuted(id2, address(agent), 0);

        slashVerifier.executeSlash(id2);

        assertTrue(slashVerifier.getReport(id2).executed);
    }

    function testExecuteIsPermissionless() public {
        uint256 id = _fileReport(reporter, address(agent), 0.5 ether);
        vm.warp(block.timestamp + 48 hours + 1);

        address randomKeeper = makeAddr("keeper");
        vm.prank(randomKeeper);
        slashVerifier.executeSlash(id);

        assertTrue(bondVault.isSlashed(address(agent)));
    }
}
