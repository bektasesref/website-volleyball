import type { PlayerRef } from "./player";

export type AllStarBallotSummary = {
  id: string;
  voter: PlayerRef;
  submittedAt: string;
  cycleKey?: string;
};

export type AllStarResults = {
  histogram: Array<{
    player: PlayerRef;
    votes: number;
  }>;
  totalBallots: number;
  lastUpdated: string | null;
  cycleKey?: string;
};

export type SubmitAllStarBallotPayload = {
  voterId: number;
  pickIds: number[];
  cycleKey?: string;
};

export type SubmitAllStarBallotResponse = {
  ballot: AllStarBallotSummary;
  results: AllStarResults;
};

export type GetAllStarResponse = {
  results: AllStarResults;
  ballots: AllStarBallotSummary[];
};

