import { FullscreenTestIds, GalleryTestIds } from "@/components/pages/puzzle/imageGallery/GalleryTestIds"

import { expect } from "../fixtures"
import { PageObject } from "./PageObject"

export class GalleryPageObject extends PageObject {
  verifyIsShown = (): Promise<this> =>
    this.step("verifyIsShown", async () => {
      await expect(this.get(GalleryTestIds.gallery)).toBeVisible()
      return this
    })

  verifyCaption = (caption: string): Promise<void> =>
    this.step(`verifyCaption '${caption}'`, () => expect(this.get(GalleryTestIds.caption)).toHaveText(caption))

  clickNext = (): Promise<void> => this.step("clickNext", () => this.get(GalleryTestIds.next).click())

  clickPrev = (): Promise<void> => this.step("clickPrev", () => this.get(GalleryTestIds.prev).click())

  clickThumbnail = (index: number): Promise<void> =>
    this.step(`clickThumbnail ${index}`, () => this.get(GalleryTestIds.thumbnail).nth(index).click())

  openFullscreen = (): Promise<FullscreenViewerPageObject> =>
    this.step("openFullscreen", async () => {
      await this.get(GalleryTestIds.fullscreen).click()
      return new FullscreenViewerPageObject(this.mountResult).verifyIsShown()
    })
}

export class FullscreenViewerPageObject extends PageObject {
  verifyIsShown = (): Promise<this> =>
    this.step("verifyIsShown", async () => {
      await expect(this.get(FullscreenTestIds.viewer)).toBeVisible()
      return this
    })

  verifyCaption = (caption: string): Promise<void> =>
    this.step(`verifyCaption '${caption}'`, () => expect(this.get(FullscreenTestIds.caption)).toHaveText(caption))

  clickNext = (): Promise<void> => this.step("clickNext", () => this.get(FullscreenTestIds.next).click())

  clickPrev = (): Promise<void> => this.step("clickPrev", () => this.get(FullscreenTestIds.prev).click())

  pressZoomInKey = (): Promise<void> => this.step("pressZoomInKey", () => this.page.keyboard.press("Shift+="))

  pressZoomOutKey = (): Promise<void> => this.step("pressZoomOutKey", () => this.page.keyboard.press("-"))

  pressEscape = (): Promise<void> => this.step("pressEscape", () => this.page.keyboard.press("Escape"))

  pressLeftArrow = (): Promise<void> => this.step("pressLeftArrow", () => this.page.keyboard.press("ArrowLeft"))

  pressRightArrow = (): Promise<void> => this.step("pressRightArrow", () => this.page.keyboard.press("ArrowRight"))

  clickZoomIn = (): Promise<void> => this.step("clickZoomIn", () => this.get(FullscreenTestIds.zoomIn).click())

  clickZoomOut = (): Promise<void> => this.step("clickZoomOut", () => this.get(FullscreenTestIds.zoomOut).click())

  clickResetZoom = (): Promise<void> => this.step("clickResetZoom", () => this.get(FullscreenTestIds.resetZoom).click())

  verifyIsClosed = (): Promise<void> =>
    this.step("verifyIsClosed", () => expect(this.get(FullscreenTestIds.viewer)).not.toBeVisible())

  getTransformScale = (): Promise<number> =>
    this.step("getTransformScale", async () => {
      const transform = await this.get(FullscreenTestIds.viewer)
        .locator(".react-transform-component")
        .first()
        .evaluate((element) => window.getComputedStyle(element).transform)

      if (!transform || transform === "none") {
        return 1
      }

      const match = transform.match(/matrix(3d)?\((.+)\)/)
      if (!match) {
        return 1
      }

      const values = match[2].split(",").map((value) => Number.parseFloat(value.trim()))
      return Number.isNaN(values[0]) ? 1 : values[0]
    })

  verifyZoomedIn = (initialScale: number): Promise<void> =>
    this.step("verifyZoomedIn", () => expect.poll(() => this.getTransformScale()).toBeGreaterThan(initialScale))

  verifyZoomedOut = (previousScale: number): Promise<void> =>
    this.step("verifyZoomedOut", () => expect.poll(() => this.getTransformScale()).toBeLessThan(previousScale))

  verifyZoomReset = (): Promise<void> =>
    this.step("verifyZoomReset", () =>
      expect
        .poll(async () => {
          const scale = await this.getTransformScale()
          return Math.abs(scale - 1) < 0.1
        })
        .toBe(true),
    )

  close = (): Promise<void> =>
    this.step("close", async () => {
      await this.get(FullscreenTestIds.close).click()
      await expect(this.get(FullscreenTestIds.viewer)).not.toBeVisible()
    })
}
