"use client";

import { useMemo, useState } from "react";
import { DrawTab } from "@/app/(tabs)/DrawTab";
import { AllStarTab } from "@/app/(tabs)/AllStarTab";
import { MatchDayTab } from "@/app/(tabs)/MatchDayTab";
import { ParticipationTab } from "@/app/(tabs)/ParticipationTab";

type TabId = "draw" | "allStar" | "matchDay" | "participation";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("draw");

  const tabs = useMemo(
    () => [
      { id: "draw" as TabId, label: "Haftalık Kura" },
      { id: "allStar" as TabId, label: "All-Star Oylaması" },
      { id: "matchDay" as TabId, label: "Maç Günü Oylaması" },
      { id: "participation" as TabId, label: "Katılım Anketi" },
    ],
    []
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 -z-20 bg-[url('/images/bg.jpeg')] bg-cover bg-center filter blur-xs scale-110"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10 bg-linear-to-br from-blue-500/70 via-blue-400/50 to-orange-400/60"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-6xl p-4 md:p-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white drop-shadow-lg md:text-5xl">
            🏐 Online Voleybol Takım Yönetimi
          </h1>
          <p className="text-xl text-white/90">Voleybol takımı için kura çekimi, all star oylaması, katılım takip ve daha fazlası</p>
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

        {activeTab === "draw" && <DrawTab />}
        {activeTab === "allStar" && <AllStarTab />}
        {activeTab === "matchDay" && <MatchDayTab />}
        {activeTab === "participation" && <ParticipationTab />}
      </div>
    </div>
  );
}
