<script setup lang="ts">
import {
  ArrowRight,
  BookOpen,
  LibraryBig,
  QrCode,
  ShieldCheck,
  Sparkles,
  Unlock,
  Wifi,
} from '@lucide/vue'
import QRCode from 'qrcode'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

import lockBgDesktopUrl from '@/assets/images/backgrounds/bg-desktop-clean.png'
import lockBgMobileUrl from '@/assets/images/backgrounds/bg-mobile.png'
import heroStudentsUrl from '@/assets/images/lock-hero-students.png'
import schoolUrl from '@/assets/thu-vien-so-assets-exact-look/objects/object-school.svg'
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
  'Chào mừng bạn đến với thư viện số. Hãy quét mã QR hoặc nhấn Mở thư viện để bắt đầu khám phá.'

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
      class="smart-lock-screen fixed inset-0 z-[120] isolate flex min-h-dvh flex-col overflow-hidden outline-none"
      :style="{
        '--lock-bg-desktop': `url(${lockBgDesktopUrl})`,
        '--lock-bg-mobile': `url(${lockBgMobileUrl})`,
        '--hero-students': `url(${heroStudentsUrl})`,
      }"
      role="dialog"
      aria-modal="true"
      aria-labelledby="smart-lock-title"
      tabindex="-1"
    >
      <div class="lock-bg-layer pointer-events-none absolute inset-0" />

      <header
        class="lock-header relative z-20 flex items-center justify-between gap-4 px-5 sm:px-8 lg:px-12"
      >
        <div class="flex min-w-0 items-center gap-3.5">
          <span
            class="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white"
          >
            <img :src="logoUrl" alt="" class="h-full w-full object-contain" />
          </span>
          <div class="min-w-0">
            <p class="truncate text-[13px] font-black tracking-[-0.01em] text-ink-950 sm:text-sm">
              Thư viện số · Trường TH Bùi Thị Xuân
            </p>
            <p
              class="mt-1.5 flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.15em] text-blue-600"
            >
              <Wifi :size="11" /> Hệ thống đang trực tuyến
            </p>
          </div>
        </div>

        <div class="absolute left-1/2 hidden -translate-x-1/2 text-center md:block">
          <p class="font-mono text-[27px] font-black leading-none tracking-[0.05em] text-ink-950">
            {{ formattedTime }}
          </p>
          <p class="mt-2 text-[10px] font-semibold capitalize tracking-[0.04em] text-slate-500">
            {{ formattedDate }}
          </p>
        </div>

        <button
          type="button"
          class="unlock-button focus-ring group inline-flex shrink-0 items-center gap-2 text-xs font-extrabold text-white transition hover:-translate-y-0.5"
          aria-label="Mở thư viện"
          @click="emit('close')"
        >
          <Unlock :size="16" />
          <span class="hidden sm:inline">Mở thư viện</span>
          <ArrowRight
            :size="15"
            class="hidden transition-transform group-hover:translate-x-0.5 sm:block"
          />
        </button>
      </header>

      <main
        class="lock-main relative z-10 mx-auto grid w-full max-w-[1460px] flex-1 gap-5 px-4 py-5 sm:px-7 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-10 lg:px-12 lg:py-10"
      >
        <section
          class="welcome-panel relative overflow-hidden"
          aria-label="Chào mừng đến thư viện số"
        >
          <span class="hero-sparkle hero-sparkle--one" aria-hidden="true">✦</span>
          <span class="hero-sparkle hero-sparkle--two" aria-hidden="true">✦</span>
          <span class="hero-paper-plane" aria-hidden="true">➤</span>

          <div
            class="knowledge-badge relative inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.1em]"
          >
            <Sparkles :size="14" fill="currentColor" /> Không gian tri thức số
          </div>

          <h1
            id="smart-lock-title"
            class="hero-title relative mt-5 max-w-[700px] font-black leading-[0.98] tracking-[-0.06em] [text-wrap:balance]"
          >
            <span class="hero-title-blue">Tri thức mở</span><br />
            <span class="hero-title-coral">Chạm</span>
            <span class="hero-title-ink">để khám phá!</span>
          </h1>

          <p
            class="hero-copy relative mt-6 max-w-[480px] text-sm font-semibold leading-6 text-ink-800 sm:text-base"
          >
            Kho học liệu trực quan dành cho giáo viên và học sinh.<br />
            Mở thư viện ngay trên màn hình này<br />
            hoặc quét mã để tiếp tục trên điện thoại.
          </p>

          <div class="storybook-3d hero-book pointer-events-none absolute" aria-hidden="true">
            <div class="storybook-3d__shadow" />
            <div class="storybook-3d__scene">
              <div class="storybook-3d__book">
                <span class="storybook-3d__pages storybook-3d__pages--left" />
                <span class="storybook-3d__pages storybook-3d__pages--right" />
                <span class="storybook-3d__cover storybook-3d__cover--left"
                  ><span class="storybook-3d__lines"
                /></span>
                <span class="storybook-3d__cover storybook-3d__cover--right"
                  ><span class="storybook-3d__star" /><span class="storybook-3d__title"
                    >Thư viện<br />số</span
                  ></span
                >
                <span class="storybook-3d__spine" />
                <span class="storybook-3d__bookmark" />
              </div>
            </div>
          </div>

          <button
            type="button"
            class="hero-cta focus-ring group absolute z-10 inline-flex items-center gap-3 text-sm font-black text-white transition hover:-translate-y-1"
            @click="emit('close')"
          >
            <BookOpen :size="19" /> Bắt đầu khám phá
            <ArrowRight :size="17" class="transition-transform group-hover:translate-x-1" />
          </button>

          <div class="hero-stats absolute inset-x-0 bottom-0 z-10 grid grid-cols-2 gap-4">
            <div class="hero-stat-card flex items-center gap-3">
              <span class="hero-stat-icon hero-stat-icon--purple"><LibraryBig :size="22" /></span>
              <span
                ><strong class="block text-xs font-black sm:text-sm"
                  >{{ digitalBooks.length }} tài liệu đã số hóa</strong
                ><small class="mt-1 block text-[10px] font-semibold text-slate-500 sm:text-[11px]"
                  >Sách, video, audio, bài giảng...</small
                ></span
              >
            </div>
            <div class="hero-stat-card flex items-center gap-3">
              <span class="hero-stat-icon hero-stat-icon--green"><ShieldCheck :size="24" /></span>
              <span
                ><strong class="block text-xs font-black sm:text-sm"
                  >An toàn &amp; thân thiện</strong
                ><small class="mt-1 block text-[10px] font-semibold text-slate-500 sm:text-[11px]"
                  >Nội dung chọn lọc, phù hợp lứa tuổi</small
                ></span
              >
            </div>
          </div>
        </section>

        <aside
          class="qr-panel relative mx-auto w-full max-w-[420px] overflow-hidden rounded-[38px] p-5 text-ink-950 sm:p-6"
          aria-label="Mã QR truy cập thư viện"
        >
          <div class="connect-card relative flex items-center justify-between gap-4">
            <span class="connect-ribbon absolute">Quét để kết nối</span>
            <h2 class="text-[27px] font-black leading-[1.08] tracking-[-0.045em]">
              Mang thư viện<br /><span>theo bạn</span>
            </h2>
            <div class="closed-book" aria-hidden="true">
              <span class="closed-book__blue" /><span class="closed-book__red"
                >THƯ<br />VIỆN<br />SỐ</span
              >
            </div>
          </div>

          <div
            class="qr-frame relative mx-auto mt-5 grid aspect-square w-full max-w-[300px] place-items-center overflow-hidden rounded-[24px] bg-white p-3"
          >
            <canvas
              ref="qrCanvas"
              class="block aspect-square h-auto w-full rounded-[14px] object-contain"
              aria-label="Quét mã QR để truy cập thư viện số"
            />
            <span class="qr-corner qr-corner-tl" /><span class="qr-corner qr-corner-tr" /><span
              class="qr-corner qr-corner-bl"
            /><span class="qr-corner qr-corner-br" />
            <span class="qr-scan-line pointer-events-none absolute inset-x-4 h-px" />
          </div>

          <p v-if="qrError" class="mt-3 text-center text-xs font-semibold text-red-500">
            {{ qrError }}
          </p>
          <div
            v-else
            class="url-chip mx-auto mt-3 flex w-fit items-center justify-center gap-2 text-center"
          >
            <span class="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            <p class="max-w-[260px] truncate font-mono text-[10px] font-bold text-emerald-700/55">
              {{ displayUrl }}
            </p>
          </div>

          <div
            class="scan-help mx-auto mt-3 flex items-center justify-center gap-3 text-left text-xs font-semibold leading-4 text-ink-800"
          >
            <span class="scan-help__icon"><QrCode :size="22" /></span>
            <span>Mở camera điện thoại<br />và hướng vào mã QR</span>
          </div>
          <img :src="schoolUrl" alt="" class="school-illustration pointer-events-none absolute" />
        </aside>
      </main>

      <footer
        class="lock-footer relative z-20 flex items-center justify-between px-5 text-[9px] font-extrabold uppercase tracking-[0.08em] text-ink-800/55 sm:px-8 lg:px-12"
      >
        <span class="hidden sm:inline" />
        <span>© 2026 Trường TH Bùi Thị Xuân 🤍</span>
        <span class="hidden text-emerald-600 sm:inline">● &nbsp; Nhấn ESC để đóng màn hình 🍃</span>
      </footer>
    </section>
  </Teleport>
