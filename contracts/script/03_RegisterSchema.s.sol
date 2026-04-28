// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {ISchemaRegistry} from "@ethereum-attestation-service/eas-contracts/contracts/ISchemaRegistry.sol";
import {ISchemaResolver} from "@ethereum-attestation-service/eas-contracts/contracts/resolver/ISchemaResolver.sol";

import {ReputationHook} from "../src/ReputationHook.sol";

/// @notice Register the Arbiter attestation schema on EAS and pin its UID
///         on ReputationHook. Run once per chain after 01_DeployCore.
contract RegisterSchema is Script {
    string internal constant SCHEMA =
        "address agent,bool success,bytes32 userOpHash,uint256 timestamp";

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");

        address schemaRegistry = vm.envAddress("EAS_SCHEMA_REGISTRY");
        address reputationAddr = vm.envAddress("REPUTATION_HOOK");
        bytes32 existingUid = vm.envOr("EAS_SCHEMA_UID", bytes32(0));

        require(schemaRegistry != address(0), "EAS_SCHEMA_REGISTRY not set");
        require(reputationAddr != address(0), "REPUTATION_HOOK not set");

        vm.startBroadcast(pk);

        bytes32 uid;
        if (existingUid != bytes32(0)) {
            uid = existingUid;
            console.log("Using existing schema UID from env.");
        } else {
            uid = ISchemaRegistry(schemaRegistry).register(
                SCHEMA,
                ISchemaResolver(address(0)),
                false // revocable = false (history is permanent)
            );
            console.log("Registered new schema.");
        }

        ReputationHook(reputationAddr).setSchemaUID(uid);

        vm.stopBroadcast();

        console.log("=== Schema wired ===");
        console.log("EAS_SCHEMA_UID (copy this into .env):");
        console.logBytes32(uid);
    }
}
