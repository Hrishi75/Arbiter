// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IEntryPoint} from "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";

import {AgentRegistry} from "./AgentRegistry.sol";
import {BondVault} from "./BondVault.sol";
import {ReputationHook} from "./ReputationHook.sol";
import {AgentAccount} from "./AgentAccount.sol";

/// @title  AgentAccountFactory
/// @notice CREATE2 factory for ERC-4337 AgentAccount instances. Computes a
///         deterministic address from (factory, owner, salt) so the address
///         can be funded and referenced before the contract is deployed.
contract AgentAccountFactory {
    IEntryPoint public immutable entryPoint;
    AgentRegistry public immutable registry;
    BondVault public immutable bondVault;
    ReputationHook public immutable reputationHook;

    event AccountCreated(
        address indexed account,
        address indexed owner,
        bytes32 salt,
        bytes32 modelHash
    );

    error ZeroAddress();

    constructor(
        IEntryPoint _entryPoint,
        AgentRegistry _registry,
        BondVault _bondVault,
        ReputationHook _reputationHook
    ) {
        if (
            address(_entryPoint) == address(0) ||
            address(_registry) == address(0) ||
            address(_bondVault) == address(0) ||
            address(_reputationHook) == address(0)
        ) revert ZeroAddress();

        entryPoint = _entryPoint;
        registry = _registry;
        bondVault = _bondVault;
        reputationHook = _reputationHook;
    }

    /// @notice Deploy (or return) an AgentAccount and register it.
    /// @dev    Idempotent: if the deterministic address already has code,
    ///         returns it without redeploying or re-registering.
    function createAccount(
        address owner,
        bytes32 salt,
        bytes32 modelHash,
        string calldata metadataURI
    ) external returns (AgentAccount account) {
        if (owner == address(0)) revert ZeroAddress();

        address predicted = getAddress(owner, salt);

        // Already deployed — return as-is. Avoids double-registration revert.
        if (predicted.code.length > 0) {
            return AgentAccount(payable(predicted));
        }

        account = new AgentAccount{salt: salt}(
            entryPoint,
            registry,
            bondVault,
            reputationHook,
            owner
        );

        // Sanity: CREATE2 must land on the predicted address.
        require(address(account) == predicted, "factory: address mismatch");

        registry.registerAgent(address(account), owner, modelHash, metadataURI);
        emit AccountCreated(address(account), owner, salt, modelHash);
    }

    /// @notice Compute the deterministic address an AgentAccount would have
    ///         for the given (owner, salt). Does not deploy.
    function getAddress(address owner, bytes32 salt) public view returns (address) {
        bytes32 bytecodeHash = keccak256(
            abi.encodePacked(
                type(AgentAccount).creationCode,
                abi.encode(entryPoint, registry, bondVault, reputationHook, owner)
            )
        );
        return Create2.computeAddress(salt, bytecodeHash);
    }
}
