import { useCallback } from "react"
import { useRouter } from "next/navigation"

export const useGoBack = (fallback: string) => {
  const router = useRouter()
  return useCallback(() => {
    if ("navigation" in window && window.navigation.canGoBack) {
      router.back()
    } else {
      router.push(fallback)
    }
  }, [router, fallback])
}
