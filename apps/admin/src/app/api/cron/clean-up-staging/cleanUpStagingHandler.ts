import { BucketName } from "@wortle/shared"
import { NextResponse } from "next/server"

import { Clock } from "@/utils/clock"
import { cleanUpStagingFiles } from "@/utils/cleanUpStagingFiles"
import { HttpStatus } from "@/utils/httpStatus"
import { IBucketStorage } from "@/utils/R2BucketStorage"

export const createCleanUpStagingHandler =
  (storage: IBucketStorage, bucket: BucketName, clock: Clock, cronSecret: string) => async (request: Request) => {
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: HttpStatus.UNAUTHORIZED })
    }

    const result = await cleanUpStagingFiles(storage, bucket, clock)
    return NextResponse.json(result)
  }
