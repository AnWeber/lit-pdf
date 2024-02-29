import { LitElement, html } from "lit-element";
import { customElementIfNotExists } from "./custom-element";
import { PdfViewer } from "./pdf-viewer";

@customElementIfNotExists("showcase-app")
export class ShowcaseApp extends LitElement {
  public override render() {
    return html`<div class="buttongroup">
      <button @click=${this.prevPage}>prev</button>
      <button @click=${this.nextPage}>next</button>
      <button @click=${() => this.switchPdf("/agb.pdf")}>agb.pdf</button>
      <button @click=${() => this.switchPdf("/dummy.pdf")}>dummy.pdf</button>
      <button @click=${() => this.setScale("cover")}>cover</button>
      <button @click=${() => this.setScale("contain")}>contain</button>
      <button @click=${() => this.setScale(0.2)}>20%</button>
      <button @click=${() => this.setScale(0.5)}>50%</button>
      <button @click=${() => this.setScale(0.8)}>80%</button>
      <button @click=${() => this.setScale(1)}>100%</button>
    </div>`;
  }

  private get pdfViewer(): PdfViewer {
    return document.querySelector("pdf-viewer") as PdfViewer;
  }

  private prevPage() {
    const currentPage = this.pdfViewer.page;
    const numPages = this.pdfViewer.numPages;

    let result = currentPage - 1;
    if (result < 1 && numPages) {
      result += numPages;
    }
    this.pdfViewer.page = result;
  }

  private nextPage() {
    const currentPage = this.pdfViewer.page;
    const numPages = this.pdfViewer.numPages;

    let result = currentPage + 1;
    if (numPages && result > numPages) {
      result -= numPages;
    }
    this.pdfViewer.page = result;
  }

  private switchPdf(url: string) {
    this.pdfViewer.src = url;
  }

  private setScale(scale: number | "cover" | "contain") {
    this.pdfViewer.scale = scale;
  }
}
