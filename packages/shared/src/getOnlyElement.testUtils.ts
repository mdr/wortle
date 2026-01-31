export const getOnlyElement = <T>(array: T[]): T => {
  if (array.length !== 1) {
    throw new Error(`Expected exactly 1 element, got ${array.length}`)
  }
  return array[0]
}
