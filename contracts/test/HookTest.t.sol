// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Fixture} from "./utils/Fixture.sol";
import {ArbiterSwapHook} from "../src/hooks/ArbiterSwapHook.sol";
import {AgentAccount} from "../src/AgentAccount.sol";

import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {BeforeSwapDelta} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {LPFeeLibrary} from "@uniswap/v4-core/src/libraries/LPFeeLibrary.sol";

contract HookTest is Fixture {
    address internal poolManagerAddr;
    ArbiterSwapHook internal hook;
    AgentAccount internal agent;
    address internal owner;

    uint160 internal constant FLAG_MASK = 0x3FFF;
    uint160 internal constant BEFORE_SWAP_FLAG = 0x80;

    function setUp() public {
        _deploy();
        owner = makeAddr("owner");
        poolManagerAddr = makeAddr("poolManager");

        bytes memory creationCode = type(ArbiterSwapHook).creationCode;
        bytes memory args = abi.encode(
            IPoolManager(poolManagerAddr),
            registry,
            reputation
        );
        bytes32 bytecodeHash = keccak256(abi.encodePacked(creationCode, args));

        (bytes32 salt, address predicted) = _mine(address(this), bytecodeHash);
        hook = new ArbiterSwapHook{salt: salt}(
            IPoolManager(poolManagerAddr),
            registry,
            reputation
        );
        require(address(hook) == predicted, "hook address mismatch");

        agent = _createAgent(owner, keccak256("a"), 0.5 ether);
    }

    // ---------------------------------------------------------------
    // Tier mapping
    // ---------------------------------------------------------------

    function testNonAgentNoOverride() public {
        address random = makeAddr("random");
        vm.prank(poolManagerAddr);
        (bytes4 sel, , uint24 fee) = hook.beforeSwap(
            random,
            _emptyKey(),
            _emptyParams(),
            ""
        );
        assertEq(sel, hook.beforeSwap.selector);
        assertEq(fee, 0); // no override → pool default
    }

    function testAgentDefaultTier() public {
        // score = 100 (initial)
        vm.prank(poolManagerAddr);
        (, , uint24 fee) = hook.beforeSwap(address(agent), _emptyKey(), _emptyParams(), "");
        assertEq(fee, uint24(1000) | LPFeeLibrary.OVERRIDE_FEE_FLAG);
    }

    function testAgentPremiumTier() public {
        _bumpScore(address(agent), true, 60); // 100 → 160
        assertEq(reputation.getScore(address(agent)), 160);

        vm.prank(poolManagerAddr);
        (, , uint24 fee) = hook.beforeSwap(address(agent), _emptyKey(), _emptyParams(), "");
        assertEq(fee, uint24(500) | LPFeeLibrary.OVERRIDE_FEE_FLAG);
    }

    function testAgentReducedTier() public {
        _bumpScore(address(agent), false, 1); // 100 → 90
        assertEq(reputation.getScore(address(agent)), 90);

        vm.prank(poolManagerAddr);
        (, , uint24 fee) = hook.beforeSwap(address(agent), _emptyKey(), _emptyParams(), "");
        assertEq(fee, uint24(2000) | LPFeeLibrary.OVERRIDE_FEE_FLAG);
    }

    function testAgentHighRiskTier() public {
        _bumpScore(address(agent), false, 6); // 100 → 40
        assertEq(reputation.getScore(address(agent)), 40);

        vm.prank(poolManagerAddr);
        (, , uint24 fee) = hook.beforeSwap(address(agent), _emptyKey(), _emptyParams(), "");
        assertEq(fee, uint24(5000) | LPFeeLibrary.OVERRIDE_FEE_FLAG);
    }

    // ---------------------------------------------------------------
    // Access control + events
    // ---------------------------------------------------------------

    function testRevertsWhenCallerIsNotPoolManager() public {
        vm.expectRevert(ArbiterSwapHook.NotPoolManager.selector);
        hook.beforeSwap(address(agent), _emptyKey(), _emptyParams(), "");
    }

    function testEmitsAgentSwapFeeApplied() public {
        vm.expectEmit(true, false, false, true);
        emit ArbiterSwapHook.AgentSwapFeeApplied(address(agent), 100, 1000);

        vm.prank(poolManagerAddr);
        hook.beforeSwap(address(agent), _emptyKey(), _emptyParams(), "");
    }

    // ---------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------

    function _mine(address deployer, bytes32 bytecodeHash)
        internal
        pure
        returns (bytes32 salt, address predicted)
    {
        for (uint256 i = 0; i < 500_000; i++) {
            salt = bytes32(i);
            predicted = address(
                uint160(
                    uint256(
                        keccak256(abi.encodePacked(bytes1(0xff), deployer, salt, bytecodeHash))
                    )
                )
            );
            if ((uint160(predicted) & FLAG_MASK) == BEFORE_SWAP_FLAG) {
                return (salt, predicted);
            }
        }
        revert("could not mine hook salt");
    }

    function _bumpScore(address a, bool success, uint256 times) internal {
        for (uint256 i = 0; i < times; i++) {
            vm.prank(a);
            reputation.recordOp(success, bytes32(i));
        }
    }

    function _emptyKey() internal pure returns (PoolKey memory) {
        return PoolKey({
            currency0: Currency.wrap(address(0)),
            currency1: Currency.wrap(address(1)),
            fee: 0,
            tickSpacing: 60,
            hooks: IHooks(address(0))
        });
    }

    function _emptyParams() internal pure returns (IPoolManager.SwapParams memory) {
        return IPoolManager.SwapParams({
            zeroForOne: true,
            amountSpecified: 1,
            sqrtPriceLimitX96: 0
        });
    }
}
