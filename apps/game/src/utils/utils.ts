export const assetUrl = (path: string): string => {
  const base = import.meta.env.BASE_URL
  // Remove leading slash from path if base ends with slash
  if (base.endsWith("/") && path.startsWith("/")) {
    return base + path.slice(1)
  }
  return base + path
}
