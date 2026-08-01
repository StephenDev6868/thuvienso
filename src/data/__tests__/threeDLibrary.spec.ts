import { describe, expect, it } from 'vitest'

import {
  fitShelvesToCapacity,
  threeDBookCabinets,
  threeDLibraryBookCount,
} from '@/data/threeDLibrary'

describe('3D book cabinets', () => {
  it('distributes every digitized item into exactly one cabinet', () => {
    const bookIds = threeDBookCabinets.flatMap((cabinet) => cabinet.books.map((book) => book.id))

    expect(threeDBookCabinets).toHaveLength(5)
    expect(threeDLibraryBookCount).toBe(194)
    expect(bookIds).toHaveLength(194)
    expect(new Set(bookIds).size).toBe(194)
  })

  it('packs books densely into no more than 18 items per shelf', () => {
    for (const cabinet of threeDBookCabinets) {
      if (cabinet.id === 'sgk-tieu-hoc') expect(cabinet.shelves).toHaveLength(5)
      else expect(cabinet.shelves.length).toBe(Math.ceil(cabinet.books.length / 18))
      expect(cabinet.shelves.every((shelf) => shelf.books.length > 0)).toBe(true)
      expect(cabinet.shelves.every((shelf) => shelf.books.length <= 18)).toBe(true)
      expect(cabinet.shelves.flatMap((shelf) => shelf.books)).toHaveLength(cabinet.books.length)
    }
  })

  it('keeps all textbooks in one cabinet with one shelf per grade', () => {
    const textbookCabinet = threeDBookCabinets.find((cabinet) => cabinet.id === 'sgk-tieu-hoc')!

    expect(textbookCabinet.books).toHaveLength(63)
    expect(textbookCabinet.shelves.map((shelf) => shelf.label)).toEqual([
      'Lớp 1',
      'Lớp 2',
      'Lớp 3',
      'Lớp 4',
      'Lớp 5',
    ])
    expect(textbookCabinet.shelves.map((shelf) => shelf.books.length)).toEqual([11, 11, 14, 15, 12])
  })

  it('keeps teacher-book grade ranges visible after dense packing', () => {
    const teacherCabinet = threeDBookCabinets.find((cabinet) => cabinet.id === 'sach-giao-vien')!

    expect(teacherCabinet.shelves.map((shelf) => shelf.label)).toEqual(['Lớp 3–4', 'Lớp 4–5'])
    expect(teacherCabinet.shelves.map((shelf) => shelf.books.length)).toEqual([18, 18])
  })

  it('adds balanced overflow shelves when a tablet has less horizontal capacity', () => {
    const textbookCabinet = threeDBookCabinets.find((cabinet) => cabinet.id === 'sgk-tieu-hoc')!
    const tabletShelves = fitShelvesToCapacity(textbookCabinet.shelves, 13)

    expect(tabletShelves.map((shelf) => shelf.books.length)).toEqual([11, 11, 7, 7, 8, 7, 12])
    expect(tabletShelves.map((shelf) => shelf.label)).toContain('Lớp 3 · Kệ 1/2')
    expect(tabletShelves.map((shelf) => shelf.label)).toContain('Lớp 4 · Kệ 2/2')
    expect(tabletShelves.every((shelf) => shelf.books.length <= 13)).toBe(true)
    expect(tabletShelves.flatMap((shelf) => shelf.books)).toEqual(
      textbookCabinet.shelves.flatMap((shelf) => shelf.books),
    )
  })
})
