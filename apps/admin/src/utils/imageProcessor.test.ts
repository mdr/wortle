import sharp from "sharp"
import { describe, expect, it } from "vitest"

import { processImage } from "./imageProcessor"

const createTestImage = async (width: number, height: number): Promise<ArrayBuffer> => {
  const buffer = await sharp({ create: { width, height, channels: 3, background: "red" } })
    .jpeg()
    .toBuffer()
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer
}

describe("processImage", () => {
  it("resizes to the requested width and outputs WebP", async () => {
    const source = await createTestImage(800, 600)

    const result = await processImage(source, 400)

    const metadata = await sharp(Buffer.from(result)).metadata()
    expect(metadata.format).toBe("webp")
    expect(metadata.width).toBe(400)
  })

  it("does not enlarge images smaller than the requested width", async () => {
    const source = await createTestImage(100, 75)

    const result = await processImage(source, 400)

    const metadata = await sharp(Buffer.from(result)).metadata()
    expect(metadata.width).toBe(100)
  })
})
