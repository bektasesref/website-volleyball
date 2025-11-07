import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { DrawModel } from "@/lib/models/Draw";
import { buildPlayerSnapshot, buildPlayerSnapshots } from "@/lib/players";
import { serializeDraw } from "@/lib/serializers/draw";
import { resolveCycleKey } from "@/lib/utils/cycle";
import { createDrawSchema } from "@/lib/validation/draw";
import type { CreateDrawResponse, GetDrawsResponse } from "@/types/draw";

const DEFAULT_HISTORY_LIMIT = 10;

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const cycleKeyParam = searchParams.get("cycleKey") ?? undefined;

    const parsedLimit = limitParam ? Number(limitParam) : NaN;
    const limit = Number.isFinite(parsedLimit)
      ? Math.max(1, Math.min(100, parsedLimit))
      : DEFAULT_HISTORY_LIMIT;
    const cycleFilter = cycleKeyParam ? { cycleKey: cycleKeyParam } : {};

    const [latestDoc, historyDocs] = await Promise.all([
      DrawModel.findOne(cycleFilter).sort({ createdAt: -1 }).exec(),
      DrawModel.find(cycleFilter).sort({ createdAt: -1 }).limit(limit).exec(),
    ]);

    const payload: GetDrawsResponse = {
      latest: latestDoc ? serializeDraw(latestDoc) : null,
      history: historyDocs.map(serializeDraw),
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[GET /api/draws]", error);
    return NextResponse.json(
      { message: "Unable to fetch draws" },
      {
        status: 500,
      }
    );
  }
}

function shufflePlayers<T>(players: T[]): T[] {
  const arr = [...players];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parseResult = createDrawSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        { message: "Invalid draw payload", issues: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { conductorId, lockedPlayerIds, candidatePlayerIds, cycleKey } = parseResult.data;

    let conductor;
    let lockedPlayers;
    let candidatePlayers;

    try {
      conductor = buildPlayerSnapshot(conductorId);
      lockedPlayers = buildPlayerSnapshots(lockedPlayerIds ?? []);
      candidatePlayers = buildPlayerSnapshots(candidatePlayerIds ?? []);
    } catch (playerError) {
      return NextResponse.json(
        { message: (playerError as Error).message },
        { status: 400 }
      );
    }

    const resolvedCycleKey = resolveCycleKey(cycleKey);

    await connectToDatabase();

    const shuffledCandidates = shufflePlayers(candidatePlayers);
    const slotsRemaining = Math.max(0, 12 - lockedPlayers.length);
    if (slotsRemaining > shuffledCandidates.length) {
      return NextResponse.json(
        { message: "Kesin katılanlar haricinde yeterli oyuncu bulunmuyor." },
        { status: 400 }
      );
    }

    const selectedFromCandidates = shuffledCandidates.slice(0, slotsRemaining);
    const primaryPlayers = [...lockedPlayers, ...selectedFromCandidates];
    const reservePlayers = shuffledCandidates.slice(slotsRemaining);

    const drawDoc = await DrawModel.create({
      conductor,
      lockedPlayers,
      primaryPlayers,
      reservePlayers,
      cycleKey: resolvedCycleKey,
    });

    const payload: CreateDrawResponse = {
      draw: serializeDraw(drawDoc),
    };

    return NextResponse.json(payload, { status: 201 });
  } catch (error) {
    console.error("[POST /api/draws]", error);
    return NextResponse.json(
      { message: "Unable to create draw" },
      {
        status: 500,
      }
    );
  }
}

