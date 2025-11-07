"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AllStarBallotSummary } from "@/types/all-star";

interface AllStarHistoryProps {
  ballots: AllStarBallotSummary[];
}

export function AllStarHistory({ ballots }: AllStarHistoryProps) {
  if (ballots.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Son Oylar</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Henüz oy kullanılmadı.</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Son Oylar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-md bg-blue-50/70 p-3 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
          Toplam oy veren kişi sayısı: {ballots.length}
        </div>
        {ballots.map((ballot, index) => (
          <div
            key={ballot.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 p-4 text-sm shadow-sm dark:border-gray-800"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white">
                {index + 1}
              </span>
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">{ballot.voter.name}</div>
                <div className="text-xs text-muted-foreground">
                  Oy zamanı: {new Date(ballot.submittedAt).toLocaleString("tr-TR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </div>
              </div>
            </div>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Oy gizli</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