</template>

<style scoped>
.smart-lock-screen {
  background:
    linear-gradient(
      120deg,
      rgb(242 249 255 / 0.76),
      rgb(255 255 255 / 0.18) 48%,
      rgb(255 248 245 / 0.5)
    ),
    var(--lock-bg-mobile) center center / cover no-repeat,
    linear-gradient(180deg, #48bff4 0%, #c8f1ff 42%, #ddf6a1 100%);
  color: #182033;
  animation: smart-lock-enter 560ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.smart-lock-screen::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgb(255 255 255 / 0.5), transparent 34%, rgb(255 255 255 / 0.12)),
    linear-gradient(180deg, rgb(255 255 255 / 0.08), rgb(255 249 243 / 0.16));
  content: '';
}

.lock-bg-layer {
  background:
    linear-gradient(rgb(255 255 255 / 0.16) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 0.16) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(circle at 55% 50%, black, transparent 76%);
  opacity: 0.42;
}

.lock-orb {
  border-radius: 50%;
  filter: blur(2px);
  opacity: 0.65;
}

.lock-orb--one {
  top: 18%;
  right: 13%;
  width: 24rem;
  height: 24rem;
  background: radial-gradient(circle, rgb(96 165 250 / 0.2), transparent 68%);
  animation: orb-drift 9s ease-in-out infinite;
}

