<script setup lang="ts">
import { BrainCircuit, LibraryBig, QrCode, ShieldCheck, Sparkles, Unlock, Wifi } from '@lucide/vue'
import QRCode from 'qrcode'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

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

const neuralNodes = Array.from({ length: 18 }, (_, index) => ({
  left: `${(index * 37 + 9) % 96}%`,
  top: `${(index * 53 + 12) % 88}%`,
  size: `${4 + (index % 4) * 2}px`,
  delay: `${index * -0.38}s`,
}))

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
let previousBodyOverflow = ''

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
  void createAccessQrCode()
  void nextTick(() => lockScreen.value?.focus())
})

onBeforeUnmount(() => {
  globalThis.document.body.style.overflow = previousBodyOverflow
  globalThis.removeEventListener('keydown', handleKeydown)
  if (clockTimer) globalThis.clearInterval(clockTimer)
})
</script>

<template>
  <Teleport to="body">
    <section
      ref="lockScreen"
      class="smart-lock-screen fixed inset-0 z-[120] isolate flex min-h-dvh flex-col overflow-hidden text-white outline-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="smart-lock-title"
      tabindex="-1"
    >
      <div class="smart-grid-plane pointer-events-none absolute inset-0" />
      <div class="smart-scan-beam pointer-events-none absolute inset-y-0 w-1/3" />
      <div
        class="pointer-events-none absolute -left-40 -top-52 size-[520px] rounded-full bg-blue-500/20 blur-[120px]"
      />
      <div
        class="pointer-events-none absolute -bottom-60 right-[-8%] size-[620px] rounded-full bg-red-500/18 blur-[140px]"
      />

      <svg
        class="pointer-events-none absolute inset-0 h-full w-full opacity-45"
        viewBox="0 0 1200 760"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="neuralLine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#3e6ff4" stop-opacity="0" />
            <stop offset="0.48" stop-color="#80a5ff" stop-opacity="0.65" />
            <stop offset="1" stop-color="#df2133" stop-opacity="0" />
          </linearGradient>
        </defs>
        <g class="neural-paths" fill="none" stroke="url(#neuralLine)" stroke-width="1">
          <path d="M-60 180 C180 40 310 340 535 190 S920 45 1260 210" />
          <path d="M-80 510 C185 685 330 360 590 520 S985 710 1270 490" />
          <path d="M170 -60 C100 190 385 280 300 530 S220 750 390 830" />
          <path d="M900 -70 C1010 175 720 275 845 500 S1040 680 950 820" />
          <path d="M70 690 C285 550 410 690 600 390 S910 210 1140 90" />
        </g>
      </svg>

      <span
        v-for="(node, index) in neuralNodes"
        :key="index"
        class="neural-node pointer-events-none absolute rounded-full bg-blue-300"
        :style="{
          left: node.left,
          top: node.top,
          width: node.size,
          height: node.size,
          animationDelay: node.delay,
        }"
      />

      <header
        class="relative z-20 flex items-center justify-between gap-4 border-b border-white/8 px-5 py-4 sm:px-8 lg:px-12"
      >
        <div class="flex min-w-0 items-center gap-3">
          <span
            class="grid size-[61.6px] shrink-0 place-items-center overflow-hidden rounded-[22px] border border-white/15 bg-white shadow-lg"
          >
            <img :src="logoUrl" alt="" class="h-full w-full object-contain" />
          </span>
          <div class="min-w-0">
            <p class="truncate text-sm font-black tracking-[0.06em]">THƯ VIỆN SỐ</p>
            <p
              class="mt-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-blue-200/65"
            >
              <Wifi :size="11" />
              AI gateway online
            </p>
          </div>
        </div>

        <div class="hidden text-right md:block">
          <p class="font-mono text-2xl font-light tracking-[0.08em]">{{ formattedTime }}</p>
          <p class="mt-1 text-[10px] capitalize tracking-[0.08em] text-white/45">
            {{ formattedDate }}
          </p>
        </div>

        <button
          type="button"
          class="focus-ring group inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-white/12 bg-white/[0.07] px-3.5 text-xs font-bold text-white/75 backdrop-blur-xl transition hover:border-white/25 hover:bg-white hover:text-ink-950"
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
        <div class="relative max-w-4xl">
          <div class="ai-core-wrap pointer-events-none absolute -left-16 -top-28 opacity-40">
            <span class="ai-core-ring ai-core-ring-one absolute inset-0 rounded-full" />
            <span class="ai-core-ring ai-core-ring-two absolute inset-7 rounded-full" />
            <span
              class="ai-core relative grid size-52 place-items-center rounded-full border border-blue-300/15 bg-blue-400/[0.04] text-blue-200"
            >
              <BrainCircuit :size="96" :stroke-width="0.8" />
            </span>
          </div>

          <div
            class="relative mb-6 inline-flex items-center gap-2 rounded-full border border-blue-300/15 bg-blue-400/8 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-blue-200 backdrop-blur-xl"
          >
            <Sparkles :size="14" />
            Digital knowledge portal
          </div>

          <h1
            id="smart-lock-title"
            class="relative max-w-5xl text-[clamp(2.5rem,6vw,6.5rem)] font-black leading-[0.94] tracking-[-0.065em]"
          >
            Chào mừng đến với
            <span class="smart-gradient-text mt-2 block">thư viện số của chúng tôi</span>
          </h1>

          <p
            class="relative mt-7 max-w-2xl text-sm leading-7 text-slate-300/70 sm:text-base sm:leading-8"
          >
            Không gian tri thức kết nối sách số, học liệu STEM và trợ lý AI dành cho thế hệ học sinh
            mới.
          </p>

          <div class="relative mt-9 flex flex-wrap gap-3">
            <span
              class="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 text-xs font-bold text-white/65 backdrop-blur-xl"
            >
              <LibraryBig :size="16" class="text-red-300" />
              {{ digitalBooks.length }} tài liệu đã số hoá
            </span>
            <span
              class="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 text-xs font-bold text-white/65 backdrop-blur-xl"
            >
              <ShieldCheck :size="16" class="text-emerald-300" />
              Truy cập an toàn
            </span>
          </div>
        </div>

        <aside
          class="qr-panel relative mx-auto w-full max-w-sm overflow-hidden rounded-[30px] border border-white/12 bg-white/[0.07] p-5 shadow-[0_34px_100px_-30px_rgba(0,0,0,.75)] backdrop-blur-2xl sm:p-6 lg:w-[360px]"
          aria-label="Mã QR truy cập thư viện"
        >
          <div
            class="pointer-events-none absolute -right-14 -top-16 size-44 rounded-full bg-blue-400/20 blur-3xl"
          />
          <div class="relative flex items-center justify-between gap-3">
            <div>
              <p class="text-[10px] font-black uppercase tracking-[0.18em] text-blue-200/65">
                Scan to connect
              </p>
              <h2 class="mt-2 text-2xl font-black tracking-[-0.04em]">Khám phá nhiều hơn</h2>
            </div>
            <span
              class="grid size-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/8 text-blue-200"
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
            <p class="max-w-[260px] truncate font-mono text-[10px] text-white/45">
              {{ displayUrl }}
            </p>
          </div>
          <p class="mt-3 text-center text-[11px] leading-5 text-white/50">
            Dùng camera điện thoại để quét và truy cập hệ thống
          </p>
        </aside>
      </main>

      <footer
        class="relative z-20 flex items-center justify-between border-t border-white/8 px-5 py-3 text-[9px] font-bold uppercase tracking-[0.16em] text-white/30 sm:px-8 lg:px-12"
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
    radial-gradient(circle at 16% 20%, rgb(36 82 166 / 0.28), transparent 31%),
    radial-gradient(circle at 88% 80%, rgb(223 33 51 / 0.18), transparent 34%),
    linear-gradient(145deg, #071023 0%, #090d19 48%, #101528 100%);
  animation: smart-lock-enter 650ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.smart-lock-screen::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 3px,
    rgb(255 255 255 / 0.012) 4px
  );
  content: '';
  mix-blend-mode: soft-light;
}

