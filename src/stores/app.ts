import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { findDigitalBook } from '@/data/digitalLibrary'

export const useAppStore = defineStore('app', () => {
  const menuOpen = ref(false)
  const chatOpen = ref(false)
  const registrationOpen = ref(false)
  const readerOpen = ref(false)
  const smartLockOpen = ref(false)
  const selectedBookId = ref<string | null>(null)
  const pendingChatPrompt = ref('')
  const searchQuery = ref('')
  const activeGradeFilter = ref<number | 'Tất cả'>('Tất cả')
  const activeBookFilter = ref('Tất cả')
  const activeCollectionFilter = ref('Tất cả')
  const selectedBook = computed(() =>
    selectedBookId.value ? (findDigitalBook(selectedBookId.value) ?? null) : null,
  )

  function toggleMenu() {
    menuOpen.value = !menuOpen.value
  }

  function closeMenu() {
    menuOpen.value = false
  }

  function openChat() {
    chatOpen.value = true
  }

  function openChatWithPrompt(prompt: string) {
    pendingChatPrompt.value = prompt
    chatOpen.value = true
  }

  function closeChat() {
    chatOpen.value = false
  }

  function clearPendingChatPrompt() {
    pendingChatPrompt.value = ''
  }

  function openReader(bookId: string) {
    if (!findDigitalBook(bookId)) return
    selectedBookId.value = bookId
    readerOpen.value = true
    chatOpen.value = false
  }

  function closeReader() {
    readerOpen.value = false
  }

  function openRegistration() {
    registrationOpen.value = true
  }

  function closeRegistration() {
    registrationOpen.value = false
  }

  function openSmartLock() {
    menuOpen.value = false
    chatOpen.value = false
    registrationOpen.value = false
    smartLockOpen.value = true
  }

  function closeSmartLock() {
    smartLockOpen.value = false
  }

  function searchBooks(query: string) {
    searchQuery.value = query.trim()
  }

  return {
    menuOpen,
    chatOpen,
    registrationOpen,
    readerOpen,
    smartLockOpen,
    selectedBookId,
    selectedBook,
    pendingChatPrompt,
    searchQuery,
    activeGradeFilter,
    activeBookFilter,
    activeCollectionFilter,
    toggleMenu,
    closeMenu,
    openChat,
    openChatWithPrompt,
    closeChat,
    clearPendingChatPrompt,
    openReader,
    closeReader,
    openRegistration,
    closeRegistration,
    openSmartLock,
    closeSmartLock,
    searchBooks,
  }
})
