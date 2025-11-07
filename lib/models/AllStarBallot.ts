import { Schema, model, models, type InferSchemaType, type HydratedDocument } from "mongoose";
import type { PlayerRef } from "@/types/player";

type PlayerSnapshot = PlayerRef;

const PlayerSnapshotSchema = new Schema<PlayerSnapshot>(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true },
  },
  { _id: false }
);

const AllStarBallotSchema = new Schema(
  {
    voter: { type: PlayerSnapshotSchema, required: true },
    picks: {
      type: [PlayerSnapshotSchema],
      required: true,
      validate: {
        validator: (value: PlayerSnapshot[]) => value.length === 12,
        message: "Each ballot must contain exactly 12 selections.",
      },
    },
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

AllStarBallotSchema.index({ "voter.id": 1, cycleKey: 1 }, { unique: true });
AllStarBallotSchema.index({ submittedAt: -1 });

export type AllStarBallot = InferSchemaType<typeof AllStarBallotSchema>;
export type AllStarBallotDocument = HydratedDocument<AllStarBallot>;

export const AllStarBallotModel =
  models.AllStarBallot ?? model<AllStarBallot>("AllStarBallot", AllStarBallotSchema);

