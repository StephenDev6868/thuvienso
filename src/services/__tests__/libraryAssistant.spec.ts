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
})
