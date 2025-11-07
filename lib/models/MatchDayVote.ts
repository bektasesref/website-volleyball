import { Schema, model, models, type HydratedDocument, type InferSchemaType } from "mongoose";
import type { DayOfWeek } from "@/types/match-day";
import type { PlayerRef } from "@/types/player";

type PlayerSnapshot = PlayerRef;

const PlayerSnapshotSchema = new Schema<PlayerSnapshot>(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true },
  },
  { _id: false }
);

const DAYS: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const MatchDayVoteSchema = new Schema(
  {
    voter: { type: PlayerSnapshotSchema, required: true },
    day: { type: String, enum: DAYS, required: true },
    cycleKey: {
      type: String,
      required: true,
      default: "current",
      index: true,
    },
    submittedAt: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
  },
  {
    timestamps: false,
  }
);

MatchDayVoteSchema.index({ "voter.id": 1, cycleKey: 1 }, { unique: true });
MatchDayVoteSchema.index({ cycleKey: 1, day: 1 });
MatchDayVoteSchema.index({ submittedAt: -1 });

export type MatchDayVote = InferSchemaType<typeof MatchDayVoteSchema>;
export type MatchDayVoteDocument = HydratedDocument<MatchDayVote>;

export const MatchDayVoteModel =
  models.MatchDayVote ?? model<MatchDayVote>("MatchDayVote", MatchDayVoteSchema);


