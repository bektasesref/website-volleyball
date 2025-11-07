import type { DrawDocument } from "@/lib/models/Draw";
import type { DrawRecord } from "@/types/draw";

export function serializeDraw(doc: DrawDocument): DrawRecord {
  return {
    id: doc.id,
    conductor: doc.conductor,
    lockedPlayers: doc.lockedPlayers ?? [],
    primaryPlayers: doc.primaryPlayers,
    reservePlayers: doc.reservePlayers,
    createdAt: doc.createdAt.toISOString(),
    cycleKey: doc.cycleKey ?? undefined,
  };
}

