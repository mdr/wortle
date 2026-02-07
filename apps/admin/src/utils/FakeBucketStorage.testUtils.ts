import { BucketName, ImageKey, MediaType, ObjectKey, ORIGINALS_BUCKET, PuzzleId } from "@wortle/shared"
import sharp from "sharp"

import { Clock, realClock } from "./clock"
import { IBucketStorage, R2Object, UploadBinaryParams, UploadJsonParams } from "./R2BucketStorage"
import { JPEG_HEADER } from "./testConstants.testUtils"

export interface StoredObject {
  body: string | ArrayBuffer
  contentType: MediaType
  uploaded: Date
}

export class FakeBucketStorage implements IBucketStorage {
  private readonly clock: Clock
  readonly objects = new Map<`${BucketName}/${ObjectKey}`, StoredObject>()

  constructor(clock: Clock = realClock) {
    this.clock = clock
  }

  uploadJson = ({ bucket, key, body }: UploadJsonParams): Promise<void> => {
    this.objects.set(`${bucket}/${key}`, {
      body: JSON.stringify(body),
      contentType: MediaType.APPLICATION_JSON,
      uploaded: this.clock.now(),
    })
    return Promise.resolve()
  }

  uploadBinary = ({ bucket, key, body, contentType }: UploadBinaryParams): Promise<void> => {
    this.objects.set(`${bucket}/${key}`, { body, contentType, uploaded: this.clock.now() })
    return Promise.resolve()
  }

  copyObject = (
    srcBucket: BucketName,
    srcKey: ObjectKey,
    destBucket: BucketName,
    destKey: ObjectKey,
  ): Promise<void> => {
    const src = this.objects.get(`${srcBucket}/${srcKey}`)
    if (src === undefined) {
      return Promise.reject(new Error(`Object not found: ${srcBucket}/${srcKey}`))
    }
    this.objects.set(`${destBucket}/${destKey}`, { ...src, uploaded: this.clock.now() })
    return Promise.resolve()
  }

  deleteObject = (bucket: BucketName, key: ObjectKey): Promise<void> => {
    this.objects.delete(`${bucket}/${key}`)
    return Promise.resolve()
  }

  listObjects = (bucket: BucketName, prefix: string): Promise<R2Object[]> => {
    const results: R2Object[] = []
    for (const [fullKey, obj] of this.objects) {
      const [bucketName, ...rest] = fullKey.split("/")
      const key = rest.join("/")
      if (bucketName === bucket && key.startsWith(prefix)) {
        results.push({ key: ObjectKey(key), uploaded: obj.uploaded })
      }
    }
    return Promise.resolve(results)
  }

  getStoredObject = (bucket: BucketName, key: ObjectKey): StoredObject => {
    const obj = this.objects.get(`${bucket}/${key}`)
    if (obj === undefined) {
      throw new Error(`Object not found: ${bucket}/${key}`)
    }
    return obj
  }

  getObject = (bucket: BucketName, key: ObjectKey): Promise<ArrayBuffer> => {
    const obj = this.objects.get(`${bucket}/${key}`)
    if (obj === undefined) {
      return Promise.reject(new Error(`Object not found: ${bucket}/${key}`))
    }
    if (typeof obj.body === "string") {
      return Promise.resolve(new TextEncoder().encode(obj.body).buffer)
    }
    return Promise.resolve(obj.body)
  }

  seedStagingFile = (key: ObjectKey): Promise<void> =>
    this.uploadBinary({ bucket: ORIGINALS_BUCKET, key, body: JPEG_HEADER, contentType: MediaType.IMAGE_JPEG })

  seedOriginalJpeg = async (puzzleId: PuzzleId, imageKey: ImageKey): Promise<void> => {
    const buffer = await sharp({ create: { width: 10, height: 10, channels: 3, background: "red" } })
      .jpeg()
      .toBuffer()
    const body = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer
    await this.uploadBinary({
      bucket: ORIGINALS_BUCKET,
      key: ObjectKey(`${puzzleId}/${imageKey}.jpg`),
      body,
      contentType: MediaType.IMAGE_JPEG,
    })
  }

  getJson = (bucket: BucketName, key: ObjectKey): unknown => {
    const obj = this.objects.get(`${bucket}/${key}`)
    if (obj === undefined) {
      throw new Error(`Object not found: ${bucket}/${key}`)
    }
    if (typeof obj.body !== "string") {
      throw new Error(`Object ${bucket}/${key} is not a JSON object`)
    }
    return JSON.parse(obj.body) as unknown
  }
}
