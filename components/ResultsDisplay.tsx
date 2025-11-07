"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, UsersRound } from "lucide-react";
import type { PlayerRef } from "@/types/player";

interface ResultsDisplayProps {
  primaryPlayers: PlayerRef[];
  reservePlayers?: PlayerRef[];
}

export function ResultsDisplay({ primaryPlayers, reservePlayers = [] }: ResultsDisplayProps) {
  if (primaryPlayers.length === 0) {
    return null;
  }

  return (
    <Card className="w-full mt-6 bg-linear-to-br from-blue-50 to-orange-50 dark:from-blue-950 dark:to-orange-950">
      <CardHeader>
        <CardTitle className="text-center text-2xl flex items-center justify-center gap-2">
          <CheckCircle2 className="text-green-600" />
          Seçilen 12 Oyuncu
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence mode="popLayout">
          {primaryPlayers.map((player, index) => (
            <motion.div
              key={player.id}
              layout
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                delay: index * 0.1,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              className="flex items-center gap-3 rounded-lg border-2 border-orange-500 bg-white dark:bg-gray-800 p-4 shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-r from-orange-500 to-orange-600 font-bold text-white">
                {index + 1}
              </div>
              <span className="font-semibold text-lg">{player.name}</span>
            </motion.div>
          ))}
        </AnimatePresence>
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

