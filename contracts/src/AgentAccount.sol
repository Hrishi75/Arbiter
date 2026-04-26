// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IEntryPoint} from "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {PackedUserOperation} from "@account-abstraction/contracts/interfaces/PackedUserOperation.sol";
import {BaseAccount} from "@account-abstraction/contracts/core/BaseAccount.sol";
import {SIG_VALIDATION_FAILED} from "@account-abstraction/contracts/core/Helpers.sol";

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

import {AgentRegistry} from "./AgentRegistry.sol";
import {BondVault} from "./BondVault.sol";
import {ReputationHook} from "./ReputationHook.sol";

/// @title  AgentAccount
/// @notice ERC-4337 smart account for an Arbiter agent.
/// @dev    Extends BaseAccount (not SimpleAccount). SimpleAccount in the
///         account-abstraction package imports OZ v4 APIs that are gone in
///         OZ v5; BaseAccount has no OZ dependency. UUPS upgradability is
///         out of scope — each agent is a fresh CREATE2 deploy.
contract AgentAccount is BaseAccount {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    IEntryPoint private immutable _entryPoint;
    AgentRegistry public immutable registry;
    BondVault public immutable bondVault;
    ReputationHook public immutable reputationHook;
    address public immutable owner;

    /// @dev Transient storage slot for ferrying userOpHash from
    ///      _validateSignature() into execute(). Auto-cleared at end of tx.
    bytes32 private constant USER_OP_HASH_SLOT =
        bytes32(uint256(keccak256("arbiter.agentAccount.userOpHash")) - 1);

    event Executed(bool success, address indexed dest, uint256 value, bytes returnData);
    event ExecutedBatch(bool allSuccess, uint256 count);

    error NotEntryPoint();
    error LengthMismatch();

    constructor(
        IEntryPoint anEntryPoint,
        AgentRegistry _registry,
        BondVault _bondVault,
        ReputationHook _reputationHook,
        address anOwner
    ) {
        _entryPoint = anEntryPoint;
        registry = _registry;
        bondVault = _bondVault;
        reputationHook = _reputationHook;
        owner = anOwner;
    }

    /// @inheritdoc BaseAccount
    function entryPoint() public view override returns (IEntryPoint) {
        return _entryPoint;
    }

    /// @notice Allow the account to receive ETH (for bonding via the owner
    ///         forwarding ETH through the smart account, or for direct funding).
    receive() external payable {}

    // -----------------------------------------------------------------
    // Validation
    // -----------------------------------------------------------------

    /// @notice The four-check Arbiter validation.
    /// @dev    Order matters: cheap checks first. Returns SIG_VALIDATION_FAILED
    ///         on any failure. On success, stashes userOpHash for execute().
    function _validateSignature(PackedUserOperation calldata userOp, bytes32 userOpHash)
        internal
        override
        returns (uint256)
    {
        // 1. ECDSA signature from owner.
        bytes32 hash = userOpHash.toEthSignedMessageHash();
        if (owner != hash.recover(userOp.signature)) return SIG_VALIDATION_FAILED;

        // 2. Agent must be registered and active.
        if (!registry.isRegistered(address(this))) return SIG_VALIDATION_FAILED;

        // 3 + 4. Bond >= MIN_BOND AND not slashed (combined helper).
        if (!bondVault.hasMinBond(address(this))) return SIG_VALIDATION_FAILED;

        // Stash userOpHash for execute() to consume.
        uint256 slot = uint256(USER_OP_HASH_SLOT);
        assembly {
            tstore(slot, userOpHash)
        }
        return 0;
    }

    // -----------------------------------------------------------------
    // Execution
    // -----------------------------------------------------------------

    /// @notice Execute a single call. Records the outcome on ReputationHook.
    /// @dev    Inner call failures DO NOT revert the outer tx — they are
    ///         recorded as `success=false` so reputation reflects reality.
    ///         Callers can observe outcome via the Executed event.
    function execute(address dest, uint256 value, bytes calldata func) external override {
        _requireFromEntryPoint();
        bytes32 hash = _consumeUserOpHash();

        (bool success, bytes memory ret) = dest.call{value: value}(func);

        reputationHook.recordOp(success, hash);
        emit Executed(success, dest, value, ret);
    }

    /// @notice Execute a batch of calls. Records one combined outcome —
    ///         allSuccess is true iff every inner call succeeded.
    function executeBatch(address[] calldata dest, bytes[] calldata func) external {
        if (dest.length != func.length) revert LengthMismatch();
        _requireFromEntryPoint();
        bytes32 hash = _consumeUserOpHash();

        bool allSuccess = true;
        uint256 len = dest.length;
        for (uint256 i = 0; i < len; ) {
            (bool ok, ) = dest[i].call(func[i]);
            if (!ok) allSuccess = false;
            unchecked { ++i; }
        }

        reputationHook.recordOp(allSuccess, hash);
        emit ExecutedBatch(allSuccess, len);
    }

    // -----------------------------------------------------------------
    // Internal helpers
    // -----------------------------------------------------------------

    function _requireFromEntryPoint() internal view override {
        if (msg.sender != address(_entryPoint)) revert NotEntryPoint();
    }

    function _consumeUserOpHash() internal returns (bytes32 hash) {
        uint256 slot = uint256(USER_OP_HASH_SLOT);
        assembly {
            hash := tload(slot)
            tstore(slot, 0)
        }
    }
}
