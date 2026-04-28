// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {IEntryPoint} from "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {IEAS} from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";

import {AgentRegistry} from "../src/AgentRegistry.sol";
import {BondVault} from "../src/BondVault.sol";
import {ReputationHook} from "../src/ReputationHook.sol";
import {SlashVerifier} from "../src/SlashVerifier.sol";
import {AgentPaymaster} from "../src/AgentPaymaster.sol";
import {AgentAccountFactory} from "../src/AgentAccountFactory.sol";

/// @notice Deploy and wire all core Arbiter contracts. Reads addresses for
///         EAS / EntryPoint / treasury from .env. Logs the six new contract
///         addresses for copy-paste back into .env.
contract DeployCore is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);

        address eas = vm.envAddress("EAS_ADDRESS");
        address entryPoint = vm.envAddress("ENTRYPOINT_ADDRESS");
        address treasury = vm.envAddress("TREASURY");
        uint256 protocolFeeBps = vm.envOr("PROTOCOL_FEE_BPS", uint256(100));

        require(eas != address(0), "EAS_ADDRESS not set");
        require(entryPoint != address(0), "ENTRYPOINT_ADDRESS not set");
        require(treasury != address(0), "TREASURY not set");

        vm.startBroadcast(pk);

        AgentRegistry registry = new AgentRegistry(deployer);
        BondVault bondVault = new BondVault(deployer, registry, treasury);
        ReputationHook reputation = new ReputationHook(deployer, registry, IEAS(eas));
        SlashVerifier slashVerifier = new SlashVerifier(bondVault, registry);
        AgentPaymaster paymaster = new AgentPaymaster(
            IEntryPoint(entryPoint),
            registry,
            bondVault,
            treasury,
            protocolFeeBps
        );
        AgentAccountFactory factory = new AgentAccountFactory(
            IEntryPoint(entryPoint),
            registry,
            bondVault,
            reputation
        );

        // Wire: each contract has one-shot setters that lock after first call.
        registry.setFactory(address(factory));
        bondVault.setSlashVerifier(address(slashVerifier));
        bondVault.setPaymaster(address(paymaster));

        vm.stopBroadcast();

        console.log("=== Arbiter core deployed ===");
        console.log("Deployer            =", deployer);
        console.log("AGENT_REGISTRY      =", address(registry));
        console.log("BOND_VAULT          =", address(bondVault));
        console.log("REPUTATION_HOOK     =", address(reputation));
        console.log("SLASH_VERIFIER      =", address(slashVerifier));
        console.log("AGENT_PAYMASTER     =", address(paymaster));
        console.log("AGENT_ACCOUNT_FACTORY=", address(factory));
        console.log("");
        console.log("Copy these into .env. Next: 02_DeployHook (needs PoolManager)");
        console.log("                          03_RegisterSchema (needs EAS_SCHEMA_REGISTRY)");
    }
}
