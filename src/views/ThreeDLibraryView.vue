<script setup lang="ts">
import {
  Apple,
  ArrowLeft,
  ArrowRight,
  Bot,
  ChevronLeft,
  ChevronRight,
  Coffee,
  FlaskConical,
  Globe2,
  Heart,
  LampDesk,
  LibraryBig,
  Palette,
  PencilRuler,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
} from '@lucide/vue'
import type { Component } from 'vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import {
  fitShelvesToCapacity,
  threeDBookCabinets,
  threeDLibraryBookCount,
  type CabinetDecoration,
} from '@/data/threeDLibrary'
import { searchDigitalBooks } from '@/data/digitalLibrary'
import { useAppStore } from '@/stores/app'
import type { Book } from '@/types/library'

const appStore = useAppStore()
const route = useRoute()
const activeCabinetIndex = ref(0)
const shelfQuery = ref('')
const tiltX = ref(-1.5)
const tiltY = ref(0)
const hoveredBook = ref<Book | null>(null)
const openingBook = ref<Book | null>(null)
const cabinetStageElement = ref<HTMLElement | null>(null)
const viewportWidth = ref(1440)
const tabletShelfRowWidth = ref(748)
const tabletShelfCapacity = ref(18)
const hoverPreviewPosition = ref({
  left: 0,
  top: 0,
  width: 210,
  coverWidth: 0,
  coverHeight: 0,
  placement: 'left' as 'left' | 'right' | 'compact',
})
let openBookTimer: ReturnType<typeof setTimeout> | undefined
let responsiveLayoutFrame: number | undefined
let responsiveLayoutObserver: ResizeObserver | undefined

const spinePalette = [
  '#7657e8',
  '#df3043',
  '#27a779',
  '#ff7045',
  '#df478c',
  '#3974dc',
  '#c48721',
  '#159b84',
]

const activeCabinet = computed(() => threeDBookCabinets[activeCabinetIndex.value]!)
const isTeacherCabinet = computed(() => activeCabinet.value.decoration === 'teacher')
const incomingSearchQuery = computed(() => {
  const query = route.query.q
  return (Array.isArray(query) ? query[0] : query)?.trim() ?? ''
})

const decorationIcons: Record<CabinetDecoration, Component[]> = {
  'early-learning': [Palette, Bot, Trophy, PencilRuler],
  exploration: [Globe2, FlaskConical, Bot, Trophy],
  'life-skills': [Heart, ShieldCheck, Globe2, PencilRuler],
  teacher: [LampDesk, Coffee, PencilRuler, Apple],
}

const activeDecorationIcons = computed(() => decorationIcons[activeCabinet.value.decoration])

const visibleShelves = computed(() => {
  if (!shelfQuery.value.trim()) return activeCabinet.value.shelves
  const matchingBookIds = new Set(searchDigitalBooks(shelfQuery.value).map((book) => book.id))

  return activeCabinet.value.shelves
    .map((shelf) => ({
      ...shelf,
      books: shelf.books.filter((book) => matchingBookIds.has(book.id)),
    }))
    .filter((shelf) => shelf.books.length)
})

const visibleBookCount = computed(() =>
  visibleShelves.value.reduce((total, shelf) => total + shelf.books.length, 0),
)

const isTabletLayout = computed(() => viewportWidth.value >= 768 && viewportWidth.value <= 1100)

const displayShelves = computed(() =>
  isTabletLayout.value
    ? fitShelvesToCapacity(visibleShelves.value, tabletShelfCapacity.value)
    : visibleShelves.value,
)

const cabinetStyle = computed(
  () =>
    ({
      '--cabinet-frame': activeCabinet.value.frameColor,
      '--cabinet-frame-dark': activeCabinet.value.frameDarkColor,
      '--cabinet-inner': activeCabinet.value.innerColor,
      '--cabinet-glow': activeCabinet.value.glowColor,
      '--cabinet-accent': activeCabinet.value.accentColor,
      '--cabinet-tilt-x': `${tiltX.value}deg`,
      '--cabinet-tilt-y': `${tiltY.value}deg`,
    }) as Record<string, string>,
)

function selectCabinet(index: number) {
  activeCabinetIndex.value = index
  shelfQuery.value = ''
  hoveredBook.value = null
  resetTilt()
  nextTick(scheduleResponsiveShelfLayout)
}

function continueIncomingSearch() {
  const query = incomingSearchQuery.value
  if (!query) return

  const matchingBookIds = new Set(searchDigitalBooks(query).map((book) => book.id))
  const bestCabinetIndex = threeDBookCabinets.reduce((bestIndex, cabinet, index, cabinets) => {
    const matchCount = cabinet.books.filter((book) => matchingBookIds.has(book.id)).length
    const bestMatchCount = cabinets[bestIndex]!.books.filter((book) =>
      matchingBookIds.has(book.id),
    ).length
    return matchCount > bestMatchCount ? index : bestIndex
  }, 0)

  activeCabinetIndex.value = bestCabinetIndex
  shelfQuery.value = query
}

function previousCabinet() {
  selectCabinet(
    (activeCabinetIndex.value - 1 + threeDBookCabinets.length) % threeDBookCabinets.length,
  )
}

function nextCabinet() {
  selectCabinet((activeCabinetIndex.value + 1) % threeDBookCabinets.length)
}

function handlePointerMove(event: PointerEvent) {
  if (event.pointerType === 'touch') return
  const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect()
  tiltY.value = ((event.clientX - bounds.left) / bounds.width - 0.5) * 4.5
  tiltX.value = -1.5 - ((event.clientY - bounds.top) / bounds.height - 0.5) * 1.8
}

function resetTilt() {
  tiltX.value = -1.5
  tiltY.value = 0
}

function openBook(book: Book) {
  if (openingBook.value) return

  // Opening the original file must happen during the tap event on mobile. Waiting
  // for the shelf animation can make the browser block or cancel the navigation.
  if (appStore.shouldOpenBookExternally(book.id)) {
    appStore.openReader(book.id)
    return
  }

  hoveredBook.value = null
  openingBook.value = book
  const prefersReducedMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  openBookTimer = globalThis.setTimeout(
    () => {
      appStore.openReader(book.id)
      openingBook.value = null
    },
    prefersReducedMotion ? 80 : 680,
  )
}

