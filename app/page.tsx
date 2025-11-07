"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PlayerSelector } from "@/components/PlayerSelector";
import { DrawButton } from "@/components/DrawButton";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { ShareButtons } from "@/components/ShareButtons";
import { DrawHistory } from "@/components/DrawHistory";
import { ConductorModal } from "@/components/ConductorModal";
import { AllStarVoteForm } from "@/components/AllStarVoteForm";
import { AllStarResultsCard } from "@/components/AllStarResultsCard";
import { AllStarHistory } from "@/components/AllStarHistory";
import { createDraw, fetchDraws } from "@/services/draws";
import { fetchAllStar, submitAllStarBallot } from "@/services/allStar";
import { ApiError } from "@/lib/http/apiError";
import type { DrawRecord } from "@/types/draw";
import type { GetAllStarResponse, AllStarResults } from "@/types/all-star";
import type { PlayerRef } from "@/types/player";
import { ALL_PLAYERS } from "@/constants/players";
import { buildPlayerSnapshots } from "@/lib/players";

type PendingDraw = {
  primaryIds: number[];
  reserveIds: number[];
  primaryPlayers: PlayerRef[];
  reservePlayers: PlayerRef[];
};

type TabId = "draw" | "allStar";

type StatusMessage = {
  type: "success" | "error";
  message: string;
} | null;

const initialSelection = ALL_PLAYERS.map((player) => player.id);

