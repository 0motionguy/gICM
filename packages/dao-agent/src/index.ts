// DAO Agent - Governance operations, proposal analysis
export { DAOAgent, type DAOAgentAnalysis } from "./dao-agent.js";

// Types
export {
  type DAO,
  type Proposal,
  type Vote,
  type VotingPower,
  type TreasuryInfo,
  type ProposalSummary,
  type DAOAgentConfig,
  type GovernancePlatform,
  DAOAgentConfigSchema,
} from "./types.js";

// Platforms
export { SnapshotProvider } from "./platforms/snapshot.js";
export { TallyProvider } from "./platforms/tally.js";
export { RealmsProvider } from "./platforms/realms.js";

// Analyzers
export { ProposalAnalyzer } from "./analyzers/proposal.js";
export {
  VotingPowerAnalyzer,
  type VotingPowerDistribution,
  type VoterAnalysis,
} from "./analyzers/voting-power.js";
