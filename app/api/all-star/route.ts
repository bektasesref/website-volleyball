import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { AllStarBallotModel } from "@/lib/models/AllStarBallot";
import { buildPlayerSnapshot, buildPlayerSnapshots } from "@/lib/players";
import { buildAllStarResults, summarizeAllStarBallot } from "@/lib/serializers/allStar";
import { resolveCycleKey } from "@/lib/utils/cycle";
import { submitAllStarBallotSchema } from "@/lib/validation/allStar";
import type {
  GetAllStarResponse,
  SubmitAllStarBallotResponse,
} from "@/types/all-star";

const DEFAULT_BALLOT_LIMIT = 20;

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const cycleKeyParam = searchParams.get("cycleKey") ?? undefined;

    const parsedLimit = limitParam ? Number(limitParam) : NaN;
    const limit = Number.isFinite(parsedLimit)
      ? Math.max(1, Math.min(100, parsedLimit))
      : DEFAULT_BALLOT_LIMIT;
    const cycleFilter = cycleKeyParam ? { cycleKey: cycleKeyParam } : {};

    const [allCycleBallots, recentBallots] = await Promise.all([
      AllStarBallotModel.find(cycleFilter).sort({ submittedAt: -1 }).exec(),
      AllStarBallotModel.find(cycleFilter).sort({ submittedAt: -1 }).limit(limit).exec(),
    ]);

    const results = buildAllStarResults(allCycleBallots);

    const payload: GetAllStarResponse = {
      results,
      ballots: recentBallots.map(summarizeAllStarBallot),
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[GET /api/all-star]", error);
    return NextResponse.json(
      { message: "Unable to fetch all-star results" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parseResult = submitAllStarBallotSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        { message: "Invalid all-star ballot", issues: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { voterId, pickIds, cycleKey } = parseResult.data;

    let voter;
    let picks;

    try {
      voter = buildPlayerSnapshot(voterId);
      picks = buildPlayerSnapshots(pickIds);
    } catch (playerError) {
      return NextResponse.json(
        { message: (playerError as Error).message },
        { status: 400 }
      );
    }
    const resolvedCycleKey = resolveCycleKey(cycleKey);

    await connectToDatabase();

    const ballotDoc = await AllStarBallotModel.create({
      voter,
      picks,
      cycleKey: resolvedCycleKey,
    });

    const cycleBallots = await AllStarBallotModel.find({ cycleKey: resolvedCycleKey })
      .sort({ submittedAt: -1 })
      .exec();

    const payload: SubmitAllStarBallotResponse = {
      ballot: summarizeAllStarBallot(ballotDoc),
      results: buildAllStarResults(cycleBallots),
    };

    return NextResponse.json(payload, { status: 201 });
  } catch (error) {
    console.error("[POST /api/all-star]", error);

    if (isDuplicateBallotError(error)) {
      return NextResponse.json(
        { message: "Bu oyuncu zaten bu hafta için bir oy verdi." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "All-star oyunu gönderilemedi" },
      { status: 500 }
    );
  }
}

function isDuplicateBallotError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const code = (error as { code?: number }).code;
  return code === 11000;
}

