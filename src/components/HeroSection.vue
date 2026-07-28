<script setup lang="ts">
import { ArrowLeft, ArrowRight, ExternalLink, Pause, Play, Search, Sparkles } from '@lucide/vue'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import slide1Url from '@/assets/images/slide1.jpg'
import slide2Url from '@/assets/images/slide2.jpg'
import slide3Url from '@/assets/images/slide3.jpg'
import { useAppStore } from '@/stores/app'

interface HeroSlide {
  image: string
  alt: string
  eyebrow: string
  buttonLabel: string
  href: string
  position: string
}

const AUTOPLAY_DELAY = 5000

const slides: HeroSlide[] = [
  {
    image: slide1Url,
    alt: 'Cùng nhau xây dựng môi trường đọc sách văn minh',
    eyebrow: 'Văn hóa đọc',
    buttonLabel: 'Xem nội quy thư viện',
    href: '#',
    position: 'center',
  },
  {
    image: slide2Url,
    alt: 'Ngày hội sách thế giới — đọc sách, hành trình của trí tưởng tượng',
    eyebrow: 'World Book Day',
    buttonLabel: 'Khám phá ngày hội sách',
    href: '#',
    position: 'center',
  },
  {
    image: slide3Url,
    alt: 'Thư viện số — học hè thật chill, kiến thức vẫn đỉnh',
    eyebrow: 'Kho tri thức số',
    buttonLabel: 'Mở thư viện số',
    href: '#',
    position: 'center',
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
  <section id="top" class="page-shell scroll-mt-24 pb-8 pt-8 sm:pt-9">
    <!-- Mobile keeps the original hero experience. -->
    <div
      class="relative isolate overflow-hidden rounded-[30px] bg-red-500 px-6 py-12 text-white md:hidden"
    >
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
      class="hero-carousel relative hidden aspect-[1440/500] min-h-70 overflow-hidden rounded-[30px] bg-ink-950 shadow-[0_30px_80px_-40px_rgba(24,32,51,.55)] md:block"
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
          <div
            class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_62%,rgba(13,20,35,.38)_100%)]"
          />
          <div
            class="hero-shine pointer-events-none absolute inset-0 opacity-[0.18] [background:linear-gradient(110deg,transparent_34%,rgba(255,255,255,.26)_47%,transparent_58%)] [background-size:220%_100%]"
          />

          <div
            class="absolute bottom-8 right-8 z-10 flex items-center gap-3 lg:bottom-10 lg:right-10"
          >
            <span
              class="hidden rounded-full border border-white/25 bg-ink-950/35 px-4 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-white backdrop-blur-xl lg:block"
            >
              {{ activeSlide.eyebrow }}
            </span>
            <a
              :href="activeSlide.href"
              :target="activeSlide.href === '#' ? undefined : '_blank'"
              :rel="activeSlide.href === '#' ? undefined : 'noopener noreferrer'"
              class="focus-ring group inline-flex h-12 items-center gap-3 rounded-full bg-white/92 px-5 text-sm font-extrabold text-ink-950 shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white lg:h-14 lg:px-7"
            >
              {{ activeSlide.buttonLabel }}
              <span
                class="grid size-8 place-items-center rounded-full bg-red-500 text-white transition group-hover:rotate-12 group-hover:scale-110"
              >
                <ExternalLink :size="15" />
              </span>
            </a>
          </div>
        </article>
      </Transition>

      <div class="absolute left-7 top-7 z-20 flex items-center gap-3 lg:left-9 lg:top-9">
        <span
          class="rounded-full border border-white/25 bg-ink-950/30 px-4 py-2 text-xs font-black tracking-[0.16em] text-white backdrop-blur-xl"
        >
          {{ String(activeIndex + 1).padStart(2, '0') }}
          <span class="mx-1 text-white/45">/</span>
          {{ String(slides.length).padStart(2, '0') }}
        </span>
        <button
          type="button"
          class="focus-ring grid size-10 place-items-center rounded-full border border-white/25 bg-ink-950/30 text-white backdrop-blur-xl transition hover:bg-white hover:text-ink-950"
          :aria-label="manuallyPaused ? 'Tiếp tục tự chuyển slide' : 'Tạm dừng tự chuyển slide'"
          @click="toggleAutoplay"
        >
          <Play v-if="manuallyPaused" :size="16" fill="currentColor" />
          <Pause v-else :size="16" fill="currentColor" />
        </button>
      </div>

      <div class="absolute bottom-8 left-8 z-20 flex gap-2 lg:bottom-10 lg:left-10">
        <button
          type="button"
          class="focus-ring grid size-11 place-items-center rounded-full border border-white/25 bg-ink-950/30 text-white backdrop-blur-xl transition hover:bg-white hover:text-ink-950"
          aria-label="Slide trước"
          @click="previousSlide"
        >
          <ArrowLeft :size="18" />
        </button>
        <button
          type="button"
          class="focus-ring grid size-11 place-items-center rounded-full border border-white/25 bg-ink-950/30 text-white backdrop-blur-xl transition hover:bg-white hover:text-ink-950"
          aria-label="Slide tiếp theo"
          @click="nextSlide"
        >
          <ArrowRight :size="18" />
        </button>
      </div>

      <div class="absolute inset-x-8 bottom-3 z-20 flex gap-2 lg:inset-x-10 lg:bottom-4">
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
    opacity 760ms cubic-bezier(0.16, 1, 0.3, 1),
    clip-path 900ms cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-slide-enter-from {
  opacity: 0;
  clip-path: inset(0 7% 0 0 round 30px);
}

.hero-slide-leave-to {
  opacity: 0;
}

.hero-slide-image {
  filter: contrast(1.025) saturate(1.035);
  image-rendering: auto;
}

.hero-slide-progress {
  width: 0;
  animation: hero-progress 5s linear forwards;
}

.hero-slide-progress.is-paused {
  animation-play-state: paused;
}

.hero-shine {
  animation: hero-shine 5s ease-in-out infinite;
}

@keyframes hero-progress {
  from {
    width: 0;
  }
  to {
    width: 100%;
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
  .hero-shine {
    animation: none;
  }

  .hero-slide-progress {
    width: 100%;
  }
}
</style>
