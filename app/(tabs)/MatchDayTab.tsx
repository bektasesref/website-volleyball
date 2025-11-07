"use client";

import { useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import { ALL_PLAYERS } from "@/constants/players";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchMatchDay, submitMatchDayVote } from "@/services/matchDay";
import { ApiError } from "@/lib/http/apiError";
import type { DayOfWeek, GetMatchDayResponse } from "@/types/match-day";
import type { PlayerRef } from "@/types/player";

type StatusMessage = {
  type: "success" | "error";
  message: string;
} | null;

const DAY_OPTIONS: Array<{ value: DayOfWeek; label: string }> = [
  { value: "monday", label: "Pazartesi" },
  { value: "tuesday", label: "Salı" },
  { value: "wednesday", label: "Çarşamba" },
  { value: "thursday", label: "Perşembe" },
  { value: "friday", label: "Cuma" },
  { value: "saturday", label: "Cumartesi" },
  { value: "sunday", label: "Pazar" },
];

export function MatchDayTab() {
  const availablePlayers = useMemo<PlayerRef[]>(
    () => ALL_PLAYERS.map((player) => ({ id: player.id, name: player.name })),
    []
  );

  const [selectedVoterId, setSelectedVoterId] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("monday");
  const [status, setStatus] = useState<StatusMessage>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<GetMatchDayResponse | null>(null);
  const [isHistoryOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    void loadMatchDay();
  }, []);

  useEffect(() => {
    if (!data || selectedVoterId == null) {
      return;
    }
    const existingVote = data.votes.find((vote) => vote.voter.id === selectedVoterId);
    if (existingVote) {
      setSelectedDay(existingVote.day);
    }
  }, [data, selectedVoterId]);

  const results = data?.results;
  const votes = data?.votes ?? [];

  async function loadMatchDay() {
    try {
      setLoading(true);
      const response = await fetchMatchDay({ limit: 50 });
      setData(response);
      setStatus(null);
    } catch (error) {
      setStatus({ type: "error", message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (selectedVoterId == null) {
      setStatus({ type: "error", message: "Lütfen oyu kullanan oyuncuyu seçin." });
      return;
    }

    setSubmitting(true);

    try {
      const response = await submitMatchDayVote({
        voterId: selectedVoterId,
        day: selectedDay,
      });
      setData({
        results: response.results,
        votes: [
          response.vote,
          ...(data?.votes ?? []).filter((vote) => vote.id !== response.vote.id),
        ],
      });
      setStatus({ type: "success", message: "Tercihiniz kaydedildi." });
    } catch (error) {
      const apiError = error as ApiError;
      setStatus({ type: "error", message: apiError.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {status && (
        <div
          className={clsx(
            "rounded-lg p-4 text-sm font-medium shadow-lg",
            status.type === "success" ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white"
          )}
        >
          {status.message}
        </div>
      )}

      <Card className="border-none bg-white" data-card="match-day-form">
        <CardHeader className="pb-4">
          <CardTitle>Haftalık Maç Günü Tercihi</CardTitle>
          <CardDescription>Oy kullanacak oyuncuyu seçip haftanın günlerinden birini işaretleyin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Oy Kullanan Oyuncu</label>
            <select
              value={selectedVoterId ?? ""}
              onChange={(event) => {
                const value = event.target.value;
                setSelectedVoterId(value === "" ? null : Number(value));
              }}
              className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
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
            <div className="mb-2 text-sm font-medium text-gray-700">Maç Günü Tercihi</div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {DAY_OPTIONS.map((option) => {
                const isSelected = selectedDay === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={clsx(
                      "rounded-lg border p-3 text-left text-sm transition",
                      isSelected
                        ? "border-orange-500 bg-orange-500 text-white shadow"
                        : "border-gray-200 bg-white text-gray-800 hover:border-orange-400 hover:bg-orange-50"
                    )}
                    onClick={() => setSelectedDay(option.value)}
                    disabled={submitting}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            className="w-full rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleSubmit}
            disabled={submitting || selectedVoterId == null}
          >
            {submitting ? "Gönderiliyor..." : "Tercihimi Kaydet"}
          </button>
        </CardContent>
      </Card>

      <Card className="border-none bg-white" data-card="match-day-results">
        <CardHeader className="pb-4">
          <CardTitle>Bu Haftanın Kazanan Günü</CardTitle>
          <CardDescription>Oy dağılımı ve toplam oy sayısı otomatik olarak güncellenir.</CardDescription>
        </CardHeader>
        <CardContent>
        {loading ? (
          <div className="text-center text-gray-500">Sonuçlar yükleniyor...</div>
        ) : results ? (
          <div className="space-y-4">
            <div className="text-2xl font-bold text-gray-800">
              {results.winningDay ?
                DAY_OPTIONS.find((option) => option.value === results.winningDay)?.label ?? "" :
                "Henüz yeterli oy yok"}
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {results.dayCounts.map((entry) => {
                const label = DAY_OPTIONS.find((option) => option.value === entry.day)?.label ?? entry.day;
                const isWinner = results.winningDay === entry.day && entry.count > 0;
                return (
                  <div
                    key={entry.day}
                    className={clsx(
                      "rounded-lg border p-4 text-sm",
                      isWinner
                        ? "border-orange-400 bg-orange-50 text-orange-700"
                        : "border-gray-200 bg-gray-50 text-gray-700"
                    )}
                  >
                    <div className="text-base font-semibold">{label}</div>
                    <div className="mt-1 text-2xl font-bold">{entry.count}</div>
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-gray-500">
              Toplam {results.totalVotes} oy • Güncellendi: {results.lastUpdated ? new Date(results.lastUpdated).toLocaleString("tr-TR", {
                dateStyle: "medium",
                timeStyle: "short",
              }) : "-"}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">Sonuç bulunamadı.</div>
        )}
        </CardContent>
      </Card>

      <div>
        <button
          type="button"
          className="w-full rounded-lg bg-white/20 p-3 text-left text-sm font-medium text-white/90 shadow-md backdrop-blur transition hover:bg-white/30"
          onClick={() => setHistoryOpen((prev) => !prev)}
        >
          {isHistoryOpen ? "Oy Geçmişini Gizle" : "Oy Geçmişini Göster"}
        </button>
        {isHistoryOpen && (
          <Card className="mt-4 border border-gray-200" data-card="match-day-history">
            <CardHeader className="pb-3">
              <CardTitle>Oy Geçmişi</CardTitle>
              <CardDescription>Haftalık oyları listeleyip detaylarını inceleyin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-700">
              {votes.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-gray-500">
                  Henüz oy kullanılmadı.
                </div>
              ) : (
                votes.map((vote) => {
                  const label = DAY_OPTIONS.find((option) => option.value === vote.day)?.label ?? vote.day;
                  return (
                    <div key={vote.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2">
                      <span className="font-medium text-gray-800">{vote.voter.name}</span>
                      <span>{label}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(vote.submittedAt).toLocaleString("tr-TR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


