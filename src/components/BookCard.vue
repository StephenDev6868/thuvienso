<script setup lang="ts">
import { ArrowRight, Star } from '@lucide/vue'

import type { Book } from '@/types/library'

defineProps<{
  book: Book
}>()

const emit = defineEmits<{
  select: [book: Book]
}>()
</script>

<template>
  <article class="card-lift group rounded-[20px] bg-white p-4 shadow-sm">
    <button
      type="button"
      class="focus-ring block w-full rounded-[14px] text-left"
      :aria-label="`Xem sách ${book.title}`"
      @click="emit('select', book)"
    >
      <span
        class="relative grid aspect-[0.76] w-full place-items-center overflow-hidden rounded-[14px]"
        :style="{ backgroundColor: book.color }"
      >
        <span
          class="grid size-21 place-items-center rounded-full bg-white text-2xl font-black shadow-lg transition duration-300 group-hover:scale-110"
          :style="{ color: book.textColor }"
        >
          {{ String(book.id).padStart(2, '0') }}
        </span>
        <span
          class="absolute bottom-4 left-4 rounded-full bg-black/12 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
        >
          {{ book.category }}
        </span>
      </span>
      <strong class="mt-5 block min-h-12 leading-6">{{ book.title }}</strong>
      <span class="mt-2 block min-h-10 text-sm leading-5 text-slate-500">{{ book.subtitle }}</span>
      <span class="mt-3 flex items-center gap-1 text-sun-300" aria-label="5 trên 5 sao">
        <Star v-for="star in 5" :key="star" :size="13" fill="currentColor" />
      </span>
      <span
        class="mt-4 flex items-center gap-1 text-xs font-bold text-red-500 opacity-0 transition group-hover:opacity-100"
      >
        Xem gợi ý
        <ArrowRight :size="14" />
      </span>
    </button>
  </article>
</template>
