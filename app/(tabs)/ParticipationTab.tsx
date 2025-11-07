"use client";

import { useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import { ALL_PLAYERS } from "@/constants/players";
import { fetchParticipation, submitParticipation } from "@/services/participation";
import { ApiError } from "@/lib/http/apiError";
import type {
  GetParticipationResponse,
  ParticipationStatusOption,
} from "@/types/participation";
import type { PlayerRef } from "@/types/player";

type StatusMessage = {
  type: "success" | "error";
  message: string;
} | null;

const STATUS_OPTIONS: Array<{
  value: ParticipationStatusOption;
  label: string;
  description: string;
}> = [
  { value: "yes", label: "Katılmak istiyorum", description: "Bu hafta sahadayım" },
  { value: "no", label: "Katılamıyorum", description: "Bu hafta gelemeyeceğim" },
];

export function ParticipationTab() {
  const availablePlayers = useMemo<PlayerRef[]>(
    () => ALL_PLAYERS.map((player) => ({ id: player.id, name: player.name })),
    []
  );

  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(availablePlayers[0]?.id ?? null);
  const [selectedStatus, setSelectedStatus] = useState<ParticipationStatusOption>("yes");
  const [statusMessage, setStatusMessage] = useState<StatusMessage>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<GetParticipationResponse | null>(null);
  const [isHistoryOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    void loadParticipation();
  }, []);

  useEffect(() => {
    if (!data || selectedPlayerId == null) {
      return;
    }
    const existingRecord = data.records.find((record) => record.player.id === selectedPlayerId);
    if (existingRecord) {
      setSelectedStatus(existingRecord.status);
    }
  }, [data, selectedPlayerId]);

  const aggregates = data?.aggregates;
  const records = data?.records ?? [];

  async function loadParticipation() {
    try {
      setLoading(true);
      const response = await fetchParticipation({ limit: 50 });
      setData(response);
      setStatusMessage(null);
    } catch (error) {
      setStatusMessage({ type: "error", message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (selectedPlayerId == null) {
      setStatusMessage({ type: "error", message: "Lütfen katılım durumunu bildirecek oyuncuyu seçin." });
      return;
    }

    setSubmitting(true);

    try {
      const response = await submitParticipation({
        playerId: selectedPlayerId,
        status: selectedStatus,
      });
      setData({
        aggregates: response.aggregates,
        records: [
          response.record,
          ...(data?.records ?? []).filter((record) => record.id !== response.record.id),
        ],
      });
      setStatusMessage({ type: "success", message: "Katılım durumunuz kaydedildi." });
    } catch (error) {
      const apiError = error as ApiError;
      setStatusMessage({ type: "error", message: apiError.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {statusMessage && (
        <div
          className={clsx(
            "rounded-lg p-4 text-sm font-medium shadow-lg",
            statusMessage.type === "success"
              ? "bg-green-500/90 text-white"
              : "bg-red-500/90 text-white"
          )}
        >
          {statusMessage.message}
        </div>
      )}

      <div className="rounded-2xl bg-white/15 p-6 text-white shadow-lg backdrop-blur">
        <div className="mb-4 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">Oyuncu</label>
            <select
              value={selectedPlayerId ?? ""}
              onChange={(event) => setSelectedPlayerId(Number(event.target.value))}
              className="w-full rounded-lg border border-white/20 bg-white/10 p-3 text-sm text-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
              disabled={submitting}
            >
              {availablePlayers.map((player) => (
                <option key={player.id} value={player.id} className="text-gray-900">
                  {player.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium text-white/80">Katılım Durumu</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {STATUS_OPTIONS.map((option) => {
                const isSelected = selectedStatus === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={clsx(
                      "rounded-xl border p-4 text-left transition",
                      isSelected
                        ? "border-green-400 bg-green-500/80 text-white shadow"
                        : "border-white/20 bg-white/10 text-white/90 hover:border-green-400 hover:bg-green-400/30"
                    )}
                    onClick={() => setSelectedStatus(option.value)}
                    disabled={submitting}
                  >
                    <div className="text-base font-semibold">{option.label}</div>
                    <div className="text-xs text-white/70">{option.description}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="mt-4 w-full rounded-lg bg-green-500 py-3 text-sm font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Gönderiliyor..." : "Katılımımı Kaydet"}
        </button>
      </div>

      <div className="rounded-2xl bg-white/10 p-6 text-white/90 shadow-lg backdrop-blur">
        {loading ? (
          <div className="text-center text-white/70">Katılım bilgileri yükleniyor...</div>
        ) : aggregates ? (
          <div className="space-y-4">
            <div className="text-sm uppercase tracking-wide text-white/70">Bu Haftanın Katılım Özeti</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-green-400/60 bg-green-500/30 p-4 text-white">
                <div className="text-sm">Katılacak</div>
                <div className="text-3xl font-bold">{aggregates.yes}</div>
              </div>
              <div className="rounded-lg border border-red-400/60 bg-red-500/30 p-4 text-white">
                <div className="text-sm">Katılamayacak</div>
                <div className="text-3xl font-bold">{aggregates.no}</div>
              </div>
            </div>
            <div className="text-xs text-white/60">
              Toplam {aggregates.totalResponses} yanıt • Güncellendi: {aggregates.lastUpdated
                ? new Date(aggregates.lastUpdated).toLocaleString("tr-TR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "-"}
            </div>
          </div>
        ) : (
          <div className="text-center text-white/70">Katılım verisi bulunamadı.</div>
        )}
      </div>

      <div>
        <button
          type="button"
          className="w-full rounded-lg bg-white/20 p-3 text-left text-sm font-medium text-white/90 shadow-md backdrop-blur transition hover:bg-white/30"
          onClick={() => setHistoryOpen((prev) => !prev)}
        >
          {isHistoryOpen ? "Yanıt Geçmişini Gizle" : "Yanıt Geçmişini Göster"}
        </button>
        {isHistoryOpen && (
          <div className="mt-4 space-y-2 rounded-lg bg-white/10 p-4 text-white/90 backdrop-blur">
            {records.length === 0 ? (
              <div className="text-sm text-white/70">Henüz yanıt yok.</div>
            ) : (
              records.map((record) => (
                <div key={record.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{record.player.name}</span>
                  <span>{
                    STATUS_OPTIONS.find((option) => option.value === record.status)?.label ?? record.status
                  }</span>
                  <span className="text-xs text-white/60">
                    {new Date(record.submittedAt).toLocaleString("tr-TR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}


