<script setup lang="ts">
import { ArrowLeft, ArrowRight, Pause, Play, Search, Sparkles } from '@lucide/vue'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import slide4Url from '@/assets/images/slide4.gif'
import slide5Url from '@/assets/images/slide5.gif'
import slide6Url from '@/assets/images/slide6.gif'
import { useAppStore } from '@/stores/app'

type HeroAction = 'audio' | 'chat' | 'library'

interface HeroSlide {
  image: string
  alt: string
  eyebrow: string
  buttonLabel: string
  action: HeroAction
  position: string
  accent: string
  ctaStyle: Record<string, string>
}

const AUTOPLAY_DELAY = 6500

const slides: HeroSlide[] = [
  {
    image: slide4Url,
    alt: 'Tri thức trong từng âm thanh - nghe sách ngay',
    eyebrow: 'Sách nói',
    buttonLabel: 'Nghe sách ngay',
    action: 'audio',
    position: 'center',
    accent: '#315fd7',
    ctaStyle: {
      left: '18%',
      top: '69%',
      width: '21%',
      height: '14%',
    },
  },
  {
    image: slide5Url,
    alt: 'Trợ lý AI thư viện - hỏi nhanh, tìm đúng, học vui',
    eyebrow: 'AI Library Assistant',
    buttonLabel: 'Trò chuyện với trợ lý AI',
    action: 'chat',
    position: 'center',
    accent: '#ff7045',
    ctaStyle: {
      left: '10%',
      top: '53%',
      width: '31%',
      height: '18%',
    },
  },
  {
    image: slide6Url,
    alt: 'Thư viện số thông minh - khám phá kho tri thức dành cho em',
    eyebrow: 'Thư viện thông minh',
    buttonLabel: 'Khám phá ngay',
    action: 'library',
    position: 'center',
    accent: '#15a878',
    ctaStyle: {
      left: '6%',
      top: '54%',
      width: '36%',
      height: '18%',
    },
  },
]

const appStore = useAppStore()
const query = ref('')
const activeIndex = ref(0)
const progressKey = ref(0)
const manuallyPaused = ref(false)
const interactionPaused = ref(false)
const reducedMotion = ref(false)
const pointerStartX = ref<number | null>(null)
let autoplayTimer: ReturnType<typeof setInterval> | undefined

const activeSlide = computed(() => slides[activeIndex.value]!)
const isPaused = computed(
  () => manuallyPaused.value || interactionPaused.value || reducedMotion.value,
)

function clearAutoplay() {
  globalThis.clearInterval(autoplayTimer)
}

function startAutoplay() {
  clearAutoplay()
  if (isPaused.value) return

  autoplayTimer = globalThis.setInterval(() => {
    activeIndex.value = (activeIndex.value + 1) % slides.length
    progressKey.value += 1
  }, AUTOPLAY_DELAY)
}

function goToSlide(index: number) {
  activeIndex.value = (index + slides.length) % slides.length
  progressKey.value += 1
  startAutoplay()
}

function nextSlide() {
  goToSlide(activeIndex.value + 1)
}

function previousSlide() {
  goToSlide(activeIndex.value - 1)
}

function toggleAutoplay() {
  manuallyPaused.value = !manuallyPaused.value
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowLeft') previousSlide()
  if (event.key === 'ArrowRight') nextSlide()
}

function handlePointerDown(event: PointerEvent) {
  pointerStartX.value = event.clientX
}

function handlePointerUp(event: PointerEvent) {
  if (pointerStartX.value === null) return
  const distance = event.clientX - pointerStartX.value
  pointerStartX.value = null

  if (Math.abs(distance) < 50) return
  if (distance > 0) previousSlide()
  else nextSlide()
}

function submitSearch() {
  appStore.searchBooks(query.value)
  globalThis.document.querySelector('#featured-books')?.scrollIntoView({ behavior: 'smooth' })
}

function runSlideAction(action: HeroAction) {
  if (action === 'chat') {
    appStore.openChat()
    return
  }

  if (action === 'audio') appStore.searchBooks('truyện')
  else appStore.searchBooks('')

  globalThis.document.querySelector('#featured-books')?.scrollIntoView({ behavior: 'smooth' })
}

watch(isPaused, (paused) => {
  if (paused) clearAutoplay()
  else {
    progressKey.value += 1
    startAutoplay()
  }
})

onMounted(() => {
  reducedMotion.value =
    'matchMedia' in globalThis && globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
  startAutoplay()
})

onBeforeUnmount(clearAutoplay)
</script>

