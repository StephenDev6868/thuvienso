<script setup lang="ts">
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Download,
  LoaderCircle,
  Maximize2,
  Volume2,
  VolumeX,
  X,
} from '@lucide/vue'
import { PageFlip } from 'page-flip'
import {
  GlobalWorkerOptions,
  getDocument,
  type OnProgressParameters,
  type PDFDocumentLoadingTask,
  type PDFDocumentProxy,
} from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

import type { Book } from '@/types/library'

GlobalWorkerOptions.workerSrc = pdfWorkerUrl

const PDF_RANGE_CHUNK_SIZE = 512 * 1024
const PAGE_PRELOAD_AHEAD = 2

const props = defineProps<{
  book: Book
}>()

const emit = defineEmits<{
  close: []
}>()

const readerDialog = ref<HTMLElement | null>(null)
const flipHost = ref<HTMLElement | null>(null)
const loading = ref(true)
const loadPercent = ref(0)
const currentPage = ref(1)
const jumpPage = ref('1')
const errorMessage = ref('')
const fullscreen = ref(false)
const soundEnabled = ref(true)

const pageNumbers = computed(() =>
  Array.from({ length: props.book.pageCount }, (_, index) => index + 1),
)

let loadingTask: PDFDocumentLoadingTask | undefined
let pdfDocument: PDFDocumentProxy | undefined
let pageFlip: PageFlip | undefined
let previousBodyOverflow = ''
let audioContext: AudioContext | undefined
let paperNoiseBuffer: AudioBuffer | undefined
let pendingTurnSound = false
let pendingTurnSoundTimer: ReturnType<typeof setTimeout> | undefined
let lastSoundTime = Number.NEGATIVE_INFINITY
const renderedPages = new Set<number>()
const renderingPages = new Map<number, Promise<void>>()

function formatBytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function getPageCanvas(pageNumber: number) {
  return flipHost.value?.querySelector<HTMLCanvasElement>(
    `canvas[data-page-number="${pageNumber}"]`,
  )
}

async function renderPage(pageNumber: number) {
  if (
    !pdfDocument ||
    renderedPages.has(pageNumber) ||
    pageNumber < 1 ||
    pageNumber > pdfDocument.numPages
  ) {
    return
  }

  const activeRender = renderingPages.get(pageNumber)
  if (activeRender) return activeRender

  const renderPromise = (async () => {
    const canvas = getPageCanvas(pageNumber)
    if (!canvas || !pdfDocument) return

    const page = await pdfDocument.getPage(pageNumber)
    const unscaledViewport = page.getViewport({ scale: 1 })
    const cssWidth = canvas.parentElement?.clientWidth || 560
    const pixelRatio = Math.min(globalThis.devicePixelRatio || 1, 2)
    const scale = (cssWidth / unscaledViewport.width) * pixelRatio
    const viewport = page.getViewport({ scale })

    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    canvas.style.aspectRatio = `${viewport.width} / ${viewport.height}`

    await page.render({
      canvas,
      viewport,
    }).promise

    canvas.closest<HTMLElement>('.pdf-book-page')?.setAttribute('data-rendered', 'true')
    renderedPages.add(pageNumber)
    page.cleanup()
  })()

  renderingPages.set(pageNumber, renderPromise)
  try {
    await renderPromise
  } finally {
    renderingPages.delete(pageNumber)
  }
}

function renderAround(pageIndex: number) {
  const currentPageNumber = Math.max(1, pageIndex + 1)
  const lastPageNumber = Math.min(
    pdfDocument?.numPages ?? props.book.pageCount,
    currentPageNumber + PAGE_PRELOAD_AHEAD,
  )

  for (let pageNumber = currentPageNumber; pageNumber <= lastPageNumber; pageNumber += 1) {
    void renderPage(pageNumber)
  }
}

function getPageTurnAudioContext() {
  if (!soundEnabled.value || typeof globalThis.AudioContext === 'undefined') return

  audioContext ??= new globalThis.AudioContext()
  return audioContext
}

