import { Schema, model, models, type InferSchemaType, type HydratedDocument, type Model } from "mongoose";
import type { PlayerRef } from "@/types/player";

type PlayerSnapshot = PlayerRef;

const PlayerSnapshotSchema = new Schema<PlayerSnapshot>(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true },
  },
  { _id: false }
);

const DrawSchema = new Schema(
  {
    conductor: { type: PlayerSnapshotSchema, required: true },
    lockedPlayers: {
      type: [PlayerSnapshotSchema],
      default: [],
    },
    primaryPlayers: {
      type: [PlayerSnapshotSchema],
      required: true,
      validate: {
        validator: (value: PlayerSnapshot[]) => value.length >= 12,
        message: "A draw must include at least 12 selected players.",
      },
    },
    reservePlayers: {
      type: [PlayerSnapshotSchema],
      default: [],
    },
    cycleKey: {
      type: String,
      required: false,
      index: true,
      default: undefined,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

DrawSchema.index({ cycleKey: 1, createdAt: -1 });

export type Draw = InferSchemaType<typeof DrawSchema>;
export type DrawDocument = HydratedDocument<Draw>;

const existingDrawModel = models.Draw as Model<Draw> | undefined;

if (existingDrawModel && existingDrawModel.schema.path("lockedPlayers") === undefined) {
  delete models.Draw;
}

export const DrawModel = (models.Draw as Model<Draw>) ?? model<Draw>("Draw", DrawSchema);

