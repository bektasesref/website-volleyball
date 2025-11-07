"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type { PlayerRef } from "@/types/player";

interface AllStarVoteFormProps {
  players: PlayerRef[];
  onSubmit: (payload: { voterId: number; pickIds: number[] }) => Promise<void>;
  isSubmitting: boolean;
  disabled?: boolean;
  defaultVoterId?: number | null;
}

const MAX_SELECTION = 12;

export function AllStarVoteForm({
  players,
  onSubmit,
  isSubmitting,
  disabled = false,
  defaultVoterId,
}: AllStarVoteFormProps) {
  const initialVoterId = useMemo(() => defaultVoterId ?? players[0]?.id ?? null, [defaultVoterId, players]);
  const [voterId, setVoterId] = useState<number | null>(initialVoterId);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  const selectionCount = selectedIds.length;

  const handleToggle = (playerId: number) => {
    if (disabled || isSubmitting) {
      return;
    }

    if (selectedIds.includes(playerId)) {
      setSelectedIds(selectedIds.filter((id) => id !== playerId));
      setLocalError(null);
      return;
    }

    if (selectionCount >= MAX_SELECTION) {
      setLocalError(`En fazla ${MAX_SELECTION} oyuncu seçebilirsiniz.`);
      return;
    }

    setSelectedIds([...selectedIds, playerId]);
    setLocalError(null);
  };

  const handleSubmit = async () => {
    if (voterId == null) {
      setLocalError("Lütfen oyu kullanan oyuncuyu seçin.");
      return;
    }

    if (selectionCount !== MAX_SELECTION) {
      setLocalError(`Tam olarak ${MAX_SELECTION} oyuncu seçmelisiniz.`);
      return;
    }

    setLocalError(null);
    try {
      await onSubmit({ voterId, pickIds: selectedIds });
      setSelectedIds([]);
    } catch (submissionError) {
      setLocalError((submissionError as Error).message);
    }
  };

  const handleReset = () => {
    setSelectedIds([]);
    setLocalError(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>All-Star Oylaması</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">Oy Kullanan Oyuncu</label>
          <select
            value={voterId ?? ""}
            onChange={(event) => setVoterId(Number(event.target.value))}
            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900"
            disabled={disabled || isSubmitting}
          >
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-lg border border-dashed border-orange-300 bg-orange-50/70 p-3 text-sm text-orange-800 dark:border-orange-700 dark:bg-orange-900/30 dark:text-orange-100">
          {selectionCount}/{MAX_SELECTION} oyuncu seçildi.
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {players.map((player) => {
            const isSelected = selectedIds.includes(player.id);
            const isDisabled = disabled || isSubmitting || (!isSelected && selectionCount >= MAX_SELECTION)

            return (
              <button
                key={player.id}
                type="button"
                className={`flex items-center gap-3 rounded-lg border p-3 text-left transition ${
                  isSelected
                    ? "border-orange-500 bg-orange-100 shadow-sm dark:border-orange-400 dark:bg-orange-900/30"
                    : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
                } ${isDisabled && !isSelected ? "opacity-50" : ""}`}
                onClick={() => handleToggle(player.id)}
                disabled={isDisabled && !isSelected}
              >
                <Checkbox
                  id={`all-star-${player.id}`}
                  checked={isSelected}
                  className="pointer-events-none"
                />
                <span className="text-sm font-medium">{player.name}</span>
              </button>
            );
          })}
        </div>

        {localError && <div className="rounded-md bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/40 dark:text-red-200">{localError}</div>}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            className="flex-1 bg-orange-500 text-white hover:bg-orange-600"
            onClick={handleSubmit}
            disabled={disabled || isSubmitting}
          >
            {isSubmitting ? "Gönderiliyor..." : "Oyumu Gönder"}
          </Button>
          <Button type="button" variant="outline" onClick={handleReset} disabled={isSubmitting}>
            Sıfırla
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

