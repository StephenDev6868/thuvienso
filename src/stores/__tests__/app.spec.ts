import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useAppStore } from '@/stores/app'

describe('useAppStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('coordinates search and overlay state', () => {
    const store = useAppStore()

    store.searchBooks('  hệ Mặt Trời  ')
    store.openChat()
    store.openRegistration()

    expect(store.searchQuery).toBe('hệ Mặt Trời')
    expect(store.chatOpen).toBe(true)
    expect(store.registrationOpen).toBe(true)
  })
})
