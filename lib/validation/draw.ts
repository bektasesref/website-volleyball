import { z } from "zod";

const playerIdSchema = z.number().int().positive();

export const createDrawSchema = z
  .object({
    conductorId: playerIdSchema,
    primaryPlayerIds: z.array(playerIdSchema).min(12),
    reservePlayerIds: z.array(playerIdSchema).default([]),
    cycleKey: z
      .string()
      .trim()
      .min(1)
      .optional(),
  })
  .superRefine((payload, ctx) => {
    const { primaryPlayerIds, reservePlayerIds } = payload;
    const combined = [...primaryPlayerIds, ...reservePlayerIds];
    const unique = new Set(combined);
    if (combined.length !== unique.size) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Player selections may not contain duplicates.",
        path: ["primaryPlayerIds"],
      });
    }
  });

export type CreateDrawInput = z.infer<typeof createDrawSchema>;