.lock-orb--two {
  bottom: -9rem;
  left: 20%;
  width: 28rem;
  height: 28rem;
  background: radial-gradient(circle, rgb(255 255 255 / 0.62), transparent 68%);
  animation: orb-drift 11s ease-in-out infinite reverse;
}

.lock-header {
  min-height: 84px;
  border-bottom: 1px solid rgb(255 255 255 / 0.68);
  background: rgb(255 255 255 / 0.48);
  box-shadow: 0 18px 55px -46px rgb(24 32 51 / 0.48);
  backdrop-filter: blur(24px) saturate(135%);
}

.lock-footer {
  min-height: 38px;
  border-top: 1px solid rgb(255 255 255 / 0.58);
  background: rgb(255 255 255 / 0.28);
  backdrop-filter: blur(18px);
}

.welcome-panel {
  border: 1px solid rgb(255 255 255 / 0.82);
  border-radius: 36px;
  background: linear-gradient(135deg, rgb(255 255 255 / 0.88), rgb(255 255 255 / 0.64));
  box-shadow:
    0 36px 100px -58px rgb(24 32 51 / 0.55),
    inset 0 1px 0 rgb(255 255 255 / 0.88);
  padding: clamp(1.6rem, 3.7vw, 3.75rem);
  backdrop-filter: blur(24px) saturate(130%);
}

.welcome-panel__glow {
  background: radial-gradient(circle, rgb(96 165 250 / 0.17), transparent 67%);
}

