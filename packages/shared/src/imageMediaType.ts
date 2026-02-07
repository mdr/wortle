export enum ImageMediaType {
  JPEG = "image/jpeg",
  HEIC = "image/heic",
}

const EXTENSIONS: Record<ImageMediaType, string> = {
  [ImageMediaType.JPEG]: ".jpg",
  [ImageMediaType.HEIC]: ".heic",
}

export const imageMediaTypeExtension = (mediaType: ImageMediaType): string => EXTENSIONS[mediaType]
