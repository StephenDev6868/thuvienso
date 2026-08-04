<script setup lang="ts">
import { BrainCircuit, LibraryBig, QrCode, ShieldCheck, Sparkles, Unlock, Wifi } from '@lucide/vue'
import QRCode from 'qrcode'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

import lockBgDesktopUrl from '@/assets/images/backgrounds/bg-desktop-clean.png'
import lockBgMobileUrl from '@/assets/images/backgrounds/bg-mobile.png'
import logoUrl from '../../logo.jpg'
import { digitalBooks } from '@/data/digitalLibrary'

const emit = defineEmits<{
  close: []
}>()

const lockScreen = ref<HTMLElement | null>(null)
const qrCanvas = ref<HTMLCanvasElement | null>(null)
const now = ref(new Date())
const accessUrl = ref('')
const qrError = ref('')
const welcomeMessage =
  'Chào mừng bạn đến với thư viện số của chúng tôi. Hãy quét mã QR hoặc nhấn vào Mở thư viện để cùng khám phá.'

const formattedTime = computed(() =>
  new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now.value),
)

const formattedDate = computed(() =>
  new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(now.value),
)

const displayUrl = computed(() => {
  try {
    return new URL(accessUrl.value).host
  } catch {
    return accessUrl.value
  }
})

let clockTimer: ReturnType<typeof setInterval> | undefined
let speechTimer: ReturnType<typeof setInterval> | undefined
let previousBodyOverflow = ''

function chooseVietnameseVoice() {
  if (!('speechSynthesis' in globalThis)) return undefined

  const voices = globalThis.speechSynthesis.getVoices()
  if (!voices.length) return undefined

  const qualityHints = ['google', 'premium', 'enhanced', 'natural', 'female', 'linh', 'hoai']
  const vietnameseVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith('vi'))
  const candidates = vietnameseVoices.length ? vietnameseVoices : voices

  return candidates
    .map((voice) => {
      const searchable = `${voice.name} ${voice.lang}`.toLowerCase()
      const voiceLanguage = voice.lang.toLowerCase()
      const score =
        (voiceLanguage === 'vi-vn' ? 100 : 0) +
        (voiceLanguage.startsWith('vi') ? 60 : 0) +
        qualityHints.reduce((total, hint) => total + (searchable.includes(hint) ? 12 : 0), 0) +
        (voice.localService ? 4 : 0)
      return { voice, score }
    })
    .sort((left, right) => right.score - left.score)[0]?.voice
}

function speakWelcomeMessage() {
  if (!('speechSynthesis' in globalThis)) return

  globalThis.speechSynthesis.cancel()
  const utterance = new globalThis.SpeechSynthesisUtterance(welcomeMessage)
  const voice = chooseVietnameseVoice()
  utterance.lang = voice?.lang || 'vi-VN'
  utterance.rate = 1.02
  utterance.pitch = 1.05
  utterance.volume = 0.95
  if (voice) utterance.voice = voice
  globalThis.speechSynthesis.speak(utterance)
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Không thể tải logo cho mã QR.'))
    image.src = source
  })
}

async function drawLogoOnQrCode(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d')
  if (!context) return

  const logo = await loadImage(logoUrl)
  const center = canvas.width / 2
  const plateSize = canvas.width * 0.24
  const logoSize = canvas.width * 0.19

  context.save()
  context.shadowColor = 'rgb(16 26 52 / 0.2)'
  context.shadowBlur = canvas.width * 0.025
  context.beginPath()
  context.arc(center, center, plateSize / 2, 0, Math.PI * 2)
  context.fillStyle = '#ffffff'
  context.fill()
  context.shadowColor = 'transparent'
  context.lineWidth = canvas.width * 0.008
  context.strokeStyle = '#dce7ff'
  context.stroke()

  context.beginPath()
  context.arc(center, center, logoSize / 2, 0, Math.PI * 2)
  context.clip()
  context.drawImage(logo, center - logoSize / 2, center - logoSize / 2, logoSize, logoSize)
  context.restore()
}

