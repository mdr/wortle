/**
 * Merges coverage data from unit tests and IWFTs using monocart-coverage-reports.
 * This ensures consistent instrumentation and accurate merged results.
 */
import { CoverageReport } from "monocart-coverage-reports"

const sourceFilter = (sourcePath: string) =>
  sourcePath.startsWith("src/") &&
  !sourcePath.startsWith("src/tests/") &&
  !sourcePath.includes("routeTree.gen") &&
  !sourcePath.endsWith(".css") &&
  !sourcePath.includes(".stryker-tmp") &&
  !sourcePath.includes("cloud.umami.is")

async function mergeCoverage() {
  const coverageReport = new CoverageReport({
    name: "Combined Coverage Report",
    inputDir: ["./coverage/unit/raw", "./coverage/iwft/coverage/raw"],
    outputDir: "./coverage/merged",
    sourceFilter,
    reports: [["v8"], ["console-summary"]],
  })

  await coverageReport.generate()
}

mergeCoverage().catch((err: unknown) => {
  console.error("Failed to merge coverage:", err)
  process.exit(1)
})
