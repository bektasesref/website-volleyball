"use client";

import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ALL_PLAYERS } from "@/constants/players";

interface PlayerSelectorProps {
  selectedPlayers: number[];
  onSelectionChange: (playerIds: number[]) => void;
}

export function PlayerSelector({ selectedPlayers, onSelectionChange }: PlayerSelectorProps) {
  const allPlayers = useMemo(() => [...ALL_PLAYERS], []);

  const handleToggle = (playerId: number) => {
    const newSelection = selectedPlayers.includes(playerId)
      ? selectedPlayers.filter((id) => id !== playerId)
      : [...selectedPlayers, playerId];

    onSelectionChange(newSelection);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bu Haftaki Maça Katılmak İsteyenler</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {allPlayers.map((player) => {
            const isSelected = selectedPlayers.includes(player.id);
            return (
              <button
                key={player.id}
                type="button"
                className={`relative flex items-center space-x-3 rounded-lg border p-3 transition-all ${
                  isSelected
                    ? "border-orange-500 bg-orange-50 shadow-sm dark:bg-orange-950/20"
                    : "border-gray-300 bg-gray-50 opacity-70"
                }`}
                onClick={() => handleToggle(player.id)}
              >
                <Checkbox
                  id={`player-${player.id}`}
                  checked={isSelected}
                  onCheckedChange={() => handleToggle(player.id)}
                  onClick={(event) => event.stopPropagation()}
                />
                <label
                  htmlFor={`player-${player.id}`}
                  className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 select-none pointer-events-none ${
                    isSelected
                      ? ""
                      : "line-through text-gray-400"
                  }`}
                >
                  {player.name}
                </label>
              </button>
            );
          })}
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          Seçilen: {selectedPlayers.length} oyuncu
        </div>
      </CardContent>
    </Card>
  );
}