function hashBook(book: Book) {
  return Array.from(book.id).reduce((total, character) => total + character.charCodeAt(0), 0)
}

function hashText(value: string) {
  return Array.from(value).reduce((total, character) => total + character.charCodeAt(0), 0)
}

function bookStyle(book: Book, index: number, shelfBookCount: number, shelfId: string) {
  const hash = hashBook(book)
  const desktopWidth = Math.min(
    64,
    Math.max(36, Math.floor((748 - (shelfBookCount - 1) * 4) / shelfBookCount)),
  )
  const mobileWidth = Math.min(
    27,
    Math.max(13, Math.floor((284 - (shelfBookCount - 1) * 2) / shelfBookCount)),
  )
  const tabletTargetWidth = Math.min(748, tabletShelfRowWidth.value)
  const tabletWidth = Math.min(
    82,
    Math.max(44, Math.floor((tabletTargetWidth - (shelfBookCount - 1) * 4) / shelfBookCount)),
  )
  const desktopHeight = 112 + (hash % 38)
  const mobileHeight = 82 + (hash % 26)
  const paletteIndex = (hashText(shelfId) + index * 3) % spinePalette.length

  return {
    '--book-color': spinePalette[paletteIndex],
    '--book-height': `${desktopHeight}px`,
    '--book-width': `${desktopWidth}px`,
    '--cover-width': `${Math.round(desktopHeight * 0.72)}px`,
    '--book-font-size': `${Math.min(12, Math.max(8, desktopWidth * 0.19))}px`,
    '--book-height-tablet': `${desktopHeight}px`,
    '--book-width-tablet': `${tabletWidth}px`,
    '--cover-width-tablet': `${Math.round(desktopHeight * 0.72)}px`,
    '--book-font-size-tablet': `${Math.min(12, Math.max(8, tabletWidth * 0.19))}px`,
    '--book-height-mobile': `${mobileHeight}px`,
    '--book-width-mobile': `${mobileWidth}px`,
    '--cover-width-mobile': `${Math.round(mobileHeight * 0.72)}px`,
    '--book-font-size-mobile': `${Math.min(7, Math.max(5, mobileWidth * 0.34))}px`,
    '--book-lean': `${index % 7 === 5 ? -4 : index % 9 === 7 ? 4 : 0}deg`,
    '--book-delay': `${(index % 10) * 22}ms`,
  } as Record<string, string>
}

function updateResponsiveShelfLayout() {
  viewportWidth.value = globalThis.innerWidth || 1440
  if (!isTabletLayout.value) {
    tabletShelfRowWidth.value = 748
    tabletShelfCapacity.value = 18
    return
  }

  const shelf = cabinetStageElement.value?.querySelector<HTMLElement>('.cabinet-shelf')
  if (!shelf) return

  const shelfStyle = globalThis.getComputedStyle(shelf)
  const availableWidth = Math.floor(
    shelf.clientWidth -
      Number.parseFloat(shelfStyle.paddingLeft) -
      Number.parseFloat(shelfStyle.paddingRight),
  )
  const safeAvailableWidth = Math.max(320, availableWidth)
  const comfortableBookWidth = 50
  const measuredCapacity =
    safeAvailableWidth >= 744
      ? 18
      : Math.floor((safeAvailableWidth + 4) / (comfortableBookWidth + 4))

  tabletShelfRowWidth.value = safeAvailableWidth
  tabletShelfCapacity.value = Math.max(6, Math.min(18, measuredCapacity))
}

function scheduleResponsiveShelfLayout() {
  globalThis.cancelAnimationFrame(responsiveLayoutFrame ?? 0)
  responsiveLayoutFrame = globalThis.requestAnimationFrame(updateResponsiveShelfLayout)
}

function showBookPreview(book: Book, event: Event) {
  if (openingBook.value) return
  if (event.type === 'pointerenter' && (event as PointerEvent).pointerType === 'touch') return

  const target = event.currentTarget as HTMLElement
  const bounds = target.getBoundingClientRect()
  const bookcaseBounds = target.closest<HTMLElement>('.bookcase')?.getBoundingClientRect() ?? bounds
  const viewportWidth = globalThis.innerWidth
  const viewportHeight = globalThis.innerHeight
  const viewportPadding = 12
  const cabinetGap = 16
  const previewScale = 1.5
  const coverHeight = Math.round(target.offsetHeight * previewScale)
  const coverWidth = Math.round(target.offsetHeight * 0.72 * previewScale)
  const width = Math.max(190, coverWidth + 28)
  const estimatedHeight = coverHeight + 118
  const leftSpace = bookcaseBounds.left - cabinetGap - viewportPadding
  const rightSpace = viewportWidth - bookcaseBounds.right - cabinetGap - viewportPadding
  const bookIsOnLeft =
    bounds.left + bounds.width / 2 < bookcaseBounds.left + bookcaseBounds.width / 2
  const preferredPlacement = bookIsOnLeft ? 'left' : 'right'
  const canFitLeft = leftSpace >= width
  const canFitRight = rightSpace >= width

  let placement: 'left' | 'right' | 'compact'
  if (preferredPlacement === 'left' && canFitLeft) placement = 'left'
  else if (preferredPlacement === 'right' && canFitRight) placement = 'right'
  else if (canFitRight) placement = 'right'
  else if (canFitLeft) placement = 'left'
  else placement = 'compact'

  const compactWidth = Math.min(270, viewportWidth - viewportPadding * 2)
  const renderedWidth = placement === 'compact' ? compactWidth : width
  const renderedHeight = placement === 'compact' ? 102 : estimatedHeight
  const centeredTop = bounds.top + bounds.height / 2 - renderedHeight / 2
  const compactSpaceAbove = bookcaseBounds.top - cabinetGap - viewportPadding
  const compactSpaceBelow = viewportHeight - bookcaseBounds.bottom - cabinetGap - viewportPadding
  const compactFitsBelow = placement === 'compact' && compactSpaceBelow >= renderedHeight
  const compactFitsAbove = placement === 'compact' && compactSpaceAbove >= renderedHeight
  const compactIsOutsideCabinet = compactFitsBelow || compactFitsAbove
  const top = compactFitsBelow
    ? bookcaseBounds.bottom + cabinetGap
    : compactFitsAbove
      ? bookcaseBounds.top - cabinetGap - renderedHeight
      : placement === 'compact' && bounds.top + bounds.height / 2 < viewportHeight / 2
        ? viewportHeight - renderedHeight - viewportPadding
        : Math.min(
            viewportHeight - renderedHeight - viewportPadding,
            Math.max(viewportPadding, centeredTop),
          )
  const left =
    placement === 'left'
      ? bookcaseBounds.left - cabinetGap - renderedWidth
      : placement === 'right'
        ? bookcaseBounds.right + cabinetGap
        : compactIsOutsideCabinet
          ? Math.min(
              viewportWidth - renderedWidth - viewportPadding,
              Math.max(
                viewportPadding,
                bookcaseBounds.left + bookcaseBounds.width / 2 - renderedWidth / 2,
              ),
            )
          : Math.min(
              viewportWidth - renderedWidth - viewportPadding,
              Math.max(viewportPadding, bounds.left + bounds.width / 2 - renderedWidth / 2),
            )

  hoveredBook.value = book
  hoverPreviewPosition.value = {
    left,
    top,
    width: renderedWidth,
    coverWidth,
    coverHeight,
    placement,
  }
}

