import type { PlayerRef } from "@/types/player";

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type MatchDayVoteSummary = {
  id: string;
  voter: PlayerRef;
  day: DayOfWeek;
  submittedAt: string;
  cycleKey?: string;
};

export type MatchDayResults = {
  winningDay: DayOfWeek | null;
  dayCounts: Array<{
    day: DayOfWeek;
    count: number;
  }>;
  totalVotes: number;
  lastUpdated: string | null;
  cycleKey?: string;
};

export type GetMatchDayResponse = {
  results: MatchDayResults;
  votes: MatchDayVoteSummary[];
};

export type SubmitMatchDayVotePayload = {
  voterId: number;
  day: DayOfWeek;
  cycleKey?: string;
};

export type SubmitMatchDayVoteResponse = {
  vote: MatchDayVoteSummary;
  results: MatchDayResults;
};

