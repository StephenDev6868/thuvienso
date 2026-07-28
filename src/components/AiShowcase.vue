<script setup lang="ts">
import { ArrowRight, Bot, Sparkles } from '@lucide/vue'

import avatarBotUrl from '../../avatar_bot.gif'
import SectionHeading from '@/components/SectionHeading.vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const prompts = [
  'Mở sách Toán lớp 3 - Tập 1',
  'Mở sách Tiếng Việt lớp 4 - Tập 2',
  'Kho sách lớp 3 có những môn nào?',
  'Mở sách Khoa học lớp 4',
]
</script>

<template>
  <section id="ai-assistant" class="page-shell scroll-mt-20 py-8 sm:py-12">
    <div
      class="relative isolate overflow-hidden rounded-[30px] bg-ink-950 px-6 py-12 text-white sm:px-12 sm:py-15 lg:grid lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-16"
    >
      <div class="absolute -bottom-20 -right-10 size-64 rounded-full bg-red-600" />
      <div class="absolute -right-2 top-10 size-42 rounded-full bg-[#33415e]" />

      <div class="relative">
        <SectionHeading
          eyebrow="Trợ lý AI Thư viện"
          title="Không biết nên đọc gì? Hãy hỏi AI."
          description="AI gợi ý sách theo độ tuổi, sở thích, môn học và mục tiêu đọc của từng học sinh."
          light
        />
        <button
          type="button"
          class="focus-ring mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-bold text-white transition hover:bg-red-600"
          @click="appStore.openChat"
        >
          Bắt đầu trò chuyện
          <ArrowRight :size="17" />
        </button>
      </div>

      <div class="relative mt-10 rounded-[24px] bg-white p-6 text-ink-950 shadow-2xl lg:mt-0">
        <div class="flex items-center gap-3">
          <span class="grid size-13 place-items-center overflow-hidden rounded-2xl bg-red-50">
            <img
              :src="avatarBotUrl"
              alt="Nhân vật trợ lý AI Thư viện"
              class="h-full w-full object-contain object-bottom"
            />
          </span>
          <div>
            <p class="font-black">AI Library Assistant</p>
            <p class="mt-1 flex items-center gap-1.5 text-xs text-emerald-600">
              <span class="size-2 rounded-full bg-emerald-500" />
              Sẵn sàng hỗ trợ
            </p>
          </div>
          <Bot :size="20" class="ml-auto text-[#3e6ff4]" />
        </div>
        <div class="mt-6 grid gap-3">
          <button
            v-for="(prompt, index) in prompts"
            :key="prompt"
            type="button"
            class="focus-ring flex items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold transition hover:translate-x-1"
            :class="index % 2 === 0 ? 'bg-red-50 text-red-500' : 'bg-[#f1f5ff] text-[#3e6ff4]'"
            @click="appStore.openChatWithPrompt(prompt)"
          >
            {{ prompt }}
            <Sparkles :size="15" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