async function createAccessQrCode() {
  const configuredUrl = import.meta.env.VITE_PUBLIC_APP_URL?.trim()
  const currentUrl = new URL(globalThis.location.href)
  currentUrl.hash = ''
  accessUrl.value = configuredUrl || currentUrl.toString()

  await nextTick()
  if (!qrCanvas.value) return

  try {
    await QRCode.toCanvas(qrCanvas.value, accessUrl.value, {
      width: 280,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#101a34',
        light: '#ffffff',
      },
    })
    await drawLogoOnQrCode(qrCanvas.value)
  } catch (error) {
    console.error(error)
    qrError.value = 'Không thể tạo mã QR lúc này.'
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => {
  previousBodyOverflow = globalThis.document.body.style.overflow
  globalThis.document.body.style.overflow = 'hidden'
  globalThis.addEventListener('keydown', handleKeydown)
  clockTimer = globalThis.setInterval(() => {
    now.value = new Date()
  }, 1_000)
  speakWelcomeMessage()
  speechTimer = globalThis.setInterval(speakWelcomeMessage, 10_000)
  void createAccessQrCode()
  void nextTick(() => lockScreen.value?.focus())
})

onBeforeUnmount(() => {
  globalThis.document.body.style.overflow = previousBodyOverflow
  globalThis.removeEventListener('keydown', handleKeydown)
  if (clockTimer) globalThis.clearInterval(clockTimer)
  if (speechTimer) globalThis.clearInterval(speechTimer)
  if ('speechSynthesis' in globalThis) globalThis.speechSynthesis.cancel()
})
</script>

