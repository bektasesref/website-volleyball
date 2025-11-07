import { z } from "zod";

export const dayOfWeekSchema = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

const playerIdSchema = z.number().int().positive();

export const submitMatchDayVoteSchema = z.object({
  voterId: playerIdSchema,
  day: dayOfWeekSchema,
  cycleKey: z
    .string()
    .trim()
    .min(1)
    .optional(),
});

export type SubmitMatchDayVoteInput = z.infer<typeof submitMatchDayVoteSchema>;


