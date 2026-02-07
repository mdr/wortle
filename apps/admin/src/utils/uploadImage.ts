import { type UploadResponse, uploadResponseSchema } from "@/api/uploadTypes"

export const uploadImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData()
  formData.append("file", file)
  const response = await fetch("/api/upload", { method: "POST", body: formData })
  if (!response.ok) {
    const body = (await response.json()) as { error?: string }
    throw new Error(body.error ?? `Upload failed (${response.status})`)
  }
  return uploadResponseSchema.parse(await response.json())
}

export const filenameToImageKey = (filename: string): string =>
  filename
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