function getPaperNoiseBuffer(context: AudioContext) {
  if (paperNoiseBuffer && paperNoiseBuffer.sampleRate === context.sampleRate) {
    return paperNoiseBuffer
  }

  const duration = 0.48
  const buffer = context.createBuffer(
    1,
    Math.ceil(context.sampleRate * duration),
    context.sampleRate,
  )
  const samples = buffer.getChannelData(0)
  let softenedNoise = 0

  for (let index = 0; index < samples.length; index += 1) {
    const whiteNoise = Math.random() * 2 - 1
    softenedNoise = softenedNoise * 0.58 + whiteNoise * 0.42
    samples[index] = softenedNoise * (0.82 + Math.random() * 0.18)
  }

  paperNoiseBuffer = buffer
  return buffer
}

function schedulePaperRustle(
  context: AudioContext,
  startTime: number,
  duration: number,
  volume: number,
  pan: number,
  playbackRate: number,
) {
  const source = context.createBufferSource()
  const highPass = context.createBiquadFilter()
  const lowPass = context.createBiquadFilter()
  const gain = context.createGain()
  const panner = context.createStereoPanner()

  source.buffer = getPaperNoiseBuffer(context)
  source.playbackRate.setValueAtTime(playbackRate, startTime)

  highPass.type = 'highpass'
  highPass.frequency.setValueAtTime(320, startTime)
  highPass.Q.setValueAtTime(0.65, startTime)

  lowPass.type = 'lowpass'
  lowPass.frequency.setValueAtTime(4_800, startTime)
  lowPass.frequency.exponentialRampToValueAtTime(1_650, startTime + duration)
  lowPass.Q.setValueAtTime(0.45, startTime)

  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.025)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
  panner.pan.setValueAtTime(pan, startTime)

  source
    .connect(highPass)
    .connect(lowPass)
    .connect(gain)
    .connect(panner)
    .connect(context.destination)
  source.start(startTime, Math.random() * 0.045, duration)
  source.stop(startTime + duration + 0.02)
}

function playPageTurnSound(direction: -1 | 1) {
  const context = getPageTurnAudioContext()
  if (!context) return

  const play = () => {
    const now = context.currentTime
    if (now - lastSoundTime < 0.16) return
    lastSoundTime = now

    const directionPan = direction === 1 ? 0.24 : -0.24
    schedulePaperRustle(context, now, 0.3, 0.085, directionPan, 0.9 + Math.random() * 0.12)
    schedulePaperRustle(
      context,
      now + 0.12,
      0.16,
      0.045,
      directionPan * -0.35,
      1.03 + Math.random() * 0.1,
    )
  }

  if (context.state === 'suspended') {
    void context.resume().then(play).catch(console.error)
  } else {
    play()
  }
}

function primePageTurnAudio() {
  const context = getPageTurnAudioContext()
  if (context?.state === 'suspended') void context.resume().catch(console.error)
}

function playControlTurnSound(direction: -1 | 1) {
  playPageTurnSound(direction)
  pendingTurnSound = true
  if (pendingTurnSoundTimer) globalThis.clearTimeout(pendingTurnSoundTimer)
  pendingTurnSoundTimer = globalThis.setTimeout(() => {
    pendingTurnSound = false
  }, 1_400)
}

function togglePageTurnSound() {
  soundEnabled.value = !soundEnabled.value
  pendingTurnSound = false

  if (soundEnabled.value) {
    primePageTurnAudio()
  } else if (audioContext?.state === 'running') {
    void audioContext.suspend()
  }
}

