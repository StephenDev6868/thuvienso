import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useAppStore } from '@/stores/app'
import { digitalBooks, digitalResources, digitalTeacherBooks } from '@/data/digitalLibrary'

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

  it('opens an Office document in the shared reader state', () => {
    const store = useAppStore()
    const officeDocument = digitalResources.find((document) => document.viewerType === 'office')!

    store.openReader(officeDocument.id)

    expect(store.readerOpen).toBe(true)
    expect(store.selectedBook?.id).toBe(officeDocument.id)
    expect(store.selectedBook?.viewerType).toBe('office')
  })

  it('opens an external teacher book in the shared reader state', () => {
    const store = useAppStore()
    const teacherBook = digitalTeacherBooks[0]!

    store.openReader(teacherBook.id)

    expect(store.readerOpen).toBe(true)
    expect(store.selectedBook?.id).toBe(teacherBook.id)
    expect(store.selectedBook?.viewerType).toBe('external')
  })
})
