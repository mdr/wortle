import { IR2Client, UploadParams } from "./R2Client"

export class FakeR2Client implements IR2Client {
  readonly uploads: UploadParams[] = []

  upload = (params: UploadParams): Promise<void> => {
    this.uploads.push(params)
    return Promise.resolve()
  }
}
