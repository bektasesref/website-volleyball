import { ALL_PLAYERS } from "@/constants/players";
import type { PlayerRef } from "@/types/player";

const playerMap = new Map<number, PlayerRef>(ALL_PLAYERS.map((player) => [player.id, player]));

export function getPlayerById(id: number): PlayerRef | null {
  return playerMap.get(id) ?? null;
}

export function getPlayersByIds(ids: number[]): PlayerRef[] {
  return ids
    .map((id) => getPlayerById(id))
    .filter((player): player is PlayerRef => Boolean(player));
}

export function assertPlayersExist(ids: number[]): void {
  const missing = ids.filter((id) => !playerMap.has(id));
  if (missing.length > 0) {
    throw new Error(`Unknown player ids: ${missing.join(", ")}`);
  }
}

export function buildPlayerSnapshot(id: number): PlayerRef {
  const player = getPlayerById(id);
  if (!player) {
    throw new Error(`Unknown player id: ${id}`);
  }
  return player;
}

export function buildPlayerSnapshots(ids: number[]): PlayerRef[] {
  const seen = new Set<number>();
  return ids.reduce<PlayerRef[]>((acc, id) => {
    if (seen.has(id)) {
      return acc;
    }
    const player = buildPlayerSnapshot(id);
    seen.add(id);
    acc.push(player);
    return acc;
  }, []);
}

export function getAllPlayers(): PlayerRef[] {
  return [...playerMap.values()];
}

