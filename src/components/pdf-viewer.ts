/**
 * Copyright 2019 Justin Fagnani <justin@fagnani.com>
 */
import { LitElement, html, css, PropertyValues } from "lit";
import { property, query } from "lit/decorators.js";
import { ResizeController } from "@lit-labs/observers/resize-controller.js";
import {
  getDocument,
  GlobalWorkerOptions,
  PageViewport,
  PDFDocumentProxy,
  PDFPageProxy,
} from "pdfjs-dist";
import pdfWorkerSource from "pdfjs-dist/build/pdf.worker.min.mjs?raw";

import { customElementIfNotExists } from "./custom-element.js";

GlobalWorkerOptions.workerSrc = URL.createObjectURL(
  new Blob([pdfWorkerSource], {
    type: "text/javascript",
  })
);
@customElementIfNotExists("pdf-viewer")
export class PdfViewer extends LitElement {
  @property({ type: String, reflect: true })
  src?: string;

  @property({
    reflect: true,
    converter: (val: unknown) => {
      if (typeof val === "string" && ["contains", "cover"].includes(val)) {
        return val;
      }
      const result = Number(val);
      if (Number.isFinite(result)) {
        return result;
      }
      return 1;
    },
  })
  public scale: number | "cover" | "contain" = "cover";

  @property({ type: Number, reflect: true })
  public page = 1;

  @property({ type: Number, reflect: true })
  public rotation = 0;

  private _viewport: PageViewport | undefined;

  public constructor() {
    super();

    // eslint-disable-next-line no-new
    new ResizeController(this, {
      target: this,
    });
  }

  @query("canvas")
  private _viewerElement: HTMLCanvasElement | undefined;

  private _pdf: PDFDocumentProxy | undefined;

  public get pdf(): PDFDocumentProxy | undefined {
    return this._pdf;
  }

  /** count of pages of pdf */
  public get numPages(): number | undefined {
    return this._pdf?.numPages;
  }

  public override render() {
    return html`
      <slot
        @scaleChange=${this.scaleChange}
        @rotationChange=${this.rotationChange}
      >
        <pdf-viewer-toolbar></pdf-viewer-toolbar
      ></slot>
      <div class="pdfviewer__content" @wheel=${this.zoomWithWheel}>
        <canvas class="pdf__canvas"></canvas>
      </div>
    `;
  }
  public static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      background-color: white;
    }
    .pdfviewer__content {
      flex-grow: 1;
      overflow: auto;
      justify-content: center;
      align-items: flex-start;
    }
  `;

  async updated(changedProperties: PropertyValues) {
    if (changedProperties.has("src")) {
      this.load();
    } else {
      this.renderPage();
    }
  }

  private async load() {
    try {
      this._pdf = await getDocument({
        url: this.src,
      }).promise;
      await this.renderPage();
    } catch (e) {
      this.dispatchEvent(
        new ErrorEvent("error", {
          error: e,
        })
      );
    }
  }

  private zoomWithWheel(evt: WheelEvent) {
    if (evt.ctrlKey && this._viewport) {
      console.info(evt);

      const delta = evt.deltaY * -0.001;
      console.info(evt, delta);
      this.scale = this._viewport.scale + delta;
      evt.stopPropagation();
      evt.preventDefault();
    }
  }

  private updateViewport(page: PDFPageProxy): PageViewport {
    this._viewport = page.getViewport({
      scale: this.calculateScale(page),
      rotation: this.rotation,
    });
    return this._viewport;
  }

  private calculateScale(page: PDFPageProxy) {
    if (typeof this.scale === "number") {
      return this.scale;
    }

    const viewPort = page.getViewport({
      scale: 1,
      rotation: this.rotation,
    });
    const scrollbarWidth = 20;
    const availableWidth = this.offsetWidth;
    const availableHeight = this.offsetHeight;
    const viewportWidthPx = viewPort.width;
    const viewportHeightPx = viewPort.height;
    const fitWidthScale = availableWidth / viewportWidthPx;
    const fitHeightScale = availableHeight / viewportHeightPx;
    const fitWidthScaleWithoutScrollbar =
      (availableWidth - scrollbarWidth) / viewportWidthPx;
    const fitHeightScaleWithoutScrollbar =
      (availableHeight - scrollbarWidth) / viewportHeightPx;
    if (this.scale === "cover") {
      const scale = Math.max(fitWidthScale, fitHeightScale);
      if (scale > 1) {
        return Math.max(
          fitWidthScaleWithoutScrollbar,
          fitHeightScaleWithoutScrollbar
        );
      }
      return scale;
    }
    return Math.min(fitWidthScale, fitHeightScale);
  }

  private get validPage() {
    return Math.min(this._pdf?.numPages || 1, Math.max(1, this.page));
  }

  private async renderPage() {
    console.info("renderpage");
    if (this._pdf && this._viewerElement) {
      const page = await this._pdf.getPage(this.validPage);
      const viewport = this.updateViewport(page);

      this._viewerElement.height = viewport.height;
      this._viewerElement.width = viewport.width;

      const canvasContext = this._viewerElement.getContext("2d");
      if (canvasContext) {
        page.render({ canvasContext, viewport });
      }
    }
  }

  private scaleChange(evt: CustomEvent<number>) {
    this.scale = evt.detail;
  }
  private rotationChange(evt: CustomEvent<number>) {
    this.rotation = evt.detail;
  }
}
