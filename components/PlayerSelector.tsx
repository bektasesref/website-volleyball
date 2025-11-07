"use client";

import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ALL_PLAYERS } from "@/constants/players";
import { Lock, Unlock } from "lucide-react";

interface PlayerSelectorProps {
  candidateIds: number[];
  lockedIds: number[];
  onChange: (params: { candidateIds: number[]; lockedIds: number[] }) => void;
}

export function PlayerSelector({ candidateIds, lockedIds, onChange }: PlayerSelectorProps) {
  const allPlayers = useMemo(() => [...ALL_PLAYERS], []);

  const lockLimitReached = lockedIds.length >= 12;

  const handleCandidateToggle = (playerId: number) => {
    if (candidateIds.includes(playerId)) {
      const nextCandidates = candidateIds.filter((id) => id !== playerId);
      const nextLocked = lockedIds.filter((id) => id !== playerId);
      onChange({ candidateIds: nextCandidates, lockedIds: nextLocked });
    } else {
      onChange({ candidateIds: [...candidateIds, playerId], lockedIds });
    }
  };

  const handleLockToggle = (playerId: number) => {
    const isCandidate = candidateIds.includes(playerId);
    const isLocked = lockedIds.includes(playerId);

    if (!isCandidate) {
      const nextCandidates = [...candidateIds, playerId];
      const nextLocked = [...lockedIds, playerId];
      onChange({ candidateIds: nextCandidates, lockedIds: nextLocked });
      return;
    }

    if (isLocked) {
      const nextLocked = lockedIds.filter((id) => id !== playerId);
      onChange({ candidateIds, lockedIds: nextLocked });
    } else if (!lockLimitReached) {
      onChange({ candidateIds, lockedIds: [...lockedIds, playerId] });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bu Haftaki Maça Katılmak İsteyenler</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="rounded-full bg-orange-100 px-3 py-1 font-medium text-orange-700 dark:bg-orange-900/40 dark:text-orange-200">
            Kesin katılacak: {lockedIds.length}
          </span>
          <span className="rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
            Aday havuzu: {candidateIds.length - lockedIds.length}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {allPlayers.map((player) => {
            const isCandidate = candidateIds.includes(player.id);
            const isLocked = lockedIds.includes(player.id);
            const lockDisabled = !isLocked && lockLimitReached;
            return (
              <div
                key={player.id}
                className={`relative flex flex-col rounded-lg border p-3 transition-all ${
                  isLocked
                    ? "border-orange-500 bg-orange-100 shadow-sm dark:border-orange-400 dark:bg-orange-900/30"
                    : isCandidate
                      ? "border-blue-400 bg-blue-50 dark:border-blue-500/70 dark:bg-blue-900/20"
                      : "border-gray-300 bg-gray-50 opacity-70 dark:border-gray-700 dark:bg-gray-900"
                }`}
                role="button"
                tabIndex={0}
                onClick={() => handleCandidateToggle(player.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleCandidateToggle(player.id);
                  }
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <Checkbox
                    id={`player-${player.id}`}
                    checked={isCandidate}
                    onCheckedChange={() => handleCandidateToggle(player.id)}
                    onClick={(event) => event.stopPropagation()}
                  />
                  <Button
                    type="button"
                    variant={isLocked ? "default" : "outline"}
                    size="icon"
                    className={`h-8 w-8 ${
                      isLocked
                        ? "bg-orange-500 text-white hover:bg-orange-600"
                        : "text-muted-foreground"
                    }`}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleLockToggle(player.id);
                    }}
                    disabled={lockDisabled}
                  >
                    {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    <span className="sr-only">Kesin katılma durumunu değiştir</span>
                  </Button>
                </div>
                <label
                  htmlFor={`player-${player.id}`}
                  className={`mt-3 text-sm font-semibold leading-none ${
                    isCandidate ? "text-gray-900 dark:text-gray-100" : "line-through text-gray-400"
                  }`}
                >
                  {player.name}
                </label>
                {isLocked ? (
                  <span className="mt-2 rounded-full bg-orange-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-orange-900 dark:bg-orange-900/40 dark:text-orange-100">
                    Kesin
                  </span>
                ) : isCandidate ? (
                  <span className="mt-2 rounded-full bg-blue-200 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-blue-900 dark:bg-blue-900/30 dark:text-blue-100">
                    Aday
                  </span>
                ) : (
                  <span className="mt-2 text-[11px] uppercase tracking-wide text-gray-400">Hariç</span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

