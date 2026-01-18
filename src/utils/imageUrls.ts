import type { ImageKey, PuzzleId } from "@/lib/Puzzle"

import { Pixels, Url } from "./brandedTypes"

const R2_BASE_URL: Url = Url("https://images.wortle.app/puzzles")
const WIDTHS = [Pixels(200), Pixels(400), Pixels(800), Pixels(1200), Pixels(1600), Pixels(2400)] as const

export const imageUrl = (puzzleId: PuzzleId, imageKey: ImageKey, width: Pixels): Url =>
  Url(`${R2_BASE_URL}/${puzzleId}/${imageKey}-${width}.webp`)

export const imageSrcSet = (puzzleId: PuzzleId, imageKey: ImageKey, widths: readonly Pixels[] = WIDTHS): string =>
  widths.map((w) => `${imageUrl(puzzleId, imageKey, w)} ${w}w`).join(", ")

export const srcSetPresets = {
  thumbnail: [Pixels(200), Pixels(400)] as const,
  viewer: [Pixels(400), Pixels(800), Pixels(1200)] as const,
  fullscreen: WIDTHS,
}
