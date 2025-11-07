import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ParticipationStatusModel } from "@/lib/models/ParticipationStatus";
import { buildPlayerSnapshot } from "@/lib/players";
import {
  buildParticipationAggregates,
  summarizeParticipationRecord,
} from "@/lib/serializers/participation";
import { resolveCycleKey } from "@/lib/utils/cycle";
import { submitParticipationSchema } from "@/lib/validation/participation";
import type {
  GetParticipationResponse,
  SubmitParticipationResponse,
} from "@/types/participation";

const DEFAULT_RECORD_LIMIT = 20;

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const cycleKeyParam = searchParams.get("cycleKey") ?? undefined;

    const parsedLimit = limitParam ? Number(limitParam) : NaN;
    const limit = Number.isFinite(parsedLimit)
      ? Math.max(1, Math.min(200, parsedLimit))
      : DEFAULT_RECORD_LIMIT;

    const cycleFilter = cycleKeyParam ? { cycleKey: cycleKeyParam } : {};

    const records = await ParticipationStatusModel.find(cycleFilter)
      .sort({ submittedAt: -1 })
      .limit(limit)
      .exec();

    const allCycleRecords = await ParticipationStatusModel.find(cycleFilter)
      .sort({ submittedAt: -1 })
      .exec();

    const payload: GetParticipationResponse = {
      aggregates: buildParticipationAggregates(allCycleRecords),
      records: records.map(summarizeParticipationRecord),
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[GET /api/participation]", error);
    return NextResponse.json({ message: "Katılım bilgileri alınamadı" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parseResult = submitParticipationSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        { message: "Geçersiz katılım bildirimi", issues: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { playerId, status, cycleKey } = parseResult.data;

    let player;

    try {
      player = buildPlayerSnapshot(playerId);
    } catch (playerError) {
      return NextResponse.json(
        { message: (playerError as Error).message },
        { status: 400 }
      );
    }

    const resolvedCycleKey = resolveCycleKey(cycleKey);

    await connectToDatabase();

    const existingRecord = await ParticipationStatusModel.findOne({
      "player.id": player.id,
      cycleKey: resolvedCycleKey,
    }).exec();

    let recordDoc;

    if (existingRecord) {
      existingRecord.status = status;
      existingRecord.submittedAt = new Date();
      recordDoc = await existingRecord.save();
    } else {
      recordDoc = await ParticipationStatusModel.create({
        player,
        status,
        cycleKey: resolvedCycleKey,
      });
    }

    const cycleRecords = await ParticipationStatusModel.find({ cycleKey: resolvedCycleKey })
      .sort({ submittedAt: -1 })
      .exec();

    const payload: SubmitParticipationResponse = {
      record: summarizeParticipationRecord(recordDoc),
      aggregates: buildParticipationAggregates(cycleRecords),
    };

    return NextResponse.json(payload, { status: existingRecord ? 200 : 201 });
  } catch (error) {
    console.error("[POST /api/participation]", error);
    return NextResponse.json({ message: "Katılım durumu kaydedilemedi" }, { status: 500 });
  }
}


