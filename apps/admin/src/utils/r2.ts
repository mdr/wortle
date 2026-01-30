import { env } from "@/env"

type UploadToR2Params = {
  bucket: string
  key: string
  body: string
  contentType: string
}

export const uploadToR2 = async ({ bucket, key, body, contentType }: UploadToR2Params) => {
  const url = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/r2/buckets/${bucket}/objects/${key}`

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
      "Content-Type": contentType,
    },
    body,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`R2 upload failed: ${response.status} ${text}`)
  }
}
