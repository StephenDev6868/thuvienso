import { describe, expect, it } from 'vitest'

import { getOriginalPdfUrl, shouldUseNativePdfViewer } from '@/utils/pdfViewer'

const mobileSafari = {
  appUrl: 'https://thuvienso.example/tu-sach-3d',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',
  maxTouchPoints: 5,
  pointerCoarse: true,
  viewportWidth: 390,
}

describe('PDF viewer selection', () => {
  it('keeps PDF.js on desktop', () => {
    expect(
      shouldUseNativePdfViewer({
        appUrl: 'https://thuvienso.example/tu-sach-3d',
        pdfUrl: 'https://media.example/book.pdf',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        maxTouchPoints: 0,
        pointerCoarse: false,
        viewportWidth: 1440,
      }),
    ).toBe(false)
  })

  it('uses the basic in-app viewer for cross-origin files on mobile', () => {
    expect(
      shouldUseNativePdfViewer({
        ...mobileSafari,
        pdfUrl:
          'https://media.githubusercontent.com/media/owner/repository/main/src/data/book.pdf',
      }),
    ).toBe(true)
  })

  it('keeps the native mobile viewer for same-origin PDF files', () => {
    expect(
      shouldUseNativePdfViewer({
        ...mobileSafari,
        pdfUrl: '/library-assets/book.pdf',
      }),
    ).toBe(true)
  })

  it('resolves the original PDF URL without moving it through a third-party viewer', () => {
    const viewerUrl = getOriginalPdfUrl(
      'https://media.example/S%C3%A1ch%20l%E1%BB%9Bp%201.pdf',
      'https://thuvienso.example/tu-sach-3d',
    )

    expect(viewerUrl).toBe('https://media.example/S%C3%A1ch%20l%E1%BB%9Bp%201.pdf')
  })
})
