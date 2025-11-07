"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { PlayerRef } from "@/types/player";

interface ConductorModalProps {
  open: boolean;
  players: PlayerRef[];
  selectedConductorId: number | null;
  isSubmitting?: boolean;
  onSelect: (conductorId: number) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConductorModal({
  open,
  players,
  selectedConductorId,
  isSubmitting = false,
  onSelect,
  onConfirm,
  onClose,
}: ConductorModalProps) {
  const fallbackId = players[0]?.id ?? null;
  const currentConductorId = selectedConductorId ?? fallbackId;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Kura Sorumlusunu Seç
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Çekilişi başlatan kişinin ismini seçerek kaydı tamamlayalım.
              </p>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Sorumlu Oyuncu
              </label>
              <select
                value={currentConductorId ?? ""}
                onChange={(event) => onSelect(Number(event.target.value))}
                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-gray-700 dark:bg-gray-800"
              >
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Vazgeç
              </Button>
              <Button
                onClick={onConfirm}
                disabled={currentConductorId == null || isSubmitting}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isSubmitting ? "Kaydediliyor..." : "Kurayı Başlat"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

