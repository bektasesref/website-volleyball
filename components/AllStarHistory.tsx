"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AllStarBallotSummary } from "@/types/all-star";

interface AllStarHistoryProps {
  ballots: AllStarBallotSummary[];
}

export function AllStarHistory({ ballots }: AllStarHistoryProps) {
  const total = ballots.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Oy İstatistiği</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="text-sm text-muted-foreground">Henüz oy kullanılmadı.</div>
        ) : (
          <div className="rounded-md bg-blue-50/70 p-4 text-center text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
            Toplam oy veren kişi sayısı: {total}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

