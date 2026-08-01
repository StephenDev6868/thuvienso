<script setup lang="ts">
import { SearchX, X } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

import BookCard from '@/components/BookCard.vue'
import SectionHeading from '@/components/SectionHeading.vue'
import {
  digitalLibraryCollection,
  digitalResourceCollection,
  searchDigitalBooks,
  teacherBookCollection,
} from '@/data/digitalLibrary'
import { bookFilters, books, collectionFilters, gradeFilters } from '@/data/library'
import { useAppStore } from '@/stores/app'
import type { Book } from '@/types/library'

const appStore = useAppStore()
const { activeBookFilter, activeCollectionFilter, activeGradeFilter, searchQuery } =
  storeToRefs(appStore)
const SEARCH_RESULT_LIMIT = 20

const totalPages = books.reduce((total, book) => total + (book.pageCount ?? 0), 0)

const filteredBooks = computed(() => {
  const candidates = searchQuery.value ? searchDigitalBooks(searchQuery.value) : books

  return candidates.filter((book) => {
    const matchesFilter =
      activeBookFilter.value === 'Tất cả' || book.subject === activeBookFilter.value
    const matchesGrade =
      activeGradeFilter.value === 'Tất cả' || book.grade === activeGradeFilter.value
    const matchesCollection =
      activeCollectionFilter.value === 'Tất cả' ||
      book.collectionTitle === activeCollectionFilter.value
    return matchesFilter && matchesGrade && matchesCollection
  })
})

const visibleBooks = computed(() => filteredBooks.value.slice(0, SEARCH_RESULT_LIMIT))

function selectBook(book: Book) {
  appStore.openReader(book.id)
}

</script>

<template>
  <section id="featured-books" class="page-shell section-space scroll-mt-20">
    <SectionHeading
      eyebrow="Kho sách số tiểu học"
      title="Một vài cuốn sách để bắt đầu"
      :description="`Trang chính giới thiệu tối đa ${SEARCH_RESULT_LIMIT} tài liệu phù hợp mỗi lần. Toàn bộ ${digitalLibraryCollection.bookCount + teacherBookCollection.bookCount + digitalResourceCollection.documentCount} tài liệu và ${totalPages.toLocaleString('vi-VN')} trang/slide được sắp gọn trong Tủ sách 3D.`"
    />

    <div v-if="searchQuery" class="mt-6 flex items-center gap-3">
      <p class="rounded-full bg-red-50 px-4 py-2 text-sm text-red-500">
        <strong>{{ visibleBooks.length }}/{{ filteredBooks.length }}</strong> kết quả cho:
        <strong>“{{ searchQuery }}”</strong>
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

    <div class="mt-7 flex gap-2 overflow-x-auto pb-2" aria-label="Lọc theo kho tài liệu">
      <button
        v-for="filter in collectionFilters"
        :key="filter"
        type="button"
        class="focus-ring shrink-0 rounded-xl px-5 py-3 text-xs font-bold transition"
        :class="
          activeCollectionFilter === filter
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/15'
            : 'bg-white text-slate-500 hover:text-red-500'
        "
        @click="activeCollectionFilter = filter"
      >
        {{ filter }}
      </button>
    </div>

    <div class="mt-3 flex gap-2 overflow-x-auto pb-2" aria-label="Lọc theo lớp">
      <button
        v-for="grade in gradeFilters"
        :key="grade"
        type="button"
        class="focus-ring shrink-0 rounded-xl px-5 py-3 text-xs font-bold transition"
        :class="
          activeGradeFilter === grade
            ? 'bg-ink-950 text-white shadow-lg shadow-ink-950/15'
            : 'bg-white text-slate-500 hover:text-ink-950'
        "
        @click="activeGradeFilter = grade"
      >
        {{ grade === 'Tất cả' ? 'Tất cả các lớp' : `Lớp ${grade}` }}
      </button>
    </div>

    <div class="mt-3 flex gap-2 overflow-x-auto pb-2" aria-label="Lọc theo chủ đề">
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
      class="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 lg:gap-7"
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
          Thử từ khóa khác hoặc xóa bộ lọc hiện tại.
        </p>
        <button
          type="button"
          class="focus-ring mt-5 rounded-xl bg-red-500 px-5 py-3 text-sm font-bold text-white"
          @click="appStore.searchBooks('')"
        >
          Xóa tìm kiếm
        </button>
      </div>
    </div>
  </section>

</template>
