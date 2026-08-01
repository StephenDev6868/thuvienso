<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import HomeBookcaseCanvas from '@/components/HomeBookcaseCanvas.vue'
import { threeDBookCabinets } from '@/data/threeDLibrary'
import { useAppStore } from '@/stores/app'
import type { Book } from '@/types/library'

const appStore = useAppStore()
const router = useRouter()
const activeGrade = ref<number | 'Tất cả'>('Tất cả')

const textbookCabinet =
  threeDBookCabinets.find((cabinet) => cabinet.id === 'sgk-tieu-hoc') ?? threeDBookCabinets[0]!

const visibleShelves = computed(() => {
  if (activeGrade.value === 'Tất cả') return textbookCabinet.shelves.slice(0, 3)

  const selected = textbookCabinet.shelves.filter((shelf) =>
    shelf.label.includes(String(activeGrade.value)),
  )

  if (selected.length === 0) return textbookCabinet.shelves.slice(0, 3)

  return [
    ...selected,
    ...textbookCabinet.shelves.filter((shelf) => !selected.includes(shelf)),
  ].slice(0, 3)
})

function openBook(book: Book) {
  appStore.openReader(book.id)
}

function showAll() {
  void router.push({ name: 'three-d-library' })
}
</script>

<template>
  <section id="home-3d-library" class="exact-library-section page-shell scroll-mt-22">
    <div class="exact-library-scroller">
      <HomeBookcaseCanvas
        :shelves="visibleShelves"
        :active-grade="activeGrade"
        @open-book="openBook"
        @set-grade="activeGrade = $event"
        @show-all="showAll"
      />
    </div>
  </section>
</template>

<style scoped>
.exact-library-section {
  padding-bottom: clamp(28px, 4vw, 56px);
}

.exact-library-scroller {
  overflow-x: auto;
  overflow-y: hidden;
  padding: 4px 0 12px;
  scrollbar-color: rgb(209 134 69 / 0.45) transparent;
  scrollbar-width: thin;
}

.exact-library-scroller > :deep(*) {
  min-width: 860px;
}

@media (max-width: 1023px) {
  .exact-library-scroller {
    overflow: visible;
    padding-bottom: 0;
  }

  .exact-library-scroller > :deep(*) {
    min-width: 0;
  }
}

@media (min-width: 1024px) {
  .exact-library-scroller {
    overflow: visible;
  }

  .exact-library-scroller > :deep(*) {
    min-width: 0;
  }
}
</style>
