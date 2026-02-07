import { objectKeySchema } from "@wortle/shared"
import { z } from "zod"

import { imageMediaTypeSchema } from "@/utils/imageMediaType"

export const uploadResponseSchema = z.object({
  stagingKey: objectKeySchema,
  mediaType: imageMediaTypeSchema,
})

export type UploadResponse = z.infer<typeof uploadResponseSchema>
