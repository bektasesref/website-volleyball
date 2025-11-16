"use client";

import { useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import { ALL_PLAYERS } from "@/constants/players";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchParticipation, submitParticipation } from "@/services/participation";
import { fetchMatchDay } from "@/services/matchDay";
import { deriveCycleKey } from "@/lib/utils/cycle";
import { ApiError } from "@/lib/http/apiError";
import type {
  GetParticipationResponse,
  ParticipationStatusOption,
} from "@/types/participation";
import type { DayOfWeek, GetMatchDayResponse } from "@/types/match-day";
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

const DAY_OPTIONS: Array<{ value: DayOfWeek; label: string }> = [
  { value: "monday", label: "Pazartesi" },
  { value: "tuesday", label: "Salı" },
  { value: "wednesday", label: "Çarşamba" },
  { value: "thursday", label: "Perşembe" },
  { value: "friday", label: "Cuma" },
  { value: "saturday", label: "Cumartesi" },
  { value: "sunday", label: "Pazar" },
];

export function ParticipationTab() {
  const availablePlayers = useMemo<PlayerRef[]>(
    () => ALL_PLAYERS.map((player) => ({ id: player.id, name: player.name })),
    []
  );

  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ParticipationStatusOption>("yes");
  const [statusMessage, setStatusMessage] = useState<StatusMessage>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentWeekData, setCurrentWeekData] = useState<GetParticipationResponse | null>(null);
  const [allRecords, setAllRecords] = useState<GetParticipationResponse["records"]>([]);
  const [matchDayData, setMatchDayData] = useState<GetMatchDayResponse | null>(null);
  const [isHistoryOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    void loadParticipation();
    void loadAllRecords();
    void loadMatchDay();
  }, []);

  useEffect(() => {
    if (!currentWeekData || selectedPlayerId == null) {
      return;
    }
    const existingRecord = currentWeekData.records.find((record) => record.player.id === selectedPlayerId);
    if (existingRecord) {
      setSelectedStatus(existingRecord.status);
    }
  }, [currentWeekData, selectedPlayerId]);

  const aggregates = currentWeekData?.aggregates;
  const records = allRecords;
  const winningDay = matchDayData?.results.winningDay;
  const winningDayLabel = winningDay
    ? DAY_OPTIONS.find((option) => option.value === winningDay)?.label ?? ""
    : null;

  async function loadParticipation() {
    try {
      setLoading(true);
      const currentCycleKey = deriveCycleKey();
      const response = await fetchParticipation({ limit: 50, cycleKey: currentCycleKey });
      setCurrentWeekData(response);
      setStatusMessage(null);
    } catch (error) {
      setStatusMessage({ type: "error", message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  }

  async function loadAllRecords() {
    try {
      const response = await fetchParticipation({ limit: 200 });
      setAllRecords(response.records);
    } catch (error) {
      // Silently fail for history
    }
  }

  async function loadMatchDay() {
    try {
      const currentCycleKey = deriveCycleKey();
      const response = await fetchMatchDay({ limit: 1, cycleKey: currentCycleKey });
      setMatchDayData(response);
    } catch (error) {
      // Silently fail, don't show error for match day
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
      setCurrentWeekData({
        aggregates: response.aggregates,
        records: [
          response.record,
          ...(currentWeekData?.records ?? []).filter((record) => record.id !== response.record.id),
        ],
      });
      // Refresh all records to include the new one
      await loadAllRecords();
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

      <Card className="border-none bg-white" data-card="participation-form">
        <CardHeader className="pb-4">
          <CardTitle>Haftalık Katılım Anketi</CardTitle>
          <CardDescription>
            {winningDayLabel ? (
              <>
                Lider olarak önde giden gün: <span className="font-semibold text-orange-600">{winningDayLabel}</span>. Bu gün için katılım sağlayıp sağlayamayacağınız belirsiz.
              </>
            ) : (
              "Bu hafta maçta olup olmayacağınızı belirtin, kura sekmesi otomatik güncellensin."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Oyuncu</label>
            <select
              value={selectedPlayerId ?? ""}
              onChange={(event) => {
                const value = event.target.value;
                setSelectedPlayerId(value === "" ? null : Number(value));
              }}
              className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-400"
              disabled={submitting}
            >
              <option value="">Oyuncu seçin...</option>
              {availablePlayers.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium text-gray-700">Katılım Durumu</div>
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
                        ? "border-green-500 bg-green-500 text-white shadow"
                        : "border-gray-200 bg-white text-gray-800 hover:border-green-400 hover:bg-green-50"
                    )}
                    onClick={() => setSelectedStatus(option.value)}
                    disabled={submitting}
                  >
                    <div className="text-base font-semibold">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            className="w-full rounded-lg bg-green-500 py-3 text-sm font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleSubmit}
            disabled={submitting || selectedPlayerId == null}
          >
            {submitting ? "Gönderiliyor..." : "Katılımımı Kaydet"}
          </button>
        </CardContent>
      </Card>

      <Card className="border-none bg-white" data-card="participation-summary">
        <CardHeader className="pb-4">
          <CardTitle>Bu Haftanın Katılım Özeti</CardTitle>
          <CardDescription>Toplam katılan / katılamayan sayısı ve güncellenme zamanı.</CardDescription>
        </CardHeader>
        <CardContent>
        {loading ? (
          <div className="text-center text-gray-500">Katılım bilgileri yükleniyor...</div>
        ) : aggregates ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
                <div className="text-sm font-medium">Katılacak</div>
                <div className="text-3xl font-bold">{aggregates.yes}</div>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                <div className="text-sm font-medium">Katılamayacak</div>
                <div className="text-3xl font-bold">{aggregates.no}</div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Toplam {aggregates.totalResponses} yanıt • Güncellendi: {aggregates.lastUpdated
                ? new Date(aggregates.lastUpdated).toLocaleString("tr-TR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "-"}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">Katılım verisi bulunamadı.</div>
        )}
        </CardContent>
      </Card>

      <div>
        <button
          type="button"
          className="w-full rounded-lg bg-white/20 p-3 text-left text-sm font-medium text-white/90 shadow-md backdrop-blur transition hover:bg-white/30"
          onClick={() => setHistoryOpen((prev) => !prev)}
        >
          {isHistoryOpen ? "Yanıt Geçmişini Gizle" : "Yanıt Geçmişini Göster"}
        </button>
        {isHistoryOpen && (
          <Card className="mt-4 border border-gray-200" data-card="participation-history">
            <CardHeader className="pb-3">
              <CardTitle>Katılım Yanıtları</CardTitle>
              <CardDescription>Haftanın yanıt geçmişini görüntüleyin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-700">
              {records.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-gray-500">
                  Henüz yanıt yok.
                </div>
              ) : (
                (() => {
                  const groupedByCycle = records.reduce((acc, record) => {
                    const key = record.cycleKey ?? "Bilinmeyen";
                    if (!acc[key]) {
                      acc[key] = [];
                    }
                    acc[key].push(record);
                    return acc;
                  }, {} as Record<string, typeof records>);

                  return Object.entries(groupedByCycle)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .map(([cycleKey, cycleRecords]) => (
                      <div key={cycleKey} className="space-y-2">
                        <div className="sticky top-0 z-10 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
                          {cycleKey}
                        </div>
                        {cycleRecords.map((record) => (
                          <div key={record.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2">
                            <span className="font-medium text-gray-800">{record.player.name}</span>
                            <span>{
                              STATUS_OPTIONS.find((option) => option.value === record.status)?.label ?? record.status
                            }</span>
                            <span className="text-xs text-gray-500">
                              {new Date(record.submittedAt).toLocaleString("tr-TR", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    ));
                })()
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


