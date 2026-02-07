const HEIC_TYPES = new Set(["image/heic", "image/heif"])

export const toPreviewBlob = async (file: File): Promise<Blob> => {
  if (!HEIC_TYPES.has(file.type)) return file
  const { default: heic2any } = await import("heic2any")
  const jpeg = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.8 })
  if (Array.isArray(jpeg)) return jpeg[0]
  return jpeg
}