function hideBookPreview(book: Book) {
  if (hoveredBook.value?.id === book.id) hoveredBook.value = null
}

function formatBookType(book: Book) {
  if (book.format === 'link') return 'Sách trực tuyến NXBGD'
  return `${book.format.toUpperCase()} • ${book.subject}`
}

function spineLabel(book: Book) {
  return book.subject
    .replace('Kế hoạch bài dạy - ', 'KHBD ')
    .replace('Giáo dục thể chất', 'GDTC')
    .replace('Hoạt động trải nghiệm', 'HĐTN')
    .replace('Lịch sử và Địa lí', 'LS & ĐL')
    .replace('Tự nhiên và Xã hội', 'TN & XH')
}

onMounted(async () => {
  continueIncomingSearch()
  viewportWidth.value = globalThis.innerWidth || 1440
  await nextTick()
  updateResponsiveShelfLayout()

  responsiveLayoutObserver = new ResizeObserver(scheduleResponsiveShelfLayout)
  if (cabinetStageElement.value) responsiveLayoutObserver.observe(cabinetStageElement.value)
  globalThis.addEventListener('resize', scheduleResponsiveShelfLayout, { passive: true })
})

onBeforeUnmount(() => {
  globalThis.clearTimeout(openBookTimer)
  globalThis.cancelAnimationFrame(responsiveLayoutFrame ?? 0)
  responsiveLayoutObserver?.disconnect()
  globalThis.removeEventListener('resize', scheduleResponsiveShelfLayout)
})
</script>

