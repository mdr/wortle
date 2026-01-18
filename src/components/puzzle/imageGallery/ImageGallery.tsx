import { ChevronLeft, ChevronRight, Copyright, Maximize2 } from "lucide-react"
import { useId } from "react"
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch"

import { Button } from "@/components/shadcn/Button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shadcn/Popover"
import { usePuzzleServiceActions, usePuzzleState } from "@/services/puzzle/puzzleServiceHooks"
import { imageSrcSet, imageUrl, srcSetPresets } from "@/utils/imageUrls"

import { FullScreenViewer } from "./FullScreenViewer"
import { GalleryTestIds } from "./GalleryTestIds"

export const ImageGallery = () => {
  const captionId = useId()
  const { id: puzzleId, images, photoAttribution } = usePuzzleState((state) => state.puzzle)
  const { index: imageGalleryIndex, isFullscreen } = usePuzzleState((state) => state.imageGallery)
  const puzzleActions = usePuzzleServiceActions()

  const goToPrevious = () => {
    puzzleActions.goToPreviousImage()
  }

  const goToNext = () => {
    puzzleActions.goToNextImage()
  }

  return (
    <>
      <div className="space-y-4" data-testid={GalleryTestIds.gallery}>
        <div className="bg-muted relative aspect-[4/3] overflow-hidden rounded-lg">
          <TransformWrapper
            key={imageGalleryIndex}
            initialScale={1}
            minScale={1}
            maxScale={4}
            centerOnInit
            limitToBounds
            centerZoomedOut
            doubleClick={{ mode: "toggle", step: 2 }}
          >
            <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
              <img
                src={imageUrl(puzzleId, images[imageGalleryIndex].imageKey, 800)}
                srcSet={imageSrcSet(puzzleId, images[imageGalleryIndex].imageKey, srcSetPresets.viewer)}
                sizes="(max-width: 640px) 100vw, 800px"
                aria-labelledby={captionId}
                className="h-full w-full object-contain"
              />
            </TransformComponent>
          </TransformWrapper>

          <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={goToPrevious}
              className="pointer-events-auto size-12 rounded-full shadow-lg"
              data-testid={GalleryTestIds.prev}
            >
              <ChevronLeft className="size-6" />
              <span className="sr-only">Previous image</span>
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={goToNext}
              className="pointer-events-auto size-12 rounded-full shadow-lg"
              data-testid={GalleryTestIds.next}
            >
              <ChevronRight className="size-6" />
              <span className="sr-only">Next image</span>
            </Button>
          </div>

          <Button
            variant="secondary"
            size="icon"
            onClick={puzzleActions.enterFullscreenImageMode}
            className="absolute top-2 right-2 size-12 rounded-full shadow-lg"
            data-testid={GalleryTestIds.fullscreen}
          >
            <Maximize2 className="size-6" />
            <span className="sr-only">View fullscreen</span>
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-2 bottom-2 size-12 rounded-full opacity-70 shadow-lg hover:opacity-100"
              >
                <Copyright className="size-6" />
                <span className="sr-only">Photo attribution</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto text-xs" side="top" align="end">
              <p className="flex flex-wrap items-center gap-x-1">
                <span>© 2025 by {photoAttribution.photographer}, licensed under</span>
                <a
                  href="https://creativecommons.org/licenses/by/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center hover:underline"
                >
                  {photoAttribution.license}
                  <img
                    src="https://mirrors.creativecommons.org/presskit/icons/cc.svg"
                    alt=""
                    className="ml-1 inline-block h-4 w-4"
                  />
                  <img
                    src="https://mirrors.creativecommons.org/presskit/icons/by.svg"
                    alt=""
                    className="ml-0.5 inline-block h-4 w-4"
                  />
                </a>
              </p>
            </PopoverContent>
          </Popover>
        </div>

        <p id={captionId} className="text-muted-foreground text-center text-sm" data-testid={GalleryTestIds.caption}>
          {images[imageGalleryIndex].caption}
        </p>

        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <div key={image.imageKey} className="flex flex-col items-center">
              <button
                onClick={() => puzzleActions.selectImageIndex(index)}
                className={`relative aspect-square w-full overflow-hidden rounded-md border transition-all ${
                  index === imageGalleryIndex
                    ? "border-muted-foreground/30"
                    : "hover:border-muted-foreground/30 border-transparent opacity-60 hover:opacity-100"
                }`}
                data-testid={GalleryTestIds.thumbnail}
              >
                <img
                  src={imageUrl(puzzleId, image.imageKey, 200)}
                  srcSet={imageSrcSet(puzzleId, image.imageKey, srcSetPresets.thumbnail)}
                  sizes="25vw"
                  alt={image.caption}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
              <div
                className={`border-b-primary mt-1 h-0 w-0 border-x-[6px] border-b-[8px] border-x-transparent transition-opacity ${
                  index === imageGalleryIndex ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {isFullscreen && <FullScreenViewer />}
    </>
  )
}
