import { describe, expect, it } from 'vitest'

import {
  digitalBooks,
  digitalEbooks,
  digitalLibraryCollection,
  digitalLibraryGradeCollections,
  digitalResources,
  digitalTeacherBooks,
  digitalTextbooks,
  searchDigitalBooks,
} from '@/data/digitalLibrary'

describe('digital library catalog', () => {
  it('contains every digitized textbook from grade one through five', () => {
    expect(digitalTextbooks).toHaveLength(63)
    expect(digitalEbooks).toHaveLength(42)
    expect(digitalResources).toHaveLength(53)
    expect(digitalTeacherBooks).toHaveLength(36)
    expect(digitalBooks).toHaveLength(194)
    expect(digitalLibraryCollection.bookCount).toBe(63)
    expect(digitalLibraryCollection.totalPages).toBe(6642)
    expect(digitalLibraryCollection.grades).toEqual([1, 2, 3, 4, 5])
    expect(digitalLibraryGradeCollections).toEqual([
      expect.objectContaining({ grade: 1, bookCount: 11, totalPages: 1256 }),
      expect.objectContaining({ grade: 2, bookCount: 11, totalPages: 1171 }),
      expect.objectContaining({ grade: 3, bookCount: 14, totalPages: 1398 }),
      expect.objectContaining({ grade: 4, bookCount: 15, totalPages: 1519 }),
      expect.objectContaining({ grade: 5, bookCount: 12, totalPages: 1298 }),
    ])
    expect(
      digitalTextbooks.every((book) => book.viewerType === 'pdf' && book.pdfUrl && book.coverUrl),
    ).toBe(true)
    expect(
      digitalResources.every(
        (document) =>
          document.coverUrl &&
          (document.viewerType === 'pdf' ? document.pdfUrl : document.previewUrl),
      ),
    ).toBe(true)
    expect(
      digitalEbooks.every((book) => book.viewerType === 'pdf' && book.pdfUrl && book.coverUrl),
    ).toBe(true)
    expect(
      digitalTeacherBooks.every(
        (book) =>
          book.viewerType === 'external' &&
          book.externalUrl.startsWith('https://taphuan.nxbgd.vn/'),
      ),
    ).toBe(true)
  })

  it('finds books from natural Vietnamese chat requests', () => {
    expect(searchDigitalBooks('Mở sách Toán 1 tập 2')[0]?.id).toBe('sgk1-toan-tap-2')
    expect(searchDigitalBooks('đọc tiếng việt lớp 2 tập 1')[0]?.id).toBe('sgk2-tieng-viet-tap-1')
    expect(searchDigitalBooks('mở toán lớp 3 tập 1')[0]?.id).toBe('sgk3-toan-tap-1')
    expect(searchDigitalBooks('đọc khoa học lớp 4')[0]?.id).toBe('sgk4-khoa-hoc')
    expect(searchDigitalBooks('xem sách khoa học lớp 5')[0]?.id).toBe('sgk5-khoa-hoc')
    expect(searchDigitalBooks('mở lịch sử địa lí 5')[0]?.id).toBe('sgk5-lich-su-dia-li')
    expect(searchDigitalBooks('mở sách giáo viên toán lớp 4 tập 1')[0]?.id).toBe('sgv4-toan-tap-1')
  })
})