<template>
  <Teleport to="body">
    <section
      ref="lockScreen"
      class="smart-lock-screen fixed inset-0 z-[120] isolate flex min-h-dvh flex-col overflow-hidden text-white outline-none"
      :style="{
        '--lock-bg-desktop': `url(${lockBgDesktopUrl})`,
        '--lock-bg-mobile': `url(${lockBgMobileUrl})`,
      }"
      role="dialog"
      aria-modal="true"
      aria-labelledby="smart-lock-title"
      tabindex="-1"
    >
      <div class="lock-bg-layer pointer-events-none absolute inset-0" />
      <div class="smart-grid-plane pointer-events-none absolute inset-0" />
      <div class="smart-scan-beam pointer-events-none absolute inset-y-0 w-1/3" />

      <header
        class="relative z-20 flex items-center justify-between gap-4 border-b border-white/45 bg-white/42 px-5 py-4 text-ink-950 shadow-[0_18px_60px_-45px_rgba(24,32,51,.45)] backdrop-blur-xl sm:px-8 lg:px-12"
      >
        <div class="flex min-w-0 items-center gap-3">
          <span
            class="grid size-[61.6px] shrink-0 place-items-center overflow-hidden rounded-[22px] border border-white/15 bg-white shadow-lg"
          >
            <img :src="logoUrl" alt="" class="h-full w-full object-contain" />
          </span>
          <div class="min-w-0">
            <p class="truncate text-sm font-black tracking-[0.06em]">
              THƯ VIỆN SỐ TRƯỜNG TH BÙI THỊ XUÂN
            </p>
            <p
              class="mt-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-blue-700/65"
            >
              <Wifi :size="11" />
              AI gateway online
            </p>
          </div>
        </div>

        <div class="hidden text-right md:block">
          <p class="font-mono text-2xl font-light tracking-[0.08em]">{{ formattedTime }}</p>
          <p class="mt-1 text-[10px] capitalize tracking-[0.08em] text-ink-800/55">
            {{ formattedDate }}
          </p>
        </div>

        <button
          type="button"
          class="focus-ring group inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-red-500 px-3.5 text-xs font-bold text-white shadow-lg shadow-red-500/20 transition hover:-translate-y-0.5 hover:bg-red-600"
          aria-label="Mở thư viện"
          @click="emit('close')"
        >
          <Unlock :size="16" />
          <span class="hidden sm:inline">Mở thư viện</span>
        </button>
      </header>

      <main
        class="relative z-10 mx-auto grid w-full max-w-[1500px] flex-1 items-center gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_auto] lg:gap-16 lg:px-14 lg:py-12"
      >
        <div class="welcome-panel relative max-w-4xl">
          <div class="ai-core-wrap pointer-events-none absolute -left-16 -top-28 opacity-40">
            <span class="ai-core-ring ai-core-ring-one absolute inset-0 rounded-full" />
            <span class="ai-core-ring ai-core-ring-two absolute inset-7 rounded-full" />
            <span
              class="ai-core relative grid size-52 place-items-center rounded-full border border-blue-300/20 bg-white/15 text-blue-600"
            >
              <BrainCircuit :size="96" :stroke-width="0.8" />
            </span>
          </div>

          <div
            class="relative mb-6 inline-flex items-center gap-2 rounded-full border border-red-100 bg-white/70 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-red-500 shadow-sm backdrop-blur-xl"
          >
            <Sparkles :size="14" />
            Digital knowledge portal
          </div>

          <h1
            id="smart-lock-title"
            class="relative max-w-4xl text-[clamp(1.95rem,3.8vw,4.25rem)] font-black uppercase leading-[1.14] tracking-[-0.025em] text-ink-950 [text-wrap:balance]"
          >
            {{ welcomeMessage }}
          </h1>

          <div class="relative mt-9 flex flex-wrap gap-3">
            <span
              class="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-white/72 px-4 py-3 text-xs font-bold text-ink-800 shadow-sm backdrop-blur-xl"
            >
              <LibraryBig :size="16" class="text-red-300" />
              {{ digitalBooks.length }} tài liệu đã số hoá
            </span>
            <span
              class="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-white/72 px-4 py-3 text-xs font-bold text-ink-800 shadow-sm backdrop-blur-xl"
            >
              <ShieldCheck :size="16" class="text-emerald-300" />
              Truy cập an toàn
            </span>
          </div>
        </div>

        <aside
          class="qr-panel relative mx-auto w-full max-w-sm overflow-hidden rounded-[30px] border border-white/80 bg-white/82 p-5 text-ink-950 shadow-[0_34px_100px_-45px_rgba(24,32,51,.45)] backdrop-blur-2xl sm:p-6 lg:w-[360px]"
          aria-label="Mã QR truy cập thư viện"
        >
          <div class="storybook-3d storybook-3d--qr pointer-events-none relative" aria-hidden="true">
            <div class="storybook-3d__shadow" />
            <div class="storybook-3d__scene">
              <div class="storybook-3d__book">
                <span class="storybook-3d__cover storybook-3d__cover--left">
                  <span class="storybook-3d__lines" />
                </span>
                <span class="storybook-3d__cover storybook-3d__cover--right">
                  <span class="storybook-3d__star" />
                  <span class="storybook-3d__title">Thư viện số</span>
                </span>
                <span class="storybook-3d__pages storybook-3d__pages--left" />
                <span class="storybook-3d__pages storybook-3d__pages--right" />
                <span class="storybook-3d__spine" />
              </div>
            </div>
          </div>

          <div class="relative flex items-center justify-between gap-3">
            <div>
              <p class="text-[10px] font-black uppercase tracking-[0.18em] text-red-500/75">
                Scan to connect
              </p>
              <h2 class="mt-2 text-2xl font-black tracking-[-0.04em]">Khám phá nhiều hơn</h2>
            </div>
            <span
              class="grid size-11 shrink-0 place-items-center rounded-2xl border border-red-100 bg-red-50 text-red-500"
            >
              <QrCode :size="22" />
            </span>
          </div>

          <div
            class="qr-frame relative mt-6 overflow-hidden rounded-[24px] bg-white p-3 shadow-2xl"
          >
            <canvas
              ref="qrCanvas"
              class="mx-auto block h-auto w-full rounded-[14px]"
              aria-label="Quét mã QR để truy cập thư viện số"
            />
            <span class="qr-corner qr-corner-tl" />
            <span class="qr-corner qr-corner-tr" />
            <span class="qr-corner qr-corner-bl" />
            <span class="qr-corner qr-corner-br" />
            <span class="qr-scan-line pointer-events-none absolute inset-x-4 h-px" />
          </div>

          <p v-if="qrError" class="mt-4 text-center text-xs font-semibold text-red-300">
            {{ qrError }}
          </p>
          <div v-else class="mt-4 flex items-center justify-center gap-2 text-center">
            <span class="size-1.5 animate-pulse rounded-full bg-emerald-400" />
            <p class="max-w-[260px] truncate font-mono text-[10px] text-ink-800/45">
              {{ displayUrl }}
            </p>
          </div>
          <p class="mt-3 text-center text-[11px] leading-5 text-ink-800/55">
            Dùng camera điện thoại để quét và truy cập hệ thống
          </p>
        </aside>
      </main>

      <footer
        class="relative z-20 flex items-center justify-between border-t border-white/45 bg-white/36 px-5 py-3 text-[9px] font-bold uppercase tracking-[0.16em] text-ink-800/45 backdrop-blur-xl sm:px-8 lg:px-12"
      >
        <span>TRƯỜNG TH BÙI THỊ XUÂN</span>
        <span class="hidden sm:inline">ESC để quay lại thư viện</span>
      </footer>
    </section>
  </Teleport>
