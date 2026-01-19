import type { CoverageReportOptions } from "monocart-coverage-reports"

const config: CoverageReportOptions = {
  name: "Unit Test Coverage",
  outputDir: "./coverage/unit",
  reports: [["raw", {}], ["v8"], ["console-summary"]],
  sourceFilter: (sourcePath: string) =>
    sourcePath.startsWith("src/") &&
    !sourcePath.startsWith("src/tests/") &&
    !sourcePath.includes("routeTree.gen") &&
    !sourcePath.endsWith(".css") &&
    !sourcePath.includes(".stryker-tmp"),
}

export default config