<template>
  <main class="three-d-library min-h-screen overflow-hidden text-ink-950">
    <section class="relative isolate overflow-hidden pb-5 pt-4 sm:pb-7 sm:pt-6">
      <div class="library-grid pointer-events-none absolute inset-0 opacity-30" />

      <div class="page-shell relative">
        <RouterLink
          to="/"
          class="focus-ring inline-flex items-center gap-2 rounded-full border border-red-100 bg-white px-4 py-2 text-xs font-bold text-ink-950 shadow-sm transition hover:text-red-500 md:hidden"
        >
          <ArrowLeft :size="15" />
          Tủ sách 3D
        </RouterLink>

        <div class="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div class="hidden md:block">
            <p
              class="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-red-500"
            >
              <Sparkles :size="16" />
              Không gian đọc tương tác
            </p>
            <p
              v-if="incomingSearchQuery"
              class="search-arrival mt-4 inline-flex items-center gap-2 rounded-full border border-red-100 bg-white px-4 py-2 text-xs font-bold text-slate-500 shadow-sm"
            >
              <Search :size="14" class="text-red-500" />
              Tiếp tục tìm “{{ incomingSearchQuery }}”
            </p>
            <h1
              class="mt-3 text-4xl font-black leading-none text-[#7a431b] sm:text-5xl lg:text-6xl"
            >
              Tủ sách <span class="three-d-title">3D</span>
            </h1>
            <p class="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              {{ threeDLibraryBookCount }} tài liệu đã được sắp vào từng tủ, từng kệ theo lớp học và
              mục đích sử dụng. Chọn một tủ, chạm vào gáy sách và bắt đầu đọc ngay.
            </p>
          </div>

          <div class="hidden grid-cols-3 gap-2 sm:gap-3 md:grid">
            <div class="hero-stat">
              <strong>{{ threeDBookCabinets.length }}</strong>
              <span>Tủ sách</span>
            </div>
            <div class="hero-stat">
              <strong>{{ threeDLibraryBookCount }}</strong>
              <span>Tài liệu</span>
            </div>
            <div class="hero-stat">
              <strong>4+</strong>
              <span>Định dạng</span>
            </div>
          </div>
        </div>

        <div class="mt-4 flex gap-2 overflow-x-auto pb-2 md:mt-7 md:gap-3" role="tablist" aria-label="Chọn tủ sách">
          <button
            v-for="(cabinet, index) in threeDBookCabinets"
            :key="cabinet.id"
            type="button"
            role="tab"
            :aria-selected="activeCabinetIndex === index"
            class="focus-ring cabinet-tab group min-w-28 shrink-0 rounded-full border px-4 py-2 text-left transition duration-300 sm:min-w-44 sm:rounded-2xl sm:p-3"
            :class="
              activeCabinetIndex === index
                ? 'border-red-200 bg-red-500 text-white shadow-lg shadow-red-500/18'
                : 'border-red-100 bg-white text-ink-950 hover:-translate-y-0.5 hover:text-red-500'
            "
            @click="selectCabinet(index)"
          >
            <span class="flex items-center gap-3">
              <span
                class="grid size-9 shrink-0 place-items-center rounded-xl text-xs font-black text-white shadow-lg"
                :style="{ backgroundColor: cabinet.frameColor }"
              >
                {{ index + 1 }}
              </span>
              <span class="min-w-0">
                <strong class="block truncate text-xs">{{ cabinet.shortTitle }}</strong>
                <small
                  class="mt-1 block text-[10px]"
                  :class="activeCabinetIndex === index ? 'text-white/75' : 'text-slate-500'"
                >
                  {{ cabinet.books.length }} tài liệu
                </small>
              </span>
            </span>
          </button>
        </div>
      </div>
    </section>

    <section class="page-shell relative pb-28 md:pb-24">
      <div
        class="stage-toolbar relative z-20 mb-4 flex flex-col gap-3 rounded-[18px] border border-red-100 bg-white/88 p-3 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between md:rounded-[22px] md:p-4"
      >
        <div class="min-w-0">
          <p class="text-[10px] font-black uppercase tracking-[0.12em] text-red-500">
            Đang khám phá
          </p>
          <h2 class="mt-1 truncate text-lg font-black sm:text-2xl">
            {{ activeCabinet.title }}
          </h2>
        </div>

        <div class="flex items-center gap-2">
          <label class="relative min-w-0 flex-1 sm:w-70">
            <span class="sr-only">Tìm trong tủ sách hiện tại</span>
            <Search
              :size="16"
              class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              v-model="shelfQuery"
              type="search"
              class="focus-ring h-11 w-full rounded-xl border border-red-100 bg-white pl-10 pr-4 text-sm text-ink-950 outline-none placeholder:text-slate-400"
              placeholder="Tìm trong tủ này..."
            />
          </label>
          <button
            type="button"
            class="focus-ring grid size-11 shrink-0 place-items-center rounded-xl border border-red-100 bg-white text-ink-950 transition hover:text-red-500"
            aria-label="Tủ sách trước"
            @click="previousCabinet"
          >
            <ChevronLeft :size="20" />
          </button>
          <button
            type="button"
            class="focus-ring grid size-11 shrink-0 place-items-center rounded-xl border border-red-100 bg-white text-ink-950 transition hover:text-red-500"
            aria-label="Tủ sách tiếp theo"
            @click="nextCabinet"
          >
            <ChevronRight :size="20" />
          </button>
        </div>
      </div>

      <div
        ref="cabinetStageElement"
        class="cabinet-stage relative"
        :style="cabinetStyle"
        @pointermove="handlePointerMove"
        @pointerleave="resetTilt"
      >
        <div
          class="pointer-events-none absolute left-1/2 top-[45%] h-[70%] w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-3xl"
          :style="{ backgroundColor: activeCabinet.glowColor }"
        />

        <button
          type="button"
          class="focus-ring stage-arrow left-1 sm:left-3"
          aria-label="Tủ sách trước"
          @click="previousCabinet"
        >
          <ChevronLeft :size="24" />
        </button>
        <button
          type="button"
          class="focus-ring stage-arrow right-1 sm:right-3"
          aria-label="Tủ sách tiếp theo"
          @click="nextCabinet"
        >
          <ChevronRight :size="24" />
        </button>

        <Transition name="opening-status">
          <div v-if="openingBook" class="opening-status" role="status">
            <img :src="openingBook.coverUrl" alt="" />
            <span>
              <small>Đang mở sách</small>
              <strong>{{ openingBook.title }}</strong>
            </span>
            <Sparkles :size="18" />
          </div>
        </Transition>

        <Transition name="cabinet-swap" mode="out-in">
          <article
            :key="activeCabinet.id"
            class="bookcase relative mx-auto"
            :aria-label="activeCabinet.title"
          >
            <div class="bookcase-crown">
              <div class="crown-shine" />
              <div class="cabinet-sign">
                <small>Trường tiểu học Bùi Thị Xuân</small>
                <strong>{{ activeCabinet.title }}</strong>
                <span>{{ activeCabinet.eyebrow }}</span>
              </div>

              <div class="top-decor left-decor" aria-hidden="true">
                <component :is="activeDecorationIcons[0]" :size="30" />
              </div>
              <div class="top-decor right-decor" aria-hidden="true">
                <component :is="activeDecorationIcons[1]" :size="30" />
              </div>
            </div>

            <div class="bookcase-body">
              <template v-if="displayShelves.length">
                <div
                  v-for="(shelf, shelfIndex) in displayShelves"
                  :key="shelf.id"
                  class="cabinet-shelf"
                >
                  <span class="shelf-label">{{ shelf.label }}</span>
                  <div class="book-row">
                    <button
                      v-for="(book, bookIndex) in shelf.books"
                      :key="book.id"
                      type="button"
                      class="focus-ring shelf-book"
                      :class="{ 'is-opening': openingBook?.id === book.id }"
                      :style="bookStyle(book, bookIndex, shelf.books.length, shelf.id)"
                      :aria-label="`Mở ${book.title}`"
                      @pointerenter="showBookPreview(book, $event)"
                      @pointerleave="hideBookPreview(book)"
                      @focus="showBookPreview(book, $event)"
                      @blur="hideBookPreview(book)"
                      @click="openBook(book)"
                    >
                      <span class="book-spine-face">
                        <span class="book-page-edge" />
                        <span class="book-spine-text">{{ spineLabel(book) }}</span>
                      </span>
                      <span class="book-cover-face" aria-hidden="true">
                        <img :src="book.coverUrl" alt="" />
                        <span class="cover-shine" />
                      </span>
                    </button>
                  </div>

                  <div
                    v-if="!shelfQuery && shelfIndex % 2 === 0"
                    class="shelf-decoration"
                    :class="{ 'teacher-decoration': isTeacherCabinet }"
                    aria-hidden="true"
                  >
                    <component
                      :is="activeDecorationIcons[(shelfIndex + 2) % activeDecorationIcons.length]"
                      :size="shelfIndex === 0 ? 34 : 29"
                    />
                    <span v-if="isTeacherCabinet" class="teacher-pencil" />
                    <span v-else class="student-star">★</span>
                  </div>
                </div>
              </template>

              <div v-else class="empty-shelf-state">
                <LibraryBig :size="42" />
                <strong>Chưa tìm thấy sách trong tủ này</strong>
                <span>Thử tên môn hoặc một từ khóa khác.</span>
              </div>
            </div>

            <div class="bookcase-base">
              <span>{{ visibleBookCount }}/{{ activeCabinet.books.length }} tài liệu trên kệ</span>
              <span>Chạm vào gáy sách để mở</span>
            </div>
          </article>
        </Transition>
      </div>

      <div class="mt-8 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div
          class="rounded-[20px] border border-red-100 bg-white/88 p-6 shadow-sm backdrop-blur-xl sm:p-7"
        >
          <p class="text-xs font-black uppercase tracking-[0.12em] text-red-500">Cách sắp xếp</p>
          <p class="mt-3 text-sm leading-7 text-slate-600">
            {{ activeCabinet.description }} Sách cùng môn và cùng tập được đặt gần nhau; tài liệu
            giáo viên ưu tiên theo nghiệp vụ, còn sách giáo viên được xếp liền mạch theo thứ tự lớp.
          </p>
        </div>
        <div
          class="flex items-center gap-4 rounded-[20px] border border-red-100 bg-white/88 p-6 shadow-sm backdrop-blur-xl sm:p-7"
        >
          <span
            class="grid size-13 shrink-0 place-items-center rounded-2xl bg-red-500 text-white shadow-lg shadow-red-500/20"
          >
            <LibraryBig :size="24" />
          </span>
          <div>
            <strong class="block">Một chạm để đọc</strong>
            <span class="mt-1 block text-xs leading-5 text-slate-400">
              Hỗ trợ PDF, Word, PowerPoint và sách NXBGD.
            </span>
          </div>
          <ArrowRight :size="19" class="ml-auto text-white/35" />
        </div>
      </div>
    </section>
  </main>

  <Teleport to="body">
    <div
      v-if="hoveredBook"
      class="book-hover-preview"
      :class="`is-${hoverPreviewPosition.placement}`"
      :style="{
        left: `${hoverPreviewPosition.left}px`,
        top: `${hoverPreviewPosition.top}px`,
        width: `${hoverPreviewPosition.width}px`,
        '--preview-cover-width': `${hoverPreviewPosition.coverWidth}px`,
        '--preview-cover-height': `${hoverPreviewPosition.coverHeight}px`,
        '--preview-accent': activeCabinet.accentColor,
      }"
      role="tooltip"
    >
      <div class="hover-preview-panel">
        <div class="hover-preview-cover" aria-hidden="true">
          <span class="hover-preview-glow" />
          <img :src="hoveredBook.coverUrl" alt="" />
          <span class="hover-preview-shine" />
        </div>

        <div class="hover-preview-info">
          <span class="floating-info-accent" />
          <span class="min-w-0">
            <strong>{{ hoveredBook.title }}</strong>
            <small>{{ formatBookType(hoveredBook) }}</small>
          </span>
          <span class="floating-info-action">Bấm để mở</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.three-d-library {
  background: transparent;
}

