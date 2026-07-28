<script setup lang="ts">
import { Menu, Search, X } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

import logoUrl from '../../logo.jpg'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const { menuOpen, searchQuery } = storeToRefs(appStore)
const headerQuery = ref('')

const navigation = [
  { label: 'Trang chủ', href: '#top' },
  { label: 'Kho sách', href: '#featured-books' },
  { label: 'Sách nói', href: '#quick-access' },
  { label: 'Học liệu', href: '#stem-videos' },
  { label: 'STEM', href: '#topics' },
  { label: 'Hoạt động', href: '#community' },
]

function submitSearch() {
  appStore.searchBooks(headerQuery.value)
  globalThis.document.querySelector('#featured-books')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-black/6 bg-white/92 backdrop-blur-xl">
    <div class="page-shell flex h-20 items-center justify-between gap-6">
      <RouterLink
        to="/"
        class="focus-ring flex shrink-0 items-center gap-3 rounded-xl"
        aria-label="Trang chủ Thư viện số"
      >
        <span
          class="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-red-100 bg-white shadow-sm"
        >
          <img
            :src="logoUrl"
            alt="Logo Trường Tiểu học Bùi Thị Xuân"
            class="h-full w-full object-contain"
          />
        </span>
        <span class="leading-none">
          <strong class="block text-[17px] tracking-[-0.02em]">THƯ VIỆN SỐ</strong>
          <small class="mt-1.5 block text-[10px] font-extrabold tracking-[0.08em] text-red-500">
            AI • STEM • SÁCH
          </small>
        </span>
      </RouterLink>

      <nav class="hidden items-center gap-8 xl:flex" aria-label="Điều hướng chính">
        <a
          v-for="(item, index) in navigation"
          :key="item.href"
          :href="item.href"
          class="focus-ring rounded-lg py-2 text-sm font-semibold transition hover:text-red-500"
          :class="index === 0 ? 'text-red-500' : 'text-ink-950'"
        >
          {{ item.label }}
        </a>
      </nav>

      <form
        class="hidden h-12 w-53 items-center rounded-2xl bg-red-50 px-4 lg:flex"
        role="search"
        @submit.prevent="submitSearch"
      >
        <Search :size="16" class="shrink-0 text-slate-500" />
        <label for="header-search" class="sr-only">Tìm kiếm sách</label>
        <input
          id="header-search"
          v-model="headerQuery"
          type="search"
          class="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-slate-500"
          :placeholder="searchQuery || 'Tìm kiếm'"
        />
        <span
          class="grid size-8 shrink-0 place-items-center rounded-full bg-red-500 text-xs font-bold text-white"
        >
          A
        </span>
      </form>

      <button
        type="button"
        class="focus-ring grid size-11 shrink-0 place-items-center rounded-xl bg-red-50 text-red-500 xl:hidden"
        :aria-label="menuOpen ? 'Đóng menu' : 'Mở menu'"
        :aria-expanded="menuOpen"
        @click="appStore.toggleMenu"
      >
        <X v-if="menuOpen" :size="22" />
        <Menu v-else :size="22" />
      </button>
    </div>

    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="-translate-y-2 opacity-0"
      leave-active-class="transition duration-150"
      leave-to-class="-translate-y-2 opacity-0"
    >
      <div v-if="menuOpen" class="border-t border-black/5 bg-white px-5 py-5 xl:hidden">
        <form
          class="mb-4 flex h-12 items-center rounded-xl bg-red-50 px-4 lg:hidden"
          @submit.prevent="submitSearch"
        >
          <Search :size="17" class="text-red-500" />
          <input
            v-model="headerQuery"
            type="search"
            class="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
            placeholder="Tìm tên sách..."
          />
        </form>
        <nav class="grid gap-1" aria-label="Điều hướng mobile">
          <a
            v-for="item in navigation"
            :key="item.href"
            :href="item.href"
            class="focus-ring rounded-xl px-4 py-3 text-sm font-bold hover:bg-red-50 hover:text-red-500"
            @click="appStore.closeMenu"
          >
            {{ item.label }}
          </a>
        </nav>
      </div>
    </Transition>
  </header>
</template>