async function loadBook() {
  try {
    loadingTask = getDocument({
      url: props.book.pdfUrl,
      cMapPacked: true,
      disableAutoFetch: true,
      disableStream: true,
      enableXfa: false,
      rangeChunkSize: PDF_RANGE_CHUNK_SIZE,
    })
    loadingTask.onProgress = ({ loaded, total }: OnProgressParameters) => {
      loadPercent.value = total ? Math.round((loaded / total) * 100) : 0
    }

    pdfDocument = await loadingTask.promise
    await nextTick()

    if (!flipHost.value) return
    const pageElements = flipHost.value.querySelectorAll<HTMLElement>('.pdf-book-page')
    pageFlip = new PageFlip(flipHost.value, {
      width: 560,
      height: 792,
      size: 'stretch',
      minWidth: 260,
      maxWidth: 590,
      minHeight: 368,
      maxHeight: 835,
      drawShadow: true,
      flippingTime: 760,
      usePortrait: true,
      autoSize: true,
      maxShadowOpacity: 0.42,
      showCover: true,
      mobileScrollSupport: false,
      swipeDistance: 24,
      showPageCorners: true,
    })
    pageFlip.loadFromHTML(pageElements)
    pageFlip.on<number>('flip', ({ data }) => {
      const nextPage = data + 1
      if (nextPage !== currentPage.value) {
        const direction = nextPage > currentPage.value ? 1 : -1
        if (pendingTurnSound) {
          pendingTurnSound = false
          if (pendingTurnSoundTimer) globalThis.clearTimeout(pendingTurnSoundTimer)
        } else {
          playPageTurnSound(direction)
        }
      }

      currentPage.value = nextPage
      jumpPage.value = String(currentPage.value)
      renderAround(data)
    })

    await renderPage(1)
    loading.value = false
    renderAround(0)
    await nextTick()
    readerDialog.value?.focus()
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Không thể tải tệp PDF này. Vui lòng thử lại.'
    loading.value = false
  }
}

function previousPage() {
  if (!pageFlip || currentPage.value <= 1) return
  playControlTurnSound(-1)
  pageFlip?.flipPrev('top')
}

function nextPage() {
  if (!pageFlip || currentPage.value >= props.book.pageCount) return
  playControlTurnSound(1)
  pageFlip?.flipNext('top')
}

function goToPage() {
  const targetPage = Math.min(
    props.book.pageCount,
    Math.max(1, Number.parseInt(jumpPage.value, 10) || 1),
  )
  jumpPage.value = String(targetPage)
  if (targetPage !== currentPage.value) {
    playControlTurnSound(targetPage > currentPage.value ? 1 : -1)
  }
  currentPage.value = targetPage
  pageFlip?.turnToPage(targetPage - 1)
  renderAround(targetPage - 1)
}

async function toggleFullscreen() {
  if (!readerDialog.value) return
  if (!globalThis.document.fullscreenElement) {
    await readerDialog.value.requestFullscreen()
  } else {
    await globalThis.document.exitFullscreen()
  }
  fullscreen.value = Boolean(globalThis.document.fullscreenElement)
  globalThis.setTimeout(() => pageFlip?.update(), 120)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && !globalThis.document.fullscreenElement) emit('close')
  if (event.key === 'ArrowLeft') previousPage()
  if (event.key === 'ArrowRight') nextPage()
}

function handleFullscreenChange() {
  fullscreen.value = Boolean(globalThis.document.fullscreenElement)
  globalThis.setTimeout(() => pageFlip?.update(), 120)
}

onMounted(() => {
  previousBodyOverflow = globalThis.document.body.style.overflow
  globalThis.document.body.style.overflow = 'hidden'
  globalThis.addEventListener('keydown', handleKeydown)
  globalThis.document.addEventListener('fullscreenchange', handleFullscreenChange)
  void loadBook()
})

onBeforeUnmount(() => {
  globalThis.document.body.style.overflow = previousBodyOverflow
  globalThis.removeEventListener('keydown', handleKeydown)
  globalThis.document.removeEventListener('fullscreenchange', handleFullscreenChange)
  pageFlip?.off('flip')
  pageFlip?.destroy()
  if (pendingTurnSoundTimer) globalThis.clearTimeout(pendingTurnSoundTimer)
  void audioContext?.close()
  audioContext = undefined
  paperNoiseBuffer = undefined
  void loadingTask?.destroy()
  void pdfDocument?.destroy()
})
</script>

