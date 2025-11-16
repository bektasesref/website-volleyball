"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import type { DrawRecord } from "@/types/draw";

interface DrawHistoryProps {
  draws: DrawRecord[];
}

export function DrawHistory({ draws }: DrawHistoryProps) {
  const entries = useMemo(() => draws.slice(0, 50), [draws]);

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Geçmiş Kuralar</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Henüz kayıtlı bir kura bulunmuyor.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Geçmiş Kuralar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {useMemo(() => {
          const groupedByCycle = entries.reduce((acc, draw) => {
            const key = draw.cycleKey ?? "Bilinmeyen";
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(draw);
            return acc;
          }, {} as Record<string, typeof entries>);

          return Object.entries(groupedByCycle)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([cycleKey, cycleDraws]) => (
              <div key={cycleKey} className="space-y-4">
                <div className="sticky top-0 z-10 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {cycleKey}
                </div>
                {cycleDraws.map((draw) => (
                  <div key={draw.id} className="rounded-lg border border-gray-200 p-4 shadow-sm dark:border-gray-800">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                      <span>
                        Çekiliş Tarihi: {new Date(draw.createdAt).toLocaleString("tr-TR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                      <span>
                        Kura Sorumlusu: <strong>{draw.conductor.name}</strong>
                      </span>
                    </div>
                    {draw.lockedPlayers.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-300">
                          <ShieldCheck className="h-3.5 w-3.5" /> Kesin Katılanlar
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {draw.lockedPlayers.map((player) => (
                            <span
                              key={player.id}
                              className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-900/40 dark:text-orange-200"
                            >
                              {player.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="text-sm">
                      <div className="font-semibold text-orange-600 dark:text-orange-300">Asıl Oyuncular</div>
                      <div className="flex flex-wrap gap-2 py-2">
                        {draw.primaryPlayers.map((player) => {
                          const isLocked = draw.lockedPlayers.some((locked) => locked.id === player.id);
                          return (
                            <span
                              key={player.id}
                              className={`rounded-full px-3 py-1 text-orange-700 dark:text-orange-200 ${
                                isLocked ? "bg-orange-200 font-semibold dark:bg-orange-900/60" : "bg-orange-100 dark:bg-orange-900/40"
                              }`}
                            >
                              {isLocked ? `(Kesin) ${player.name}` : player.name}
                            </span>
                          );
                        })}
                      </div>
                      {draw.reservePlayers.length > 0 && (
                        <div className="mt-2">
                          <div className="font-semibold text-blue-600 dark:text-blue-300">Yedekler</div>
                          <div className="flex flex-wrap gap-2 py-2">
                            {draw.reservePlayers.map((player) => (
                              <span
                                key={player.id}
                                className="rounded-full bg-blue-100 px-3 py-1 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200"
                              >
                                {player.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ));
        }, [entries])}
      </CardContent>
    </Card>
  );
}

