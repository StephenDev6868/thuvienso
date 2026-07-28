import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useAppStore } from '@/stores/app'
import { digitalBooks } from '@/data/digitalLibrary'

describe('useAppStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('coordinates search and overlay state', () => {
    const store = useAppStore()

    store.searchBooks('  hệ Mặt Trời  ')
    store.openChat()
    store.openRegistration()
    store.openReader(digitalBooks[0]!.id)
    store.openSmartLock()

    expect(store.searchQuery).toBe('hệ Mặt Trời')
    expect(store.chatOpen).toBe(false)
    expect(store.readerOpen).toBe(true)
    expect(store.smartLockOpen).toBe(true)
    expect(store.registrationOpen).toBe(false)
    expect(store.selectedBook?.id).toBe(digitalBooks[0]!.id)
    expect(store.activeGradeFilter).toBe('Tất cả')
  })

  it('ignores an unknown digital book id', () => {
    const store = useAppStore()

    store.openReader('khong-ton-tai')

    expect(store.readerOpen).toBe(false)
    expect(store.selectedBook).toBeNull()
  })
})
