import * as mockttp from "mockttp"
import { describe, expect, it } from "vitest"

import { PuzzleId } from "@/lib/Puzzle"
import { Iso8601Date } from "@/utils/brandedTypes"

import { DataApi } from "./DataApi"
import { withMockServer } from "./withMockServer.testUtils"

const withDataApi = async (callback: (api: DataApi, server: mockttp.Mockttp) => Promise<void>): Promise<void> =>
  withMockServer(async (server, baseUrl) => {
    const api = new DataApi(baseUrl)
    await callback(api, server)
  })

describe("DataApi", () => {
  describe("fetchSchedule", () => {
    it("fetches and parses valid schedule", () =>
      withDataApi(async (api, server) => {
        await server.forGet("/schedule.json").thenJson(200, {
          schedule: [
            { date: "2026-06-08", puzzleId: 43 },
            { date: "2026-06-09", puzzleId: 41 },
          ],
        })

        const schedule = await api.fetchSchedule()

        expect(schedule.findPuzzleForDate(Iso8601Date("2026-06-08"))).toBe(PuzzleId(43))
        expect(schedule.findPuzzleForDate(Iso8601Date("2026-06-09"))).toBe(PuzzleId(41))
        expect(schedule.findPuzzleForDate(Iso8601Date("2026-06-10"))).toBeUndefined()
      }))

    it("throws on HTTP error", () =>
      withDataApi(async (api, server) => {
        await server.forGet("/schedule.json").thenReply(500, "Internal Server Error")

        await expect(api.fetchSchedule()).rejects.toThrowErrorMatchingInlineSnapshot(
          `[Error: Failed to fetch schedule: 500 Internal Server Error]`,
        )
      }))

    it("throws on 404", () =>
      withDataApi(async (api, server) => {
        await server.forGet("/schedule.json").thenReply(404, "Not Found")

        await expect(api.fetchSchedule()).rejects.toThrowErrorMatchingInlineSnapshot(
          `[Error: Failed to fetch schedule: 404 Not Found]`,
        )
      }))

    it("throws on invalid JSON", () =>
      withDataApi(async (api, server) => {
        await server.forGet("/schedule.json").thenReply(200, "not json {{{", {
          "content-type": "application/json",
        })

        await expect(api.fetchSchedule()).rejects.toThrow()
      }))

    it("throws on schema validation failure", () =>
      withDataApi(async (api, server) => {
        await server.forGet("/schedule.json").thenJson(200, {
          entries: [{ date: "2026-06-08", puzzleId: 43 }],
        })

        await expect(api.fetchSchedule()).rejects.toThrow()
      }))

    it("allows extra fields in response for forward compatibility", () =>
      withDataApi(async (api, server) => {
        await server.forGet("/schedule.json").thenJson(200, {
          schedule: [{ date: "2026-06-08", puzzleId: 43, newField: "ignored" }],
          anotherNewField: "also ignored",
        })

        const schedule = await api.fetchSchedule()

        expect(schedule.findPuzzleForDate(Iso8601Date("2026-06-08"))).toBe(PuzzleId(43))
      }))
  })

  describe("fetchPuzzles", () => {
    const validPuzzle = {
      id: 40,
      speciesId: "2cd4p9h.xbs",
      observationDate: "2025-12-19",
      location: { description: "North Yorkshire", coordinates: { latitude: 54.0, longitude: -1.5 } },
      habitat: "Road verge",
      images: [{ imageKey: "whole-plant", caption: "Whole plant" }],
      photoAttribution: { photographer: "Matt Russell", license: "CC-BY 4.0" },
    }

    it("fetches and parses valid puzzles", () =>
      withDataApi(async (api, server) => {
        await server.forGet("/puzzles.json").thenJson(200, {
          puzzles: [validPuzzle],
        })

        const puzzles = await api.fetchPuzzles()

        expect(puzzles.findPuzzle(PuzzleId(40))).toBeDefined()
        expect(puzzles.findPuzzle(PuzzleId(99))).toBeUndefined()
      }))

    it("throws on HTTP error", () =>
      withDataApi(async (api, server) => {
        await server.forGet("/puzzles.json").thenReply(500, "Internal Server Error")

        await expect(api.fetchPuzzles()).rejects.toThrowErrorMatchingInlineSnapshot(
          `[Error: Failed to fetch puzzles: 500 Internal Server Error]`,
        )
      }))

    it("throws on schema validation failure", () =>
      withDataApi(async (api, server) => {
        await server.forGet("/puzzles.json").thenJson(200, {
          puzzles: [{ id: 40 }],
        })

        await expect(api.fetchPuzzles()).rejects.toThrow()
      }))

    it("allows extra fields in response for forward compatibility", () =>
      withDataApi(async (api, server) => {
        await server.forGet("/puzzles.json").thenJson(200, {
          puzzles: [{ ...validPuzzle, newField: "ignored" }],
          anotherNewField: "also ignored",
        })

        const puzzles = await api.fetchPuzzles()

        expect(puzzles.findPuzzle(PuzzleId(40))).toBeDefined()
      }))
  })
})
