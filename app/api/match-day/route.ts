import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { MatchDayVoteModel } from "@/lib/models/MatchDayVote";
import { buildPlayerSnapshot } from "@/lib/players";
import { buildMatchDayResults, summarizeMatchDayVote } from "@/lib/serializers/matchDay";
import { resolveCycleKey } from "@/lib/utils/cycle";
import { submitMatchDayVoteSchema } from "@/lib/validation/matchDay";
import type { GetMatchDayResponse, SubmitMatchDayVoteResponse } from "@/types/match-day";

const DEFAULT_VOTE_LIMIT = 20;

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const cycleKeyParam = searchParams.get("cycleKey") ?? undefined;

    const parsedLimit = limitParam ? Number(limitParam) : NaN;
    const limit = Number.isFinite(parsedLimit)
      ? Math.max(1, Math.min(100, parsedLimit))
      : DEFAULT_VOTE_LIMIT;

    const cycleFilter = cycleKeyParam ? { cycleKey: cycleKeyParam } : {};

    const votes = await MatchDayVoteModel.find(cycleFilter)
      .sort({ submittedAt: -1 })
      .limit(limit)
      .exec();

    const allCycleVotes = await MatchDayVoteModel.find(cycleFilter)
      .sort({ submittedAt: -1 })
      .exec();

    const payload: GetMatchDayResponse = {
      results: buildMatchDayResults(allCycleVotes),
      votes: votes.map(summarizeMatchDayVote),
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[GET /api/match-day]", error);
    return NextResponse.json({ message: "Maç günü bilgileri alınamadı" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parseResult = submitMatchDayVoteSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        { message: "Geçersiz maç günü oyu", issues: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { voterId, day, cycleKey } = parseResult.data;

    let voter;

    try {
      voter = buildPlayerSnapshot(voterId);
    } catch (playerError) {
      return NextResponse.json(
        { message: (playerError as Error).message },
        { status: 400 }
      );
    }

    const resolvedCycleKey = resolveCycleKey(cycleKey);

    await connectToDatabase();

    const existingVote = await MatchDayVoteModel.findOne({
      "voter.id": voter.id,
      cycleKey: resolvedCycleKey,
    }).exec();

    let voteDoc;

    if (existingVote) {
      existingVote.day = day;
      existingVote.submittedAt = new Date();
      voteDoc = await existingVote.save();
    } else {
      voteDoc = await MatchDayVoteModel.create({
        voter,
        day,
        cycleKey: resolvedCycleKey,
      });
    }

    const cycleVotes = await MatchDayVoteModel.find({ cycleKey: resolvedCycleKey })
      .sort({ submittedAt: -1 })
      .exec();

    const payload: SubmitMatchDayVoteResponse = {
      vote: summarizeMatchDayVote(voteDoc),
      results: buildMatchDayResults(cycleVotes),
    };

    return NextResponse.json(payload, { status: existingVote ? 200 : 201 });
  } catch (error) {
    console.error("[POST /api/match-day]", error);
    return NextResponse.json({ message: "Maç günü oyu gönderilemedi" }, { status: 500 });
  }
}


