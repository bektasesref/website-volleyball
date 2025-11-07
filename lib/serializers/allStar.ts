import type { AllStarBallotDocument } from "@/lib/models/AllStarBallot";
import type { AllStarBallotSummary, AllStarResults } from "@/types/all-star";
import type { PlayerRef } from "@/types/player";

export function buildAllStarResults(ballots: AllStarBallotDocument[]): AllStarResults {
  const histogramMap = new Map<number, { player: PlayerRef; votes: number }>();

  for (const ballot of ballots) {
    for (const pick of ballot.picks) {
      const existing = histogramMap.get(pick.id);
      if (existing) {
        existing.votes += 1;
      } else {
        histogramMap.set(pick.id, { player: pick, votes: 1 });
      }
    }
  }

  const histogram = Array.from(histogramMap.values()).sort((a, b) => {
    if (b.votes === a.votes) {
      return a.player.name.localeCompare(b.player.name, "tr");
    }
    return b.votes - a.votes;
  });

  const lastUpdated = ballots.length > 0 ? ballots[0].submittedAt.toISOString() : null;
  const cycleKey = ballots[0]?.cycleKey;

  return {
    histogram,
    totalBallots: ballots.length,
    lastUpdated,
    cycleKey,
  };
}

export function summarizeAllStarBallot(doc: AllStarBallotDocument): AllStarBallotSummary {
  return {
    id: doc.id,
    voter: doc.voter,
    submittedAt: doc.submittedAt.toISOString(),
    cycleKey: doc.cycleKey ?? undefined,
  };
}

