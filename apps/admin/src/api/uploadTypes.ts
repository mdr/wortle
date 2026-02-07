import { objectKeySchema } from "@wortle/shared"
import { z } from "zod"

export const uploadResponseSchema = z.object({
  stagingKey: objectKeySchema,
})

export type UploadResponse = z.infer<typeof uploadResponseSchema>
