"use client";

import { useEffect, useMemo, useState } from "react";
import { AllStarVoteForm } from "@/components/AllStarVoteForm";
import { AllStarResultsCard } from "@/components/AllStarResultsCard";
import { AllStarHistory } from "@/components/AllStarHistory";
import { fetchAllStar, submitAllStarBallot } from "@/services/allStar";
import { ApiError } from "@/lib/http/apiError";
import type { GetAllStarResponse, AllStarResults } from "@/types/all-star";
import type { PlayerRef } from "@/types/player";
import { ALL_PLAYERS } from "@/constants/players";

type StatusMessage = {
  type: "success" | "error";
  message: string;
} | null;

const EMPTY_ALL_STAR_RESULTS: AllStarResults = {
  histogram: [],
  totalBallots: 0,
  lastUpdated: null,
  cycleKey: undefined,
};

export function AllStarTab() {
  const [allStarData, setAllStarData] = useState<GetAllStarResponse | null>(null);
  const [allStarLoading, setAllStarLoading] = useState(true);
  const [allStarStatus, setAllStarStatus] = useState<StatusMessage>(null);
  const [allStarSubmitting, setAllStarSubmitting] = useState(false);
  const [isAllStarHistoryOpen, setAllStarHistoryOpen] = useState(false);

  const availablePlayers = useMemo<PlayerRef[]>(
    () => ALL_PLAYERS.map((player) => ({ id: player.id, name: player.name })),
    []
  );

  useEffect(() => {
    void loadAllStar();
  }, []);

  const allStarResults = allStarData?.results ?? EMPTY_ALL_STAR_RESULTS;
  const allStarBallots = allStarData?.ballots ?? [];

  async function loadAllStar() {
    try {
      setAllStarLoading(true);
      const response = await fetchAllStar({ limit: 20 });
      setAllStarData(response);
      setAllStarStatus(null);
    } catch (fetchError) {
      setAllStarStatus({ type: "error", message: (fetchError as Error).message });
    } finally {
      setAllStarLoading(false);
    }
  }

  async function handleAllStarSubmit(payload: { voterId: number; pickIds: number[] }) {
    setAllStarSubmitting(true);
    try {
      const response = await submitAllStarBallot(payload);
      setAllStarData((prev) => ({
        results: response.results,
        ballots: [
          response.ballot,
          ...(prev?.ballots ?? []).filter((ballot) => ballot.id !== response.ballot.id),
        ],
      }));
      setAllStarStatus({ type: "success", message: "Oyunuz kaydedildi." });
    } catch (submitError) {
      const apiError = submitError as ApiError;
      const message = apiError.message;
      setAllStarStatus({ type: "error", message });
      throw new Error(message);
    } finally {
      setAllStarSubmitting(false);
    }
  }

  return (
    <>
      {allStarStatus && (
        <div
          className={`mb-4 rounded-lg p-4 text-sm font-medium shadow-lg ${
            allStarStatus.type === "success"
              ? "bg-green-500/90 text-white"
              : "bg-red-500/90 text-white"
          }`}
        >
          {allStarStatus.message}
        </div>
      )}

      {allStarLoading ? (
        <div className="rounded-lg bg-white/15 p-6 text-center text-white/80 backdrop-blur">Yükleniyor...</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <AllStarVoteForm
            players={availablePlayers}
            onSubmit={handleAllStarSubmit}
            isSubmitting={allStarSubmitting}
            defaultVoterId={null}
          />
          <AllStarResultsCard results={allStarResults} />
        </div>
      )}

      <div className="mt-10">
        <button
          type="button"
          className="w-full rounded-lg bg-white/20 p-3 text-left text-sm font-medium text-white/90 shadow-md backdrop-blur transition hover:bg-white/30"
          onClick={() => setAllStarHistoryOpen((prev) => !prev)}
        >
          {isAllStarHistoryOpen ? "Geçmiş Oyları Gizle" : "Geçmiş Oyları Göster"}
        </button>
        {isAllStarHistoryOpen && (
          <div className="mt-4">
            {allStarLoading ? (
              <div className="rounded-lg bg-white/10 p-4 text-center text-white/80">Yükleniyor...</div>
            ) : (
              <AllStarHistory ballots={allStarBallots} />
            )}
          </div>
        )}
      </div>
    </>
  );
}


