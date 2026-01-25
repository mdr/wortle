import { FocusTrap } from "focus-trap-react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { useId } from "react"
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch"

import { Button } from "@/components/shadcn/Button"
import { usePuzzleServiceActions, usePuzzleState } from "@/services/puzzle/puzzleServiceHooks"
import { Pixels } from "@/utils/brandedTypes"
import { imageSrcSet, imageUrl, srcSetPresets } from "@/utils/imageUrls"

import { FullscreenKeyboardShortcuts } from "./FullscreenKeyboardShortcuts"
import { FullscreenTestIds } from "./GalleryTestIds"
import { ZoomControls } from "./ZoomControls"

export const FullScreenViewer = () => {
  const captionId = useId()
  const { id: puzzleId, images } = usePuzzleState((state) => state.puzzle)
  const imageGalleryIndex = usePuzzleState((state) => state.imageGallery.index)
  const puzzleActions = usePuzzleServiceActions()

  return (
    <FocusTrap focusTrapOptions={{ initialFocus: false, allowOutsideClick: true }}>
      <div
        className="fixed inset-0 z-50 bg-black"
        role="dialog"
        aria-modal="true"
        aria-label="Image viewer"
        data-testid={FullscreenTestIds.viewer}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 size-12 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
          onClick={puzzleActions.exitFullscreenImageMode}
          data-testid={FullscreenTestIds.close}
        >
          <X className="size-6" />
          <span className="sr-only">Close</span>
        </Button>

        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1/2 left-4 z-10 size-12 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
              onClick={puzzleActions.goToPreviousImage}
              data-testid={FullscreenTestIds.prev}
            >
              <ChevronLeft className="size-8" />
              <span className="sr-only">Previous image</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1/2 right-4 z-10 size-12 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
              onClick={puzzleActions.goToNextImage}
              data-testid={FullscreenTestIds.next}
            >
              <ChevronRight className="size-8" />
              <span className="sr-only">Next image</span>
            </Button>
          </>
        )}

        <TransformWrapper
          key={imageGalleryIndex}
          initialScale={1}
          minScale={0.5}
          maxScale={5}
          centerOnInit
          limitToBounds
          centerZoomedOut
          doubleClick={{ mode: "toggle", step: 2 }}
        >
          <FullscreenKeyboardShortcuts />
          <TransformComponent
            wrapperClass="!w-full !h-full"
            contentClass="!w-full !h-full flex items-center justify-center"
          >
            <img
              src={imageUrl(puzzleId, images[imageGalleryIndex].imageKey, Pixels(1600))}
              srcSet={imageSrcSet(puzzleId, images[imageGalleryIndex].imageKey, srcSetPresets.fullscreen)}
              sizes="100vw"
              aria-labelledby={captionId}
              className="max-h-full max-w-full object-contain"
            />
          </TransformComponent>

          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
            <p
              id={captionId}
              className="rounded bg-black/50 px-3 py-1 text-sm text-white"
              data-testid={FullscreenTestIds.caption}
            >
              {images[imageGalleryIndex].caption}
            </p>
            <ZoomControls />
          </div>
        </TransformWrapper>
      </div>
    </FocusTrap>
  )
}
