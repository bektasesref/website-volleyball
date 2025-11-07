import type { PlayerRef } from "./player";

export type DrawRecord = {
  id: string;
  conductor: PlayerRef;
  lockedPlayers: PlayerRef[];
  primaryPlayers: PlayerRef[];
  reservePlayers: PlayerRef[];
  createdAt: string;
  cycleKey?: string;
};

export type CreateDrawPayload = {
  conductorId: number;
  lockedPlayerIds: number[];
  candidatePlayerIds: number[];
  cycleKey?: string;
};

export type CreateDrawResponse = {
  draw: DrawRecord;
};

export type GetDrawsResponse = {
  latest: DrawRecord | null;
  history: DrawRecord[];
};

