import type { ParticipationStatusDocument } from "@/lib/models/ParticipationStatus";
import type {
  ParticipationAggregates,
  ParticipationRecord,
  ParticipationStatusOption,
} from "@/types/participation";

export function buildParticipationAggregates(
  records: ParticipationStatusDocument[]
): ParticipationAggregates {
  let yes = 0;
  let no = 0;

  for (const record of records) {
    if (record.status === "yes") {
      yes += 1;
    } else {
      no += 1;
    }
  }

  const lastUpdated = records.length > 0 ? records[0].submittedAt.toISOString() : null;
  const cycleKey = records[0]?.cycleKey;
  const totalResponses = records.length;

  return {
    yes,
    no,
    totalResponses,
    lastUpdated,
    cycleKey,
  };
}

export function summarizeParticipationRecord(
  doc: ParticipationStatusDocument
): ParticipationRecord {
  return {
    id: doc.id,
    player: doc.player,
    status: doc.status as ParticipationStatusOption,
    submittedAt: doc.submittedAt.toISOString(),
    cycleKey: doc.cycleKey ?? undefined,
  };
}


