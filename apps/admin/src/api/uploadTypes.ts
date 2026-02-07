import { ImageMediaType, objectKeySchema } from "@wortle/shared"
import { z } from "zod"

export const uploadResponseSchema = z.object({
  stagingKey: objectKeySchema,
  mediaType: z.enum(ImageMediaType),
})

export type UploadResponse = z.infer<typeof uploadResponseSchema>
