<script setup lang="ts">
import {
  Bell,
  BookOpen,
  GraduationCap,
  Headphones,
  Home,
  LockKeyhole,
  Menu,
  MessagesSquare,
  Search,
  UserRound,
  X,
} from '@lucide/vue'
import { storeToRefs } from 'pinia'
import type { Component } from 'vue'
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import logoUrl from '../../logo.jpg'
import { useAppStore } from '@/stores/app'

interface NavigationItem {
  label: string
  to: { name: string; hash?: string }
  icon: Component
  activeRoute?: string
}

const appStore = useAppStore()
const route = useRoute()
const router = useRouter()
const { menuOpen, searchQuery, smartLockOpen } = storeToRefs(appStore)
const headerQuery = ref('')

const navigation: NavigationItem[] = [
  { label: 'Trang chủ', to: { name: 'home', hash: '#top' }, icon: Home, activeRoute: 'home' },
  { label: 'Kho sách', to: { name: 'home', hash: '#featured-books' }, icon: BookOpen },
  {
    label: 'Tủ sách 3D',
    to: { name: 'three-d-library' },
    icon: GraduationCap,
    activeRoute: 'three-d-library',
  },
  { label: 'Sách nói', to: { name: 'audiobooks' }, icon: Headphones, activeRoute: 'audiobooks' },
  {
    label: 'Video Bài giảng',
    to: { name: 'video-lessons' },
    icon: GraduationCap,
    activeRoute: 'video-lessons',
  },
]

function submitSearch() {
  appStore.searchBooks(headerQuery.value)
  void router.push({ name: 'home', hash: '#featured-books' })
}
</script>

<template>
  <header class="sticky top-0 z-40 px-3 py-3 backdrop-blur md:px-5">
    <div
      class="mx-auto flex h-18 max-w-[1480px] items-center justify-between gap-3 rounded-[26px] bg-white/94 px-3 shadow-[0_18px_55px_-34px_rgba(24,32,51,.55)] md:h-20 md:px-5"
    >
      <RouterLink
        to="/"
        class="focus-ring flex shrink-0 items-center gap-3 rounded-xl"
        aria-label="Trang chủ Thư viện số"
      >
        <span
          class="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-red-100 bg-white shadow-sm md:size-14"
        >
          <img
            :src="logoUrl"
            alt="Logo Trường Tiểu học Bùi Thị Xuân"
            class="h-full w-full object-contain"
          />
        </span>
        <span class="leading-none">
          <strong class="block text-[15px] tracking-[-0.02em] text-ink-950 md:text-[18px]">
            THƯ VIỆN SỐ
          </strong>
          <small
            class="mt-1.5 block text-[8px] font-extrabold tracking-[0.06em] text-red-500 md:text-[10px]"
          >
            TRƯỜNG TIỂU HỌC BÙI THỊ XUÂN
          </small>
        </span>
      </RouterLink>

      <nav class="hidden items-center gap-1 xl:flex" aria-label="Điều hướng chính">
        <RouterLink
          v-for="item in navigation"
          :key="item.label"
          :to="item.to"
          class="focus-ring grid min-w-15 place-items-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-black transition hover:bg-red-50 hover:text-red-500 2xl:min-w-21 2xl:px-3 2xl:text-[11px]"
          :class="
            route.name === item.activeRoute ? 'bg-red-50 text-red-500 shadow-sm' : 'text-ink-950'
          "
        >
          <component :is="item.icon" :size="22" />
          {{ item.label }}
        </RouterLink>
      </nav>

      <form
        class="hidden h-12 min-w-44 max-w-76 flex-1 items-center rounded-full bg-[#fff1f1] px-3 xl:flex 2xl:min-w-58 2xl:max-w-82 2xl:px-4"
        role="search"
        @submit.prevent="submitSearch"
      >
        <Search :size="18" class="shrink-0 text-slate-500" />
        <label for="header-search" class="sr-only">Tìm kiếm sách</label>
        <input
          id="header-search"
          v-model="headerQuery"
          type="search"
          class="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-slate-500"
          :placeholder="searchQuery || 'Tìm kiếm sách, chủ đề...'"
        />
        <button
          type="submit"
          class="focus-ring grid size-9 shrink-0 place-items-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/20"
          aria-label="Tìm kiếm"
        >
          <Search :size="16" />
        </button>
      </form>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="focus-ring hidden h-11 shrink-0 items-center gap-2 rounded-full bg-red-500 px-3 text-xs font-black text-white shadow-lg shadow-red-500/20 transition hover:-translate-y-0.5 md:inline-flex 2xl:px-4"
          :aria-pressed="smartLockOpen"
          aria-label="Hiển thị màn hình khóa"
          @click="appStore.openSmartLock"
        >
          <LockKeyhole :size="16" />
          <span class="hidden 2xl:inline">Màn hình khóa</span>
        </button>

        <button
          type="button"
          class="focus-ring hidden h-11 shrink-0 items-center gap-2 rounded-full bg-[#3f8fe5] px-3 text-xs font-black text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 md:inline-flex 2xl:px-4"
          aria-label="Liên hệ với nhà trường"
          @click="appStore.openUtilityModal('contact')"
        >
          <MessagesSquare :size="16" />
          <span class="hidden 2xl:inline">Liên hệ</span>
        </button>

        <button
          type="button"
          class="focus-ring grid size-10 place-items-center rounded-full bg-red-50 text-ink-950 md:hidden"
          aria-label="Thông báo"
        >
          <Bell :size="20" />
        </button>

        <span
          class="hidden size-11 place-items-center rounded-full bg-[#fff2e8] text-ink-950 md:grid"
        >
          <UserRound :size="21" />
        </span>

        <button
          type="button"
          class="focus-ring grid size-10 shrink-0 place-items-center rounded-xl bg-red-50 text-red-500 xl:hidden"
          :aria-label="menuOpen ? 'Đóng menu' : 'Mở menu'"
          :aria-expanded="menuOpen"
          @click="appStore.toggleMenu"
        >
          <X v-if="menuOpen" :size="22" />
          <Menu v-else :size="22" />
        </button>
      </div>
    </div>

    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="-translate-y-2 opacity-0"
      leave-active-class="transition duration-150"
      leave-to-class="-translate-y-2 opacity-0"
    >
      <div
        v-if="menuOpen"
        class="mx-3 mt-3 rounded-[24px] border border-red-100 bg-white p-4 shadow-card xl:hidden"
      >
        <form
          class="mb-4 flex h-12 items-center rounded-xl bg-red-50 px-4"
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
        <nav class="grid grid-cols-2 gap-2" aria-label="Điều hướng mobile">
          <RouterLink
            v-for="item in navigation"
            :key="item.label"
            :to="item.to"
            class="focus-ring flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold hover:bg-red-50 hover:text-red-500"
            :class="{ 'bg-red-50 text-red-500': route.name === item.activeRoute }"
            @click="appStore.closeMenu"
          >
            <component :is="item.icon" :size="18" />
            {{ item.label }}
          </RouterLink>
        </nav>
      </div>
    </Transition>
  </header>
</template>
