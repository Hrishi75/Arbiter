// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import {AgentRegistry} from "./AgentRegistry.sol";

/// @title  ReputationHook
/// @notice Records every agent action as an EAS attestation and maintains
///         an on-chain integer reputation score (0..200) for fast reads.
contract ReputationHook is Ownable {
    uint256 public constant INITIAL_SCORE = 100;
    uint256 public constant MAX_SCORE = 200;
    uint256 public constant LOW_THRESHOLD = 20;
    uint256 public constant SUCCESS_DELTA = 1;
    uint256 public constant FAILURE_DELTA = 10;

    /// @notice Registry used to authorise callers.
    AgentRegistry public immutable registry;

    /// @notice EAS contract used to issue attestations.
    IEAS public immutable eas;

    /// @notice Schema UID registered on EAS for our attestation shape.
    ///         Settable once by owner after running 03_RegisterSchema.
    bytes32 public schemaUID;

    mapping(address agent => bool) private _seen;
    mapping(address agent => uint256) private _scores;
    mapping(address agent => uint256) private _attestationCount;

    event SchemaUIDSet(bytes32 schemaUID);
    event OpRecorded(address indexed agent, bool success, bytes32 userOpHash, uint256 newScore);
    event LowReputation(address indexed agent, uint256 score);

    error NotRegistered();
    error SchemaAlreadySet();
    error ZeroAddress();
    error ZeroSchema();

    constructor(address initialOwner, AgentRegistry _registry, IEAS _eas) Ownable(initialOwner) {
        if (address(_registry) == address(0) || address(_eas) == address(0)) revert ZeroAddress();
        registry = _registry;
        eas = _eas;
    }

    /// @notice Set the EAS schema UID once. Owner-only.
    function setSchemaUID(bytes32 uid) external onlyOwner {
        if (uid == bytes32(0)) revert ZeroSchema();
        if (schemaUID != bytes32(0)) revert SchemaAlreadySet();
        schemaUID = uid;
        emit SchemaUIDSet(uid);
    }

    /// @notice Called by an AgentAccount after each execution.
    /// @dev    msg.sender is the agent. Updates local score and (if schema
    ///         is set) writes an EAS attestation.
    function recordOp(bool success, bytes32 userOpHash) external {
        if (!registry.isRegistered(msg.sender)) revert NotRegistered();

        uint256 prev = getScore(msg.sender);
        uint256 next = success
            ? (prev + SUCCESS_DELTA > MAX_SCORE ? MAX_SCORE : prev + SUCCESS_DELTA)
            : (prev > FAILURE_DELTA ? prev - FAILURE_DELTA : 0);

        _seen[msg.sender] = true;
        _scores[msg.sender] = next;
        unchecked { _attestationCount[msg.sender] += 1; }

        if (prev >= LOW_THRESHOLD && next < LOW_THRESHOLD) {
            emit LowReputation(msg.sender, next);
        }

        bytes32 uid = schemaUID;
        if (uid != bytes32(0)) {
            eas.attest(
                AttestationRequest({
                    schema: uid,
                    data: AttestationRequestData({
                        recipient: msg.sender,
                        expirationTime: 0,
                        revocable: false,
                        refUID: bytes32(0),
                        data: abi.encode(msg.sender, success, userOpHash, block.timestamp),
                        value: 0
                    })
                })
            );
        }

        emit OpRecorded(msg.sender, success, userOpHash, next);
    }

    /// @notice Current reputation score. Returns INITIAL_SCORE for unseen agents.
    function getScore(address agent) public view returns (uint256) {
        return _seen[agent] ? _scores[agent] : INITIAL_SCORE;
    }

    /// @notice Number of attestations recorded for this agent.
    function getAttestationCount(address agent) external view returns (uint256) {
        return _attestationCount[agent];
    }
}
