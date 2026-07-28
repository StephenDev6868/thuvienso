<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'

import SectionHeading from '@/components/SectionHeading.vue'
import { topics } from '@/data/library'

function explore(anchor: string) {
  globalThis.document.querySelector(`#${anchor}`)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <section id="topics" class="page-shell section-space scroll-mt-20">
    <SectionHeading
      eyebrow="Khám phá theo chủ đề"
      title="Tủ sách kỳ thú"
      description="Mỗi tủ sách là một thế giới riêng đang chờ các em khám phá."
    />
    <div class="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <button
        v-for="topic in topics"
        :key="topic.title"
        type="button"
        class="focus-ring card-lift group flex min-h-42 items-center gap-5 rounded-[22px] bg-white p-4 text-left shadow-sm"
        @click="explore(topic.anchor)"
      >
        <span
          class="grid h-33 w-28 shrink-0 place-items-center rounded-[18px] text-3xl font-black text-white sm:w-29"
          :style="{ backgroundColor: topic.color }"
        >
          {{ topic.icon }}
        </span>
        <span class="min-w-0">
          <strong class="block text-lg">{{ topic.title }}</strong>
          <span class="mt-3 block text-sm leading-6 text-slate-500">{{ topic.description }}</span>
          <span
            class="mt-4 flex items-center gap-2 text-xs font-bold"
            :style="{ color: topic.color }"
          >
            Khám phá
            <ArrowRight :size="14" class="transition group-hover:translate-x-1" />
          </span>
        </span>
      </button>
    </div>
  </section>
</template>
