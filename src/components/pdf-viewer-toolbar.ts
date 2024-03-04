/**
 * Copyright 2019 Justin Fagnani <justin@fagnani.com>
 */
import { LitElement, html, css } from "lit";
import { GlobalWorkerOptions, PDFDocumentProxy } from "pdfjs-dist";
import pdfWorkerSource from "pdfjs-dist/build/pdf.worker.min.mjs?raw";

import { customElementIfNotExists } from "./custom-element.js";
import { property } from "lit/decorators.js";

GlobalWorkerOptions.workerSrc = URL.createObjectURL(
  new Blob([pdfWorkerSource], {
    type: "text/javascript",
  })
);
@customElementIfNotExists("pdf-viewer-toolbar")
export class PdfViewerToolbar extends LitElement {
  @property({ type: Object })
  public pdf: PDFDocumentProxy | undefined;

  public override render() {
    return html`
      <button @click=${() => this.setScale("cover")}>cover</button>
      <button @click=${() => this.setScale("contain")}>contain</button>
      <button @click=${() => this.setScale(0.2)}>20%</button>
      <button @click=${() => this.setScale(0.5)}>50%</button>
      <button @click=${() => this.setScale(0.8)}>80%</button>
      <button @click=${() => this.setScale(1)}>100%</button>
      <button @click=${() => this.setRotation(90)}>90%</button>
      <button @click=${() => this.setRotation(180)}>180</button>
      <button @click=${() => this.setRotation(0)}>0</button>
    `;
  }
  public static override styles = css`
    :host {
      display: flex;
    }
  `;

  private setScale(detail: number | "cover" | "contain") {
    this.dispatchEvent(
      new CustomEvent("scaleChange", {
        detail,
        bubbles: true,
        composed: true,
      })
    );
  }
  private setRotation(detail: number | "cover" | "contain") {
    this.dispatchEvent(
      new CustomEvent("rotationChange", {
        detail,
        bubbles: true,
        composed: true,
      })
    );
  }
}
