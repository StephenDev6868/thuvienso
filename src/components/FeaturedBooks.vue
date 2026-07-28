<script setup lang="ts">
import { SearchX, X } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

import BookCard from '@/components/BookCard.vue'
import SectionHeading from '@/components/SectionHeading.vue'
import { bookFilters, books } from '@/data/library'
import { useAppStore } from '@/stores/app'
import type { Book } from '@/types/library'

const appStore = useAppStore()
const { activeBookFilter, searchQuery } = storeToRefs(appStore)

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('vi')
}

const visibleBooks = computed(() => {
  const query = normalize(searchQuery.value)
  return books.filter((book) => {
    const matchesFilter =
      activeBookFilter.value === 'Đề xuất' || book.filters.includes(activeBookFilter.value)
    const haystack = normalize(`${book.title} ${book.subtitle} ${book.category}`)
    const matchesQuery = !query || haystack.includes(query)
    return matchesFilter && matchesQuery
  })
})

function selectBook(book: Book) {
  appStore.openChat()
  appStore.searchBooks(book.title)
}
</script>

<template>
  <section id="featured-books" class="page-shell section-space scroll-mt-20">
    <SectionHeading
      eyebrow="Được yêu thích"
      title="Sách nổi bật tuần này"
      description="Những cuốn sách đang được học sinh tìm đọc nhiều nhất."
    />

    <div v-if="searchQuery" class="mt-6 flex items-center gap-3">
      <p class="rounded-full bg-red-50 px-4 py-2 text-sm text-red-500">
        Kết quả cho: <strong>“{{ searchQuery }}”</strong>
      </p>
      <button
        type="button"
        class="focus-ring grid size-9 place-items-center rounded-full bg-white text-slate-500 shadow-sm"
        aria-label="Xóa tìm kiếm"
        @click="appStore.searchBooks('')"
      >
        <X :size="16" />
      </button>
    </div>

    <div class="mt-7 flex gap-2 overflow-x-auto pb-2">
      <button
        v-for="filter in bookFilters"
        :key="filter"
        type="button"
        class="focus-ring shrink-0 rounded-xl px-5 py-3 text-xs font-bold transition"
        :class="
          activeBookFilter === filter
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/15'
            : 'bg-white text-slate-500 hover:text-red-500'
        "
        @click="activeBookFilter = filter"
      >
        {{ filter }}
      </button>
    </div>

    <div
      v-if="visibleBooks.length"
      class="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 lg:gap-7"
    >
      <BookCard v-for="book in visibleBooks" :key="book.id" :book="book" @select="selectBook" />
    </div>
    <div
      v-else
      class="mt-8 grid min-h-70 place-items-center rounded-[24px] bg-white p-8 text-center"
    >
      <div>
        <SearchX :size="42" class="mx-auto text-red-300" />
        <h3 class="mt-4 text-xl font-black">Chưa tìm thấy sách phù hợp</h3>
        <p class="mt-2 text-sm text-slate-500">
          Thử từ khóa khác hoặc hỏi trợ lý AI để nhận gợi ý.
        </p>
        <button
          type="button"
          class="focus-ring mt-5 rounded-xl bg-red-500 px-5 py-3 text-sm font-bold text-white"
          @click="appStore.openChat"
        >
          Hỏi trợ lý AI
        </button>
      </div>
    </div>
  </section>
</template>
