<script setup lang="ts">
import {
  ArrowUpRight,
  BookOpen,
  BookPlus,
  Bot,
  FlaskConical,
  Headphones,
  Play,
  Sparkles,
} from '@lucide/vue'
import type { Component } from 'vue'

import SectionHeading from '@/components/SectionHeading.vue'
import { digitalLibraryCollection } from '@/data/digitalLibrary'
import { useAppStore } from '@/stores/app'

type QuickAction = 'scroll-books' | 'audio' | 'video' | 'chat' | 'stem' | 'register'

interface QuickLink {
  title: string
  description: string
  badge: string
  metric: string
  color: string
  icon: Component
  action: QuickAction
}

const appStore = useAppStore()

const links: QuickLink[] = [
  {
    title: 'Đọc sách',
    description: 'Lật trang và đọc PDF trực tuyến',
    badge: 'Kho sách số',
    metric: `${digitalLibraryCollection.bookCount} cuốn`,
    color: '#df2133',
    icon: BookOpen,
    action: 'scroll-books',
  },
  {
    title: 'Sách nói',
    description: 'Nghe kiến thức mọi lúc, mọi nơi',
    badge: 'Audio',
    metric: 'Rảnh tay',
    color: '#8757f2',
    icon: Headphones,
    action: 'audio',
  },
  {
    title: 'Video học tập',
    description: 'Bài học sinh động và trực quan',
    badge: 'Khám phá',
    metric: 'Trực quan',
    color: '#ff7045',
    icon: Play,
    action: 'video',
  },
  {
    title: 'Trợ lý AI',
    description: 'Hỏi bằng giọng nói, mở sách tức thì',
    badge: 'AI thông minh',
    metric: '24/7',
    color: '#3e6ff4',
    icon: Bot,
    action: 'chat',
  },
  {
    title: 'Góc STEM',
    description: 'Thí nghiệm và sáng tạo không giới hạn',
    badge: 'Thực hành',
    metric: 'Sáng tạo',
    color: '#2aa66c',
    icon: FlaskConical,
    action: 'stem',
  },
  {
    title: 'Mượn sách',
    description: 'Đăng ký mượn sách thật nhanh chóng',
    badge: 'Thư viện',
    metric: 'Dễ dàng',
    color: '#e8a514',
    icon: BookPlus,
    action: 'register',
  },
]

function scrollTo(id: string) {
  globalThis.document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })
}

function runAction(action: QuickAction) {
  if (action === 'chat') return appStore.openChat()
  if (action === 'register') return appStore.openRegistration()
  if (action === 'video' || action === 'stem') return scrollTo('#stem-videos')
  if (action === 'audio') {
    appStore.searchBooks('truyện')
    return scrollTo('#featured-books')
  }
  scrollTo('#featured-books')
}

function getCardStyle(link: QuickLink, index: number) {
  return {
    '--quick-accent': link.color,
    '--quick-delay': `${index * -0.55}s`,
  }
}
</script>

