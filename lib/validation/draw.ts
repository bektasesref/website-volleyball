import { z } from "zod";

const playerIdSchema = z.number().int().positive();

export const createDrawSchema = z
  .object({
    conductorId: playerIdSchema,
    lockedPlayerIds: z.array(playerIdSchema).max(12),
    candidatePlayerIds: z.array(playerIdSchema),
    cycleKey: z
      .string()
      .trim()
      .min(1)
      .optional(),
  })
  .superRefine((payload, ctx) => {
    const { lockedPlayerIds, candidatePlayerIds } = payload;

    const lockedSet = new Set(lockedPlayerIds);
    if (lockedSet.size !== lockedPlayerIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Kesin katılacak oyuncular tekil olmalıdır.",
        path: ["lockedPlayerIds"],
      });
      return;
    }

    const candidateSet = new Set(candidatePlayerIds);
    if (candidateSet.size !== candidatePlayerIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Aday oyuncu listesi tekrar içeremez.",
        path: ["candidatePlayerIds"],
      });
      return;
    }

    for (const id of lockedPlayerIds) {
      if (candidateSet.has(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Kesin katılacak oyuncular aday listesinde yer almamalıdır.",
          path: ["candidatePlayerIds"],
        });
        return;
      }
    }

    const totalAvailable = lockedPlayerIds.length + candidatePlayerIds.length;
    if (totalAvailable < 12) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "En az 12 oyuncu seçmelisiniz.",
        path: ["candidatePlayerIds"],
      });
    }
  });

export type CreateDrawInput = z.infer<typeof createDrawSchema>;