<template>
  <Teleport to="body">
    <section
      ref="readerDialog"
      class="fixed inset-0 z-[80] flex flex-col overflow-hidden bg-[#111827] text-white outline-none"
      role="dialog"
      aria-modal="true"
      :aria-label="`Đang đọc ${book.title}`"
      tabindex="-1"
    >
      <header
        class="relative z-30 flex min-h-18 items-center gap-3 border-b border-white/10 bg-[#111827]/96 px-3 backdrop-blur-xl sm:px-5"
      >
        <img :src="book.coverUrl" alt="" class="h-12 w-9 shrink-0 rounded object-cover shadow-lg" />
        <div class="min-w-0 flex-1">
          <h2 class="truncate text-sm font-black sm:text-base">{{ book.title }}</h2>
          <p class="mt-1 truncate text-[11px] text-white/55 sm:text-xs">
            {{ book.subject }} • {{ book.pageCount }} trang • {{ formatBytes(book.fileSizeBytes) }}
          </p>
        </div>
        <a
          :href="book.pdfUrl"
          :download="book.fileName"
          class="focus-ring hidden size-10 place-items-center rounded-xl bg-white/8 text-white/75 transition hover:bg-white/15 hover:text-white sm:grid"
          aria-label="Tải tệp PDF"
        >
          <Download :size="18" />
        </a>
        <button
          type="button"
          class="focus-ring grid size-10 place-items-center rounded-xl bg-white/8 text-white/75 transition hover:bg-white/15 hover:text-white"
          :class="{ 'bg-red-500/20 text-red-300': soundEnabled }"
          :aria-label="soundEnabled ? 'Tắt âm thanh lật trang' : 'Bật âm thanh lật trang'"
          :title="soundEnabled ? 'Tắt âm thanh lật trang' : 'Bật âm thanh lật trang'"
          :aria-pressed="soundEnabled"
          @click="togglePageTurnSound"
        >
          <Volume2 v-if="soundEnabled" :size="18" />
          <VolumeX v-else :size="18" />
        </button>
        <button
          type="button"
          class="focus-ring grid size-10 place-items-center rounded-xl bg-white/8 text-white/75 transition hover:bg-white/15 hover:text-white"
          :aria-label="fullscreen ? 'Thoát toàn màn hình' : 'Xem toàn màn hình'"
          @click="toggleFullscreen"
        >
          <Maximize2 :size="18" />
        </button>
        <button
          type="button"
          class="focus-ring grid size-10 place-items-center rounded-xl bg-white/8 text-white/75 transition hover:bg-red-500 hover:text-white"
          aria-label="Đóng trình đọc sách"
          @click="emit('close')"
        >
          <X :size="20" />
        </button>
      </header>

      <div
        class="relative min-h-0 flex-1 overflow-hidden bg-[radial-gradient(circle_at_50%_35%,#354157_0%,#1b2434_42%,#111827_75%)]"
      >
        <div
          v-if="loading"
          class="absolute inset-0 z-20 grid place-items-center bg-[#111827]"
          aria-live="polite"
        >
          <div class="text-center">
            <LoaderCircle :size="42" class="mx-auto animate-spin text-red-400" />
            <p class="mt-5 font-bold">Đang mở {{ book.title }}</p>
            <div class="mx-auto mt-4 h-1.5 w-52 overflow-hidden rounded-full bg-white/10">
              <div
                class="h-full rounded-full bg-red-500 transition-[width] duration-300"
                :style="{ width: `${loadPercent}%` }"
              />
            </div>
            <p class="mt-2 text-xs text-white/45">
              {{ loadPercent ? `${loadPercent}%` : 'Đang tải dữ liệu PDF...' }}
            </p>
          </div>
        </div>

        <div
          v-else-if="errorMessage"
          class="absolute inset-0 z-20 grid place-items-center p-6 text-center"
          role="alert"
        >
          <div>
            <BookOpen :size="46" class="mx-auto text-red-400" />
            <p class="mt-4 font-bold">{{ errorMessage }}</p>
            <a
              :href="book.pdfUrl"
              target="_blank"
              rel="noreferrer"
              class="focus-ring mt-5 inline-flex rounded-xl bg-red-500 px-5 py-3 text-sm font-bold"
            >
              Mở PDF gốc
            </a>
          </div>
        </div>

        <div class="reader-stage absolute inset-0 flex items-center justify-center p-2 sm:p-5">
          <div ref="flipHost" class="pdf-flip-host" @pointerdown="primePageTurnAudio">
            <div
              v-for="pageNumber in pageNumbers"
              :key="pageNumber"
              class="pdf-book-page"
              :data-density="pageNumber === 1 || pageNumber === book.pageCount ? 'hard' : 'soft'"
            >
              <canvas :data-page-number="pageNumber" />
              <div class="pdf-page-placeholder">
                <LoaderCircle :size="25" class="animate-spin text-slate-300" />
                <span>Trang {{ pageNumber }}</span>
              </div>
              <span class="pdf-page-number">{{ pageNumber }}</span>
            </div>
          </div>
        </div>
      </div>

      <footer
        class="relative z-30 flex min-h-18 items-center justify-center gap-2 border-t border-white/10 bg-[#111827]/96 px-3 sm:gap-4"
      >
        <button
          type="button"
          class="focus-ring grid size-11 place-items-center rounded-xl bg-white/8 transition hover:bg-white/15 disabled:opacity-30"
          :disabled="currentPage <= 1"
          aria-label="Trang trước"
          @click="previousPage"
        >
          <ArrowLeft :size="20" />
        </button>
        <form
          class="flex items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-sm"
          @submit.prevent="goToPage"
        >
          <label for="reader-page" class="text-white/55">Trang</label>
          <input
            id="reader-page"
            v-model="jumpPage"
            type="number"
            min="1"
            :max="book.pageCount"
            class="h-8 w-14 rounded-lg bg-white/10 px-2 text-center font-bold outline-none focus:bg-white/15"
            @change="goToPage"
          />
          <span class="text-white/45">/ {{ book.pageCount }}</span>
        </form>
        <button
          type="button"
          class="focus-ring grid size-11 place-items-center rounded-xl bg-red-500 transition hover:bg-red-600 disabled:opacity-30"
          :disabled="currentPage >= book.pageCount"
          aria-label="Trang sau"
          @click="nextPage"
        >
          <ArrowRight :size="20" />
        </button>
        <p class="absolute right-5 hidden text-xs text-white/35 lg:block">
          Kéo góc trang hoặc dùng phím ← →
        </p>
      </footer>
    </section>
  </Teleport>
