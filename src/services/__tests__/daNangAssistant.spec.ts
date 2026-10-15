import { describe, expect, it } from 'vitest'

import { getDaNangAssistantReply } from '@/services/daNangAssistant'

describe('Da Nang discovery assistant', () => {
  it('answers detailed questions about Dinh lang Hoa My', () => {
    const reply = getDaNangAssistantReply('Đình làng Hòa Mỹ có gì đặc biệt?')

    expect(reply?.content).toContain('Đình làng Hòa Mỹ')
    expect(reply?.content).toContain('12 tháng Giêng')
    expect(reply?.content).toContain('5 ảnh')
    expect(reply?.routeQuery).toEqual({ q: 'Đình làng Hòa Mỹ' })
    expect(reply?.autoNavigate).toBe(false)
  })

  it('summarizes a ward with places, festivals and food', () => {
    const reply = getDaNangAssistantReply('Phường Hòa Khánh có gì?')

    expect(reply?.content).toContain('Phường Hòa Khánh')
    expect(reply?.content).toContain('Đình làng Hòa Mỹ')
    expect(reply?.content).toContain('Lễ hội đình làng Hòa Mỹ')
    expect(reply?.routeQuery).toEqual({ q: 'Hòa Khánh' })
  })

  it('lists festivals from the discovery dataset', () => {
    const reply = getDaNangAssistantReply('Đà Nẵng có những lễ hội nào?')

    expect(reply?.content).toContain('Một số lễ hội nổi bật')
    expect(reply?.content).toContain('Lễ hội đình làng Hòa Mỹ')
    expect(reply?.routeName).toBe('discover-da-nang')
  })

  it('can navigate directly when explicitly requested', () => {
    const reply = getDaNangAssistantReply('Mở bài Đình làng Hòa Mỹ')

    expect(reply?.autoNavigate).toBe(true)
  })

  it('ignores unrelated library questions', () => {
    expect(getDaNangAssistantReply('Mở sách Toán lớp 3')).toBeNull()
  })
})
