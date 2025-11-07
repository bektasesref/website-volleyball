"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { AllStarResults } from "@/types/all-star";

interface AllStarResultsCardProps {
  results: AllStarResults;
  highlightCount?: number;
}

export function AllStarResultsCard({ results, highlightCount = 12 }: AllStarResultsCardProps) {
  const { histogram, totalBallots, lastUpdated } = results;

  return (
    <Card>
      <CardHeader>
        <CardTitle>All-Star Sonuçları</CardTitle>
      </CardHeader>
      <CardContent>
        {totalBallots === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-muted-foreground dark:border-gray-700">
            Henüz oy kullanılmadı. İlk oyu siz bırakın!
          </div>
        ) : (
          <div className="space-y-3">
            {histogram.map((entry, index) => {
              const isHighlighted = index < highlightCount;
              return (
                <div
                  key={entry.player.id}
                  className={`flex items-center justify-between rounded-lg border p-3 text-sm transition ${
                    isHighlighted
                      ? "border-orange-400 bg-orange-50 dark:border-orange-500 dark:bg-orange-900/30"
                      : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 font-semibold text-white">
                      {index + 1}
                    </span>
                    <span className="text-base font-medium">{entry.player.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-orange-600 dark:text-orange-300">
                    {entry.votes} oy
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-1 text-xs text-muted-foreground">
        <span>Toplam oy: {totalBallots}</span>
        {lastUpdated && <span>Son güncelleme: {new Date(lastUpdated).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" })}</span>}
      </CardFooter>
    </Card>
  );
}

