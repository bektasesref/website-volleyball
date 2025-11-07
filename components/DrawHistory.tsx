"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        {entries.map((draw) => (
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
            <div className="text-sm">
              <div className="font-semibold text-orange-600 dark:text-orange-300">Asıl Oyuncular</div>
              <div className="flex flex-wrap gap-2 py-2">
                {draw.primaryPlayers.map((player) => (
                  <span
                    key={player.id}
                    className="rounded-full bg-orange-100 px-3 py-1 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200"
                  >
                    {player.name}
                  </span>
                ))}
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
      </CardContent>
    </Card>
  );
}

