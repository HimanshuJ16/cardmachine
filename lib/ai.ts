import { z } from 'zod'
export const AiExtractSchema = z.object({
  providerGuess: z.string().nullable(),
  monthTurnover: z.number().nonnegative(),
  mix: z.object({
    debitTurnover: z.number().nonnegative(),
    creditTurnover: z.number().nonnegative(),
    businessTurnover: z.number().nonnegative(),
    internationalTurnover: z.number().nonnegative(),
    amexTurnover: z.number().nonnegative(),
    txCount: z.number().int().nonnegative(),
  }),
  currentFeesMonthly: z.number().nullable(),
  currentFixedMonthly: z.number().nonnegative(),
})
export type AiExtract = z.infer<typeof AiExtractSchema>
