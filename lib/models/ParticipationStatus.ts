import { Schema, model, models, type HydratedDocument, type InferSchemaType } from "mongoose";
import type { ParticipationStatusOption } from "@/types/participation";
import type { PlayerRef } from "@/types/player";

type PlayerSnapshot = PlayerRef;

const PlayerSnapshotSchema = new Schema<PlayerSnapshot>(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true },
  },
  { _id: false }
);

const ParticipationStatusSchema = new Schema(
  {
    player: { type: PlayerSnapshotSchema, required: true },
    status: { type: String, enum: ["yes", "no"] satisfies ParticipationStatusOption[], required: true },
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

ParticipationStatusSchema.index({ "player.id": 1, cycleKey: 1 }, { unique: true });
ParticipationStatusSchema.index({ cycleKey: 1, status: 1 });
ParticipationStatusSchema.index({ submittedAt: -1 });

export type ParticipationStatus = InferSchemaType<typeof ParticipationStatusSchema>;
export type ParticipationStatusDocument = HydratedDocument<ParticipationStatus>;

export const ParticipationStatusModel =
  models.ParticipationStatus ??
  model<ParticipationStatus>("ParticipationStatus", ParticipationStatusSchema);