.library-grid {
  background-image:
    linear-gradient(rgb(255 255 255 / 0.28) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 0.28) 1px, transparent 1px);
  background-size: 38px 38px;
  mask-image: linear-gradient(to bottom, black, transparent 86%);
}

.three-d-title {
  color: transparent;
  background: linear-gradient(135deg, #ff5262 10%, #ffc94a 52%, #2f8ee9);
  background-clip: text;
  filter: drop-shadow(0 16px 30px rgb(223 33 51 / 0.2));
}

.search-arrival {
  animation: search-arrival 620ms 120ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes search-arrival {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.94);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.hero-stat {
  display: grid;
  min-width: 92px;
  min-height: 86px;
  place-items: center;
  border: 1px solid rgb(255 225 225);
  border-radius: 18px;
  background: rgb(255 255 255 / 0.88);
  text-align: center;
  box-shadow: 0 14px 32px -24px rgb(24 32 51 / 0.45);
}

.hero-stat strong {
  display: block;
  font-size: 1.5rem;
  font-weight: 900;
  line-height: 1;
}

.hero-stat span {
  display: block;
  margin-top: 8px;
  color: rgb(100 116 139);
  font-size: 0.63rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.cabinet-tab {
  box-shadow: inset 0 1px rgb(255 255 255 / 0.06);
}

.cabinet-stage {
  padding: 16px 44px 38px;
  perspective: 1700px;
  perspective-origin: 50% 42%;
}

.bookcase {
  width: min(960px, 100%);
  border-radius: 22px 22px 13px 13px;
  background: var(--cabinet-frame);
  box-shadow:
    0 42px 72px -38px rgb(126 76 28 / 0.88),
    0 12px 24px -8px color-mix(in srgb, var(--cabinet-frame-dark), transparent 28%),
    inset 0 2px rgb(255 255 255 / 0.24);
  transform: rotateX(var(--cabinet-tilt-x)) rotateY(var(--cabinet-tilt-y));
  transform-style: preserve-3d;
  transition:
    transform 180ms ease-out,
    box-shadow 300ms ease;
  will-change: transform;
}

.bookcase::before,
.bookcase::after {
  position: absolute;
  z-index: -1;
  top: 26px;
  bottom: 22px;
  width: 36px;
  background: var(--cabinet-frame-dark);
  content: '';
  filter: brightness(0.86);
}

.bookcase::before {
  left: -22px;
  border-radius: 12px 0 0 12px;
  transform: rotateY(-48deg);
  transform-origin: right;
}

.bookcase::after {
  right: -22px;
  border-radius: 0 12px 12px 0;
  transform: rotateY(48deg);
  transform-origin: left;
}

.bookcase-crown {
  position: relative;
  display: grid;
  min-height: 122px;
  place-items: center;
  overflow: hidden;
  border-bottom: 10px solid var(--cabinet-frame-dark);
  border-radius: 22px 22px 0 0;
  background:
    linear-gradient(90deg, transparent, rgb(255 255 255 / 0.12), transparent), var(--cabinet-frame);
  box-shadow:
    inset 0 -8px 14px rgb(0 0 0 / 0.16),
    inset 0 2px rgb(255 255 255 / 0.24);
  transform: translateZ(16px);
}

.crown-shine {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 0, rgb(255 255 255 / 0.24), transparent 62%);
}

.cabinet-sign {
  position: relative;
  z-index: 2;
  width: min(520px, 68%);
  padding: 14px 28px;
  border: 1px solid rgb(255 255 255 / 0.32);
  border-radius: 15px;
  color: white;
  background: color-mix(in srgb, var(--cabinet-frame-dark), transparent 8%);
  box-shadow:
    0 14px 22px -12px rgb(0 0 0 / 0.45),
    inset 0 1px rgb(255 255 255 / 0.22);
  text-align: center;
}

.cabinet-sign small,
.cabinet-sign span {
  display: block;
}

.cabinet-sign small {
  font-size: 0.56rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.66;
}

.cabinet-sign strong {
  display: block;
  margin-top: 5px;
  font-size: clamp(1rem, 2.2vw, 1.45rem);
  font-weight: 900;
}

.cabinet-sign span {
  margin-top: 3px;
  font-size: 0.62rem;
  font-weight: 700;
  opacity: 0.68;
}

.top-decor {
  position: absolute;
  z-index: 2;
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 0.24);
  border-radius: 18px;
  color: white;
  background: rgb(255 255 255 / 0.13);
  box-shadow: inset 0 1px rgb(255 255 255 / 0.2);
  transform: rotate(-6deg);
}

.left-decor {
  left: 54px;
}

.right-decor {
  right: 54px;
  transform: rotate(6deg);
}

.bookcase-body {
  position: relative;
  padding: 14px 24px 4px;
  border-right: 13px solid var(--cabinet-frame-dark);
  border-left: 13px solid var(--cabinet-frame-dark);
  background:
    linear-gradient(90deg, rgb(0 0 0 / 0.1), transparent 9%, transparent 91%, rgb(0 0 0 / 0.1)),
    var(--cabinet-inner);
  box-shadow: inset 0 20px 28px rgb(0 0 0 / 0.1);
  transform: translateZ(4px);
}

.cabinet-shelf {
  position: relative;
  display: flex;
  min-height: 175px;
  align-items: flex-end;
  padding: 20px 74px 14px 22px;
  border-bottom: 15px solid var(--cabinet-frame-dark);
  background:
    linear-gradient(to bottom, rgb(255 255 255 / 0.12), transparent 30%),
    linear-gradient(90deg, rgb(0 0 0 / 0.06), transparent 14%, transparent 86%, rgb(0 0 0 / 0.06));
  box-shadow:
    0 11px 12px -8px rgb(0 0 0 / 0.42),
    inset 0 -8px 16px rgb(0 0 0 / 0.055);
  transform-style: preserve-3d;
}

.cabinet-shelf::after {
  position: absolute;
  right: -4px;
  bottom: -19px;
  left: -4px;
  height: 8px;
  border-radius: 0 0 4px 4px;
  background: var(--cabinet-frame);
  box-shadow: inset 0 1px rgb(255 255 255 / 0.2);
  content: '';
}

.shelf-label {
  position: absolute;
  z-index: 3;
  bottom: -12px;
  left: 15px;
  max-width: 64%;
  overflow: hidden;
  padding: 3px 9px;
  border-radius: 7px;
  color: white;
  background: var(--cabinet-frame-dark);
  font-size: 0.52rem;
  font-weight: 800;
  text-overflow: ellipsis;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.book-row {
  position: relative;
  z-index: 4;
  display: flex;
  min-width: 0;
  align-items: flex-end;
  gap: 4px;
  transform-style: preserve-3d;
}

.shelf-book {
  position: relative;
  display: flex;
  width: var(--book-width-mobile);
  height: var(--book-height-mobile);
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border: 0;
  color: white;
  background: transparent;
  cursor: pointer;
  outline-offset: 3px;
  transform: rotate(var(--book-lean)) translateZ(4px);
  transform-origin: bottom;
  transform-style: preserve-3d;
  transition:
    transform 260ms cubic-bezier(0.16, 1, 0.3, 1) var(--book-delay),
    filter 200ms ease,
    box-shadow 200ms ease;
}

.book-spine-face {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px 4px 2px 2px;
  background:
    linear-gradient(
      90deg,
      rgb(0 0 0 / 0.22),
      transparent 19%,
      rgb(255 255 255 / 0.2) 72%,
      transparent
    ),
    var(--book-color);
  box-shadow:
    3px 4px 6px rgb(0 0 0 / 0.3),
    inset 1px 0 rgb(255 255 255 / 0.28);
  backface-visibility: hidden;
  transform: rotateY(0);
  transform-origin: left center;
  transition:
    transform 420ms cubic-bezier(0.16, 1, 0.3, 1),
    filter 200ms ease,
    box-shadow 200ms ease;
}

.shelf-book:nth-child(4n + 2) .book-spine-face {
  border-top: 4px solid rgb(255 255 255 / 0.42);
}

.shelf-book:nth-child(5n + 3) .book-spine-face {
  border-bottom: 5px solid rgb(0 0 0 / 0.18);
}

.shelf-book:hover,
.shelf-book:focus-visible {
  z-index: 30;
  filter: saturate(1.2) brightness(1.08);
  transform: translateY(-10px) translateZ(68px) scale(1.03);
}

.shelf-book:hover .book-spine-face,
.shelf-book:focus-visible .book-spine-face,
.shelf-book.is-opening .book-spine-face {
  box-shadow: 8px 12px 18px rgb(0 0 0 / 0.34);
  transform: rotateY(-90deg);
}

.book-cover-face {
  position: absolute;
  bottom: 0;
  left: 0;
  display: block;
  width: var(--cover-width-mobile);
  height: 100%;
  overflow: hidden;
  border: 2px solid rgb(255 255 255 / 0.58);
  border-radius: 4px 7px 7px 4px;
  background: #fff9ed;
  box-shadow:
    10px 14px 24px -8px rgb(0 0 0 / 0.54),
    inset 2px 0 rgb(255 255 255 / 0.45);
  opacity: 0;
  backface-visibility: hidden;
  transform: rotateY(88deg) translateZ(2px);
  transform-origin: left center;
  transition:
    opacity 120ms ease,
    transform 460ms cubic-bezier(0.16, 1, 0.3, 1);
}

.book-cover-face img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    112deg,
    transparent 34%,
    rgb(255 255 255 / 0.36) 49%,
    transparent 63%
  );
  pointer-events: none;
  transform: translateX(-110%);
  transition: transform 650ms 120ms ease;
}

