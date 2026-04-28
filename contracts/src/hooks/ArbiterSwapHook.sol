// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {LPFeeLibrary} from "@uniswap/v4-core/src/libraries/LPFeeLibrary.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";

import {AgentRegistry} from "../AgentRegistry.sol";
import {ReputationHook} from "../ReputationHook.sol";

/// @title  ArbiterSwapHook
/// @notice Uniswap v4 hook that overrides the LP fee per swap based on the
///         swapper's Arbiter reputation. Self-contained — does not depend on
///         v4-periphery's BaseHook (not shipped in this periphery checkout).
contract ArbiterSwapHook {
    IPoolManager public immutable poolManager;
    AgentRegistry public immutable registry;
    ReputationHook public immutable reputation;

    uint24 public constant FEE_PREMIUM   = 500;  // 0.05%
    uint24 public constant FEE_DEFAULT   = 1000; // 0.10%
    uint24 public constant FEE_REDUCED   = 2000; // 0.20%
    uint24 public constant FEE_HIGH_RISK = 5000; // 0.50%

    uint256 public constant SCORE_PREMIUM = 150;
    uint256 public constant SCORE_DEFAULT = 100;
    uint256 public constant SCORE_REDUCED = 50;

    event AgentSwapFeeApplied(address indexed agent, uint256 score, uint24 fee);

    error NotPoolManager();

    constructor(IPoolManager _poolManager, AgentRegistry _registry, ReputationHook _reputation) {
        poolManager = _poolManager;
        registry = _registry;
        reputation = _reputation;
        // Validates that the deployed address has the BEFORE_SWAP flag bit
        // set. Reverts if the deployer didn't mine a matching CREATE2 salt.
        Hooks.validateHookPermissions(IHooks(address(this)), getHookPermissions());
    }

    /// @notice Hook permissions — only beforeSwap is enabled.
    function getHookPermissions() public pure returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: false,
            beforeAddLiquidity: false,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: true,
            afterSwap: false,
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: false,
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    /// @notice Called by PoolManager before each swap. Overrides the LP fee
    ///         based on the swapper's reputation tier.
    /// @param  sender Address that called PoolManager.swap (the agent for
    ///         our use case).
    function beforeSwap(
        address sender,
        PoolKey calldata,
        IPoolManager.SwapParams calldata,
        bytes calldata
    ) external returns (bytes4, BeforeSwapDelta, uint24) {
        if (msg.sender != address(poolManager)) revert NotPoolManager();

        if (!registry.isRegistered(sender)) {
            // Not an agent — no override; pool default fee applies.
            return (this.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
        }

        uint256 score = reputation.getScore(sender);
        uint24 fee;
        if (score >= SCORE_PREMIUM) fee = FEE_PREMIUM;
        else if (score >= SCORE_DEFAULT) fee = FEE_DEFAULT;
        else if (score >= SCORE_REDUCED) fee = FEE_REDUCED;
        else fee = FEE_HIGH_RISK;

        emit AgentSwapFeeApplied(sender, score, fee);

        return (
            this.beforeSwap.selector,
            BeforeSwapDeltaLibrary.ZERO_DELTA,
            fee | LPFeeLibrary.OVERRIDE_FEE_FLAG
        );
    }
}
