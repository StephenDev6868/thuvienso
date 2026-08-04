import { describe, expect, it } from 'vitest'

import { getInlinePdfUrl, shouldUseEmbeddedPdfViewer } from '@/utils/pdfViewer'

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
      shouldUseEmbeddedPdfViewer({
        appUrl: 'https://thuvienso.example/tu-sach-3d',
        pdfUrl: 'https://media.example/book.pdf',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        maxTouchPoints: 0,
        pointerCoarse: false,
        viewportWidth: 1440,
      }),
    ).toBe(false)
  })

  it('uses the embedded web viewer for cross-origin files on mobile', () => {
    expect(
      shouldUseEmbeddedPdfViewer({
        ...mobileSafari,
        pdfUrl:
          'https://media.githubusercontent.com/media/owner/repository/main/src/data/book.pdf',
      }),
    ).toBe(true)
  })

  it('uses the embedded web viewer for same-origin PDF files on mobile', () => {
    expect(
      shouldUseEmbeddedPdfViewer({
        ...mobileSafari,
        pdfUrl: '/library-assets/book.pdf',
      }),
    ).toBe(true)
  })

  it('builds a same-origin inline PDF URL without a third-party viewer', () => {
    const viewerUrl = getInlinePdfUrl(
      '/books/SGK_1/S%C3%A1ch%20l%E1%BB%9Bp%201.pdf',
      'https://thuvienso.example/tu-sach-3d',
    )

    expect(viewerUrl).toBe(
      'https://thuvienso.example/books/SGK_1/S%C3%A1ch%20l%E1%BB%9Bp%201.pdf#page=1&view=FitH',
    )
  })
})
