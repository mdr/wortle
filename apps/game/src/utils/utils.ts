import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const assetUrl = (path: string): string => {
  const base = import.meta.env.BASE_URL
  // Remove leading slash from path if base ends with slash
  if (base.endsWith("/") && path.startsWith("/")) {
    return base + path.slice(1)
  }
  return base + path
}
