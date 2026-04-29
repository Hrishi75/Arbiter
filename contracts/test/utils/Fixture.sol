// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {EntryPoint} from "@account-abstraction/contracts/core/EntryPoint.sol";
import {IEntryPoint} from "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {IEAS} from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";

import {AgentRegistry} from "../../src/AgentRegistry.sol";
import {BondVault} from "../../src/BondVault.sol";
import {ReputationHook} from "../../src/ReputationHook.sol";
import {SlashVerifier} from "../../src/SlashVerifier.sol";
import {AgentPaymaster} from "../../src/AgentPaymaster.sol";
import {AgentAccountFactory} from "../../src/AgentAccountFactory.sol";
import {AgentAccount} from "../../src/AgentAccount.sol";

/// @notice Shared deployment harness for Arbiter tests. Inherit, call
///         `_deploy()` in setUp, and use the helpers to spin up agents.
abstract contract Fixture is Test {
    EntryPoint internal entryPoint;
    AgentRegistry internal registry;
    BondVault internal bondVault;
    ReputationHook internal reputation;
    SlashVerifier internal slashVerifier;
    AgentPaymaster internal paymaster;
    AgentAccountFactory internal factory;

    address internal deployer;
    address internal treasury;
    address internal easStub;

    function _deploy() internal {
        deployer = address(this);
        treasury = makeAddr("treasury");
        easStub = makeAddr("eas-stub"); // never invoked while schemaUID == 0

        entryPoint = new EntryPoint();

        registry = new AgentRegistry(deployer);
        bondVault = new BondVault(deployer, registry, treasury);
        reputation = new ReputationHook(deployer, registry, IEAS(easStub));
        slashVerifier = new SlashVerifier(bondVault, registry);
        paymaster = new AgentPaymaster(
            IEntryPoint(address(entryPoint)),
            registry,
            bondVault,
            treasury,
            100 // 1% protocol fee
        );
        factory = new AgentAccountFactory(
            IEntryPoint(address(entryPoint)),
            registry,
            bondVault,
            reputation
        );

        registry.setFactory(address(factory));
        bondVault.setSlashVerifier(address(slashVerifier));
        bondVault.setPaymaster(address(paymaster));
    }

    /// @notice Register + (optionally) stake an agent in one call.
    function _createAgent(address owner, bytes32 salt, uint256 stakeAmount)
        internal
        returns (AgentAccount account)
    {
        bytes32 modelHash = keccak256(abi.encodePacked("model", salt));
        account = factory.createAccount(owner, salt, modelHash, "ipfs://meta");
        if (stakeAmount > 0) {
            vm.deal(owner, stakeAmount);
            vm.prank(owner);
            bondVault.stake{value: stakeAmount}(address(account));
        }
    }

    /// @notice File a slash report. Returns the report id.
    function _fileReport(address reporter, address agent, uint256 amount)
        internal
        returns (uint256 reportId)
    {
        vm.prank(reporter);
        reportId = slashVerifier.report(agent, amount, "test reason", "ipfs://evidence");
    }
}
