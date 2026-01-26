import { Button } from "@wortle/ui"
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react"
import { useControls } from "react-zoom-pan-pinch"

import { FullscreenTestIds } from "./GalleryTestIds"

export const ZoomControls = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls()
  return (
    <div className="flex items-center gap-1 rounded-full bg-black/50 p-1">
      <Button
        variant="ghost"
        size="icon"
        className="size-12 rounded-full text-white hover:bg-black/70 hover:text-white"
        onClick={() => zoomOut()}
        data-testid={FullscreenTestIds.zoomOut}
      >
        <ZoomOut className="size-6" />
        <span className="sr-only">Zoom out</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-12 rounded-full text-white hover:bg-black/70 hover:text-white"
        onClick={() => resetTransform()}
        data-testid={FullscreenTestIds.resetZoom}
      >
        <RotateCcw className="size-6" />
        <span className="sr-only">Reset zoom</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-12 rounded-full text-white hover:bg-black/70 hover:text-white"
        onClick={() => zoomIn()}
        data-testid={FullscreenTestIds.zoomIn}
      >
        <ZoomIn className="size-6" />
        <span className="sr-only">Zoom in</span>
      </Button>
    </div>
  )
}
