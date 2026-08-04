interface PdfViewerContext {
  pdfUrl: string
  appUrl: string
  userAgent: string
  maxTouchPoints: number
  pointerCoarse: boolean
  viewportWidth: number
}

export function shouldUseEmbeddedPdfViewer(context: PdfViewerContext) {
  const isMobileUserAgent = /Android|iPad|iPhone|iPod|Mobile/i.test(context.userAgent)
  const isTouchMac = /Macintosh/i.test(context.userAgent) && context.maxTouchPoints > 1
  const isTouchDevice = context.maxTouchPoints > 0 || context.pointerCoarse

  return isMobileUserAgent || isTouchMac || (isTouchDevice && context.viewportWidth <= 1_180)
}

export function getInlinePdfUrl(pdfUrl: string, appUrl: string) {
  const inlinePdfUrl = new URL(pdfUrl, appUrl)
  inlinePdfUrl.hash = 'page=1&view=FitH'
  return inlinePdfUrl.href
}
