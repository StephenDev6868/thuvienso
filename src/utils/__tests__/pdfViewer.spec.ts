import { describe, expect, it } from 'vitest'

import { shouldOpenOriginalPdfOnMobile, shouldUseNativePdfViewer } from '@/utils/pdfViewer'

const mobileSafari = {
  appUrl: 'https://thuvienso.example/tu-sach-3d',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',
  maxTouchPoints: 5,
  pointerCoarse: true,
  viewportWidth: 390,
}

describe('PDF viewer selection', () => {
  it('opens the original PDF with the device viewer on mobile', () => {
    expect(shouldOpenOriginalPdfOnMobile(mobileSafari)).toBe(true)
  })

  it('keeps PDF.js on desktop', () => {
    expect(
      shouldOpenOriginalPdfOnMobile({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        maxTouchPoints: 0,
        pointerCoarse: false,
        viewportWidth: 1440,
      }),
    ).toBe(false)
  })

  it('uses PDF.js for cross-origin GitHub LFS files on mobile', () => {
    expect(
      shouldUseNativePdfViewer({
        ...mobileSafari,
        pdfUrl:
          'https://media.githubusercontent.com/media/owner/repository/main/src/data/book.pdf',
      }),
    ).toBe(false)
  })

  it('keeps the native mobile viewer for same-origin PDF files', () => {
    expect(
      shouldUseNativePdfViewer({
        ...mobileSafari,
        pdfUrl: '/library-assets/book.pdf',
      }),
    ).toBe(true)
  })
})
