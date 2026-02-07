import { BucketName, ObjectKey, STAGING_PREFIX } from "@wortle/shared"
import { NextResponse } from "next/server"

import { type UploadResponse } from "@/api/uploadTypes"
import { HttpStatus } from "@/utils/httpStatus"
import { IMAGE_MEDIA_TYPES, imageMediaTypeExtension } from "@/utils/imageMediaType"
import { serverLogger } from "@/utils/logger"
import { IBucketStorage } from "@/utils/R2BucketStorage"

const ACCEPTED_TYPES = new Map(IMAGE_MEDIA_TYPES.map((mediaType) => [mediaType as string, mediaType]))

export const createUploadHandler =
  (storage: IBucketStorage, originalsBucketName: BucketName) => async (request: Request) => {
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
      bucket: originalsBucketName,
      key: stagingKey,
      body: await file.arrayBuffer(),
      contentType: mediaType,
    })

    serverLogger.info("upload.image", `Uploaded image to staging`, {
      stagingKey,
      contentType: file.type,
      size: file.size,
    })

    return NextResponse.json<UploadResponse>({ stagingKey, mediaType })
  }
