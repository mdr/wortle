import { BucketName, CloudflareAccountId, CloudflareApiToken, ObjectKey, Url } from "@wortle/shared"

const DEFAULT_BASE_URL = Url("https://api.cloudflare.com/client/v4")

export enum MediaType {
  APPLICATION_JSON = "application/json",
  IMAGE_JPEG = "image/jpeg",
  IMAGE_WEBP = "image/webp",
}

interface R2BucketStorageConfig {
  accountId: CloudflareAccountId
  apiToken: CloudflareApiToken
  baseUrl?: Url
}

export interface UploadJsonParams {
  bucket: BucketName
  key: ObjectKey
  body: unknown
}

export interface UploadBinaryParams {
  bucket: BucketName
  key: ObjectKey
  body: ArrayBuffer
  contentType: MediaType
}

export interface R2Object {
  key: ObjectKey
  uploaded: Date
}

export interface IBucketStorage {
  uploadJson: (params: UploadJsonParams) => Promise<void>
  uploadBinary: (params: UploadBinaryParams) => Promise<void>
  copyObject: (srcBucket: BucketName, srcKey: ObjectKey, destBucket: BucketName, destKey: ObjectKey) => Promise<void>
  deleteObject: (bucket: BucketName, key: ObjectKey) => Promise<void>
  listObjects: (bucket: BucketName, prefix: string) => Promise<R2Object[]>
  getObject: (bucket: BucketName, key: ObjectKey) => Promise<ArrayBuffer>
}

export class R2BucketStorage implements IBucketStorage {
  private readonly baseUrl: Url
  private readonly accountId: CloudflareAccountId
  private readonly apiToken: CloudflareApiToken

  constructor(config: R2BucketStorageConfig) {
    this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL
    this.accountId = config.accountId
    this.apiToken = config.apiToken
  }

  private objectUrl = (bucket: BucketName, key: ObjectKey): string =>
    `${this.baseUrl}/accounts/${this.accountId}/r2/buckets/${bucket}/objects/${key}`

  private authHeaders = () => ({
    Authorization: `Bearer ${this.apiToken}`,
  })

  uploadJson = async ({ bucket, key, body }: UploadJsonParams): Promise<void> => {
    const response = await fetch(this.objectUrl(bucket, key), {
      method: "PUT",
      headers: {
        ...this.authHeaders(),
        "Content-Type": MediaType.APPLICATION_JSON,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`R2 upload failed: ${response.status} ${text}`)
    }
  }

  uploadBinary = async ({ bucket, key, body, contentType }: UploadBinaryParams): Promise<void> => {
    const response = await fetch(this.objectUrl(bucket, key), {
      method: "PUT",
      headers: {
        ...this.authHeaders(),
        "Content-Type": contentType,
      },
      body,
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`R2 upload failed: ${response.status} ${text}`)
    }
  }

  copyObject = async (
    srcBucket: BucketName,
    srcKey: ObjectKey,
    destBucket: BucketName,
    destKey: ObjectKey,
  ): Promise<void> => {
    const data = await this.getObject(srcBucket, srcKey)
    await this.uploadBinary({
      bucket: destBucket,
      key: destKey,
      body: data,
      contentType: MediaType.IMAGE_JPEG,
    })
  }

  deleteObject = async (bucket: BucketName, key: ObjectKey): Promise<void> => {
    const response = await fetch(this.objectUrl(bucket, key), {
      method: "DELETE",
      headers: this.authHeaders(),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`R2 delete failed: ${response.status} ${text}`)
    }
  }

  listObjects = async (bucket: BucketName, prefix: string): Promise<R2Object[]> => {
    const url = `${this.baseUrl}/accounts/${this.accountId}/r2/buckets/${bucket}/objects?prefix=${encodeURIComponent(prefix)}`
    const response = await fetch(url, {
      method: "GET",
      headers: this.authHeaders(),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`R2 list failed: ${response.status} ${text}`)
    }

    const data = (await response.json()) as { result: Array<{ key: string; uploaded: string }> }
    return data.result.map((obj) => ({
      key: ObjectKey(obj.key),
      uploaded: new Date(obj.uploaded),
    }))
  }

  getObject = async (bucket: BucketName, key: ObjectKey): Promise<ArrayBuffer> => {
    const response = await fetch(this.objectUrl(bucket, key), {
      method: "GET",
      headers: this.authHeaders(),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`R2 get failed: ${response.status} ${text}`)
    }

    return response.arrayBuffer()
  }
}
