// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {SchemaRegistry} from "@ethereum-attestation-service/eas-contracts/contracts/SchemaRegistry.sol";
import {EAS} from "@ethereum-attestation-service/eas-contracts/contracts/EAS.sol";
import {ISchemaRegistry} from "@ethereum-attestation-service/eas-contracts/contracts/ISchemaRegistry.sol";

/// @notice Deploy fresh EAS + SchemaRegistry (local Anvil) OR record an
///         existing pair (Sepolia / mainnet). Prints the addresses for
///         copy-paste into .env.
contract DeployEAS is Script {
    function run() external {
        address existingEAS = vm.envOr("EAS_ADDRESS", address(0));
        address existingRegistry = vm.envOr("EAS_SCHEMA_REGISTRY", address(0));

        address eas;
        address registry;

        if (existingEAS != address(0) && existingRegistry != address(0)) {
            eas = existingEAS;
            registry = existingRegistry;
            console.log("=== Using existing EAS deployment ===");
        } else {
            uint256 pk = vm.envUint("PRIVATE_KEY");
            vm.startBroadcast(pk);

            SchemaRegistry sr = new SchemaRegistry();
            EAS easContract = new EAS(ISchemaRegistry(address(sr)));

            vm.stopBroadcast();

            registry = address(sr);
            eas = address(easContract);
            console.log("=== Deployed fresh EAS ===");
        }

        console.log("EAS_SCHEMA_REGISTRY =", registry);
        console.log("EAS_ADDRESS         =", eas);
        console.log("");
        console.log("Copy these into your .env before running 01_DeployCore.");
    }
}
