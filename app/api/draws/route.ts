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

    const { conductorId, primaryPlayerIds, reservePlayerIds, cycleKey } = parseResult.data;

    let conductor;
    let primaryPlayers;
    let reservePlayers;

    try {
      conductor = buildPlayerSnapshot(conductorId);
      primaryPlayers = buildPlayerSnapshots(primaryPlayerIds);
      reservePlayers = buildPlayerSnapshots(reservePlayerIds ?? []);
    } catch (playerError) {
      return NextResponse.json(
        { message: (playerError as Error).message },
        { status: 400 }
      );
    }

    const resolvedCycleKey = resolveCycleKey(cycleKey);

    await connectToDatabase();

    const drawDoc = await DrawModel.create({
      conductor,
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

