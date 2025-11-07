import type { MatchDayVoteDocument } from "@/lib/models/MatchDayVote";
import type { DayOfWeek, MatchDayResults, MatchDayVoteSummary } from "@/types/match-day";

const DAY_ORDER: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export function buildMatchDayResults(votes: MatchDayVoteDocument[]): MatchDayResults {
  const counts = new Map<DayOfWeek, number>();

  for (const day of DAY_ORDER) {
    counts.set(day, 0);
  }

  for (const vote of votes) {
    const current = counts.get(vote.day as DayOfWeek) ?? 0;
    counts.set(vote.day as DayOfWeek, current + 1);
  }

  let winningDay: DayOfWeek | null = null;
  let winningCount = -1;

  for (const day of DAY_ORDER) {
    const count = counts.get(day) ?? 0;
    if (count > winningCount) {
      winningDay = day;
      winningCount = count;
    }
  }

  const lastUpdated = votes.length > 0 ? votes[0].submittedAt.toISOString() : null;
  const cycleKey = votes[0]?.cycleKey;

  return {
    winningDay,
    dayCounts: DAY_ORDER.map((day) => ({ day, count: counts.get(day) ?? 0 })),
    totalVotes: votes.length,
    lastUpdated,
    cycleKey,
  };
}

export function summarizeMatchDayVote(doc: MatchDayVoteDocument): MatchDayVoteSummary {
  return {
    id: doc.id,
    voter: doc.voter,
    day: doc.day as DayOfWeek,
    submittedAt: doc.submittedAt.toISOString(),
    cycleKey: doc.cycleKey ?? undefined,
  };
}


