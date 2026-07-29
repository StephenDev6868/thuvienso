<script setup lang="ts">
import { ArrowRight, LibraryBig, SearchX, Sparkles, X } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'

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
const router = useRouter()
const { activeBookFilter, activeCollectionFilter, activeGradeFilter, searchQuery } =
  storeToRefs(appStore)
const SEARCH_RESULT_LIMIT = 20
const isEnteringThreeDLibrary = ref(false)
let threeDNavigationTimer: ReturnType<typeof setTimeout> | undefined

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

function enterThreeDLibrary() {
  if (isEnteringThreeDLibrary.value) return

  isEnteringThreeDLibrary.value = true
  const prefersReducedMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  threeDNavigationTimer = globalThis.setTimeout(
    () =>
      router.push({
        name: 'three-d-library',
        query: searchQuery.value ? { q: searchQuery.value } : undefined,
      }),
    prefersReducedMotion ? 40 : 720,
  )
}

onBeforeUnmount(() => globalThis.clearTimeout(threeDNavigationTimer))
</script>

<template>
  <section id="featured-books" class="page-shell section-space scroll-mt-20">
    <SectionHeading
      eyebrow="Kho sách số tiểu học"
      title="Một vài cuốn sách để bắt đầu"
      :description="`Trang chính giới thiệu tối đa ${SEARCH_RESULT_LIMIT} tài liệu phù hợp mỗi lần. Toàn bộ ${digitalLibraryCollection.bookCount + teacherBookCollection.bookCount + digitalResourceCollection.documentCount} tài liệu và ${totalPages.toLocaleString('vi-VN')} trang/slide được sắp gọn trong Tủ sách 3D.`"
    />

    <div
      class="three-d-discovery relative mt-7 flex flex-col gap-6 overflow-hidden rounded-[28px] border border-red-100 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
    >
      <span
        class="discovery-glow pointer-events-none absolute -right-14 -top-24 size-64 rounded-full"
      />
      <span class="discovery-spark discovery-spark-one pointer-events-none" />
      <span class="discovery-spark discovery-spark-two pointer-events-none" />

      <div class="relative flex items-start gap-4 sm:gap-5">
        <span
          class="three-d-icon grid size-13 shrink-0 place-items-center rounded-2xl text-white sm:size-15"
        >
          <LibraryBig :size="26" />
        </span>
        <div>
          <p
            class="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-red-500"
          >
            <Sparkles :size="14" />
            Không gian đọc tương tác
          </p>
          <h3 class="mt-2 text-xl font-black tracking-[-0.025em] sm:text-2xl">
            Hãy cùng khám phá trải nghiệm Tủ sách 3D
          </h3>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {{
              searchQuery
                ? `Mang theo từ khóa “${searchQuery}” và tìm cuốn sách bạn yêu thích trên những kệ sách sống động.`
                : 'Dạo qua từng tủ sách, chạm vào nhữn cuốn sách đầy màu sắc và mở cuốn sách bạn yêu thích chỉ trong một bước.'
            }}
          </p>
          <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-red-500/80">
            <span>Chọn tủ</span>
            <span aria-hidden="true">•</span>
            <span>Chạm sách</span>
            <span aria-hidden="true">•</span>
            <span>Đọc ngay</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        class="focus-ring three-d-cta group relative inline-flex shrink-0 items-center justify-center gap-3 overflow-hidden rounded-2xl px-6 py-4 text-sm font-black text-white"
        @click="enterThreeDLibrary"
      >
        <span class="cta-shine pointer-events-none absolute inset-y-0 w-16" />
        <Sparkles :size="17" class="relative" />
        <span class="relative">Khám phá Tủ sách 3D</span>
        <ArrowRight :size="18" class="relative transition group-hover:translate-x-1.5" />
      </button>
    </div>

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

  <Teleport to="body">
    <Transition name="library-portal">
      <div
        v-if="isEnteringThreeDLibrary"
        class="library-portal fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[#101827] text-white"
        role="status"
        aria-live="polite"
      >
        <div class="portal-grid absolute inset-0" />
        <div class="portal-glow absolute size-[54vmin] rounded-full" />
        <div class="portal-door portal-door-left absolute inset-y-0 left-0 w-1/2" />
        <div class="portal-door portal-door-right absolute inset-y-0 right-0 w-1/2" />
        <div class="portal-message relative z-10 text-center">
          <span
            class="mx-auto grid size-16 place-items-center rounded-2xl bg-red-500 shadow-2xl shadow-red-500/30"
          >
            <LibraryBig :size="30" />
          </span>
          <strong class="mt-5 block text-2xl font-black">Đang mở Tủ sách 3D</strong>
          <span class="mt-2 block text-sm text-slate-300">
            {{
              searchQuery
                ? `Mang theo từ khóa “${searchQuery}”`
                : 'Sách được sắp theo từng tủ và từng kệ'
            }}
          </span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.three-d-discovery {
  background:
    radial-gradient(circle at 92% 10%, rgb(223 33 51 / 0.12), transparent 30%),
    linear-gradient(135deg, #fff 0%, #fff7f8 58%, #fff0f2 100%);
  box-shadow: 0 22px 55px -38px rgb(223 33 51 / 0.42);
}

.discovery-glow {
  background: rgb(223 33 51 / 0.1);
  filter: blur(28px);
}

.discovery-spark {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #df2133;
  box-shadow: 0 0 18px 4px rgb(223 33 51 / 0.28);
  animation: discovery-float 2.8s ease-in-out infinite;
}

.discovery-spark-one {
  top: 22%;
  right: 9%;
}

.discovery-spark-two {
  right: 24%;
  bottom: 18%;
  width: 4px;
  height: 4px;
  animation-delay: -1.1s;
}

.three-d-icon {
  background: linear-gradient(145deg, #f2384a, #bd1022);
  box-shadow:
    0 14px 28px -12px rgb(223 33 51 / 0.62),
    inset 0 1px rgb(255 255 255 / 0.28);
  animation: discovery-icon-pulse 2.6s ease-in-out infinite;
}

.three-d-cta {
  background: linear-gradient(135deg, #ef3346, #c91427);
  box-shadow:
    0 16px 34px -14px rgb(223 33 51 / 0.8),
    0 0 0 0 rgb(223 33 51 / 0.3);
  transition:
    transform 240ms ease,
    box-shadow 240ms ease;
  animation: discovery-cta-pulse 2.4s ease-out infinite;
}

.three-d-cta:hover {
  box-shadow:
    0 20px 38px -12px rgb(223 33 51 / 0.88),
    0 0 0 7px rgb(223 33 51 / 0.1);
  transform: translateY(-3px) scale(1.015);
}

.cta-shine {
  left: -35%;
  background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.38), transparent);
  transform: skewX(-18deg);
  animation: discovery-shine 2.8s ease-in-out infinite;
}

@keyframes discovery-float {
  0%,
  100% {
    opacity: 0.35;
    transform: translateY(0) scale(0.8);
  }
  50% {
    opacity: 1;
    transform: translateY(-12px) scale(1.15);
  }
}

@keyframes discovery-icon-pulse {
  0%,
  100% {
    transform: rotate(-2deg) scale(1);
  }
  50% {
    transform: rotate(2deg) scale(1.055);
  }
}

@keyframes discovery-cta-pulse {
  0%,
  100% {
    box-shadow:
      0 16px 34px -14px rgb(223 33 51 / 0.8),
      0 0 0 0 rgb(223 33 51 / 0.25);
  }
  55% {
    box-shadow:
      0 16px 34px -14px rgb(223 33 51 / 0.8),
      0 0 0 10px rgb(223 33 51 / 0);
  }
}

@keyframes discovery-shine {
  0%,
  34% {
    left: -35%;
  }
  64%,
  100% {
    left: 125%;
  }
}

.portal-grid {
  background-image:
    linear-gradient(rgb(255 255 255 / 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 0.045) 1px, transparent 1px);
  background-size: 32px 32px;
}

.library-portal {
  isolation: isolate;
}

.portal-grid {
  opacity: 0.25;
  transform: perspective(600px) rotateX(62deg) scale(1.7);
}

.portal-glow {
  background: radial-gradient(
    circle,
    rgb(255 201 74 / 0.4),
    rgb(223 33 51 / 0.16) 46%,
    transparent 72%
  );
  animation: portal-glow 720ms ease-out both;
}

.portal-door {
  z-index: 2;
  border-color: rgb(255 255 255 / 0.09);
  background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.08), transparent), #182033;
  animation-duration: 720ms;
  animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
  animation-fill-mode: both;
}

.portal-door-left {
  border-right-width: 1px;
  animation-name: open-left-door;
}

.portal-door-right {
  border-left-width: 1px;
  animation-name: open-right-door;
}

.portal-message {
  animation: portal-message 620ms 80ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.library-portal-enter-active {
  transition: opacity 180ms ease;
}

.library-portal-enter-from {
  opacity: 0;
}

@keyframes open-left-door {
  0%,
  18% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-94%);
  }
}

@keyframes open-right-door {
  0%,
  18% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(94%);
  }
}

@keyframes portal-message {
  from {
    opacity: 0;
    transform: scale(0.82) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes portal-glow {
  from {
    opacity: 0;
    transform: scale(0.6);
  }
  to {
    opacity: 1;
    transform: scale(1.2);
  }
}
</style>
