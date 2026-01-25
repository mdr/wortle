import { useEffect } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { useControls } from "react-zoom-pan-pinch"

import { usePuzzleServiceActions } from "@/services/puzzle/puzzleServiceHooks"

export const useFullscreenKeyboardShortcuts = (): void => {
  const puzzleActions = usePuzzleServiceActions()
  const { zoomIn, zoomOut, resetTransform } = useControls()

  useHotkeys("esc", () => {
    puzzleActions.exitFullscreenImageMode()
  })
  useHotkeys("left", () => {
    puzzleActions.goToPreviousImage()
  })
  useHotkeys("right", () => {
    puzzleActions.goToNextImage()
  })
  useHotkeys("equal,shift+equal,add", () => {
    zoomIn()
  })
  useHotkeys("minus,shift+minus,subtract", () => {
    zoomOut()
  })

  useEffect(() => {
    return () => {
      resetTransform()
    }
  }, [resetTransform])
}

export const FullscreenKeyboardShortcuts = () => {
  useFullscreenKeyboardShortcuts()
  return null
}
