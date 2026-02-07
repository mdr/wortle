import { ImageMediaType, imageMediaTypeExtension, ObjectKey, ORIGINALS_BUCKET } from "@wortle/shared"
import { NextResponse } from "next/server"

import { HttpStatus } from "@/utils/httpStatus"
import { IBucketStorage } from "@/utils/R2BucketStorage"

type Params = {
  puzzleId: string
  imageKey: string
}

const MEDIA_TYPE_BY_EXTENSION = new Map(Object.values(ImageMediaType).map((mt) => [imageMediaTypeExtension(mt), mt]))

export const createOriginalsHandler =
  (storage: IBucketStorage) =>
  async (_request: Request, { params }: { params: Promise<Params> }) => {
    const { puzzleId, imageKey } = await params
    const ext = imageKey.match(/\.[^.]+$/)?.[0]
    const contentType = ext ? MEDIA_TYPE_BY_EXTENSION.get(ext) : undefined
    const key = ObjectKey(`${puzzleId}/${imageKey}`)

    try {
      const data = await storage.getObject(ORIGINALS_BUCKET, key)
      return new NextResponse(data, {
        status: HttpStatus.OK,
        headers: {
          "Content-Type": contentType ?? "application/octet-stream",
          "Cache-Control": "no-store",
        },
      })
    } catch {
      return NextResponse.json({ error: "Image not found" }, { status: HttpStatus.NOT_FOUND })
    }
  }
