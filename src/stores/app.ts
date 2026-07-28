import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const menuOpen = ref(false)
  const chatOpen = ref(false)
  const registrationOpen = ref(false)
  const searchQuery = ref('')
  const activeBookFilter = ref('Đề xuất')

  function toggleMenu() {
    menuOpen.value = !menuOpen.value
  }

  function closeMenu() {
    menuOpen.value = false
  }

  function openChat() {
    chatOpen.value = true
  }

  function closeChat() {
    chatOpen.value = false
  }

  function openRegistration() {
    registrationOpen.value = true
  }

  function closeRegistration() {
    registrationOpen.value = false
  }

  function searchBooks(query: string) {
    searchQuery.value = query.trim()
  }

  return {
    menuOpen,
    chatOpen,
    registrationOpen,
    searchQuery,
    activeBookFilter,
    toggleMenu,
    closeMenu,
    openChat,
    closeChat,
    openRegistration,
    closeRegistration,
    searchBooks,
  }
})
