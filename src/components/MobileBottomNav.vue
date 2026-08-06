<script setup lang="ts">
import { BookOpen, Heart, Home, LibraryBig, MapPinned } from '@lucide/vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

const items = [
  { label: 'Trang chủ', to: { name: 'home', hash: '#top' }, icon: Home, active: 'home' },
  { label: 'Sách nói', to: { name: 'audiobooks' }, icon: BookOpen, active: 'audiobooks' },
  {
    label: 'Tủ sách 3D',
    to: { name: 'three-d-library' },
    icon: LibraryBig,
    active: 'three-d-library',
  },
  {
    label: 'Bản đồ 3D',
    to: { name: 'vietnam-3d-map' },
    icon: MapPinned,
    active: 'vietnam-3d-map',
  },
  { label: 'Video', to: { name: 'video-lessons' }, icon: Heart, active: 'video-lessons' },
]
</script>

<template>
  <nav
    class="mobile-bottom-nav fixed inset-x-3 z-50 rounded-[26px] border border-red-100 bg-white/94 px-2 pt-2 shadow-[0_18px_50px_-22px_rgba(24,32,51,.45)] backdrop-blur-xl"
    aria-label="Điều hướng chính trên mobile và iPad"
  >
    <div class="grid grid-cols-5 items-end gap-1">
      <RouterLink
        v-for="item in items"
        :key="item.label"
        :to="item.to"
        class="focus-ring group grid min-h-14 place-items-center gap-1 rounded-2xl px-1 text-[10px] font-black transition"
        :class="
          route.name === item.active
            ? 'text-red-500'
            : item.active === 'three-d-library'
              ? 'text-red-500'
              : 'text-ink-950 hover:text-red-500'
        "
      >
        <span
          v-if="item.active === 'three-d-library'"
          class="-mt-8 grid size-15 place-items-center rounded-full border-[7px] border-white bg-red-500 text-white shadow-xl shadow-red-500/25 transition group-hover:-translate-y-0.5"
        >
          <component :is="item.icon" :size="23" />
        </span>
        <span
          v-else
          class="grid size-7 place-items-center rounded-xl transition group-hover:bg-red-50"
        >
          <component :is="item.icon" :size="20" />
        </span>
        <span class="whitespace-nowrap">{{ item.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.mobile-bottom-nav {
  bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
  display: none;
  padding-bottom: calc(0.5rem + env(safe-area-inset-bottom, 0px));
}

@media (max-width: 1279px), (hover: none) and (pointer: coarse) {
  .mobile-bottom-nav {
    display: block;
  }
}
</style>
