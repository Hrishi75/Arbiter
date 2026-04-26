// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {BondVault} from "./BondVault.sol";
import {AgentRegistry} from "./AgentRegistry.sol";

/// @title  SlashVerifier
/// @notice Coordinates the report -> dispute -> slash lifecycle. Anyone may
///         file a report; the agent's owner has SLASH_DELAY to dispute; after
///         that any caller (typically a keeper) may execute the slash.
contract SlashVerifier {
    /// @dev Mirror of BondVault.SLASH_DELAY for cheaper local reads.
    uint256 public constant SLASH_DELAY = 48 hours;

    BondVault public immutable bondVault;
    AgentRegistry public immutable registry;

    struct SlashReport {
        address agent;
        address reporter;
        uint256 amount;
        string reason;
        string evidenceURI;
        uint64 createdAt;
        bool disputed;
        bool executed;
    }

    SlashReport[] private _reports;

    event ReportCreated(
        uint256 indexed reportId,
        address indexed agent,
        address indexed reporter,
        uint256 amount,
        string reason,
        string evidenceURI
    );
    event ReportDisputed(uint256 indexed reportId, address indexed disputer);
    event SlashExecuted(uint256 indexed reportId, address indexed agent, uint256 amount);

    error InvalidReportId();
    error ZeroAmount();
    error ZeroAddress();
    error EmptyEvidence();
    error NotAgentOwner();
    error AgentNotRegistered();
    error AlreadyExecuted();
    error AlreadyDisputed();
    error DisputeWindowClosed();
    error DisputeWindowOpen();

    constructor(BondVault _bondVault, AgentRegistry _registry) {
        if (address(_bondVault) == address(0) || address(_registry) == address(0)) {
            revert ZeroAddress();
        }
        bondVault = _bondVault;
        registry = _registry;
    }

    /// @notice File a slash report against an agent.
    /// @dev    Permissionless. Anyone can report.
    function report(
        address agent,
        uint256 amount,
        string calldata reason,
        string calldata evidenceURI
    ) external returns (uint256 reportId) {
        if (agent == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        if (bytes(evidenceURI).length == 0) revert EmptyEvidence();
        if (!registry.isRegistered(agent)) revert AgentNotRegistered();

        reportId = _reports.length;
        _reports.push(SlashReport({
            agent: agent,
            reporter: msg.sender,
            amount: amount,
            reason: reason,
            evidenceURI: evidenceURI,
            createdAt: uint64(block.timestamp),
            disputed: false,
            executed: false
        }));

        emit ReportCreated(reportId, agent, msg.sender, amount, reason, evidenceURI);
    }

    /// @notice Dispute a report. Callable only by the agent's owner, only
    ///         within the SLASH_DELAY window after report creation.
    function dispute(uint256 reportId) external {
        if (reportId >= _reports.length) revert InvalidReportId();
        SlashReport storage r = _reports[reportId];

        if (r.executed) revert AlreadyExecuted();
        if (r.disputed) revert AlreadyDisputed();
        if (block.timestamp >= uint256(r.createdAt) + SLASH_DELAY) revert DisputeWindowClosed();
        if (registry.getAgent(r.agent).owner != msg.sender) revert NotAgentOwner();

        r.disputed = true;
        emit ReportDisputed(reportId, msg.sender);
    }

    /// @notice Execute the slash. Permissionless — any caller (keeper) may
    ///         invoke this once the dispute window has elapsed.
    function executeSlash(uint256 reportId) external {
        if (reportId >= _reports.length) revert InvalidReportId();
        SlashReport storage r = _reports[reportId];

        if (r.executed) revert AlreadyExecuted();
        if (r.disputed) revert AlreadyDisputed();
        if (block.timestamp < uint256(r.createdAt) + SLASH_DELAY) revert DisputeWindowOpen();

        r.executed = true;

        // If the agent has already been slashed by a prior report, we can't
        // slash again (BondVault enforces one-shot). Mark the report executed
        // with amount=0 so keepers stop retrying.
        if (bondVault.isSlashed(r.agent)) {
            emit SlashExecuted(reportId, r.agent, 0);
            return;
        }

        bondVault.slash(r.agent, r.amount);
        emit SlashExecuted(reportId, r.agent, r.amount);
    }

    /// @notice Read a report by id.
    function getReport(uint256 reportId) external view returns (SlashReport memory) {
        if (reportId >= _reports.length) revert InvalidReportId();
        return _reports[reportId];
    }

    /// @notice Total number of reports filed.
    function reportsCount() external view returns (uint256) {
        return _reports.length;
    }
}
