"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, UsersRound } from "lucide-react";
import type { PlayerRef } from "@/types/player";

interface ResultsDisplayProps {
  lockedPlayers: PlayerRef[];
  primaryPlayers: PlayerRef[];
  reservePlayers?: PlayerRef[];
  cycleKey?: string;
}

export function ResultsDisplay({ lockedPlayers, primaryPlayers, reservePlayers = [], cycleKey }: ResultsDisplayProps) {
  if (primaryPlayers.length === 0) {
    return null;
  }

  const lockedIds = new Set(lockedPlayers.map((player) => player.id));

  return (
    <Card className="w-full mt-6 bg-linear-to-br from-blue-50 to-orange-50 dark:from-blue-950 dark:to-orange-950">
      <CardHeader>
        <CardTitle className="text-center text-2xl flex items-center justify-center gap-2">
          <CheckCircle2 className="text-green-600" />
          {cycleKey ? "Bu Hafta için Seçilen 12 Oyuncu" : "Seçilen 12 Oyuncu"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {primaryPlayers.map((player, index) => {
              const isLocked = lockedIds.has(player.id);
              return (
                <motion.div
                  key={player.id}
                  layout
                  initial={{ opacity: 0, scale: 0.85, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.07, type: "spring", stiffness: 220, damping: 22 }}
                  className={`flex items-center gap-3 rounded-lg border-2 p-4 shadow-md dark:bg-gray-800 ${
                    isLocked
                      ? "border-orange-500 bg-white"
                      : "border-blue-500 bg-white"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-white ${
                      isLocked
                        ? "bg-linear-to-r from-orange-500 to-orange-600"
                        : "bg-linear-to-r from-blue-500 to-blue-600"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{player.name}</div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {isLocked ? "Kesin Katılacak" : "Kura ile seçildi"}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </CardContent>
      {reservePlayers.length > 0 && (
        <div className="border-t border-orange-200 bg-white/60 p-4 dark:bg-gray-900/40">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-orange-600 dark:text-orange-300">
            <UsersRound className="h-4 w-4" />
            Yedek Oyuncular
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {reservePlayers.map((player) => (
              <span
                key={player.id}
                className="rounded-full bg-orange-100 px-3 py-1 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200"
              >
                {player.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