<template>
  <section id="quick-access" class="page-shell section-space scroll-mt-20">
    <div
      class="quick-access-stage relative isolate overflow-hidden rounded-[32px] px-5 py-10 text-white shadow-[0_32px_90px_-46px_rgba(24,32,51,.75)] sm:px-8 sm:py-12 lg:px-10"
    >
      <div class="quick-grid-pattern pointer-events-none absolute inset-0 opacity-35" />
      <div
        class="pointer-events-none absolute -left-16 -top-24 size-72 rounded-full bg-red-500/25 blur-3xl"
      />
      <div
        class="pointer-events-none absolute -bottom-36 right-0 size-80 rounded-full bg-blue-500/20 blur-3xl"
      />
      <div
        class="quick-light-orb pointer-events-none absolute right-[18%] top-8 size-32 rounded-full bg-amber-300/10 blur-2xl"
      />

      <div
        class="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10"
      >
        <SectionHeading
          eyebrow="Truy cập nhanh"
          title="Học theo cách bạn thích"
          description="Sáu trải nghiệm học tập, chỉ một chạm để bắt đầu."
          light
        />
        <div
          class="hidden shrink-0 items-center gap-3 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2.5 text-xs font-bold text-white/75 backdrop-blur-xl md:flex"
        >
          <span class="grid size-7 place-items-center rounded-full bg-red-500 text-white">
            <Sparkles :size="14" />
          </span>
          6 lối vào kho tri thức
        </div>
      </div>

      <div class="relative mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <button
          v-for="(link, index) in links"
          :key="link.title"
          type="button"
          class="quick-action-card focus-ring group relative min-h-58 overflow-hidden rounded-[24px] border border-white/10 p-5 text-left backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:border-white/25 focus-visible:-translate-y-1 active:scale-[0.98]"
          :style="getCardStyle(link, index)"
          @click="runAction(link.action)"
        >
          <component
            :is="link.icon"
            :size="104"
            :stroke-width="1.1"
            class="quick-card-watermark pointer-events-none absolute -bottom-5 -right-5 text-white/[0.045] transition duration-500 group-hover:-translate-x-2 group-hover:-translate-y-2 group-hover:rotate-[-8deg] group-hover:scale-110"
          />

          <span class="relative flex items-start justify-between gap-3">
            <span class="quick-icon-stage relative grid size-15 shrink-0 place-items-center">
              <span
                class="quick-icon-ring pointer-events-none absolute -inset-1.5 rounded-[20px]"
              />
              <span
                class="quick-icon-core relative grid size-13 place-items-center rounded-2xl text-white shadow-xl"
              >
                <component :is="link.icon" :size="23" :stroke-width="2.2" />
              </span>
              <Sparkles
                :size="13"
                class="absolute -right-1 -top-1 text-white opacity-70 transition group-hover:scale-125 group-hover:opacity-100"
              />
            </span>

            <span
              class="rounded-full border border-white/10 bg-white/[0.07] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.11em] text-white/60 transition group-hover:border-white/20 group-hover:text-white"
            >
              {{ link.badge }}
            </span>
          </span>

          <span class="relative mt-7 block">
            <strong class="block text-[18px] font-black tracking-[-0.025em]">
              {{ link.title }}
            </strong>
            <span class="mt-2 block min-h-10 text-xs leading-5 text-white/55">
              {{ link.description }}
            </span>
          </span>

          <span
            class="relative mt-5 flex items-center justify-between border-t border-white/8 pt-4"
          >
            <span class="flex items-center gap-2 text-[10px] font-extrabold text-white/65">
              <span
                class="quick-status-dot size-1.5 rounded-full"
                :style="{ backgroundColor: link.color }"
              />
              {{ link.metric }}
            </span>
            <span
              class="grid size-8 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-white/65 transition duration-300 group-hover:rotate-45 group-hover:border-transparent group-hover:bg-white group-hover:text-ink-950"
            >
              <ArrowUpRight :size="15" />
            </span>
          </span>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.quick-access-stage {
  background:
    radial-gradient(circle at 8% 10%, rgb(223 33 51 / 0.18), transparent 27%),
    radial-gradient(circle at 90% 90%, rgb(62 111 244 / 0.16), transparent 30%),
    linear-gradient(145deg, #182033 0%, #111827 52%, #151d2f 100%);
}

.quick-grid-pattern {
  background-image:
    linear-gradient(rgb(255 255 255 / 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 0.035) 1px, transparent 1px);
  background-size: 34px 34px;
  mask-image: linear-gradient(to bottom, black, transparent 88%);
}

.quick-light-orb {
  animation: quick-orb-drift 6s ease-in-out infinite;
}

.quick-action-card {
  background:
    radial-gradient(
      circle at 10% 0%,
      color-mix(in srgb, var(--quick-accent) 20%, transparent),
      transparent 45%
    ),
    linear-gradient(145deg, rgb(255 255 255 / 0.09), rgb(255 255 255 / 0.035));
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.06);
}

.quick-action-card::before {
  position: absolute;
  width: 8rem;
  height: 8rem;
  border-radius: 9999px;
  background: var(--quick-accent);
  content: '';
  filter: blur(65px);
  opacity: 0.08;
  right: -3rem;
  top: -3rem;
  transition:
    opacity 500ms ease,
    transform 500ms ease;
}

.quick-action-card::after {
  position: absolute;
  inset: -40%;
  background: linear-gradient(
    105deg,
    transparent 43%,
    rgb(255 255 255 / 0.13) 50%,
    transparent 57%
  );
  content: '';
  pointer-events: none;
  transform: translateX(-75%) rotate(8deg);
  transition: transform 750ms cubic-bezier(0.16, 1, 0.3, 1);
}

.quick-action-card:hover {
  box-shadow:
    0 24px 50px -28px color-mix(in srgb, var(--quick-accent) 75%, transparent),
    inset 0 1px 0 rgb(255 255 255 / 0.12);
}

.quick-action-card:hover::before {
  opacity: 0.2;
  transform: scale(1.25);
}

.quick-action-card:hover::after {
  transform: translateX(75%) rotate(8deg);
}

.quick-icon-stage {
  animation: quick-icon-float 4.2s ease-in-out infinite;
  animation-delay: var(--quick-delay);
}

.quick-icon-core {
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--quick-accent) 92%, white),
    var(--quick-accent)
  );
  box-shadow:
    0 14px 28px -12px color-mix(in srgb, var(--quick-accent) 80%, transparent),
    inset 0 1px 0 rgb(255 255 255 / 0.35);
  transition:
    transform 400ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 400ms ease;
}

.quick-icon-ring {
  border: 1px solid rgb(255 255 255 / 0.12);
  border-top-color: var(--quick-accent);
  transition: border-color 300ms ease;
}

.quick-action-card:hover .quick-icon-core {
  box-shadow:
    0 18px 34px -12px color-mix(in srgb, var(--quick-accent) 92%, transparent),
    inset 0 1px 0 rgb(255 255 255 / 0.45);
  transform: rotate(-7deg) scale(1.12);
}

.quick-action-card:hover .quick-icon-ring {
  animation: quick-ring-spin 3s linear infinite;
  border-color: color-mix(in srgb, var(--quick-accent) 58%, transparent);
  border-left-color: transparent;
}

.quick-status-dot {
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--quick-accent) 15%, transparent);
  animation: quick-status-pulse 2.2s ease-in-out infinite;
  animation-delay: var(--quick-delay);
}

@keyframes quick-icon-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes quick-ring-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes quick-status-pulse {
  0%,
  100% {
    opacity: 0.65;
    transform: scale(0.9);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

@keyframes quick-orb-drift {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(18px, 12px, 0) scale(1.12);
  }
}
</style>