</template>

<style scoped>
.smart-lock-screen {
  background:
    linear-gradient(180deg, rgb(72 191 244 / 0.32), rgb(255 255 255 / 0.16) 42%),
    var(--lock-bg-mobile) center center / cover no-repeat,
    linear-gradient(180deg, #48bff4 0%, #c8f1ff 42%, #ddf6a1 100%);
  animation: smart-lock-enter 650ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.smart-lock-screen::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgb(255 255 255 / 0.42), transparent 38%, rgb(255 255 255 / 0.2)),
    linear-gradient(180deg, rgb(255 255 255 / 0.08), rgb(255 249 243 / 0.24));
  content: '';
}

.lock-bg-layer {
  background:
    repeating-linear-gradient(90deg, transparent 0 34px, rgb(255 255 255 / 0.18) 35px 36px),
    repeating-linear-gradient(0deg, transparent 0 34px, rgb(255 255 255 / 0.12) 35px 36px);
  mask-image: linear-gradient(to bottom, transparent, black 18%, black 82%, transparent);
  opacity: 0.32;
}

.smart-grid-plane {
  inset: auto -18% -42%;
  height: 44%;
  background-image:
    linear-gradient(rgb(223 33 51 / 0.14) 1px, transparent 1px),
    linear-gradient(90deg, rgb(49 95 215 / 0.13) 1px, transparent 1px);
  background-size: 62px 62px;
  mask-image: linear-gradient(to top, black 18%, transparent 86%);
  perspective: 600px;
  transform: perspective(520px) rotateX(58deg) scale(1.4);
  transform-origin: center bottom;
  animation: smart-grid-flow 18s linear infinite;
}

.smart-scan-beam {
  left: -40%;
  background: linear-gradient(
    90deg,
    transparent,
    rgb(255 255 255 / 0.08),
    rgb(255 255 255 / 0.3),
    transparent
  );
  filter: blur(10px);
  transform: skewX(-18deg);
  animation: smart-beam-sweep 10s ease-in-out infinite;
}

.welcome-panel {
  border: 1px solid rgb(255 255 255 / 0.76);
  border-radius: 34px;
  background: linear-gradient(135deg, rgb(255 255 255 / 0.82), rgb(255 255 255 / 0.56));
  box-shadow: 0 34px 100px -58px rgb(24 32 51 / 0.55);
  padding: clamp(1.35rem, 3vw, 2.4rem);
  backdrop-filter: blur(22px);
}

.storybook-3d {
  right: clamp(23rem, 31vw, 36rem);
  bottom: clamp(3.2rem, 10vw, 7rem);
  z-index: 1;
  width: clamp(180px, 20vw, 310px);
  height: clamp(130px, 15vw, 220px);
  opacity: 0.9;
  perspective: 900px;
}

.storybook-3d.storybook-3d--qr {
  right: auto;
  bottom: auto;
  z-index: 1;
  width: min(230px, 74%);
  height: 150px;
  margin: -0.25rem auto 0.85rem;
  opacity: 1;
}

.storybook-3d__scene {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  animation: storybook-float 5.8s ease-in-out infinite;
}

