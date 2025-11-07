import type { PlayerRef } from "@/types/player";

export type ParticipationStatusOption = "yes" | "no";

export type ParticipationRecord = {
  id: string;
  player: PlayerRef;
  status: ParticipationStatusOption;
  submittedAt: string;
  cycleKey?: string;
};

export type ParticipationAggregates = {
  yes: number;
  no: number;
  totalResponses: number;
  lastUpdated: string | null;
  cycleKey?: string;
};

export type GetParticipationResponse = {
  aggregates: ParticipationAggregates;
  records: ParticipationRecord[];
};

export type SubmitParticipationPayload = {
  playerId: number;
  status: ParticipationStatusOption;
  cycleKey?: string;
};

export type SubmitParticipationResponse = {
  record: ParticipationRecord;
  aggregates: ParticipationAggregates;
};

