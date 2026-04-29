// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Fixture} from "./utils/Fixture.sol";
import {AgentAccount} from "../src/AgentAccount.sol";
import {AgentRegistry} from "../src/AgentRegistry.sol";
import {ReputationHook} from "../src/ReputationHook.sol";

contract LifecycleTest is Fixture {
    address internal owner;
    AgentAccount internal agent;

    function setUp() public {
        _deploy();
        owner = makeAddr("owner");
        agent = _createAgent(owner, keccak256("salt-1"), 0.5 ether);
    }

    function testAgentRegistered() public view {
        assertTrue(registry.isRegistered(address(agent)));
        AgentRegistry.Agent memory a = registry.getAgent(address(agent));
        assertEq(a.owner, owner);
        assertTrue(a.active);
    }

    function testBondStaked() public view {
        assertEq(bondVault.getBond(address(agent)), 0.5 ether);
        assertTrue(bondVault.hasMinBond(address(agent)));
    }

    function testInitialScore() public view {
        assertEq(reputation.getScore(address(agent)), 100);
    }

    function testRecordOpSuccess() public {
        vm.prank(address(agent));
        reputation.recordOp(true, bytes32(uint256(1)));

        assertEq(reputation.getScore(address(agent)), 101);
        assertEq(reputation.getAttestationCount(address(agent)), 1);
    }

    function testRecordOpFailure() public {
        vm.prank(address(agent));
        reputation.recordOp(false, bytes32(uint256(1)));

        assertEq(reputation.getScore(address(agent)), 90);
    }

    function testScoreCapsAt200() public {
        for (uint256 i = 0; i < 200; i++) {
            vm.prank(address(agent));
            reputation.recordOp(true, bytes32(i));
        }
        assertEq(reputation.getScore(address(agent)), 200);
    }

    function testScoreFloorsAtZero() public {
        // 100 / 10 = 10 hits to reach 0; do 20 to confirm floor.
        for (uint256 i = 0; i < 20; i++) {
            vm.prank(address(agent));
            reputation.recordOp(false, bytes32(i));
        }
        assertEq(reputation.getScore(address(agent)), 0);
    }

    function testLowReputationEmitsOnce() public {
        // Eight failures takes score 100 -> 20 (still at threshold, no event).
        for (uint256 i = 0; i < 8; i++) {
            vm.prank(address(agent));
            reputation.recordOp(false, bytes32(i));
        }
        assertEq(reputation.getScore(address(agent)), 20);

        // Ninth failure crosses 20 -> 10. Should emit.
        vm.expectEmit(true, false, false, true);
        emit ReputationHook.LowReputation(address(agent), 10);
        vm.prank(address(agent));
        reputation.recordOp(false, bytes32(uint256(99)));

        // Tenth failure stays below threshold; no further event expected.
        // (vm.expectEmit only asserts ON the next emitting call; we just
        //  verify the score keeps moving.)
        vm.prank(address(agent));
        reputation.recordOp(false, bytes32(uint256(100)));
        assertEq(reputation.getScore(address(agent)), 0);
    }

    function testExecuteCallsRecordOp() public {
        address target = makeAddr("target");

        vm.prank(address(entryPoint));
        agent.execute(target, 0, "");

        // Successful inner call (target has no code, low-level call returns
        // true) should bump the score by SUCCESS_DELTA = 1.
        assertEq(reputation.getScore(address(agent)), 101);
    }

    function testFactoryIdempotent() public {
        // Second call with the same (owner, salt) returns the same address
        // without redeploying or re-registering.
        bytes32 salt = keccak256("salt-1");
        AgentAccount again = factory.createAccount(owner, salt, keccak256("any"), "any");
        assertEq(address(again), address(agent));
    }

    function testDeactivateByOwner() public {
        vm.prank(owner);
        registry.deactivate(address(agent));
        assertFalse(registry.isRegistered(address(agent)));
    }
}