.storybook-3d__book {
  position: absolute;
  inset: 14% 8% 18%;
  transform: rotateX(62deg) rotateZ(-10deg);
  transform-style: preserve-3d;
}

.storybook-3d__cover,
.storybook-3d__pages,
.storybook-3d__spine {
  position: absolute;
  top: 0;
  height: 100%;
  transform-style: preserve-3d;
  box-shadow: 0 22px 42px -34px rgb(24 32 51 / 0.65);
}

.storybook-3d__cover {
  width: 48%;
  border: 2px solid rgb(255 255 255 / 0.76);
}

.storybook-3d__cover--left {
  left: 3%;
  border-radius: 18px 8px 8px 18px;
  background:
    linear-gradient(120deg, rgb(255 255 255 / 0.5), transparent 28%),
    linear-gradient(145deg, #4ca0cc, #315fd7 72%);
  transform: rotateY(24deg);
  transform-origin: right center;
  animation: left-cover-breathe 4.6s ease-in-out infinite;
}

.storybook-3d__cover--right {
  right: 3%;
  border-radius: 8px 18px 18px 8px;
  background:
    linear-gradient(120deg, rgb(255 255 255 / 0.52), transparent 32%),
    linear-gradient(145deg, #ff7b4a, #df2133 74%);
  transform: rotateY(-24deg);
  transform-origin: left center;
  animation: right-cover-breathe 4.6s ease-in-out infinite;
}

.storybook-3d__pages {
  z-index: -1;
  width: 43%;
  border-radius: 14px 7px 7px 14px;
  background:
    repeating-linear-gradient(180deg, #fff9ec 0 7px, #ead8b7 8px 9px),
    linear-gradient(90deg, #fffaf0, #f2d9a9);
}

.storybook-3d__pages--left {
  left: 6%;
  transform: translateZ(-15px) rotateY(20deg);
  transform-origin: right center;
}

.storybook-3d__pages--right {
  right: 6%;
  transform: translateZ(-15px) rotateY(-20deg);
  transform-origin: left center;
}

.storybook-3d__spine {
  left: 48%;
  width: 4.8%;
  border-radius: 999px;
  background: linear-gradient(180deg, #fff1f2, #fb7185 45%, #315fd7);
  transform: translateZ(10px);
}

.storybook-3d__shadow {
  position: absolute;
  left: 18%;
  right: 14%;
  bottom: 2%;
  height: 18%;
  border-radius: 50%;
  background: rgb(24 32 51 / 0.22);
  filter: blur(18px);
  animation: storybook-shadow 5.8s ease-in-out infinite;
}

.storybook-3d__title {
  position: absolute;
  right: 12%;
  bottom: 16%;
  max-width: 74%;
  color: white;
  font-size: clamp(0.62rem, 1.1vw, 0.95rem);
  font-weight: 900;
  line-height: 1.05;
  text-align: right;
  text-transform: uppercase;
}

.storybook-3d__star {
  position: absolute;
  top: 20%;
  left: 18%;
  width: 22%;
  aspect-ratio: 1;
  background: #ffc94a;
  clip-path: polygon(
    50% 0,
    62% 34%,
    98% 35%,
    69% 56%,
    79% 91%,
    50% 70%,
    21% 91%,
    31% 56%,
    2% 35%,
    38% 34%
  );
  filter: drop-shadow(0 6px 5px rgb(24 32 51 / 0.18));
}

.storybook-3d__lines {
  position: absolute;
  inset: 22% 16% auto;
  height: 44%;
  border-radius: 12px;
  background: repeating-linear-gradient(
    180deg,
    rgb(255 255 255 / 0.84) 0 7px,
    transparent 8px 18px
  );
}

.ai-core-wrap {
  width: 13rem;
  height: 13rem;
}

.ai-core {
  box-shadow:
    inset 0 0 45px rgb(62 111 244 / 0.08),
    0 0 80px rgb(255 255 255 / 0.24);
  animation: ai-core-float 5.5s ease-in-out infinite;
}

.ai-core-ring {
  border: 1px dashed rgb(128 165 255 / 0.24);
}

.ai-core-ring-one {
  animation: ai-ring-spin 16s linear infinite;
}

.ai-core-ring-two {
  animation: ai-ring-spin 10s linear infinite reverse;
}

.qr-panel::after {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.12);
  content: '';
  pointer-events: none;
}

.qr-frame {
  box-shadow:
    0 24px 70px -28px rgb(0 0 0 / 0.8),
    0 0 0 1px rgb(255 255 255 / 0.8);
}

.qr-corner {
  position: absolute;
  width: 1.25rem;
  height: 1.25rem;
  border-color: #3e6ff4;
}

.qr-corner-tl {
  left: 0.55rem;
  top: 0.55rem;
  border-left-width: 3px;
  border-top-width: 3px;
}

.qr-corner-tr {
  right: 0.55rem;
  top: 0.55rem;
  border-right-width: 3px;
  border-top-width: 3px;
}

.qr-corner-bl {
  bottom: 0.55rem;
  left: 0.55rem;
  border-bottom-width: 3px;
  border-left-width: 3px;
}

.qr-corner-br {
  right: 0.55rem;
  bottom: 0.55rem;
  border-right-width: 3px;
  border-bottom-width: 3px;
}

.qr-scan-line {
  top: 1rem;
  background: linear-gradient(90deg, transparent, #3e6ff4, transparent);
  box-shadow: 0 0 12px rgb(62 111 244 / 0.65);
  opacity: 0.28;
  animation: qr-scan 3.2s ease-in-out infinite;
}

@keyframes smart-grid-flow {
  to {
    background-position: 0 108px;
  }
}

@keyframes smart-lock-enter {
  from {
    opacity: 0;
    transform: scale(1.025);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes smart-beam-sweep {
  0%,
  16% {
    left: -45%;
  }
  72%,
  100% {
    left: 120%;
  }
}

@keyframes storybook-float {
  0%,
  100% {
    transform: translateY(0) rotate(-1.5deg);
  }
  50% {
    transform: translateY(-16px) rotate(2deg);
  }
}

@keyframes storybook-shadow {
  0%,
  100% {
    opacity: 0.28;
    transform: scaleX(0.92);
  }
  50% {
    opacity: 0.18;
    transform: scaleX(1.06);
  }
}

@keyframes left-cover-breathe {
  0%,
  100% {
    transform: rotateY(24deg);
  }
  50% {
    transform: rotateY(31deg);
  }
}

@keyframes right-cover-breathe {
  0%,
  100% {
    transform: rotateY(-24deg);
  }
  50% {
    transform: rotateY(-31deg);
  }
}

@keyframes ai-core-float {
  0%,
  100% {
    transform: translateY(0) rotate(-2deg);
  }
  50% {
    transform: translateY(-12px) rotate(2deg);
  }
}

@keyframes ai-ring-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes qr-scan {
  0%,
  100% {
    top: 1rem;
  }
  50% {
    top: calc(100% - 1rem);
  }
}

@media (min-width: 768px) {
  .smart-lock-screen {
    background:
      linear-gradient(180deg, rgb(72 191 244 / 0.24), rgb(255 255 255 / 0.12) 44%),
      var(--lock-bg-desktop) center top / cover no-repeat,
      linear-gradient(180deg, #48bff4 0%, #c8f1ff 42%, #ddf6a1 100%);
  }
}

@media (max-width: 1100px) {
  .storybook-3d {
    right: 3%;
    bottom: 18%;
    width: clamp(150px, 26vw, 220px);
    height: clamp(108px, 19vw, 160px);
    opacity: 0.52;
  }
}

@media (max-width: 767px) {
  .welcome-panel {
    padding: 1.15rem;
    border-radius: 24px;
  }

  .ai-core-wrap {
    display: none;
  }

  .storybook-3d {
    right: -1.5rem;
    bottom: 28%;
    width: 150px;
    height: 110px;
    opacity: 0.42;
  }

  .storybook-3d.storybook-3d--qr {
    right: auto;
    bottom: auto;
    width: min(170px, 68%);
    height: 112px;
    margin: -0.15rem auto 0.45rem;
    opacity: 1;
  }
}

@media (max-height: 760px) and (min-width: 1024px) {
  .qr-panel {
    transform: scale(0.88);
  }
}
</style>
