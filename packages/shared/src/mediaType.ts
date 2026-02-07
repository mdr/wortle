import { z } from "zod"

export const mediaTypeSchema = z.string().brand<"MediaType", "inout">()
export type MediaType = z.output<typeof mediaTypeSchema>

const createMediaType = (s: string): MediaType => mediaTypeSchema.parse(s)

export const MediaType = Object.assign(createMediaType, {
  APPLICATION_JSON: createMediaType("application/json"),
  IMAGE_JPEG: createMediaType("image/jpeg"),
  IMAGE_HEIC: createMediaType("image/heic"),
  IMAGE_WEBP: createMediaType("image/webp"),
})
