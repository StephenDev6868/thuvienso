<script setup lang="ts">
import { ArrowRight, GraduationCap, Users } from '@lucide/vue'

import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const classes = [
  { label: 'Lớp 1', progress: 70 },
  { label: 'Lớp 2', progress: 92 },
  { label: 'Lớp 3', progress: 58 },
  { label: 'Lớp 4', progress: 84 },
]
</script>

<template>
  <section id="community" class="page-shell scroll-mt-20 pb-24 pt-12">
    <div
      class="relative overflow-hidden rounded-[30px] bg-red-500 px-6 py-12 text-white sm:px-12 sm:py-15 lg:grid lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-16"
    >
      <div class="relative z-10">
        <p class="text-xs font-extrabold uppercase tracking-[0.12em] text-red-100">
          Không gian đọc cho cả trường
        </p>
        <h2
          class="mt-4 max-w-3xl text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl lg:text-[40px]"
        >
          Kết nối học sinh, giáo viên và phụ huynh trong một thư viện.
        </h2>
        <p class="mt-5 max-w-2xl leading-7 text-red-100">
          Theo dõi hoạt động đọc, tổ chức cuộc thi, chia sẻ học liệu và xây dựng văn hóa đọc trong
          nhà trường.
        </p>
        <div class="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            class="focus-ring inline-flex h-12 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-red-500"
            @click="appStore.openRegistration"
          >
            <GraduationCap :size="18" />
            Dành cho giáo viên
          </button>
          <button
            type="button"
            class="focus-ring inline-flex h-12 items-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-bold text-white"
            @click="appStore.openChat"
          >
            <Users :size="18" />
            Tôi là phụ huynh
            <ArrowRight :size="16" />
          </button>
        </div>
      </div>

      <div class="relative z-10 mt-10 rounded-[24px] bg-white p-7 text-ink-950 shadow-2xl lg:mt-0">
        <h3 class="text-lg font-black">Thành tích tháng này</h3>
        <div class="mt-7 grid gap-6">
          <div v-for="item in classes" :key="item.label" class="flex items-center gap-4">
            <span class="w-12 shrink-0 text-xs font-semibold text-slate-500">{{ item.label }}</span>
            <div class="h-2.5 flex-1 overflow-hidden rounded-full bg-[#efedee]">
              <div
                class="h-full rounded-full"
                :class="item.progress > 85 ? 'bg-red-500' : 'bg-red-100'"
                :style="{ width: `${item.progress}%` }"
              />
            </div>
            <span class="w-8 text-right text-xs font-bold text-slate-500"
              >{{ item.progress }}%</span
            >
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