</template>

<style scoped>
.reader-stage {
  perspective: 2400px;
}

.pdf-flip-host {
  height: 100%;
  width: 100%;
}

.pdf-book-page {
  position: relative;
  overflow: hidden;
  background: white;
  color: #182033;
  box-shadow: inset 0 0 0 1px rgb(15 23 42 / 0.08);
}

.pdf-book-page::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  background: linear-gradient(
    90deg,
    rgb(15 23 42 / 0.08),
    transparent 6%,
    transparent 94%,
    rgb(15 23 42 / 0.06)
  );
}

.pdf-book-page canvas {
  display: block;
  height: 100%;
  width: 100%;
  background: white;
}

.pdf-page-placeholder {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 0.75rem;
  background: #fff;
  color: #94a3b8;
  font-size: 0.75rem;
  transition: opacity 180ms ease;
}

.pdf-book-page[data-rendered='true'] .pdf-page-placeholder {
  opacity: 0;
}

.pdf-page-number {
  position: absolute;
  right: 0.65rem;
  bottom: 0.45rem;
  z-index: 2;
  color: rgb(15 23 42 / 0.35);
  font-size: 0.65rem;
  font-weight: 700;
}

@media (max-width: 640px) {
  .reader-stage {
    padding: 0.35rem;
  }
}
</style>
