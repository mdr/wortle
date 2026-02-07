import { Clock } from "./clock"

export const JPEG_HEADER = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]).buffer

export const FIXED_TIME = new Date("2025-06-15T12:00:00Z")
export const fixedClock: Clock = { now: () => FIXED_TIME }
