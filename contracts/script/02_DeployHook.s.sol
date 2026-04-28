// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";

import {ArbiterSwapHook} from "../src/hooks/ArbiterSwapHook.sol";
import {AgentRegistry} from "../src/AgentRegistry.sol";
import {ReputationHook} from "../src/ReputationHook.sol";

/// @notice Mine a CREATE2 salt that produces a hook address whose lower 14
///         bits encode "beforeSwap only", then deploy at that address.
contract DeployHook is Script {
    /// @dev Mask of the 14 hook flag bits in a hook address.
    uint160 internal constant FLAG_MASK = 0x3FFF;
    /// @dev BEFORE_SWAP_FLAG = 1 << 7 (matches v4-core/src/libraries/Hooks.sol).
    uint160 internal constant BEFORE_SWAP_FLAG = 0x80;
    /// @dev Cap on mining attempts. Expected ~16k; 500k is generous safety.
    uint256 internal constant MAX_MINE_ATTEMPTS = 500_000;

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);

        address poolManagerAddr = vm.envAddress("POOL_MANAGER_ADDRESS");
        address registryAddr = vm.envAddress("AGENT_REGISTRY");
        address reputationAddr = vm.envAddress("REPUTATION_HOOK");

        require(poolManagerAddr != address(0), "POOL_MANAGER_ADDRESS not set");
        require(registryAddr != address(0), "AGENT_REGISTRY not set");
        require(reputationAddr != address(0), "REPUTATION_HOOK not set");

        bytes memory creationCode = type(ArbiterSwapHook).creationCode;
        bytes memory args = abi.encode(poolManagerAddr, registryAddr, reputationAddr);
        bytes32 bytecodeHash = keccak256(abi.encodePacked(creationCode, args));

        (bytes32 salt, address predicted) = _mine(deployer, bytecodeHash);

        console.log("Mined salt        :", uint256(salt));
        console.log("Predicted address :", predicted);
        console.log("Deploying...");

        vm.startBroadcast(pk);
        ArbiterSwapHook hook = new ArbiterSwapHook{salt: salt}(
            IPoolManager(poolManagerAddr),
            AgentRegistry(registryAddr),
            ReputationHook(reputationAddr)
        );
        vm.stopBroadcast();

        require(address(hook) == predicted, "address mismatch after deploy");

        console.log("=== ArbiterSwapHook deployed ===");
        console.log("ARBITER_SWAP_HOOK =", address(hook));
        console.log("");
        console.log("Copy ARBITER_SWAP_HOOK into .env.");
    }

    function _mine(address deployer, bytes32 bytecodeHash)
        internal
        pure
        returns (bytes32 salt, address addr)
    {
        for (uint256 i = 0; i < MAX_MINE_ATTEMPTS; i++) {
            salt = bytes32(i);
            addr = _computeCreate2Address(deployer, salt, bytecodeHash);
            if ((uint160(addr) & FLAG_MASK) == BEFORE_SWAP_FLAG) {
                return (salt, addr);
            }
        }
        revert("could not mine salt within MAX_MINE_ATTEMPTS");
    }

    function _computeCreate2Address(address deployer, bytes32 salt, bytes32 bytecodeHash)
        internal
        pure
        returns (address)
    {
        return address(
            uint160(
                uint256(
                    keccak256(abi.encodePacked(bytes1(0xff), deployer, salt, bytecodeHash))
                )
            )
        );
    }
}
