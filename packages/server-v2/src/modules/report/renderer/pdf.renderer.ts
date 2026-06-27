// ============================================================
// DZS-OS V2 — PDF 渲染器（基于 HTML 转换）
// ============================================================

import { ExportFormat } from '../../../database/mongoose/schemas/report.schema';
import { HTMLReportRenderer } from './html.renderer';
import { IReportRenderer } from './renderer.interface';
import { RenderContext, RenderResult, RenderOptions, RendererMeta } from './types';

/**
 * PDFReportRenderer — 将报告渲染为 PDF 格式
 *
 * 基于 HTML 渲染结果 + puppeteer 无头浏览器转换为 PDF。
 * 实际执行时需依赖 puppeteer 或 puppeteer-core 包。
 * 若运行时未安装，将回退为仅生成 HTML 并提示安装。
 */
export class PDFReportRenderer implements IReportRenderer {
  readonly meta: RendererMeta = {
    format: ExportFormat.PDF,
    name: 'PDF 渲染器',
    description: '基于 HTML 渲染 + Puppeteer 无头浏览器生成 PDF',
    version: '1.0.0',
  };

  readonly format = ExportFormat.PDF;

  /** 内部 HTML 渲染委托 */
  private htmlRenderer: HTMLReportRenderer;

  /** Puppeteer 是否可用 */
  private puppeteerAvailable: boolean | null = null;

  constructor() {
    this.htmlRenderer = new HTMLReportRenderer();
  }

  async render(context: RenderContext, options?: RenderOptions): Promise<RenderResult> {
    const startTime = Date.now();
    const available = await this.checkPuppeteer();

    if (!available) {
      // Fallback: 返回 HTML 结果，标注需要 puppeteer
      const htmlResult = await this.htmlRenderer.render(context, options);
      return {
        ...htmlResult,
        content: `<!-- ============================================\n${'注意：PDF 渲染需要 puppeteer 依赖，以下为 HTML 回退内容'}\n============================================ -->\n\n${htmlResult.content}`,
        format: ExportFormat.PDF,
        size: htmlResult.size,
        duration: Date.now() - startTime,
        mimeType: this.getMimeType(),
      };
    }

    // 正常 PDF 渲染路径
    const htmlContent = (await this.htmlRenderer.render(context, options)).content;
    const pdfBuffer = await this.htmlToPdf(htmlContent, options);
    const pdfContent = pdfBuffer.toString('base64');

    return {
      content: pdfContent,
      format: ExportFormat.PDF,
      size: pdfBuffer.length,
      duration: Date.now() - startTime,
      mimeType: this.getMimeType(),
    };
  }

  /**
   * 检查 puppeteer 是否可用
   */
  private async checkPuppeteer(): Promise<boolean> {
    if (this.puppeteerAvailable !== null) return this.puppeteerAvailable;
    try {
      // @ts-expect-error 可选依赖 — 运行时按需检查
      await import('puppeteer');
      this.puppeteerAvailable = true;
    } catch {
      this.puppeteerAvailable = false;
    }
    return this.puppeteerAvailable;
  }

  /**
   * 使用 puppeteer 将 HTML 转为 PDF Buffer
   */
  private async htmlToPdf(html: string, options?: RenderOptions): Promise<Buffer> {
    // @ts-expect-error 可选依赖 — 运行时按需检查
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfOpts = options?.pdfOptions ?? {};
      const pdfBuffer = await page.pdf({
        format: pdfOpts.pageSize ?? 'A4',
        margin: pdfOpts.margin ?? { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
        landscape: pdfOpts.landscape ?? false,
        printBackground: pdfOpts.printBackground ?? true,
        displayHeaderFooter: true,
        headerTemplate: '<div style="font-size:9px;color:#999;padding:10px;width:100%;text-align:center;"><span class="title"></span></div>',
        footerTemplate: '<div style="font-size:9px;color:#999;padding:10px;width:100%;text-align:center;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  async toBuffer(content: string): Promise<Buffer> {
    // Base64 编码的 PDF 内容
    return Buffer.from(content, 'base64');
  }

  getMimeType(): string {
    return 'application/pdf';
  }

  getFileExtension(): string {
    return '.pdf';
  }
}
