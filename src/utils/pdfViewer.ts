interface NativePdfViewerContext {
  pdfUrl: string
  appUrl: string
  userAgent: string
  maxTouchPoints: number
  pointerCoarse: boolean
  viewportWidth: number
}

export function shouldUseNativePdfViewer(context: NativePdfViewerContext) {
  let pdfUrl: URL
  let appUrl: URL

  try {
    appUrl = new URL(context.appUrl)
    pdfUrl = new URL(context.pdfUrl, appUrl)
  } catch {
    return false
  }

  // Mobile browsers, especially Safari, can show a blank iframe when a cross-origin
  // PDF is served by GitHub LFS as application/octet-stream. PDF.js handles that
  // response (including CORS and byte ranges) consistently.
  if (pdfUrl.origin !== appUrl.origin) return false

  const isAppleMobile =
    /iPad|iPhone|iPod/i.test(context.userAgent) ||
    (/Macintosh/i.test(context.userAgent) && context.maxTouchPoints > 1)
  const isTouchDevice = context.maxTouchPoints > 0 || context.pointerCoarse

  return isAppleMobile || (isTouchDevice && context.viewportWidth <= 1_180)
}