.shelf-book:hover .book-cover-face,
.shelf-book:focus-visible .book-cover-face,
.shelf-book.is-opening .book-cover-face {
  opacity: 1;
  transform: rotateY(0) translateZ(20px);
}

.shelf-book:hover .cover-shine,
.shelf-book:focus-visible .cover-shine {
  transform: translateX(110%);
}

.book-page-edge {
  position: absolute;
  top: 5px;
  right: -3px;
  bottom: 4px;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background: repeating-linear-gradient(
    to bottom,
    #fff9e9 0,
    #fff9e9 2px,
    #e3dac6 2px,
    #e3dac6 3px
  );
  transform: rotateY(30deg);
  transform-origin: left;
}

.book-spine-text {
  display: block;
  max-height: calc(100% - 14px);
  overflow: hidden;
  font-size: var(--book-font-size-mobile);
  font-weight: 900;
  line-height: 1;
  text-overflow: ellipsis;
  text-shadow: 0 1px rgb(0 0 0 / 0.18);
  text-transform: uppercase;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}

.shelf-book.is-opening {
  z-index: 50;
  pointer-events: none;
  animation: book-open-launch 680ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.shelf-book.is-opening .book-cover-face {
  animation: cover-open-launch 680ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.shelf-decoration {
  position: absolute;
  right: 17px;
  bottom: 14px;
  z-index: 2;
  display: grid;
  width: 47px;
  height: 54px;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--cabinet-accent), transparent 72%);
  border-radius: 16px 16px 9px 9px;
  color: var(--cabinet-accent);
  background: rgb(255 255 255 / 0.62);
  box-shadow: 0 7px 12px -7px rgb(0 0 0 / 0.35);
  transform: rotate(2deg);
}

