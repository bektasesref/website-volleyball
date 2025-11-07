import { z } from "zod";

export const participationStatusSchema = z.enum(["yes", "no"]);

const playerIdSchema = z.number().int().positive();

export const submitParticipationSchema = z.object({
  playerId: playerIdSchema,
  status: participationStatusSchema,
  cycleKey: z
    .string()
    .trim()
    .min(1)
    .optional(),
});

export type SubmitParticipationInput = z.infer<typeof submitParticipationSchema>;