<template>
  <section id="top" class="w-full scroll-mt-20 pb-8">
    <!-- Mobile keeps the original hero experience. -->
    <div class="relative isolate overflow-hidden bg-red-500 px-6 py-12 text-white md:hidden">
      <div class="absolute -right-5 top-10 size-55 rounded-full bg-[#ff5262]" />
      <div class="absolute -bottom-12 right-18 size-75 rounded-full bg-[#bd1628]" />
      <div class="absolute -right-12 bottom-24 size-38 rounded-full bg-[#ff7968]" />

      <div class="relative z-10">
        <p
          class="mb-5 inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em]"
        >
          <Sparkles :size="15" />
          Tri thức trong tầm tay
        </p>
        <h1 class="text-4xl font-black leading-[1.02] tracking-[-0.055em] sm:text-6xl">
          THƯ VIỆN SỐ
          <span class="block">CHO THẾ HỆ MỚI</span>
        </h1>
        <p class="mt-6 max-w-2xl text-base leading-7 text-red-100 sm:text-lg sm:leading-8">
          Đọc sách, nghe truyện, xem học liệu STEM và trò chuyện cùng trợ lý AI — tất cả trong một
          không gian học tập truyền cảm hứng.
        </p>
        <div class="mt-8 flex flex-wrap gap-3">
          <a
            href="#featured-books"
            class="focus-ring inline-flex h-12 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-red-500 transition hover:-translate-y-0.5"
          >
            Khám phá kho sách
            <ArrowRight :size="17" />
          </a>
          <button
            type="button"
            class="focus-ring h-12 rounded-xl px-5 text-sm font-bold text-white transition hover:bg-white/10"
            @click="appStore.openChat"
          >
            Hỏi trợ lý AI
          </button>
        </div>

        <form
          class="mt-8 flex max-w-153 items-center rounded-2xl bg-white p-2 shadow-xl shadow-red-950/10"
          role="search"
          @submit.prevent="submitSearch"
        >
          <Search :size="21" class="ml-3 shrink-0 text-red-500" />
          <label for="hero-search" class="sr-only">Tìm sách, tác giả hoặc chủ đề</label>
          <input
            id="hero-search"
            v-model="query"
            type="search"
            class="h-12 min-w-0 flex-1 bg-transparent px-4 text-sm text-ink-950 outline-none placeholder:text-slate-400 sm:text-base"
            placeholder="Tìm tên sách, tác giả hoặc chủ đề..."
          />
          <button
            type="submit"
            class="focus-ring h-12 shrink-0 rounded-xl bg-red-500 px-6 text-sm font-bold text-white hover:bg-red-600"
          >
            Tìm
          </button>
        </form>
      </div>
    </div>

    <!-- iPad and desktop carousel. -->
    <div
      class="hero-carousel group relative hidden aspect-[1920/650] min-h-70 w-full overflow-hidden bg-ink-950 shadow-[0_30px_80px_-40px_rgba(24,32,51,.55)] md:block"
      :style="{
        '--hero-autoplay-duration': `${AUTOPLAY_DELAY}ms`,
        '--hero-accent': activeSlide.accent,
      }"
      role="region"
      aria-roledescription="carousel"
      aria-label="Nội dung nổi bật của thư viện"
      tabindex="0"
      @keydown="handleKeydown"
      @mouseenter="interactionPaused = true"
      @mouseleave="interactionPaused = false"
      @focusin="interactionPaused = true"
      @focusout="interactionPaused = false"
      @pointerdown="handlePointerDown"
      @pointerup="handlePointerUp"
      @pointercancel="pointerStartX = null"
    >
      <Transition name="hero-slide">
        <article
          :key="activeIndex"
          class="absolute inset-0"
          role="group"
          aria-roledescription="slide"
          :aria-label="`${activeIndex + 1} trên ${slides.length}: ${activeSlide.alt}`"
        >
          <img
            :src="activeSlide.image"
            :alt="activeSlide.alt"
            class="hero-slide-image absolute inset-0 h-full w-full object-cover"
            :style="{ objectPosition: activeSlide.position }"
          />
          <div class="hero-depth-vignette pointer-events-none absolute inset-0" />
          <div class="hero-digital-mesh pointer-events-none absolute inset-0 opacity-25" />
          <div
            class="hero-shine pointer-events-none absolute inset-0 opacity-[0.2] [background:linear-gradient(110deg,transparent_32%,rgba(255,255,255,.32)_47%,transparent_59%)] [background-size:240%_100%]"
          />

          <div class="pointer-events-none absolute inset-0 overflow-hidden">
            <span class="hero-particle hero-particle-one" />
            <span class="hero-particle hero-particle-two" />
            <span class="hero-particle hero-particle-three" />
          </div>

          <button
            type="button"
            class="hero-embedded-cta focus-ring group/cta absolute z-10 rounded-[24px]"
            :style="activeSlide.ctaStyle"
            :aria-label="activeSlide.buttonLabel"
            @click="runSlideAction(activeSlide.action)"
          >
            <span
              class="absolute inset-0 rounded-[inherit] border-2 border-transparent transition duration-300 group-hover/cta:border-white/75 group-hover/cta:bg-white/8 group-hover/cta:shadow-[0_0_36px_rgba(255,255,255,.38)]"
            />
            <span
              class="absolute -right-4 top-1/2 grid size-9 -translate-y-1/2 translate-x-2 place-items-center rounded-full bg-white text-ink-950 opacity-0 shadow-xl transition duration-300 group-hover/cta:translate-x-0 group-hover/cta:opacity-100"
            >
              <ArrowRight :size="16" />
            </span>
          </button>
        </article>
      </Transition>

      <div class="absolute left-6 top-5 z-20 flex items-center gap-2.5 lg:left-8 lg:top-7">
        <span
          class="flex items-center gap-2 rounded-full border border-white/55 bg-white/72 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.13em] text-ink-950 shadow-xl backdrop-blur-xl"
        >
          <Sparkles :size="13" :style="{ color: activeSlide.accent }" />
          {{ activeSlide.eyebrow }}
        </span>
        <span
          class="rounded-full border border-white/20 bg-ink-950/35 px-3 py-2 text-[10px] font-black tracking-[0.13em] text-white shadow-xl backdrop-blur-xl"
        >
          {{ String(activeIndex + 1).padStart(2, '0') }}
          <span class="mx-1 text-white/40">/</span>
          {{ String(slides.length).padStart(2, '0') }}
        </span>
      </div>

      <button
        type="button"
        class="focus-ring absolute right-6 top-5 z-20 grid size-10 place-items-center rounded-full border border-white/50 bg-white/72 text-ink-950 shadow-xl backdrop-blur-xl transition duration-300 hover:scale-105 hover:bg-white lg:right-8 lg:top-7"
        :aria-label="manuallyPaused ? 'Tiếp tục tự chuyển slide' : 'Tạm dừng tự chuyển slide'"
        @click="toggleAutoplay"
      >
        <Play v-if="manuallyPaused" :size="15" fill="currentColor" />
        <Pause v-else :size="15" fill="currentColor" />
      </button>

      <div
        class="pointer-events-none absolute inset-y-0 left-3 z-20 flex items-center opacity-0 transition duration-300 hover:opacity-100 group-hover:opacity-100"
      >
        <button
          type="button"
          class="focus-ring pointer-events-auto grid size-11 place-items-center rounded-full border border-white/40 bg-ink-950/35 text-white shadow-xl backdrop-blur-xl transition hover:-translate-x-0.5 hover:bg-white hover:text-ink-950"
          aria-label="Slide trước"
          @click="previousSlide"
        >
          <ArrowLeft :size="18" />
        </button>
      </div>

      <div
        class="pointer-events-none absolute inset-y-0 right-3 z-20 flex items-center opacity-0 transition duration-300 hover:opacity-100 group-hover:opacity-100"
      >
        <button
          type="button"
          class="focus-ring pointer-events-auto grid size-11 place-items-center rounded-full border border-white/40 bg-ink-950/35 text-white shadow-xl backdrop-blur-xl transition hover:translate-x-0.5 hover:bg-white hover:text-ink-950"
          aria-label="Slide tiếp theo"
          @click="nextSlide"
        >
          <ArrowRight :size="18" />
        </button>
      </div>

      <div class="absolute inset-x-6 bottom-3 z-20 flex gap-2 lg:inset-x-8 lg:bottom-4">
        <button
          v-for="(_, index) in slides"
          :key="index"
          type="button"
          class="focus-ring relative h-1 flex-1 overflow-hidden rounded-full bg-white/30"
          :aria-label="`Chuyển đến slide ${index + 1}`"
          :aria-current="activeIndex === index ? 'true' : undefined"
          @click="goToSlide(index)"
        >
          <span
            v-if="activeIndex === index"
            :key="`${progressKey}-${index}`"
            class="hero-slide-progress absolute inset-y-0 left-0 rounded-full bg-white"
            :class="{ 'is-paused': isPaused }"
          />
          <span v-else-if="index < activeIndex" class="absolute inset-0 rounded-full bg-white/75" />
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-slide-enter-active,
.hero-slide-leave-active {
  transition:
    opacity 850ms cubic-bezier(0.16, 1, 0.3, 1),
    clip-path 1050ms cubic-bezier(0.16, 1, 0.3, 1),
    filter 900ms ease,
    transform 1050ms cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-slide-enter-active {
  z-index: 2;
}

.hero-slide-enter-from {
  opacity: 0;
  clip-path: polygon(100% 0, 100% 0, 86% 100%, 100% 100%);
  filter: blur(8px) saturate(1.35);
  transform: translate3d(4%, 0, 0) scale(1.04);
}

.hero-slide-leave-to {
  opacity: 0;
  clip-path: polygon(0 0, 86% 0, 72% 100%, 0 100%);
  filter: blur(3px) saturate(0.85);
  transform: translate3d(-2%, 0, 0) scale(0.98);
}

.hero-slide-image {
  filter: contrast(1.025) saturate(1.035);
  image-rendering: auto;
  animation: hero-image-drift var(--hero-autoplay-duration) cubic-bezier(0.16, 1, 0.3, 1) both;
  transform-origin: center;
  will-change: transform;
}

.hero-depth-vignette {
  background:
    linear-gradient(
      90deg,
      rgb(10 18 34 / 0.08),
      transparent 18%,
      transparent 82%,
      rgb(10 18 34 / 0.12)
    ),
    linear-gradient(180deg, transparent 72%, rgb(10 18 34 / 0.2) 100%);
}

.hero-digital-mesh {
  background-image:
    linear-gradient(rgb(255 255 255 / 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 0.08) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(105deg, transparent 8%, black 48%, transparent 88%);
  animation: hero-mesh-drift 12s linear infinite;
}

.hero-embedded-cta {
  cursor: pointer;
  transform: translateZ(0);
}

.hero-embedded-cta:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--hero-accent) 72%, white);
  outline-offset: 5px;
}

