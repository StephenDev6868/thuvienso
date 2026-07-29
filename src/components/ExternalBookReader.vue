<script setup lang="ts">
import { ExternalLink, LoaderCircle, X } from '@lucide/vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'

import type { ExternalLibraryItem } from '@/types/library'

defineProps<{
  book: ExternalLibraryItem
}>()

const emit = defineEmits<{
  close: []
}>()

const loading = ref(true)
const connectionSlow = ref(false)
let previousBodyOverflow = ''
let connectionTimeout: ReturnType<typeof setTimeout> | undefined

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

function handleExternalLoaded() {
  globalThis.clearTimeout(connectionTimeout)
  loading.value = false
}

onMounted(() => {
  previousBodyOverflow = globalThis.document.body.style.overflow
  globalThis.document.body.style.overflow = 'hidden'
  globalThis.addEventListener('keydown', handleKeydown)
  connectionTimeout = globalThis.setTimeout(() => {
    connectionSlow.value = true
  }, 10_000)
})

onBeforeUnmount(() => {
  globalThis.clearTimeout(connectionTimeout)
  globalThis.document.body.style.overflow = previousBodyOverflow
  globalThis.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <section
    class="fixed inset-0 z-[80] flex flex-col overflow-hidden bg-[#111827] text-white"
    role="dialog"
    aria-modal="true"
    :aria-label="`Đang đọc ${book.title}`"
  >
    <header
      class="relative z-10 flex min-h-18 items-center gap-3 border-b border-white/10 bg-[#111827]/96 px-3 backdrop-blur-xl sm:px-5"
    >
      <img :src="book.coverUrl" alt="" class="h-12 w-9 shrink-0 rounded object-cover shadow-lg" />
      <div class="min-w-0 flex-1">
        <h2 class="truncate text-sm font-black sm:text-base">{{ book.title }}</h2>
        <p class="mt-1 truncate text-[11px] text-white/55 sm:text-xs">
          {{ book.subject }} • Lớp {{ book.grade }} • Nguồn NXBGD
        </p>
      </div>
      <a
        :href="book.externalUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="focus-ring inline-flex h-10 items-center gap-2 rounded-xl bg-white/8 px-3 text-xs font-bold text-white/75 transition hover:bg-white/15 hover:text-white"
        aria-label="Mở sách trên trang NXBGD"
      >
        <ExternalLink :size="17" />
        <span class="hidden sm:inline">Mở trang gốc</span>
      </a>
      <button
        type="button"
        class="focus-ring grid size-10 place-items-center rounded-xl bg-white/8 text-white/75 transition hover:bg-red-500 hover:text-white"
        aria-label="Đóng trình đọc sách giáo viên"
        @click="emit('close')"
      >
        <X :size="20" />
      </button>
    </header>

    <div class="relative min-h-0 flex-1 bg-white">
      <div
        v-if="loading"
        class="absolute inset-0 z-10 grid place-items-center bg-[#111827]"
        aria-live="polite"
      >
        <div class="max-w-sm px-6 text-center">
          <template v-if="connectionSlow">
            <ExternalLink :size="44" class="mx-auto text-red-400" />
            <p class="mt-5 font-bold">Trình duyệt đang chặn nội dung nhúng</p>
            <p class="mt-2 text-xs leading-5 text-white/45">
              Hãy mở sách trực tiếp trên trang NXBGD để tiếp tục đọc.
            </p>
            <a
              :href="book.externalUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="focus-ring mt-5 inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-bold text-white"
            >
              <ExternalLink :size="17" />
              Mở sách ngay
            </a>
          </template>
          <template v-else>
            <LoaderCircle :size="42" class="mx-auto animate-spin text-red-400" />
            <p class="mt-5 font-bold">Đang kết nối kho sách NXBGD</p>
            <p class="mt-2 text-xs leading-5 text-white/45">
              Nội dung sách được tải trực tiếp từ taphuan.nxbgd.vn.
            </p>
          </template>
        </div>
      </div>

      <iframe
        :src="book.externalUrl"
        :title="book.title"
        class="h-full w-full border-0 bg-white"
        allow="fullscreen"
        referrerpolicy="strict-origin-when-cross-origin"
        sandbox="allow-downloads allow-forms allow-popups allow-same-origin allow-scripts"
        @load="handleExternalLoaded"
      />
    </div>
  </section>
</template>
