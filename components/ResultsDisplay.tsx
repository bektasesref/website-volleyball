"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import type { Player } from "@/constants/players";
import { ALL_PLAYERS } from "@/constants/players";

interface ResultsDisplayProps {
  winners: number[];
  isDrawing: boolean;
}

export function ResultsDisplay({ winners, isDrawing }: ResultsDisplayProps) {
  if (winners.length === 0) return null;

  const getPlayerById = (id: number): Player | undefined => {
    return ALL_PLAYERS.find((p) => p.id === id);
  };

  const winnerPlayers = winners
    .map(getPlayerById)
    .filter((p): p is Player => p !== undefined);

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
          {winnerPlayers.map((player, index) => (
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
    </Card>
  );
}

