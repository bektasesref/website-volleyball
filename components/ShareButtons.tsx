"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Copy, Share2, Check } from "lucide-react";
import type { PlayerRef } from "@/types/player";

interface ShareButtonsProps {
  winners: PlayerRef[];
  lockedPlayers?: PlayerRef[];
  resultsRef?: { current: HTMLDivElement | null };
}

export function ShareButtons({ winners, lockedPlayers = [], resultsRef }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const lockedIds = new Set(lockedPlayers.map((player) => player.id));

  const handleCopy = () => {
    const winnersText = winners
      .map((player, index) => {
        const prefix = lockedIds.has(player.id) ? "(Kesin) " : "";
        return `${index + 1}. ${prefix}${player.name}`;
      })
      .join("\n");

    const textToCopy = `🏐 Bu Hafta Seçilen Oyuncular:\n\n${winnersText}`;
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const winnersText = winners
      .map((player, index) => {
        const prefix = lockedIds.has(player.id) ? "(Kesin) " : "";
        return `${index + 1}. ${prefix}${player.name}`;
      })
      .join("\n");

    const message = `🏐 Bu Hafta Seçilen Oyuncular:\n\n${winnersText}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-4">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex-1"
      >
        <Button
          onClick={handleCopy}
          variant="outline"
          className="w-full"
          disabled={winners.length === 0}
        >
          {copied ? (
            <>
              <Check className="mr-2" />
              Kopyalandı!
            </>
          ) : (
            <>
              <Copy className="mr-2" />
              Kopyala
            </>
          )}
        </Button>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex-1"
      >
        <Button
          onClick={handleWhatsApp}
          variant="outline"
          className="w-full"
          disabled={winners.length === 0}
        >
          <Share2 className="mr-2" />
          WhatsApp
        </Button>
      </motion.div>
    </div>
  );
}