.smart-grid-plane {
  inset: 38% -20% -55%;
  background-image:
    linear-gradient(rgb(92 137 237 / 0.15) 1px, transparent 1px),
    linear-gradient(90deg, rgb(92 137 237 / 0.15) 1px, transparent 1px);
  background-size: 54px 54px;
  mask-image: linear-gradient(to top, black 25%, transparent 82%);
  perspective: 600px;
  transform: perspective(520px) rotateX(58deg) scale(1.4);
  transform-origin: center bottom;
  animation: smart-grid-flow 14s linear infinite;
}

.smart-scan-beam {
  left: -40%;
  background: linear-gradient(
    90deg,
    transparent,
    rgb(96 146 255 / 0.045),
    rgb(255 255 255 / 0.09),
    transparent
  );
  filter: blur(8px);
  transform: skewX(-18deg);
  animation: smart-beam-sweep 9s ease-in-out infinite;
}

.neural-paths path {
  stroke-dasharray: 8 18;
  animation: neural-path-flow 12s linear infinite;
}

.neural-paths path:nth-child(even) {
  animation-direction: reverse;
  animation-duration: 15s;
}

.neural-node {
  box-shadow:
    0 0 8px rgb(128 165 255 / 0.8),
    0 0 24px rgb(62 111 244 / 0.55);
  animation: neural-node-pulse 3.4s ease-in-out infinite;
}

.smart-gradient-text {
  background: linear-gradient(90deg, #ffffff 0%, #9fc0ff 48%, #ff9da6 100%);
  background-clip: text;
  color: transparent;
}

.ai-core-wrap {
  width: 13rem;
  height: 13rem;
}

.ai-core {
  box-shadow:
    inset 0 0 45px rgb(62 111 244 / 0.12),
    0 0 80px rgb(62 111 244 / 0.1);
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

@keyframes neural-path-flow {
  to {
    stroke-dashoffset: -260;
  }
}

@keyframes neural-node-pulse {
  0%,
  100% {
    opacity: 0.25;
    transform: scale(0.75);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.35);
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

@media (max-height: 760px) and (min-width: 1024px) {
  .qr-panel {
    transform: scale(0.88);
  }
}
</style>
