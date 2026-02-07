import sharp from "sharp"

export const IMAGE_WIDTHS = [200, 400, 800, 1200, 1600, 2400] as const

export const processImage = async (sourceBuffer: ArrayBuffer, width: number): Promise<ArrayBuffer> => {
  const buffer = await sharp(Buffer.from(sourceBuffer))
    .resize(width, undefined, { withoutEnlargement: true })
    .webp()
    .toBuffer()
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer
}
