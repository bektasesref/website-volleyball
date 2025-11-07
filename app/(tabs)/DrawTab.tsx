"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PlayerSelector } from "@/components/PlayerSelector";
import { DrawButton } from "@/components/DrawButton";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { ShareButtons } from "@/components/ShareButtons";
import { DrawHistory } from "@/components/DrawHistory";
import { ConductorModal } from "@/components/ConductorModal";
import { createDraw, fetchDraws } from "@/services/draws";
import { fetchParticipation } from "@/services/participation";
import type { DrawRecord } from "@/types/draw";
import type { PlayerRef } from "@/types/player";
import type { GetParticipationResponse, ParticipationStatusOption } from "@/types/participation";
import { Button } from "@/components/ui/button";
import { ALL_PLAYERS } from "@/constants/players";

const initialSelection = ALL_PLAYERS.map((player) => player.id);

export function DrawTab() {
  const [candidatePlayerIds, setCandidatePlayerIds] = useState<number[]>(initialSelection);
  const [lockedPlayerIds, setLockedPlayerIds] = useState<number[]>([]);
  const [latestDraw, setLatestDraw] = useState<DrawRecord | null>(null);
  const [drawHistory, setDrawHistory] = useState<DrawRecord[]>([]);
  const [drawLoading, setDrawLoading] = useState(true);
  const [drawError, setDrawError] = useState<string | null>(null);
  const [isDrawHistoryOpen, setDrawHistoryOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalConductorId, setModalConductorId] = useState<number | null>(null);

  const [participationData, setParticipationData] = useState<GetParticipationResponse | null>(null);
  const [participationLoading, setParticipationLoading] = useState(true);
  const [participationError, setParticipationError] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  const availablePlayers = useMemo<PlayerRef[]>(
    () => ALL_PLAYERS.map((player) => ({ id: player.id, name: player.name })),
    []
  );

  useEffect(() => {
    void loadDraws();
    void loadParticipation();
  }, []);

  const winners = latestDraw?.primaryPlayers ?? [];
  const reserves = latestDraw?.reservePlayers ?? [];
  const candidatePoolIds = useMemo(
    () => candidatePlayerIds.filter((id) => !lockedPlayerIds.includes(id)),
    [candidatePlayerIds, lockedPlayerIds]
  );
  const totalParticipants = lockedPlayerIds.length + candidatePoolIds.length;
  const participationStatuses = useMemo(() => {
    if (!participationData) {
      return {} as Record<number, ParticipationStatusOption>;
    }
    return participationData.records.reduce<Record<number, ParticipationStatusOption>>((acc, record) => {
      acc[record.player.id] = record.status;
      return acc;
    }, {});
  }, [participationData]);

  const yesParticipantIds = useMemo(() => {
    if (!participationData) {
      return [] as number[];
    }
    return participationData.records
      .filter((record) => record.status === "yes")
      .map((record) => record.player.id);
  }, [participationData]);

  const unavailablePlayers = useMemo(() => {
    if (!participationData) {
      return [] as string[];
    }
    return participationData.records
      .filter((record) => record.status === "no")
      .map((record) => record.player.name);
  }, [participationData]);

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

  async function loadParticipation() {
    try {
      setParticipationLoading(true);
      const response = await fetchParticipation({ limit: 200 });
      setParticipationData(response);
      setParticipationError(null);
    } catch (error) {
      setParticipationError((error as Error).message);
    } finally {
      setParticipationLoading(false);
    }
  }

  function handlePrepareDraw() {
    if (totalParticipants < 12) {
      setDrawError("Kesin katılacaklar ve aday havuzunun toplamı en az 12 olmalı.");
      return;
    }

    setDrawError(null);

    setModalConductorId(latestDraw?.conductor.id ?? availablePlayers[0]?.id ?? null);
    setModalOpen(true);
  }

  async function handleConfirmDraw() {
    if (modalConductorId == null) {
      return;
    }

    setIsDrawing(true);

    try {
      const response = await createDraw({
        conductorId: modalConductorId,
        lockedPlayerIds,
        candidatePlayerIds: candidatePoolIds,
      });

      setLatestDraw(response.draw);
      setDrawHistory((prev) => [response.draw, ...prev.filter((draw) => draw.id !== response.draw.id)]);
      setDrawError(null);
      setModalOpen(false);
      setModalConductorId(null);
    } catch (submitError) {
      setDrawError((submitError as Error).message);
    } finally {
      setIsDrawing(false);
    }
  }

  function handleApplyParticipation() {
    if (!participationData) {
      return;
    }

    const yesIds = participationData.records
      .filter((record) => record.status === "yes")
      .map((record) => record.player.id);

    if (yesIds.length === 0) {
      return;
    }

    setCandidatePlayerIds(yesIds);
    setLockedPlayerIds((prev) => prev.filter((id) => yesIds.includes(id)));
  }

  return (
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

      <div className="mb-6 rounded-xl bg-white/10 p-4 text-white shadow backdrop-blur">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-white/80">Katılım Anketi</div>
            <div className="text-xs text-white/70">
              Katılacak: {participationData?.aggregates.yes ?? 0} • Katılamayacak: {participationData?.aggregates.no ?? 0}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-white/40 bg-white/10 text-white hover:bg-white/20"
              onClick={() => void loadParticipation()}
              disabled={participationLoading}
            >
              {participationLoading ? "Yükleniyor..." : "Anketi Yenile"}
            </Button>
            <Button
              type="button"
              className="bg-green-500 text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleApplyParticipation}
              disabled={participationLoading || yesParticipantIds.length === 0}
            >
              Katılanları Doldur
            </Button>
          </div>
        </div>
        {participationError && (
          <div className="rounded-lg bg-red-500/70 p-3 text-xs font-medium text-white">
            {participationError}
          </div>
        )}
        {!participationError && unavailablePlayers.length > 0 && (
          <div className="text-xs text-white/70">
            Katılamayacaklar: {unavailablePlayers.join(", ")}
          </div>
        )}
        {!participationError && participationData && participationData.records.length === 0 && (
          <div className="text-xs text-white/60">Henüz katılım yanıtı yok.</div>
        )}
      </div>

      <div className="mb-8">
        <PlayerSelector
          candidateIds={candidatePlayerIds}
          lockedIds={lockedPlayerIds}
          participationStatuses={participationStatuses}
          onChange={({ candidateIds, lockedIds }) => {
            setCandidatePlayerIds(candidateIds);
            setLockedPlayerIds(lockedIds);
          }}
        />
      </div>

      <div className="mb-8 text-center">
        <DrawButton onClick={handlePrepareDraw} disabled={totalParticipants < 12 || isDrawing} isDrawing={isDrawing} />
        {totalParticipants < 12 && (
          <p className="mt-4 text-sm text-white/80">
            En az 12 oyuncu seçmelisiniz. Şu anda seçilen: {totalParticipants}
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
        <ResultsDisplay
          lockedPlayers={latestDraw?.lockedPlayers ?? []}
          primaryPlayers={winners}
          reservePlayers={reserves}
        />
        {winners.length > 0 && (
          <ShareButtons
            winners={winners}
            lockedPlayers={latestDraw?.lockedPlayers ?? []}
            resultsRef={resultsRef}
          />
        )}
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
            setModalConductorId(null);
          }
        }}
      />
    </>
  );
}