.hero-particle {
  position: absolute;
  border-radius: 9999px;
  background: var(--hero-accent);
  box-shadow: 0 0 24px color-mix(in srgb, var(--hero-accent) 65%, transparent);
  opacity: 0.24;
}

.hero-particle-one {
  left: 47%;
  top: 14%;
  width: 7px;
  height: 7px;
  animation: hero-particle-one 5.8s ease-in-out infinite;
}

.hero-particle-two {
  right: 13%;
  top: 31%;
  width: 5px;
  height: 5px;
  animation: hero-particle-two 7s ease-in-out infinite;
}

.hero-particle-three {
  bottom: 15%;
  left: 57%;
  width: 9px;
  height: 9px;
  animation: hero-particle-three 6.4s ease-in-out infinite;
}

.hero-slide-progress {
  width: 0;
  background: linear-gradient(90deg, var(--hero-accent), white);
  box-shadow: 0 0 14px color-mix(in srgb, var(--hero-accent) 65%, transparent);
  animation: hero-progress var(--hero-autoplay-duration) linear forwards;
}

.hero-slide-progress.is-paused {
  animation-play-state: paused;
}

.hero-shine {
  animation: hero-shine var(--hero-autoplay-duration) ease-in-out infinite;
}

@keyframes hero-image-drift {
  from {
    transform: scale(1.045) translate3d(0.6%, 0, 0);
  }
  to {
    transform: scale(1.008) translate3d(-0.35%, 0, 0);
  }
}

@keyframes hero-progress {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

@keyframes hero-mesh-drift {
  to {
    background-position: 42px 42px;
  }
}

@keyframes hero-particle-one {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(0.8);
  }
  50% {
    transform: translate3d(22px, -14px, 0) scale(1.25);
  }
}

@keyframes hero-particle-two {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(-18px, 20px, 0);
  }
}

@keyframes hero-particle-three {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(10px, -25px, 0) scale(0.7);
  }
}

@keyframes hero-shine {
  0%,
  25% {
    background-position: 160% 0;
  }
  60%,
  100% {
    background-position: -80% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-slide-enter-active,
  .hero-slide-leave-active {
    transition-duration: 1ms;
  }

  .hero-slide-progress,
  .hero-shine,
  .hero-slide-image,
  .hero-digital-mesh,
  .hero-particle {
    animation: none;
  }

  .hero-slide-progress {
    width: 100%;
  }
}
</style>
