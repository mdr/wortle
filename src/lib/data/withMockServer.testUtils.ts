import * as mockttp from "mockttp"

import { Url } from "@/utils/brandedTypes"

export const withMockServer = async (
  callback: (server: mockttp.Mockttp, baseUrl: Url) => Promise<void>,
): Promise<void> => {
  const server = mockttp.getLocal()
  await server.start()
  try {
    const baseUrl = Url(`http://localhost:${server.port}`)
    await callback(server, baseUrl)
  } finally {
    await server.stop()
  }
}
