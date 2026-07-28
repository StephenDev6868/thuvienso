<script setup lang="ts">
import { BookOpen, FileText } from '@lucide/vue'

import type { Book } from '@/types/library'

defineProps<{
  book: Book
}>()

const emit = defineEmits<{
  select: [book: Book]
}>()
</script>

<template>
  <article class="card-lift group overflow-hidden rounded-[22px] bg-white shadow-sm">
    <button
      type="button"
      class="focus-ring block w-full text-left"
      :aria-label="`Đọc online sách ${book.title}`"
      @click="emit('select', book)"
    >
      <span class="relative block aspect-[0.708] w-full overflow-hidden bg-slate-100">
        <img
          :src="book.coverUrl"
          :alt="`Bìa sách ${book.title}`"
          class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
          loading="lazy"
        />
        <span
          class="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent"
        />
        <span
          class="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider shadow-sm backdrop-blur"
          :style="{ color: book.accent }"
        >
          Lớp {{ book.grade }}
        </span>
        <span
          class="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur"
        >
          <FileText :size="12" />
          {{ book.pageCount }} trang
        </span>
      </span>
      <span class="block p-4">
        <span
          class="text-[11px] font-extrabold uppercase tracking-[0.08em]"
          :style="{ color: book.accent }"
        >
          {{ book.subject }}
        </span>
        <strong class="mt-2 block min-h-12 leading-6">{{ book.title }}</strong>
        <span class="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
          {{ book.description }}
        </span>
        <span class="mt-4 flex items-center gap-2 text-xs font-extrabold text-red-500">
          <BookOpen :size="15" />
          Đọc sách online
        </span>
      </span>
    </button>
  </article>
</template>