.welcome-title-accent {
  background: linear-gradient(110deg, #df2133 4%, #f0525f 48%, #315fd7 112%);
  background-clip: text;
  color: transparent;
}

.qr-panel {
  border: 1px solid rgb(255 255 255 / 0.86);
  background: linear-gradient(160deg, rgb(255 255 255 / 0.94), rgb(248 251 255 / 0.8));
  box-shadow:
    0 36px 100px -52px rgb(24 32 51 / 0.62),
    inset 0 1px 0 white;
  backdrop-filter: blur(28px) saturate(135%);
}

.qr-panel::before {
  position: absolute;
  top: -9rem;
  right: -7rem;
  width: 20rem;
  height: 20rem;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(223 33 51 / 0.08), transparent 68%);
  content: '';
  pointer-events: none;
}

.storybook-3d {
  width: 142px;
  height: 132px;
  flex: 0 0 142px;
  perspective: 950px;
}

.storybook-3d__scene {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  animation: storybook-float 5.4s ease-in-out infinite;
}

.storybook-3d__book {
  position: absolute;
  inset: 4% 3% 10%;
  transform: rotateX(-7deg) rotateY(-2deg) rotateZ(-1deg);
  transform-style: preserve-3d;
}

.storybook-3d__cover,
.storybook-3d__pages,
.storybook-3d__spine {
  position: absolute;
  top: 0;
  height: 100%;
  transform-style: preserve-3d;
}

.storybook-3d__cover {
  z-index: 2;
  width: 49%;
  border: 1px solid rgb(255 255 255 / 0.72);
  box-shadow: 0 18px 30px -20px rgb(24 32 51 / 0.7);
  backface-visibility: hidden;
}

