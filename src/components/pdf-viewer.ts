/**
 * Copyright 2019 Justin Fagnani <justin@fagnani.com>
 */
import { LitElement, html, css, PropertyValues } from "lit";
import { property, query } from "lit/decorators.js";

import {
  getDocument,
  GlobalWorkerOptions,
  PDFDocumentProxy,
  PDFPageProxy,
} from "pdfjs-dist";


import { customElementIfNotExists } from "./custom-element.js";

GlobalWorkerOptions.workerSrc = "node_modules/pdfjs-dist/build/pdf.worker.js";
@customElementIfNotExists("pdf-viewer")
export class PdfViewer extends LitElement {
  static styles = css`
    :host {
      display: block;
      overflow: auto;
    }
  `;

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
  scale: number | "cover" | "contain" = "cover";

  @property({ type: Number, reflect: true })
  page = 1;

  @query("canvas")
  public _viewerElement: HTMLCanvasElement | undefined;

  private _pdf: PDFDocumentProxy | undefined;

  public get pdf(): PDFDocumentProxy | undefined {
    return this._pdf;
  }

  get numPages(): number | undefined {
    return this._pdf?.numPages;
  }

  render() {
    return html`<canvas class="page"></canvas>`;
  }

  async updated(changedProperties: PropertyValues) {
    if (changedProperties.has("src")) {
      this.load();
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

  private getCurrentScale(page: PDFPageProxy) {
    if (typeof this.scale === "number") {
      return this.scale;
    }
    const ptToPx: number = 96.0 / 72.0;

    const viewPort = page.getViewport({
      scale: 1,
      rotation: 0,
    });
    const availableWidth = this.offsetWidth;
    const availableHeight = this.offsetHeight;
    const viewportWidthPx = viewPort.width * ptToPx;
    const viewportHeightPx = viewPort.height * ptToPx;
    const fitWidthScale = availableWidth / viewportWidthPx;
    const fitHeightScale = availableHeight / viewportHeightPx;
    if (this.scale === "cover") {
      return Math.max(fitWidthScale, fitHeightScale);
    }
    return Math.min(fitWidthScale, fitHeightScale);
  }

  private get validPage() {
    return Math.min(this._pdf?.numPages || 1, Math.max(1, this.page));
  }

  private async renderPage() {
    if (this._pdf) {
      const page = await this._pdf.getPage(this.validPage);
      const viewport = page.getViewport({ scale: this.getCurrentScale(page) });
      if (this._viewerElement) {
        this._viewerElement.height = viewport.height;
        this._viewerElement.width = viewport.width;
        const canvasContext = this._viewerElement.getContext("2d");
        if (canvasContext) {
          page.render({ canvasContext, viewport });
        }
      }
    }
  }
}
