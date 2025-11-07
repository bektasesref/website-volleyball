import { z } from "zod";

const playerIdSchema = z.number().int().positive();

export const submitAllStarBallotSchema = z
  .object({
    voterId: playerIdSchema,
    pickIds: z.array(playerIdSchema).length(12),
    cycleKey: z
      .string()
      .trim()
      .min(1)
      .optional(),
  })
  .superRefine((payload, ctx) => {
    const { voterId, pickIds } = payload;
    const unique = new Set(pickIds);
    if (unique.size !== pickIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "All-star selections must be unique.",
        path: ["pickIds"],
      });
    }

    if (pickIds.includes(voterId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Voter cannot vote for themselves.",
        path: ["voterId"],
      });
    }
  });

export type SubmitAllStarBallotInput = z.infer<typeof submitAllStarBallotSchema>;