const EMPTY_ALL_STAR_RESULTS: AllStarResults = {
  histogram: [],
  totalBallots: 0,
  lastUpdated: null,
  cycleKey: undefined,
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("draw");

  const [selectedPlayers, setSelectedPlayers] = useState<number[]>(initialSelection);
  const [latestDraw, setLatestDraw] = useState<DrawRecord | null>(null);
  const [drawHistory, setDrawHistory] = useState<DrawRecord[]>([]);
  const [drawLoading, setDrawLoading] = useState(true);
  const [drawError, setDrawError] = useState<string | null>(null);
  const [isDrawHistoryOpen, setDrawHistoryOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [pendingDraw, setPendingDraw] = useState<PendingDraw | null>(null);
  const [modalConductorId, setModalConductorId] = useState<number | null>(null);

  const [allStarData, setAllStarData] = useState<GetAllStarResponse | null>(null);
  const [allStarLoading, setAllStarLoading] = useState(true);
  const [allStarStatus, setAllStarStatus] = useState<StatusMessage>(null);
  const [allStarSubmitting, setAllStarSubmitting] = useState(false);
  const [isAllStarHistoryOpen, setAllStarHistoryOpen] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  const availablePlayers = useMemo<PlayerRef[]>(
    () => ALL_PLAYERS.map((player) => ({ id: player.id, name: player.name })),
    []
  );

  const tabs = useMemo(
    () => [
      { id: "draw" as TabId, label: "Haftalık Kura" },
      { id: "allStar" as TabId, label: "All-Star Oylaması" },
    ],
    []
  );

  useEffect(() => {
    void Promise.all([loadDraws(), loadAllStar()]);
  }, []);

  const winners = latestDraw?.primaryPlayers ?? [];
  const reserves = latestDraw?.reservePlayers ?? [];
  const selectedCount = selectedPlayers.length;
  const allStarResults = allStarData?.results ?? EMPTY_ALL_STAR_RESULTS;
  const allStarBallots = allStarData?.ballots ?? [];

  async function loadDraws() {
    try {
      setDrawLoading(true);
      const response = await fetchDraws({ limit: 20 });
      setLatestDraw(response.latest);
      setDrawHistory(response.history);
      setDrawError(null);
    } catch (fetchError) {
      setDrawError((fetchError as Error).message);
    } finally {
      setDrawLoading(false);
    }
  }

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

  function handlePrepareDraw() {
    if (selectedPlayers.length < 12) {
      setDrawError("En az 12 oyuncu seçmelisiniz.");
      return;
    }

    setDrawError(null);

    const shuffled = shuffle([...selectedPlayers]);
    const primaryIds = shuffled.slice(0, 12);
    const reserveIds = shuffled.slice(12);

    const primaryPlayers = buildPlayerSnapshots(primaryIds);
    const reservePlayers = buildPlayerSnapshots(reserveIds);

    setPendingDraw({ primaryIds, reserveIds, primaryPlayers, reservePlayers });
    setModalConductorId(latestDraw?.conductor.id ?? availablePlayers[0]?.id ?? null);
    setModalOpen(true);
  }

  async function handleConfirmDraw() {
    if (!pendingDraw || modalConductorId == null) {
      return;
    }

    setIsDrawing(true);

    try {
      const response = await createDraw({
        conductorId: modalConductorId,
        primaryPlayerIds: pendingDraw.primaryIds,
        reservePlayerIds: pendingDraw.reserveIds,
      });

      setLatestDraw(response.draw);
      setDrawHistory((prev) => [response.draw, ...prev.filter((draw) => draw.id !== response.draw.id)]);
      setDrawError(null);
      setModalOpen(false);
      setPendingDraw(null);
      setModalConductorId(null);
    } catch (submitError) {
      setDrawError((submitError as Error).message);
    } finally {
      setIsDrawing(false);
    }
  }

  async function handleAllStarSubmit(payload: { voterId: number; pickIds: number[] }) {
    setAllStarSubmitting(true);
    try {
      const response = await submitAllStarBallot(payload);
      setAllStarData((prev) => ({
        results: response.results,
        ballots: [response.ballot, ...(prev?.ballots ?? []).filter((ballot) => ballot.id !== response.ballot.id)],
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
    <div className="min-h-screen bg-linear-to-br from-blue-500 via-blue-400 to-orange-400 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white drop-shadow-lg md:text-5xl">
            🏐 Online Turnuva Kura & All-Star Oylaması
          </h1>
          <p className="text-xl text-white/90">12 kişilik takım için kura çekimi ve all-star oylaması</p>
        </div>

        <div className="mb-8 flex gap-2 rounded-full bg-white/15 p-1 backdrop-blur">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-white text-orange-600 shadow"
                    : "text-white/80 hover:bg-white/20"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "draw" ? (
          <>
            {latestDraw && (
              <div className="mb-6 rounded-xl bg-white/15 p-4 text-white shadow-lg backdrop-blur">
                <div className="text-sm uppercase tracking-wide text-white/80">Bu Haftanın Kurası</div>
                <div className="mt-1 text-lg font-semibold">
                  {latestDraw.conductor.name} tarafından {new Date(latestDraw.createdAt).toLocaleString("tr-TR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })} tarihinde çekildi.
                </div>
              </div>
            )}

            {drawError && (
              <div className="mb-4 rounded-lg bg-red-500/90 p-4 text-sm font-medium text-white shadow-lg">
                {drawError}
              </div>
            )}

            <div className="mb-8">
              <PlayerSelector selectedPlayers={selectedPlayers} onSelectionChange={setSelectedPlayers} />
            </div>

            <div className="mb-8 text-center">
              <DrawButton onClick={handlePrepareDraw} disabled={selectedCount < 12 || isDrawing} isDrawing={isDrawing} />
              {selectedCount < 12 && (
                <p className="mt-4 text-sm text-white/80">
                  En az 12 oyuncu seçmelisiniz. Şu anda seçilen: {selectedCount}
                </p>
              )}
            </div>

            {isDrawing && (
              <div className="mb-8 text-center">
                <div className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-6 py-4 backdrop-blur-sm">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
                  <span className="text-lg font-semibold text-white">Kura kaydediliyor...</span>
                </div>
              </div>
            )}

            <div ref={resultsRef}>
              <ResultsDisplay primaryPlayers={winners} reservePlayers={reserves} />
              {winners.length > 0 && <ShareButtons winners={winners} resultsRef={resultsRef} />}
            </div>

            <div className="mt-10">
              <button
                type="button"
                className="w-full rounded-lg bg-white/20 p-3 text-left text-sm font-medium text-white/90 shadow-md backdrop-blur transition hover:bg-white/30"
                onClick={() => setDrawHistoryOpen((prev) => !prev)}
              >
                {isDrawHistoryOpen ? "Geçmiş Kuraları Gizle" : "Geçmiş Kuraları Göster"}
              </button>
              {isDrawHistoryOpen && (
                <div className="mt-4">
                  {drawLoading ? (
                    <div className="rounded-lg bg-white/10 p-4 text-center text-white/80">Yükleniyor...</div>
                  ) : (
                    <DrawHistory draws={drawHistory} />
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
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
                  defaultVoterId={availablePlayers[0]?.id ?? null}
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
        )}
      </div>

      <ConductorModal
        open={isModalOpen}
        players={availablePlayers}
        selectedConductorId={modalConductorId}
        isSubmitting={isDrawing}
        onSelect={setModalConductorId}
        onConfirm={handleConfirmDraw}
        onClose={() => {
          if (!isDrawing) {
            setModalOpen(false);
            setPendingDraw(null);
            setModalConductorId(null);
          }
        }}
      />
    </div>
  );
}

function shuffle(array: number[]): number[] {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
