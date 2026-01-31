import { BucketName, CloudflareAccountId, CloudflareApiToken, ObjectKey, Url } from "@wortle/shared"

const DEFAULT_BASE_URL = Url("https://api.cloudflare.com/client/v4")

export enum MediaType {
  APPLICATION_JSON = "application/json",
  TEXT_PLAIN = "text/plain",
}

interface R2BucketStorageConfig {
  accountId: CloudflareAccountId
  apiToken: CloudflareApiToken
  baseUrl?: Url
}

export interface UploadParams {
  bucket: BucketName
  key: ObjectKey
  body: string
  contentType: MediaType
}

export interface IBucketStorage {
  upload: (params: UploadParams) => Promise<void>
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

  upload = async ({ bucket, key, body, contentType }: UploadParams): Promise<void> => {
    const url = `${this.baseUrl}/accounts/${this.accountId}/r2/buckets/${bucket}/objects/${key}`

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": contentType,
      },
      body,
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`R2 upload failed: ${response.status} ${text}`)
    }
  }
}

let _bucketStorage: R2BucketStorage | undefined

export const bucketStorage: IBucketStorage = {
  upload: async (params: UploadParams): Promise<void> => {
    if (_bucketStorage === undefined) {
      const { env } = await import("@/env")
      const accountId = env.CLOUDFLARE_ACCOUNT_ID
      const apiToken = env.CLOUDFLARE_API_TOKEN
      if (accountId === undefined || apiToken === undefined) {
        throw new Error("CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN must be set")
      }
      _bucketStorage = new R2BucketStorage({ accountId, apiToken })
    }
    return _bucketStorage.upload(params)
  },
}