.teacher-decoration {
  border-radius: 7px 14px 9px 9px;
  background: rgb(255 255 255 / 0.72);
}

.student-star {
  position: absolute;
  top: -8px;
  right: -7px;
  color: #ffc94a;
  font-size: 1rem;
  filter: drop-shadow(0 2px 2px rgb(0 0 0 / 0.15));
}

.teacher-pencil {
  position: absolute;
  right: -4px;
  bottom: -2px;
  width: 7px;
  height: 42px;
  border-radius: 4px;
  background: linear-gradient(90deg, #e9b949 0 66%, #c98f26 66%);
  box-shadow: 0 2px 4px rgb(0 0 0 / 0.2);
  transform: rotate(12deg);
}

.empty-shelf-state {
  display: grid;
  min-height: 470px;
  place-items: center;
  align-content: center;
  gap: 10px;
  color: color-mix(in srgb, var(--cabinet-frame-dark), transparent 18%);
  text-align: center;
}

.empty-shelf-state strong {
  font-size: 1rem;
}

.empty-shelf-state span {
  font-size: 0.74rem;
  opacity: 0.65;
}

.bookcase-base {
  display: flex;
  min-height: 46px;
  align-items: center;
  justify-content: space-between;
  padding: 0 25px;
  border-top: 9px solid var(--cabinet-frame-dark);
  border-radius: 0 0 13px 13px;
  color: rgb(255 255 255 / 0.68);
  background: var(--cabinet-frame);
  box-shadow:
    inset 0 2px rgb(255 255 255 / 0.16),
    0 10px 18px -10px rgb(0 0 0 / 0.48);
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transform: translateZ(10px);
}

.stage-arrow {
  position: absolute;
  z-index: 30;
  top: 48%;
  display: grid;
  width: 46px;
  height: 46px;
  place-items: center;
  border: 1px solid rgb(255 225 225);
  border-radius: 50%;
  color: #df2133;
  background: rgb(255 255 255 / 0.94);
  box-shadow: 0 15px 28px -18px rgb(24 32 51 / 0.5);
  backdrop-filter: blur(12px);
  transition: 180ms ease;
}

.stage-arrow:hover {
  color: white;
  background: #df2133;
  transform: scale(1.06);
}

.opening-status {
  position: absolute;
  z-index: 55;
  top: 10px;
  left: 50%;
  display: flex;
  width: min(390px, calc(100% - 100px));
  min-height: 62px;
  align-items: center;
  gap: 12px;
  padding: 9px 14px 9px 9px;
  border: 1px solid rgb(255 255 255 / 0.18);
  border-radius: 18px;
  color: #182033;
  background: rgb(255 255 255 / 0.96);
  box-shadow: 0 20px 44px -24px rgb(24 32 51 / 0.55);
  pointer-events: none;
  transform: translateX(-50%);
  backdrop-filter: blur(16px);
}

.opening-status img {
  width: 36px;
  height: 46px;
  flex: 0 0 auto;
  border-radius: 5px;
  object-fit: cover;
  box-shadow: 0 7px 12px -6px rgb(0 0 0 / 0.65);
}

.opening-status span {
  min-width: 0;
  flex: 1;
}

.opening-status small,
.opening-status strong {
  display: block;
}

.opening-status small {
  color: #df2133;
  font-size: 0.57rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.opening-status strong {
  overflow: hidden;
  margin-top: 3px;
  font-size: 0.72rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.opening-status-enter-active,
.opening-status-leave-active {
  transition:
    opacity 180ms ease,
    transform 240ms cubic-bezier(0.16, 1, 0.3, 1);
}

.opening-status-enter-from,
.opening-status-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px) scale(0.94);
}

.book-hover-preview {
  position: fixed;
  z-index: 90;
  pointer-events: none;
}

.hover-preview-panel {
  position: relative;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 11px;
  padding: 13px;
  border: 1px solid rgb(255 255 255 / 0.16);
  border-radius: 18px;
  color: white;
  background:
    radial-gradient(
      circle at 50% 22%,
      color-mix(in srgb, var(--preview-accent), transparent 70%),
      transparent 45%
    ),
    rgb(15 23 38 / 0.97);
  box-shadow:
    0 24px 55px -18px rgb(0 0 0 / 0.82),
    0 0 30px -16px color-mix(in srgb, var(--preview-accent), transparent 15%);
  animation: hover-preview-in 240ms cubic-bezier(0.16, 1, 0.3, 1) both;
  backdrop-filter: blur(18px);
}

.book-hover-preview.is-left .hover-preview-panel {
  transform-origin: right center;
}

.book-hover-preview.is-right .hover-preview-panel {
  transform-origin: left center;
}

.book-hover-preview.is-compact .hover-preview-panel {
  padding: 12px 13px;
}

.book-hover-preview.is-compact .hover-preview-cover {
  display: none;
}

.hover-preview-cover {
  position: relative;
  width: var(--preview-cover-width);
  height: var(--preview-cover-height);
  flex: 0 0 auto;
  overflow: hidden;
  border: 2px solid rgb(255 255 255 / 0.7);
  border-radius: 6px 11px 11px 6px;
  background: #fff9ed;
  box-shadow:
    0 18px 28px -11px rgb(0 0 0 / 0.72),
    0 0 28px -9px color-mix(in srgb, var(--preview-accent), transparent 18%),
    inset 3px 0 rgb(255 255 255 / 0.48);
  animation: hover-cover-turn 520ms cubic-bezier(0.16, 1, 0.3, 1) both;
  transform-origin: left center;
}

.hover-preview-cover img {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hover-preview-glow {
  position: absolute;
  z-index: 0;
  inset: -25%;
  border-radius: 50%;
  background: color-mix(in srgb, var(--preview-accent), white 22%);
  opacity: 0.48;
  filter: blur(20px);
}

.hover-preview-shine {
  position: absolute;
  z-index: 2;
  inset: -20% -65%;
  background: linear-gradient(
    108deg,
    transparent 38%,
    rgb(255 255 255 / 0.58) 49%,
    transparent 60%
  );
  animation: hover-cover-shine 1050ms 160ms ease-in-out infinite;
  transform: translateX(-58%);
}

.hover-preview-info {
  position: relative;
  display: grid;
  grid-template-columns: 4px minmax(0, 1fr);
  gap: 0 11px;
  width: 100%;
  min-width: 0;
  padding: 3px 1px 1px;
}

.floating-info-accent {
  grid-row: 1 / span 2;
  width: 4px;
  border-radius: 99px;
  background: linear-gradient(#ff5262, #ffc94a);
  box-shadow: 0 0 14px rgb(255 82 98 / 0.58);
}

.book-hover-preview strong,
.book-hover-preview small {
  display: block;
}

.book-hover-preview strong {
  display: -webkit-box;
  overflow: hidden;
  font-size: 0.76rem;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.book-hover-preview small {
  overflow: hidden;
  margin-top: 4px;
  color: rgb(255 255 255 / 0.52);
  font-size: 0.62rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.floating-info-action {
  grid-column: 2;
  width: fit-content;
  margin-top: 8px;
  padding: 4px 8px;
  border-radius: 999px;
  color: #ffabb3;
  background: rgb(223 33 51 / 0.16);
  font-size: 0.55rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.cabinet-swap-enter-active,
.cabinet-swap-leave-active {
  transition:
    opacity 220ms ease,
    transform 260ms cubic-bezier(0.16, 1, 0.3, 1);
}

.cabinet-swap-enter-from {
  opacity: 0;
  transform: translateX(36px) scale(0.97);
}

.cabinet-swap-leave-to {
  opacity: 0;
  transform: translateX(-36px) scale(0.97);
}

@keyframes hover-preview-in {
  from {
    opacity: 0;
    transform: translateY(7px) scale(0.92);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes hover-cover-turn {
  from {
    opacity: 0;
    transform: perspective(700px) rotateY(78deg) translateX(-16px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: perspective(700px) rotateY(0) translateX(0) scale(1);
  }
}

@keyframes hover-cover-shine {
  0%,
  26% {
    transform: translateX(-58%);
  }
  72%,
  100% {
    transform: translateX(58%);
  }
}

@keyframes book-open-launch {
  0% {
    opacity: 1;
    transform: translateY(-10px) translateZ(68px) scale(1.03);
  }
  42% {
    opacity: 1;
    transform: translateY(-19px) translateZ(105px) scale(1.18);
  }
  72% {
    opacity: 1;
    transform: translateY(-33px) translateZ(150px) scale(1.34);
  }
  100% {
    opacity: 0;
    transform: translateY(-52px) translateZ(210px) scale(1.5);
  }
}

@keyframes cover-open-launch {
  0% {
    opacity: 0;
    transform: rotateY(88deg) translateZ(2px);
  }
  42% {
    opacity: 1;
    transform: rotateY(0) translateZ(30px);
  }
  100% {
    opacity: 1;
    transform: rotateY(-5deg) translateZ(70px);
  }
}

@media (min-width: 1101px) {
  .shelf-book {
    width: var(--book-width);
    height: var(--book-height);
  }

  .book-cover-face {
    width: var(--cover-width);
  }

  .book-spine-text {
    font-size: var(--book-font-size);
  }
}

@media (min-width: 768px) and (max-width: 1100px) {
  .cabinet-stage {
    padding: 18px 18px 42px;
  }

  .shelf-book {
    width: var(--book-width-tablet);
    height: var(--book-height-tablet);
  }

  .book-cover-face {
    width: var(--cover-width-tablet);
  }

  .book-spine-text {
    font-size: var(--book-font-size-tablet);
  }

  .stage-arrow {
    width: 42px;
    height: 42px;
  }
}

@media (max-width: 767px) {
  .hero-stat {
    min-width: 0;
    min-height: 76px;
  }

  .cabinet-stage {
    padding: 10px 0 30px;
  }

  .bookcase {
    width: 100%;
  }

  .bookcase::before,
  .bookcase::after {
    display: none;
  }

  .bookcase-crown {
    min-height: 84px;
    border-bottom-width: 8px;
  }

  .cabinet-sign {
    width: 74%;
    padding: 10px 12px;
  }

  .cabinet-sign small {
    font-size: 0.47rem;
    letter-spacing: 0.06em;
  }

  .cabinet-sign span {
    display: none;
  }

  .top-decor {
    width: 39px;
    height: 39px;
    border-radius: 12px;
  }

  .top-decor :deep(svg) {
    width: 21px;
  }

  .left-decor {
    left: 12px;
  }

  .right-decor {
    right: 12px;
  }

  .bookcase-body {
    padding: 9px 7px 3px;
    border-right-width: 8px;
    border-left-width: 8px;
  }

  .cabinet-shelf {
    min-height: 118px;
    padding: 10px 7px 12px;
    border-bottom-width: 12px;
  }

  .book-row {
    gap: 2px;
  }

  .shelf-decoration {
    display: none;
  }

  .opening-status {
    top: 4px;
    width: calc(100% - 42px);
  }

  .stage-arrow {
    display: none;
  }

  .bookcase-base {
    padding: 0 12px;
    font-size: 0.5rem;
    letter-spacing: 0.02em;
  }
}
</style>
