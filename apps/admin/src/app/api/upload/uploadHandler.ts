import { objectKeySchema, ObjectKey, ORIGINALS_BUCKET, STAGING_PREFIX } from "@wortle/shared"
import { NextResponse } from "next/server"
import { z } from "zod"

import { HttpStatus } from "@/utils/httpStatus"
import { serverLogger } from "@/utils/logger"
import { IBucketStorage, MediaType } from "@/utils/R2BucketStorage"

export const uploadResponseSchema = z.object({
  stagingKey: objectKeySchema,
})

export type UploadResponse = z.infer<typeof uploadResponseSchema>

const ACCEPTED_TYPES = new Set<MediaType>([MediaType.IMAGE_JPEG, MediaType.IMAGE_HEIC])

export const createUploadHandler = (storage: IBucketStorage) => async (request: Request) => {
  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: HttpStatus.BAD_REQUEST })
  }

  if (!ACCEPTED_TYPES.has(file.type as MediaType)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type}. Accepted: ${[...ACCEPTED_TYPES].join(", ")}` },
      { status: HttpStatus.BAD_REQUEST },
    )
  }

  const stagingKey = ObjectKey(`${STAGING_PREFIX}${crypto.randomUUID()}.jpg`)

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

  return NextResponse.json<UploadResponse>({ stagingKey })
}
