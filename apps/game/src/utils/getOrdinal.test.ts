import { expect, test } from "vitest"

import { getOrdinal } from "./getOrdinal"

test.each([
  [1, "1st"],
  [2, "2nd"],
  [3, "3rd"],
  [4, "4th"],
  [5, "5th"],
  [10, "10th"],
  [11, "11th"],
  [12, "12th"],
  [13, "13th"],
  [14, "14th"],
  [21, "21st"],
  [22, "22nd"],
  [23, "23rd"],
  [24, "24th"],
  [100, "100th"],
  [101, "101st"],
  [111, "111th"],
  [112, "112th"],
  [113, "113th"],
])("getOrdinal(%i) returns %s", (n, expected) => {
  expect(getOrdinal(n)).toBe(expected)
})
