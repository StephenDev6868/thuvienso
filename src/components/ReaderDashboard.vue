<script setup lang="ts">
const stats = [
  { value: '12', label: 'Sách đã đọc', background: '#fff0f2', color: '#df2133' },
  { value: '5h 40m', label: 'Thời gian đọc', background: '#f1f5ff', color: '#3e6ff4' },
  { value: '08', label: 'Huy hiệu', background: '#fff7dd', color: '#c58a00' },
]
</script>

<template>
  <section class="page-shell py-8 sm:py-12">
    <div
      class="rounded-[28px] bg-white px-6 py-10 shadow-sm sm:px-12 lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16"
    >
      <div>
        <p class="text-xs font-extrabold uppercase tracking-[0.12em] text-red-500">Góc của bạn</p>
        <h2 class="mt-4 max-w-2xl text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl">
          Chào Minh Anh,<br />tiếp tục hành trình đọc nhé!
        </h2>
        <div class="mt-9 max-w-md">
          <div class="flex items-center justify-between text-sm font-bold">
            <span>Mục tiêu tuần này</span>
            <span class="text-red-500">80%</span>
          </div>
          <div class="mt-3 h-3 overflow-hidden rounded-full bg-[#eeeae7]">
            <div class="h-full w-4/5 rounded-full bg-red-500" />
          </div>
          <p class="mt-3 text-sm text-slate-500">4/5 cuốn sách</p>
        </div>
      </div>
      <div class="mt-9 grid grid-cols-3 gap-3 lg:mt-0">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="grid min-h-39 place-items-center rounded-[18px] px-3 text-center sm:min-w-39"
          :style="{ backgroundColor: stat.background }"
        >
          <div>
            <strong class="block text-2xl font-black sm:text-3xl" :style="{ color: stat.color }">
              {{ stat.value }}
            </strong>
            <span class="mt-5 block text-[11px] font-semibold sm:text-xs">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
