import { BucketName, ObjectKey } from "@wortle/shared"

import { IBucketStorage, MediaType, UploadParams } from "./R2BucketStorage"

interface StoredObject {
  body: string
  contentType: MediaType
}

export class FakeBucketStorage implements IBucketStorage {
  readonly objects = new Map<`${BucketName}/${ObjectKey}`, StoredObject>()

  upload = ({ bucket, key, body, contentType }: UploadParams): Promise<void> => {
    this.objects.set(`${bucket}/${key}`, { body, contentType })
    return Promise.resolve()
  }

  get = (bucket: BucketName, key: ObjectKey): StoredObject => {
    const obj = this.objects.get(`${bucket}/${key}`)
    if (obj === undefined) {
      throw new Error(`Object not found: ${bucket}/${key}`)
    }
    return obj
  }
}
