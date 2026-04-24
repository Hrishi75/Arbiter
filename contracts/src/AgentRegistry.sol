// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title  AgentRegistry
/// @notice On-chain identity layer for Arbiter. Every ERC-4337 smart
///         account managed by the protocol must be registered here before
///         it can execute, stake, or be attested against.
contract AgentRegistry is Ownable {
    struct Agent {
        address owner;         // EOA authorised to manage the agent account
        bytes32 modelHash;     // keccak256(system prompt || config)
        string metadataURI;    // off-chain metadata pointer (IPFS / 0G / HTTP)
        uint64 registeredAt;   // block.timestamp of registration
        bool active;           // false once deactivated
    }

    /// @notice The sole factory permitted to register new agents.
    address public factory;

    mapping(address account => Agent) private _agents;

    event FactorySet(address indexed factory);
    event AgentRegistered(
        address indexed account,
        address indexed owner,
        bytes32 modelHash,
        string metadataURI
    );
    event AgentDeactivated(address indexed account);

    error NotFactory();
    error NotAgentOwner();
    error AgentAlreadyRegistered();
    error AgentNotRegistered();
    error AgentInactive();
    error ZeroAddress();

    constructor(address initialOwner) Ownable(initialOwner) {
        if (initialOwner == address(0)) revert ZeroAddress();
    }

    /// @notice Set (or rotate) the authorised factory. Owner-only.
    function setFactory(address newFactory) external onlyOwner {
        if (newFactory == address(0)) revert ZeroAddress();
        factory = newFactory;
        emit FactorySet(newFactory);
    }

    /// @notice Register a new agent account. Factory-only.
    function registerAgent(
        address account,
        address owner_,
        bytes32 modelHash,
        string calldata metadataURI
    ) external {
        if (msg.sender != factory) revert NotFactory();
        if (account == address(0) || owner_ == address(0)) revert ZeroAddress();
        if (_agents[account].registeredAt != 0) revert AgentAlreadyRegistered();

        _agents[account] = Agent({
            owner: owner_,
            modelHash: modelHash,
            metadataURI: metadataURI,
            registeredAt: uint64(block.timestamp),
            active: true
        });

        emit AgentRegistered(account, owner_, modelHash, metadataURI);
    }

    /// @notice Deactivate an agent. Callable only by the agent's owner.
    function deactivate(address account) external {
        Agent storage a = _agents[account];
        if (a.registeredAt == 0) revert AgentNotRegistered();
        if (a.owner != msg.sender) revert NotAgentOwner();
        if (!a.active) revert AgentInactive();

        a.active = false;
        emit AgentDeactivated(account);
    }

    /// @notice True if account is registered and currently active.
    function isRegistered(address account) external view returns (bool) {
        return _agents[account].active;
    }

    /// @notice Full agent record. Reverts if not registered.
    function getAgent(address account) external view returns (Agent memory) {
        if (_agents[account].registeredAt == 0) revert AgentNotRegistered();
        return _agents[account];
    }
}
