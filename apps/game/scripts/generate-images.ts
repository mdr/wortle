import { mkdir, readdir } from "node:fs/promises"
import { basename, extname, join } from "node:path"

import sharp from "sharp"

const WIDTHS = [200, 400, 800, 1200, 1600, 2400]
const QUALITY = 80
const INPUT_DIR = "public/images"
const OUTPUT_DIR = "dist/optimized-images"

const generateVariants = async (inputPath: string, outputDir: string, filename: string) => {
  const name = basename(filename, extname(filename))

  for (const width of WIDTHS) {
    const outputPath = join(outputDir, `${name}-${width}.webp`)
    await sharp(inputPath).resize(width).webp({ quality: QUALITY }).toFile(outputPath)
    console.log(`  ✓ ${name}-${width}.webp`)
  }
}

const main = async () => {
  const puzzleDirs = await readdir(INPUT_DIR)

  for (const puzzleId of puzzleDirs) {
    const puzzleInputDir = join(INPUT_DIR, puzzleId)
    const puzzleOutputDir = join(OUTPUT_DIR, puzzleId)

    await mkdir(puzzleOutputDir, { recursive: true })

    const files = await readdir(puzzleInputDir)
    const images = files.filter((f) => /\.(jpg|jpeg|png)$/i.test(f))

    console.log(`\nPuzzle ${puzzleId}: ${images.length} images`)

    for (const image of images) {
      console.log(`Processing ${image}...`)
      await generateVariants(join(puzzleInputDir, image), puzzleOutputDir, image)
    }
  }

  console.log("\nDone!")
}

main().catch(console.error)
