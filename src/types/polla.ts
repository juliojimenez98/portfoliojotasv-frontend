export interface FixtureMatch {
  stage: string;
  matchday?: number;
  homeTeam: string;
  awayTeam: string;
  matchDate?: string;
  venue?: string;
}

export type MatchStage =
  | "group"
  | "round_of_16"
  | "quarterfinal"
  | "semifinal"
  | "final";

export type MatchStatus = "scheduled" | "live" | "finished";

export interface ScoringConfig {
  exactScore: number;
  correctTrend: number;
  championBonus: number;
  topScorerBonus: number;
}

export interface GroupMember {
  userId: string;
  username: string;
  hasPaid: boolean;
  paidAt?: string;
  joinedAt: string;
}

export interface IPollaGroup {
  _id: string;
  name: string;
  description?: string;
  adminId: string;
  inviteCode: string;
  entryFee: number;
  currency: string;
  members: GroupMember[];
  scoringConfig: ScoringConfig;
  tournamentName: string;
  isActive: boolean;
  actualChampion?: string;
  actualTopScorer?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPollaMatch {
  _id: string;
  groupId: string;
  stage: MatchStage;
  matchday?: number;
  homeTeam: string;
  awayTeam: string;
  matchDate?: string;
  homeScore?: number;
  awayScore?: number;
  status: MatchStatus;
  isBettingOpen: boolean;
}

export interface MatchPrediction {
  matchId: string;
  homeScore: number;
  awayScore: number;
  pointsEarned: number;
}

export interface IPollaPrediction {
  _id: string;
  groupId: string;
  userId: string;
  username: string;
  predictedChampion?: string;
  predictedTopScorer?: string;
  matchPredictions: MatchPrediction[];
  totalPoints: number;
  championBonusEarned: boolean;
  topScorerBonusEarned: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  totalPoints: number;
  championBonusEarned: boolean;
  topScorerBonusEarned: boolean;
  predictedChampion?: string;
  predictedTopScorer?: string;
}

export interface FinanceSummary {
  pot: number;
  paidCount: number;
  pendingCount: number;
  paid: { userId: string; username: string; paidAt?: string }[];
  pending: { userId: string; username: string }[];
}

export interface GroupDashboard {
  group: IPollaGroup;
  finance: FinanceSummary;
  leaderboard: LeaderboardEntry[];
}
