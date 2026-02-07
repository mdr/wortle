import { MediaType, mediaTypeSchema } from "@wortle/shared"

export const IMAGE_MEDIA_TYPES = [MediaType.IMAGE_JPEG, MediaType.IMAGE_HEIC] as const

export const imageMediaTypeSchema = mediaTypeSchema.refine((val) =>
  (IMAGE_MEDIA_TYPES as readonly MediaType[]).includes(val),
)

const EXTENSIONS: Record<string, string> = {
  [MediaType.IMAGE_JPEG]: ".jpg",
  [MediaType.IMAGE_HEIC]: ".heic",
}

export const imageMediaTypeExtension = (mediaType: MediaType): string => {
  const ext = EXTENSIONS[mediaType]
  if (!ext) throw new Error(`No extension for media type: ${mediaType}`)
  return ext
}

export const imageMediaTypeContentType = (mediaType: MediaType): MediaType => {
  switch (mediaType as string) {
    case "image/jpeg":
      return MediaType.IMAGE_JPEG
    case "image/heic":
      return MediaType.IMAGE_JPEG
    default:
      throw new Error(`Unsupported media type: ${mediaType}`)
  }
}
