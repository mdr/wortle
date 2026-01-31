import { BucketName, CloudflareAccountId, CloudflareApiToken, ObjectKey, Url } from "@wortle/shared"

const DEFAULT_BASE_URL = Url("https://api.cloudflare.com/client/v4")

export enum MediaType {
  APPLICATION_JSON = "application/json",
  TEXT_PLAIN = "text/plain",
}

interface R2ClientConfig {
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

export interface IR2Client {
  upload: (params: UploadParams) => Promise<void>
}

export class R2Client implements IR2Client {
  private readonly baseUrl: Url
  private readonly accountId: CloudflareAccountId
  private readonly apiToken: CloudflareApiToken

  constructor(config: R2ClientConfig) {
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

let _r2Client: R2Client | undefined

export const r2Client: IR2Client = {
  upload: async (params: UploadParams): Promise<void> => {
    if (_r2Client === undefined) {
      const { env } = await import("@/env")
      const accountId = env.CLOUDFLARE_ACCOUNT_ID
      const apiToken = env.CLOUDFLARE_API_TOKEN
      if (accountId === undefined || apiToken === undefined) {
        throw new Error("CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN must be set")
      }
      _r2Client = new R2Client({ accountId, apiToken })
    }
    return _r2Client.upload(params)
  },
}
