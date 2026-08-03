import { describe, expect, it } from 'vitest'

import { shouldUseNativePdfViewer } from '@/utils/pdfViewer'

const mobileSafari = {
  appUrl: 'https://thuvienso.example/tu-sach-3d',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',
  maxTouchPoints: 5,
  pointerCoarse: true,
  viewportWidth: 390,
}

describe('PDF viewer selection', () => {
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
