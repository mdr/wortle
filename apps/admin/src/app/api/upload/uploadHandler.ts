import { ImageMediaType, imageMediaTypeExtension, ObjectKey, ORIGINALS_BUCKET, STAGING_PREFIX } from "@wortle/shared"
import { NextResponse } from "next/server"

import { type UploadResponse } from "@/api/uploadTypes"
import { HttpStatus } from "@/utils/httpStatus"
import { serverLogger } from "@/utils/logger"
import { IBucketStorage, MediaType } from "@/utils/R2BucketStorage"

const ACCEPTED_TYPES = new Map<string, ImageMediaType>([
  [MediaType.IMAGE_JPEG, ImageMediaType.JPEG],
  [MediaType.IMAGE_HEIC, ImageMediaType.HEIC],
])

export const createUploadHandler = (storage: IBucketStorage) => async (request: Request) => {
  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: HttpStatus.BAD_REQUEST })
  }

  const mediaType = ACCEPTED_TYPES.get(file.type)
  if (mediaType === undefined) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type}. Accepted: ${[...ACCEPTED_TYPES.keys()].join(", ")}` },
      { status: HttpStatus.BAD_REQUEST },
    )
  }

  const stagingKey = ObjectKey(`${STAGING_PREFIX}${crypto.randomUUID()}${imageMediaTypeExtension(mediaType)}`)

  await storage.uploadBinary({
    bucket: ORIGINALS_BUCKET,
    key: stagingKey,
    body: await file.arrayBuffer(),
    contentType: file.type as MediaType,
  })

  serverLogger.info("upload.image", `Uploaded image to staging`, {
    stagingKey,
    contentType: file.type,
    size: file.size,
  })

  return NextResponse.json<UploadResponse>({ stagingKey, mediaType })
}
