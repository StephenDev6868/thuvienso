<script setup lang="ts">
import { BookOpen, BookPlus, Bot, FlaskConical, Headphones, Play } from '@lucide/vue'
import type { Component } from 'vue'

import SectionHeading from '@/components/SectionHeading.vue'
import { useAppStore } from '@/stores/app'

type QuickAction = 'scroll-books' | 'audio' | 'video' | 'chat' | 'stem' | 'register'

interface QuickLink {
  title: string
  description: string
  color: string
  icon: Component
  action: QuickAction
}

const appStore = useAppStore()

const links: QuickLink[] = [
  {
    title: 'Đọc sách',
    description: 'Hàng nghìn đầu sách',
    color: '#df2133',
    icon: BookOpen,
    action: 'scroll-books',
  },
  {
    title: 'Sách nói',
    description: 'Nghe mọi lúc',
    color: '#8757f2',
    icon: Headphones,
    action: 'audio',
  },
  {
    title: 'Video học tập',
    description: 'Bài học trực quan',
    color: '#ff7045',
    icon: Play,
    action: 'video',
  },
  {
    title: 'Trợ lý AI',
    description: 'Hỏi đáp thông minh',
    color: '#3e6ff4',
    icon: Bot,
    action: 'chat',
  },
  {
    title: 'Góc STEM',
    description: 'Thử nghiệm sáng tạo',
    color: '#2aa66c',
    icon: FlaskConical,
    action: 'stem',
  },
  {
    title: 'Mượn sách',
    description: 'Đăng ký nhanh',
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
</script>

<template>
  <section id="quick-access" class="page-shell section-space scroll-mt-20">
    <SectionHeading
      eyebrow="Truy cập nhanh"
      title="Học theo cách bạn thích"
      description="Chạm vào một mục để bắt đầu hành trình khám phá."
    />
    <div class="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      <button
        v-for="link in links"
        :key="link.title"
        type="button"
        class="focus-ring card-lift min-h-41 rounded-[22px] bg-white p-5 text-left shadow-sm"
        @click="runAction(link.action)"
      >
        <span
          class="grid size-13 place-items-center rounded-2xl text-white"
          :style="{ backgroundColor: link.color }"
        >
          <component :is="link.icon" :size="22" />
        </span>
        <strong class="mt-5 block text-[17px]">{{ link.title }}</strong>
        <span class="mt-2 block text-sm leading-5 text-slate-500">{{ link.description }}</span>
      </button>
    </div>
  </section>
</template>
