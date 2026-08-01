<script setup lang="ts">
import { ArrowLeft, ArrowRight, Pause, Play } from '@lucide/vue'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import slide4Url from '@/assets/images/slide4.gif'
import slide5Url from '@/assets/images/slide5.gif'
import slide6Url from '@/assets/images/slide6.gif'
import slide7Url from '@/assets/images/slide7.gif'
import { useAppStore } from '@/stores/app'

type HeroAction = 'audio' | 'library'

interface HeroSlide {
  image: string
  alt: string
  buttonLabel: string
  action: HeroAction
  position: string
}

const AUTOPLAY_DELAY = 6500

const slides: HeroSlide[] = [
  {
    image: slide6Url,
    alt: 'Thư viện số thông minh - khám phá kho tri thức dành cho em',
    buttonLabel: 'Bắt đầu khám phá',
    action: 'library',
    position: 'center',
  },
  {
    image: slide5Url,
    alt: 'Trợ lý AI thư viện - hỏi nhanh, tìm đúng, học vui',
    buttonLabel: 'Khám phá kho sách',
    action: 'library',
    position: 'center',
  },
  {
    image: slide4Url,
    alt: 'Tri thức trong từng âm thanh - nghe sách ngay',
    buttonLabel: 'Nghe sách ngay',
    action: 'audio',
    position: 'center',
  },
  {
    image: slide7Url,
    alt: 'Giáo viên đồng hành, mở cánh cửa tri thức cùng em',
    buttonLabel: 'Xem hướng dẫn',
    action: 'library',
    position: 'center',
  },
]

const appStore = useAppStore()
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

function runSlideAction(action: HeroAction) {
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
  <section
    class="library-hero-slider"
    :style="{ '--hero-autoplay-duration': `${AUTOPLAY_DELAY}ms` }"
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
        class="hero-slide"
        role="group"
        aria-roledescription="slide"
        :aria-label="`${activeIndex + 1} trên ${slides.length}: ${activeSlide.alt}`"
      >
        <img
          :src="activeSlide.image"
          :alt="activeSlide.alt"
          class="hero-slide__image"
          :style="{ objectPosition: activeSlide.position }"
        />
        <div class="hero-slide__wash" />

        <button
          type="button"
          class="hero-slide__cta"
          @click="runSlideAction(activeSlide.action)"
        >
          {{ activeSlide.buttonLabel }}
          <ArrowRight :size="17" />
        </button>
      </article>
    </Transition>

    <button type="button" class="hero-control hero-control--prev" aria-label="Slide trước" @click="previousSlide">
      <ArrowLeft :size="18" />
    </button>
    <button type="button" class="hero-control hero-control--next" aria-label="Slide tiếp theo" @click="nextSlide">
      <ArrowRight :size="18" />
    </button>

    <button
      type="button"
      class="hero-pause"
      :aria-label="manuallyPaused ? 'Tiếp tục tự chuyển slide' : 'Tạm dừng tự chuyển slide'"
      @click="toggleAutoplay"
    >
      <Play v-if="manuallyPaused" :size="15" fill="currentColor" />
      <Pause v-else :size="15" fill="currentColor" />
    </button>

    <div class="hero-dots">
      <button
        v-for="(_, index) in slides"
        :key="index"
        type="button"
        :class="{ 'is-active': activeIndex === index }"
        :aria-label="`Chuyển đến slide ${index + 1}`"
        :aria-current="activeIndex === index ? 'true' : undefined"
        @click="goToSlide(index)"
      />
    </div>
  </section>
</template>

<style scoped>
.library-hero-slider {
  position: relative;
  isolation: isolate;
  width: 100%;
  min-width: 0;
  aspect-ratio: 1080 / 300;
  overflow: hidden;
  border: 2px solid rgb(255 255 255 / 0.92);
  border-radius: 26px;
  background: white;
  box-shadow: 0 22px 60px -36px rgb(24 32 51 / 0.55);
  outline: none;
}

.hero-slide {
  position: absolute;
  inset: 0;
}

.hero-slide__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: contrast(1.025) saturate(1.035);
  image-rendering: auto;
  transform-origin: center;
  animation: hero-image-drift var(--hero-autoplay-duration) cubic-bezier(0.16, 1, 0.3, 1) both;
  will-change: transform;
}

.hero-slide__wash {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgb(255 255 255 / 0.18), transparent 44%),
    linear-gradient(180deg, rgb(255 255 255 / 0.03), rgb(255 255 255 / 0.16));
}

.hero-slide__cta {
  position: absolute;
  left: clamp(28px, 8vw, 128px);
  bottom: clamp(28px, 9vw, 44px);
  z-index: 3;
  display: inline-flex;
  height: 48px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 0;
  border-radius: 999px;
  padding: 0 24px;
  color: white;
  background: linear-gradient(180deg, #ff6c7c, #e93245);
  box-shadow: 0 14px 24px -16px rgb(223 33 51 / 0.8);
  cursor: pointer;
  font-size: 14px;
  font-weight: 900;
}

.hero-control,
.hero-pause,
.hero-dots button {
  border: 0;
  cursor: pointer;
}

.hero-control {
  position: absolute;
  top: 50%;
  z-index: 4;
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 50%;
  color: #f05265;
  background: rgb(255 255 255 / 0.92);
  box-shadow: 0 10px 20px -14px rgb(24 32 51 / 0.7);
  transform: translateY(-50%);
}

.hero-control--prev {
  left: 18px;
}

.hero-control--next {
  right: 18px;
}

.hero-pause {
  position: absolute;
  right: 18px;
  top: 18px;
  z-index: 4;
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 50%;
  color: #17213a;
  background: rgb(255 255 255 / 0.9);
  box-shadow: 0 10px 20px -16px rgb(24 32 51 / 0.7);
}

.hero-dots {
  position: absolute;
  inset-inline: 0;
  bottom: 16px;
  z-index: 4;
  display: flex;
  justify-content: center;
  gap: 9px;
}

.hero-dots button {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.88);
  transition:
    width 180ms ease,
    background-color 180ms ease;
}

.hero-dots button.is-active {
  width: 30px;
  background: #f05265;
}

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

@keyframes hero-image-drift {
  from {
    transform: scale(1.045) translate3d(0.6%, 0, 0);
  }
  to {
    transform: scale(1.008) translate3d(-0.35%, 0, 0);
  }
}

@media (max-width: 767px) {
  .library-hero-slider {
    aspect-ratio: 340 / 280;
    border-radius: 18px;
  }

  .hero-slide__image {
    object-position: center;
  }

  .hero-slide__cta {
    left: 28px;
    bottom: 32px;
    height: 44px;
    padding: 0 20px;
    font-size: 12px;
  }

  .hero-control {
    width: 38px;
    height: 38px;
  }

  .hero-control--prev {
    left: 12px;
  }

  .hero-control--next {
    right: 12px;
  }

  .hero-pause {
    right: 14px;
    top: 14px;
    width: 36px;
    height: 36px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-slide-enter-active,
  .hero-slide-leave-active {
    transition-duration: 1ms;
  }

  .hero-slide__image {
    animation: none;
  }
}
</style>
