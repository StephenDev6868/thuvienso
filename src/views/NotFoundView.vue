<script setup lang="ts">
import { ArrowLeft } from '@lucide/vue'
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="grid min-h-screen place-items-center bg-ink-950 px-5 text-center text-white">
    <div>
      <p class="text-sm font-bold uppercase tracking-[0.3em] text-red-500">Lỗi 404</p>
      <h1 class="mt-5 text-5xl font-black tracking-[-0.05em] sm:text-7xl">
        Trang này không tồn tại.
      </h1>
      <p class="mx-auto mt-5 max-w-lg text-white/55">
        Đường dẫn có thể đã thay đổi hoặc nội dung bạn tìm kiếm chưa được tạo.
      </p>
      <RouterLink
        to="/"
        class="focus-ring mt-9 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-ink-950"
      >
        <ArrowLeft :size="17" />
        Về trang chủ
      </RouterLink>
    </div>
  </main>
</template>
