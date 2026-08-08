<script setup lang="ts">
import { Download, FileText, LoaderCircle, Presentation, X } from '@lucide/vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'

import type { OfficeLibraryItem } from '@/types/library'

defineProps<{
  document: OfficeLibraryItem
}>()

const emit = defineEmits<{
  close: []
}>()

const loading = ref(true)
const previewSlow = ref(false)
const PREVIEW_SLOW_TIMEOUT = 120_000
let previousBodyOverflow = ''
let previewTimeout: ReturnType<typeof setTimeout> | undefined

function formatBytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

function handlePreviewLoaded() {
  globalThis.clearTimeout(previewTimeout)
  loading.value = false
}

onMounted(() => {
  previousBodyOverflow = globalThis.document.body.style.overflow
  globalThis.document.body.style.overflow = 'hidden'
  globalThis.addEventListener('keydown', handleKeydown)
  previewTimeout = globalThis.setTimeout(() => {
    previewSlow.value = true
  }, PREVIEW_SLOW_TIMEOUT)
})

onBeforeUnmount(() => {
  globalThis.clearTimeout(previewTimeout)
  globalThis.document.body.style.overflow = previousBodyOverflow
  globalThis.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <section
    class="fixed inset-0 z-[80] flex flex-col overflow-hidden bg-[#111827] text-white"
    role="dialog"
    aria-modal="true"
    :aria-label="`Đang xem ${document.title}`"
  >
    <header
      class="relative z-10 flex min-h-18 items-center gap-3 border-b border-white/10 bg-[#111827]/96 px-3 backdrop-blur-xl sm:px-5"
    >
      <img
        :src="document.coverUrl"
        alt=""
        class="h-12 w-9 shrink-0 rounded object-cover shadow-lg"
      />
      <div class="min-w-0 flex-1">
        <h2 class="truncate text-sm font-black sm:text-base">{{ document.title }}</h2>
        <p class="mt-1 truncate text-[11px] text-white/55 sm:text-xs">
          {{ document.subject }} • {{ document.format.toUpperCase() }}
          <template v-if="document.pageCount"> • {{ document.pageCount }} slide</template>
          • {{ formatBytes(document.fileSizeBytes) }}
        </p>
      </div>
      <span
        class="hidden items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-xs font-bold text-white/70 md:flex"
      >
        <Presentation v-if="document.format === 'ppt' || document.format === 'pptx'" :size="16" />
        <FileText v-else :size="16" />
        Bản xem trước
      </span>
      <a
        :href="document.originalUrl"
        :download="document.fileName"
        class="focus-ring grid size-10 place-items-center rounded-xl bg-white/8 text-white/75 transition hover:bg-white/15 hover:text-white"
        :aria-label="`Tải tệp ${document.format.toUpperCase()}`"
        :title="`Tải tệp ${document.format.toUpperCase()}`"
      >
        <Download :size="18" />
      </a>
      <button
        type="button"
        class="focus-ring grid size-10 place-items-center rounded-xl bg-white/8 text-white/75 transition hover:bg-red-500 hover:text-white"
        aria-label="Đóng trình xem tài liệu"
        @click="emit('close')"
      >
        <X :size="20" />
      </button>
    </header>

    <div class="relative min-h-0 flex-1 bg-slate-200">
      <div
        v-if="loading"
        class="absolute inset-0 z-10 grid place-items-center bg-[#111827]"
        aria-live="polite"
      >
        <div class="text-center">
          <template v-if="previewSlow">
            <FileText :size="44" class="mx-auto text-red-400" />
            <p class="mt-5 font-bold">Bản xem trước chưa phản hồi</p>
            <p class="mt-2 text-xs leading-5 text-white/45">
              Thiết bị của bạn có thể mở tài liệu bằng ứng dụng phù hợp.
            </p>
            <a
              :href="document.originalUrl"
              :download="document.fileName"
              class="focus-ring mt-5 inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-bold text-white"
            >
              <Download :size="17" />
              Mở tài liệu
            </a>
          </template>
          <template v-else>
            <LoaderCircle :size="42" class="mx-auto animate-spin text-red-400" />
            <p class="mt-5 font-bold">Đang mở {{ document.title }}</p>
            <p class="mt-2 text-xs text-white/45">
              Đang tải bản xem trước {{ document.format.toUpperCase() }}...
            </p>
          </template>
        </div>
      </div>

      <iframe
        :src="document.previewUrl"
        :title="`Bản xem trước ${document.title}`"
        class="h-full w-full border-0 bg-white"
        sandbox="allow-same-origin allow-scripts"
        @load="handlePreviewLoaded"
      />
    </div>
  </section>
</template>