.storybook-3d__cover--left {
  left: 1.5%;
  border-radius: 12px 4px 4px 12px;
  background:
    linear-gradient(125deg, rgb(255 255 255 / 0.42), transparent 30%),
    linear-gradient(145deg, #4c9ee8, #315fd7 74%);
  transform: rotateY(18deg) translateZ(7px);
  transform-origin: right center;
  animation: left-cover-breathe 4.8s ease-in-out infinite;
}

.storybook-3d__cover--right {
  right: 1.5%;
  border-radius: 4px 12px 12px 4px;
  background:
    linear-gradient(125deg, rgb(255 255 255 / 0.45), transparent 30%),
    linear-gradient(145deg, #ff625e, #df2133 72%);
  transform: rotateY(-18deg) translateZ(7px);
  transform-origin: left center;
  animation: right-cover-breathe 4.8s ease-in-out infinite;
}

.storybook-3d__pages {
  z-index: 1;
  top: 3%;
  height: 94%;
  width: 46%;
  border: 1px solid rgb(209 179 124 / 0.35);
  background:
    repeating-linear-gradient(180deg, #fff9ec 0 5px, #ead8b7 6px 7px),
    linear-gradient(90deg, #fffaf0, #f2d9a9);
}

.storybook-3d__pages--left {
  left: 4%;
  border-radius: 10px 3px 3px 10px;
  transform: translateZ(-2px) rotateY(15deg);
  transform-origin: right center;
}

.storybook-3d__pages--right {
  right: 4%;
  border-radius: 3px 10px 10px 3px;
  transform: translateZ(-2px) rotateY(-15deg);
  transform-origin: left center;
}

.storybook-3d__spine {
  z-index: 4;
  left: 48.4%;
  width: 3.4%;
  border-radius: 999px;
  background: linear-gradient(180deg, #fff7ed, #ffc94a 45%, #d78720);
  box-shadow: 0 0 9px rgb(24 32 51 / 0.22);
  transform: translateZ(13px);
}

.storybook-3d__bookmark {
  position: absolute;
  z-index: 5;
  top: 0;
  left: 51%;
  width: 7px;
  height: 80%;
  background: linear-gradient(180deg, #ffc94a, #f59e0b);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%);
  transform: translateZ(15px) rotate(2deg);
}

.storybook-3d__shadow {
  position: absolute;
  left: 13%;
  right: 10%;
  bottom: 0;
  height: 12%;
  border-radius: 50%;
  background: rgb(24 32 51 / 0.28);
  filter: blur(12px);
  animation: storybook-shadow 5.4s ease-in-out infinite;
}

.storybook-3d__title {
  position: absolute;
  right: 12%;
  bottom: 14%;
  max-width: 76%;
  color: white;
  font-size: 0.56rem;
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: 0.01em;
  text-align: right;
  text-transform: uppercase;
}

.storybook-3d__star {
  position: absolute;
  top: 18%;
  left: 18%;
  width: 24%;
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
  filter: drop-shadow(0 4px 4px rgb(24 32 51 / 0.18));
}

.storybook-3d__lines {
  position: absolute;
  inset: 25% 18% auto;
  height: 42%;
  border-radius: 8px;
  background: repeating-linear-gradient(
    180deg,
    rgb(255 255 255 / 0.86) 0 4px,
    transparent 5px 12px
  );
}

.qr-panel::after {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.8);
  content: '';
  pointer-events: none;
}

.qr-frame {
  box-shadow:
    0 22px 54px -30px rgb(24 32 51 / 0.62),
    0 0 0 1px rgb(225 231 239 / 0.9);
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
  opacity: 0.25;
  animation: qr-scan 3.2s ease-in-out infinite;
}

@keyframes orb-drift {
  50% {
    transform: translate3d(1.5rem, -1.25rem, 0) scale(1.05);
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

@keyframes storybook-float {
  0%,
  100% {
    transform: translateY(0) rotate(-1deg);
  }
  50% {
    transform: translateY(-9px) rotate(1.2deg);
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
    transform: rotateY(18deg) translateZ(7px);
  }
  50% {
    transform: rotateY(24deg) translateZ(8px);
  }
}

@keyframes right-cover-breathe {
  0%,
  100% {
    transform: rotateY(-18deg) translateZ(7px);
  }
  50% {
    transform: rotateY(-24deg) translateZ(8px);
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
      linear-gradient(
        120deg,
        rgb(242 249 255 / 0.78),
        rgb(255 255 255 / 0.16) 48%,
        rgb(255 248 245 / 0.48)
      ),
      var(--lock-bg-desktop) center top / cover no-repeat,
      linear-gradient(180deg, #48bff4 0%, #c8f1ff 42%, #ddf6a1 100%);
  }
}

@media (max-width: 1023px) {
  .lock-main {
    align-content: start;
    overflow-y: auto;
  }

  .qr-panel {
    display: none;
  }
}

@media (max-width: 767px) {
  .lock-header {
    min-height: 76px;
  }

  .welcome-panel {
    padding: 1.35rem;
    border-radius: 26px;
  }
}

@media (max-height: 820px) and (min-width: 1024px) {
  .lock-header {
    min-height: 74px;
  }

  .lock-main {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }

  .welcome-panel {
    padding: 2rem 2.5rem;
  }

  .qr-panel {
    padding: 1.15rem;
  }

  .qr-frame {
    margin-top: 0.75rem;
  }

  .qr-frame canvas {
    max-width: 210px;
  }

  .storybook-3d {
    width: 116px;
    height: 106px;
    flex-basis: 116px;
  }
}

/* Reference-matched playful lock screen */
.smart-lock-screen {
  background:
    linear-gradient(180deg, rgb(193 232 255 / 0.18), rgb(255 255 255 / 0.02)),
    var(--lock-bg-mobile) center / cover no-repeat,
    #cbefff;
}

.smart-lock-screen::after {
  background: linear-gradient(180deg, rgb(255 255 255 / 0.08), transparent 42%);
}

.lock-bg-layer {
  background: radial-gradient(circle at 50% 20%, rgb(255 255 255 / 0.3), transparent 52%);
  opacity: 1;
}

.lock-header {
  min-height: 110px;
  border: 1px solid rgb(255 255 255 / 0.92);
  border-radius: 0 0 10px 10px;
  background: rgb(255 255 255 / 0.93);
  box-shadow: 0 10px 30px -22px rgb(37 84 145 / 0.35);
  backdrop-filter: blur(22px) saturate(135%);
}

.unlock-button {
  height: 62px;
  padding: 0 25px;
  border-radius: 999px;
  background: linear-gradient(135deg, #0b5fea, #2378ff);
  box-shadow: 0 16px 30px -14px rgb(25 105 241 / 0.65);
}

.lock-main {
  min-height: 0;
  align-items: stretch;
}

.welcome-panel {
  min-height: 0;
  border: 2px solid rgb(255 255 255 / 0.95);
  border-radius: 42px 110px 36px 36px;
  background:
    linear-gradient(
      90deg,
      rgb(239 249 255 / 0.94) 0%,
      rgb(239 249 255 / 0.66) 39%,
      transparent 62%
    ),
    var(--hero-students) center / cover no-repeat;
  box-shadow:
    0 28px 70px -38px rgb(38 91 146 / 0.42),
    inset 0 0 0 1px rgb(255 255 255 / 0.5);
  padding: clamp(2rem, 4vw, 3.6rem);
  padding-bottom: 130px;
  backdrop-filter: none;
}

.knowledge-badge {
  z-index: 4;
  border-radius: 999px;
  background: linear-gradient(135deg, #ffe78d, #ffc83d);
  box-shadow: 0 12px 22px -14px rgb(192 125 15 / 0.65);
  padding: 10px 17px;
  color: #e36f21;
}

.hero-title {
  z-index: 4;
  font-size: clamp(2.5rem, 4.25vw, 4.65rem);
  filter: drop-shadow(0 7px 0 rgb(255 255 255 / 0.92))
    drop-shadow(0 10px 7px rgb(49 103 174 / 0.18));
}

.hero-title-blue {
  background: linear-gradient(180deg, #68aeff, #2773e5 82%);
  background-clip: text;
  color: transparent;
  -webkit-text-stroke: 1px rgb(255 255 255 / 0.8);
}

.hero-title-coral {
  margin-right: 0.12em;
  background: linear-gradient(180deg, #ff794d, #f04420 82%);
  background-clip: text;
  color: transparent;
  -webkit-text-stroke: 1px rgb(255 255 255 / 0.8);
}

.hero-title-ink {
  color: #142240;
  -webkit-text-stroke: 1px rgb(255 255 255 / 0.76);
}

.hero-copy {
  z-index: 4;
  letter-spacing: -0.015em;
  text-shadow: 0 1px 4px rgb(255 255 255 / 0.95);
}

.hero-sparkle {
  position: absolute;
  z-index: 3;
  color: white;
  font-size: 2rem;
  filter: drop-shadow(0 4px 4px rgb(80 131 186 / 0.18));
  animation: sparkle-pulse 2.6s ease-in-out infinite;
}

.hero-sparkle--one {
  top: 8%;
  left: 58%;
}

.hero-sparkle--two {
  top: 34%;
  right: 5%;
  font-size: 1.2rem;
  animation-delay: -1.2s;
}

.hero-paper-plane {
  position: absolute;
  z-index: 3;
  top: 29%;
  left: 67%;
  color: #ffc334;
  font-size: 3rem;
  text-shadow: 0 5px 8px rgb(194 119 3 / 0.18);
  transform: rotate(-26deg);
}

.hero-book {
  top: 5%;
  right: 5%;
  z-index: 5;
  width: clamp(150px, 14vw, 205px);
  height: clamp(135px, 13vw, 185px);
  flex-basis: auto;
}

.hero-cta {
  left: 50%;
  bottom: 104px;
  min-width: 292px;
  height: 66px;
  justify-content: center;
  border: 2px solid rgb(255 255 255 / 0.72);
  border-radius: 999px;
  background: linear-gradient(135deg, #ff4e78, #ff6f86);
  box-shadow:
    0 18px 35px -14px rgb(244 56 101 / 0.68),
    inset 0 2px 0 rgb(255 255 255 / 0.3);
  transform: translateX(-50%);
}

.hero-cta:hover {
  transform: translateX(-50%) translateY(-4px);
}

.hero-stats {
  padding: 16px clamp(1rem, 5vw, 9rem) 22px;
  background: linear-gradient(
    180deg,
    transparent,
    rgb(255 241 222 / 0.78) 32%,
    rgb(255 236 215 / 0.92)
  );
}

.hero-stat-card {
  min-height: 78px;
  border: 1px solid rgb(255 255 255 / 0.86);
  border-radius: 28px;
  background: rgb(255 255 255 / 0.84);
  box-shadow: 0 16px 32px -24px rgb(74 87 111 / 0.42);
  padding: 12px 16px;
  backdrop-filter: blur(12px);
}

.hero-stat-icon {
  display: grid;
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  place-items: center;
  border-radius: 15px;
  color: white;
}

.hero-stat-icon--purple {
  background: linear-gradient(145deg, #9d70ff, #6842e9);
  box-shadow: 0 8px 16px -8px rgb(104 66 233 / 0.7);
}

.hero-stat-icon--green {
  background: linear-gradient(145deg, #68e89c, #20b96c);
  box-shadow: 0 8px 16px -8px rgb(32 185 108 / 0.7);
}

.qr-panel {
  min-height: 0;
  border: 2px solid rgb(255 255 255 / 0.96);
  background: linear-gradient(180deg, rgb(255 255 255 / 0.88), rgb(245 255 247 / 0.8));
  box-shadow:
    0 28px 70px -38px rgb(38 91 146 / 0.42),
    inset 0 1px 0 white;
  backdrop-filter: blur(22px) saturate(125%);
}

.qr-panel::before {
  top: auto;
  right: -15%;
  bottom: -15%;
  width: 130%;
  height: 38%;
  border-radius: 50% 50% 0 0;
  background: linear-gradient(180deg, rgb(205 249 188 / 0.4), rgb(118 211 88 / 0.55));
}

.connect-card {
  min-height: 128px;
  border-radius: 27px;
  background: rgb(255 255 255 / 0.85);
  box-shadow: 0 18px 40px -28px rgb(45 61 99 / 0.42);
  padding: 35px 18px 16px;
}

.connect-card h2 span {
  background: linear-gradient(90deg, #286bdc, #ff941b 70%);
  background-clip: text;
  color: transparent;
}

.connect-ribbon {
  top: -10px;
  left: -8px;
  padding: 9px 20px;
  border-radius: 7px 7px 4px 4px;
  background: linear-gradient(180deg, #ff5b6d, #ee344d);
  box-shadow: 0 8px 14px -8px rgb(213 35 65 / 0.72);
  color: white;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  transform: rotate(-4deg);
}

.closed-book {
  position: relative;
  width: 86px;
  height: 90px;
  flex: 0 0 86px;
  filter: drop-shadow(0 10px 8px rgb(30 62 118 / 0.18));
}

.closed-book__blue,
.closed-book__red {
  position: absolute;
  top: 0;
  height: 100%;
}

.closed-book__blue {
  left: 0;
  width: 53%;
  border-radius: 11px 2px 2px 11px;
  background: linear-gradient(150deg, #569bea, #2464cc);
}

.closed-book__blue::after {
  position: absolute;
  top: 29%;
  left: 18%;
  width: 64%;
  height: 24%;
  border-top: 4px solid rgb(255 255 255 / 0.84);
  border-bottom: 4px solid rgb(255 255 255 / 0.84);
  content: '';
  transform: skewY(-7deg);
}

.closed-book__red {
  right: 0;
  display: grid;
  width: 49%;
  place-items: center;
  border-radius: 2px 11px 11px 2px;
  background: linear-gradient(145deg, #ff5c4d, #e22532);
  color: white;
  font-size: 7px;
  font-weight: 900;
  line-height: 1.05;
  text-align: center;
}

.qr-frame {
  aspect-ratio: 1 / 1;
  box-shadow:
    0 22px 45px -30px rgb(27 49 93 / 0.48),
    0 0 0 1px rgb(227 233 242 / 0.85);
}

.qr-frame canvas {
  display: block;
  width: 100% !important;
  height: auto !important;
  max-width: none;
  aspect-ratio: 1 / 1;
  object-fit: contain;
  image-rendering: auto;
}

.url-chip {
  border-radius: 999px;
  background: rgb(214 247 224 / 0.72);
  padding: 7px 14px;
}

.scan-help {
  width: fit-content;
  min-width: 250px;
  border-radius: 24px;
  background: rgb(255 255 255 / 0.62);
  padding: 10px 18px;
  backdrop-filter: blur(10px);
}

.scan-help__icon {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 10px;
  background: linear-gradient(145deg, #437de3, #2459bd);
  color: white;
}

.school-illustration {
  right: 50%;
  bottom: 4px;
  z-index: 2;
  width: 82px;
  max-height: 96px;
  object-fit: contain;
  transform: translateX(50%);
  filter: drop-shadow(0 8px 8px rgb(72 113 94 / 0.18));
}

.lock-footer {
  min-height: 59px;
  border: 1px solid rgb(255 255 255 / 0.94);
  border-radius: 12px 12px 0 0;
  background: rgb(255 255 255 / 0.94);
  backdrop-filter: blur(18px);
}

@keyframes sparkle-pulse {
  50% {
    opacity: 0.45;
    transform: scale(0.72) rotate(20deg);
  }
}

@media (min-width: 768px) {
  .smart-lock-screen {
    background:
      linear-gradient(180deg, rgb(193 232 255 / 0.12), rgb(255 255 255 / 0.02)),
      var(--lock-bg-desktop) center top / cover no-repeat,
      #cbefff;
  }
}

@media (max-width: 1023px) {
  .lock-main {
    overflow-y: auto;
  }

  .welcome-panel {
    min-height: 670px;
    border-radius: 34px;
  }

  .hero-title {
    font-size: clamp(2.5rem, 8vw, 4.25rem);
  }

  .hero-book {
    right: 3%;
  }

  .qr-panel {
    display: none;
  }
}

@media (max-width: 767px) {
  .lock-header {
    min-height: 78px;
  }

  .unlock-button {
    width: 46px;
    height: 46px;
    justify-content: center;
    padding: 0;
  }

  .welcome-panel {
    min-height: 650px;
    padding: 1.35rem;
    padding-bottom: 168px;
    background:
      linear-gradient(
        180deg,
        rgb(239 249 255 / 0.96),
        rgb(239 249 255 / 0.52) 45%,
        transparent 72%
      ),
      var(--hero-students) 58% center / cover no-repeat;
  }

  .hero-title {
    font-size: clamp(2.35rem, 12vw, 3.5rem);
  }

  .hero-copy {
    max-width: 90%;
    font-size: 12px;
    line-height: 1.6;
  }

  .hero-book,
  .hero-paper-plane {
    display: none;
  }

  .hero-cta {
    bottom: 139px;
    min-width: 250px;
    height: 56px;
  }

  .hero-stats {
    grid-template-columns: 1fr;
    gap: 7px;
    padding: 10px 12px 12px;
  }

  .hero-stat-card {
    min-height: 58px;
    border-radius: 20px;
    padding: 7px 12px;
  }

  .hero-stat-icon {
    width: 38px;
    height: 38px;
    flex-basis: 38px;
  }

  .lock-footer {
    min-height: 42px;
    justify-content: center;
  }
}

@media (max-height: 820px) and (min-width: 1024px) {
  .lock-header {
    min-height: 78px;
  }

  .lock-main {
    padding-top: 15px;
    padding-bottom: 15px;
  }

  .welcome-panel {
    padding: 2rem 2.4rem 112px;
  }

  .hero-title {
    margin-top: 0.85rem;
    font-size: clamp(2.4rem, 4vw, 3.85rem);
  }

  .hero-copy {
    margin-top: 1rem;
    font-size: 13px;
    line-height: 1.55;
  }

  .hero-book {
    width: 135px;
    height: 125px;
  }

  .hero-cta {
    bottom: 91px;
    height: 56px;
  }

  .hero-stats {
    padding-bottom: 12px;
  }

  .hero-stat-card {
    min-height: 64px;
  }

  .qr-panel {
    display: block;
    padding: 14px;
  }

  .connect-card {
    min-height: 105px;
    padding-top: 26px;
  }

  .closed-book {
    width: 66px;
    height: 70px;
    flex-basis: 66px;
  }

  .qr-frame {
    width: min(210px, 100%);
  }

  .school-illustration {
    display: none;
  }

  .lock-footer {
    min-height: 42px;
  }
}
</style>
