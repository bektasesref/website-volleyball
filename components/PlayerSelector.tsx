"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ALL_PLAYERS } from "@/constants/players";
import type { Player } from "@/constants/players";
import { Plus } from "lucide-react";

interface PlayerSelectorProps {
  selectedPlayers: number[];
  onSelectionChange: (playerIds: number[]) => void;
}

export function PlayerSelector({ selectedPlayers, onSelectionChange }: PlayerSelectorProps) {
  const [customPlayers, setCustomPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [nextCustomId, setNextCustomId] = useState(1000);
  
  const allPlayers = [...ALL_PLAYERS, ...customPlayers];
  
  // Başlangıçta tüm oyuncuları seçili yap
  const [playerIds, setPlayerIds] = useState<number[]>([]);
  
  useEffect(() => {
    // İlk yüklemede tüm oyuncuları seç
    if (selectedPlayers.length === 0 && playerIds.length === 0) {
      const allIds = allPlayers.map(p => p.id);
      setPlayerIds(allIds);
      onSelectionChange(allIds);
    } else if (selectedPlayers.length > 0 && playerIds.length === 0) {
      setPlayerIds(selectedPlayers);
    }
  }, []);

  // customPlayers değiştiğinde yeni oyuncuları otomatik seç
  useEffect(() => {
    const allIds = allPlayers.map(p => p.id);
    setPlayerIds(prev => {
      // Yeni eklenen oyuncuları seç
      const newPlayers = allPlayers.filter(p => !prev.includes(p.id));
      if (newPlayers.length > 0) {
        const updated = [...prev, ...newPlayers.map(p => p.id)];
        onSelectionChange(updated);
        return updated;
      }
      return prev;
    });
  }, [customPlayers]);

  const handleToggle = (playerId: number) => {
    const newSelection = playerIds.includes(playerId)
      ? playerIds.filter((id) => id !== playerId)
      : [...playerIds, playerId];
    
    setPlayerIds(newSelection);
    onSelectionChange(newSelection);
  };

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      const newPlayer: Player = {
        id: nextCustomId,
        name: newPlayerName.trim(),
      };
      setCustomPlayers([...customPlayers, newPlayer]);
      setNextCustomId(nextCustomId + 1);
      setNewPlayerName("");
      // Yeni oyuncuyu otomatik seç
      setPlayerIds(prev => [...prev, nextCustomId]);
    }
  };

  const handleRemovePlayer = (playerId: number) => {
    const filtered = customPlayers.filter((p) => p.id !== playerId);
    setCustomPlayers(filtered);
    // Seçilmiş oyuncuyu da seçimden çıkar
    const newSelection = playerIds.filter((id) => id !== playerId);
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
          {allPlayers.map((player) => {
            const isSelected = playerIds.includes(player.id);
            return (
              <div
                key={player.id}
                className={`relative flex items-center space-x-3 rounded-lg border p-3 transition-all group cursor-pointer active:scale-95 ${
                  isSelected 
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20 shadow-sm" 
                    : "border-gray-300 bg-gray-50 opacity-60"
                }`}
                onClick={(e) => {
                  // Sadece checkbox veya label dışındaki alana tıklandığında çalış
                  const target = e.target as HTMLElement;
                  if (!target.closest('button, input, label')) {
                    handleToggle(player.id);
                  }
                }}
              >
                <Checkbox
                  id={`player-${player.id}`}
                  checked={isSelected}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleToggle(player.id);
                    } else {
                      handleToggle(player.id);
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(player.id);
                  }}
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
                {customPlayers.some((p) => p.id === player.id) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePlayer(player.id);
                    }}
                    className="ml-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xl font-bold w-6 h-6 flex items-center justify-center hover:bg-red-50 rounded"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          Seçilen: {playerIds.length} oyuncu
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Input
          placeholder="Yeni oyuncu adı..."
          value={newPlayerName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPlayerName(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              handleAddPlayer();
            }
          }}
          className="flex-1"
        />
        <Button onClick={handleAddPlayer} disabled={!newPlayerName.trim()}>
          <Plus className="h-4 w-4 mr-2" />
          Ekle
        </Button>
      </CardFooter>
    </Card>
  );
}

