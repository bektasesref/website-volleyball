"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ALL_PLAYERS } from "@/constants/players";
import type { Player } from "@/constants/players";

interface PlayerSelectorProps {
  selectedPlayers: number[];
  onSelectionChange: (playerIds: number[]) => void;
}

export function PlayerSelector({ selectedPlayers, onSelectionChange }: PlayerSelectorProps) {
  const [playerIds, setPlayerIds] = useState<number[]>(selectedPlayers);

  const handleToggle = (playerId: number) => {
    const newSelection = playerIds.includes(playerId)
      ? playerIds.filter((id) => id !== playerId)
      : [...playerIds, playerId];
    
    setPlayerIds(newSelection);
    onSelectionChange(newSelection);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bu Haftaki Maça Katılmak İsteyenler</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {ALL_PLAYERS.map((player) => (
            <div
              key={player.id}
              className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <Checkbox
                id={`player-${player.id}`}
                checked={playerIds.includes(player.id)}
                onCheckedChange={() => handleToggle(player.id)}
              />
              <label
                htmlFor={`player-${player.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
              >
                {player.name}
              </label>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          Seçilen: {playerIds.length} oyuncu
        </div>
      </CardContent>
    </Card>
  );
}

