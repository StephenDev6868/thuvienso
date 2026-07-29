import { describe, expect, it } from 'vitest'

import { getLibraryAssistantReply } from '@/services/libraryAssistant'

describe('local library assistant', () => {
  it('opens an exact requested textbook', () => {
    expect(getLibraryAssistantReply('Hãy mở sách Toán lớp 3 tập 2 giúp tôi').openBookId).toBe(
      'sgk3-toan-tap-2',
    )
    expect(getLibraryAssistantReply('Mở sách Khoa học lớp 4').openBookId).toBe('sgk4-khoa-hoc')
  })

  it('asks for the grade when several grades have the same subject', () => {
    const reply = getLibraryAssistantReply('Mở sách Tiếng Việt tập 1')

    expect(reply.openBookId).toBeUndefined()
    expect(reply.content).toContain('lớp 1')
    expect(reply.content).toContain('lớp 2')
    expect(reply.content).toContain('lớp 3')
    expect(reply.content).toContain('lớp 4')
    expect(reply.content).toContain('lớp 5')
  })

  it('asks for the volume after the grade is known', () => {
    const reply = getLibraryAssistantReply('Mở sách Tiếng Việt lớp 5')

    expect(reply.openBookId).toBeUndefined()
    expect(reply.content).toContain('Tập 1')
    expect(reply.content).toContain('Tập 2')
  })

  it('answers catalog questions from digitized metadata', () => {
    const reply = getLibraryAssistantReply('Kho sách lớp 5 có những môn nào?')

    expect(reply.content).toContain('12 cuốn')
    expect(reply.content).toContain('lớp 5')
    expect(reply.content).toContain('Toán')
    expect(reply.content).toContain('Tiếng Việt')
    expect(reply.content).toContain('Khoa học')
  })

  it('opens a digitized life-skill PDF', () => {
    const reply = getLibraryAssistantReply('Mở tài liệu kỹ năng quản trị cảm xúc')

    expect(reply.openBookId).toBe('ky-nang-song-quan-ly-cam-xuc-ki-nang-quan-tri-cam-xuc')
    expect(reply.content).toContain('PDF')
  })

  it('opens a digitized Word lesson plan', () => {
    const reply = getLibraryAssistantReply('Mở KHBD Toán lớp 3 tuần 19')

    expect(reply.openBookId).toBe(
      'tai-lieu-giao-vien-khbd-minh-hoa-khoi-1-5-khbd-tvs-lop-3-khbd-lop-3-toan-tuan-19',
    )
    expect(reply.content).toContain('DOCX')
  })

  it('describes the teacher resource catalog', () => {
    const reply = getLibraryAssistantReply('Danh sách tài liệu giáo viên')

    expect(reply.content).toContain('36 tài liệu')
    expect(reply.content).toContain('DOCX')
    expect(reply.content).toContain('PPTX')
  })

  it('opens an embedded teacher book link', () => {
    const reply = getLibraryAssistantReply('Mở sách giáo viên Toán lớp 4 tập 1')

    expect(reply.openBookId).toBe('sgv4-toan-tap-1')
    expect(reply.content).toContain('NXBGD')
  })

  it('asks for a volume when a teacher book has two volumes', () => {
    const reply = getLibraryAssistantReply('Mở sách giáo viên Tiếng Việt lớp 5')

    expect(reply.openBookId).toBeUndefined()
    expect(reply.content).toContain('Tập 1')
    expect(reply.content).toContain('Tập 2')
  })

  it('describes the teacher-book catalog by grade', () => {
    const reply = getLibraryAssistantReply('Kho sách giáo viên lớp 4 có gì?')

    expect(reply.content).toContain('15 cuốn')
    expect(reply.content).toContain('Toán')
    expect(reply.content).toContain('Tiếng Việt')
  })
})
