import { MediaType, ObjectKey, ORIGINALS_BUCKET } from "@wortle/shared"
import { NextResponse } from "next/server"
import sharp from "sharp"

import { HttpStatus } from "@/utils/httpStatus"
import { IMAGE_MEDIA_TYPES, imageMediaTypeContentType, imageMediaTypeExtension } from "@/utils/imageMediaType"
import { IBucketStorage } from "@/utils/R2BucketStorage"

type Params = {
  puzzleId: string
  imageKey: string
}

const MEDIA_TYPE_BY_EXTENSION = new Map(
  IMAGE_MEDIA_TYPES.map((mediaType) => [imageMediaTypeExtension(mediaType), mediaType]),
)

const convertToJpeg = async (data: ArrayBuffer): Promise<ArrayBuffer> => {
  const buffer = await sharp(Buffer.from(data)).jpeg().toBuffer()
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer
}

export const createOriginalsHandler =
  (storage: IBucketStorage) =>
  async (_request: Request, { params }: { params: Promise<Params> }) => {
    const { puzzleId, imageKey } = await params
    const ext = imageKey.match(/\.[^.]+$/)?.[0]
    const mediaType = ext ? MEDIA_TYPE_BY_EXTENSION.get(ext) : undefined
    if (!mediaType) {
      return NextResponse.json(
        { error: `Unsupported image extension: ${ext ?? "(none)"}` },
        { status: HttpStatus.BAD_REQUEST },
      )
    }
    const key = ObjectKey(`${puzzleId}/${imageKey}`)

    try {
      const data = await storage.getObject(ORIGINALS_BUCKET, key)
      const body = mediaType === MediaType.IMAGE_HEIC ? await convertToJpeg(data) : data
      const contentType = imageMediaTypeContentType(mediaType)
      return new NextResponse(body, {
        status: HttpStatus.OK,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "no-store",
        },
      })
    } catch {
      return NextResponse.json({ error: "Image not found" }, { status: HttpStatus.NOT_FOUND })
    }
  }
