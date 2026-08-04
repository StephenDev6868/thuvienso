interface NativePdfViewerContext {
  pdfUrl: string
  appUrl: string
  userAgent: string
  maxTouchPoints: number
  pointerCoarse: boolean
  viewportWidth: number
}

export function shouldUseNativePdfViewer(context: NativePdfViewerContext) {
  const isMobileUserAgent = /Android|iPad|iPhone|iPod|Mobile/i.test(context.userAgent)
  const isTouchMac = /Macintosh/i.test(context.userAgent) && context.maxTouchPoints > 1
  const isTouchDevice = context.maxTouchPoints > 0 || context.pointerCoarse

  return isMobileUserAgent || isTouchMac || (isTouchDevice && context.viewportWidth <= 1_180)
}

export function getOriginalPdfUrl(pdfUrl: string, appUrl: string) {
  return new URL(pdfUrl, appUrl).href
}
