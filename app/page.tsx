"use client";

import { useState, useRef } from "react";
import { PlayerSelector } from "@/components/PlayerSelector";
import { DrawButton } from "@/components/DrawButton";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { ShareButtons } from "@/components/ShareButtons";

export default function Home() {
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [winners, setWinners] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleDraw = () => {
    if (selectedPlayers.length < 12) return;

    setIsDrawing(true);
    
    // Shuffle array function
    const shuffleArray = (array: number[]) => {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    };

    // Simulate drawing animation
    setTimeout(() => {
      const shuffled = shuffleArray(selectedPlayers);
      const selected = shuffled.slice(0, 12);
      setWinners(selected);
      setIsDrawing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-500 via-blue-400 to-orange-400 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white drop-shadow-lg md:text-5xl">
            🏐 Online Turnuva Kura
          </h1>
          <p className="text-xl text-white/90">
            12 kişilik takım için kura çekimi
          </p>
        </div>

        <div className="mb-8">
          <PlayerSelector
            selectedPlayers={selectedPlayers}
            onSelectionChange={setSelectedPlayers}
          />
        </div>

        <div className="mb-8 text-center">
          <DrawButton
            onClick={handleDraw}
            disabled={selectedPlayers.length < 12}
            isDrawing={isDrawing}
          />
          {selectedPlayers.length < 12 && (
            <p className="mt-4 text-sm text-white/80">
              En az 12 oyuncu seçmelisiniz. Şu anda seçilen: {selectedPlayers.length}
            </p>
          )}
        </div>

        {isDrawing && (
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-6 py-4 backdrop-blur-sm">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
              <span className="text-lg font-semibold text-white">
                Kura çekiliyor... Gerilim zirvede!
              </span>
            </div>
          </div>
        )}

        <div ref={resultsRef}>
          <ResultsDisplay winners={winners} isDrawing={isDrawing} />
          {winners.length > 0 && (
            <ShareButtons winners={winners} resultsRef={resultsRef} />
          )}
        </div>
      </div>
    </div>
  );
}
