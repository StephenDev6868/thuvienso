<script setup lang="ts">
const groups = [
  {
    title: 'Khám phá',
    links: [
      { label: 'Kho sách', href: '#featured-books' },
      { label: 'Sách nói', href: '#quick-access' },
      { label: 'Học liệu STEM', href: '#stem-videos' },
    ],
  },
  {
    title: 'Tài nguyên',
    links: [
      { label: 'Hướng dẫn', href: '#top' },
      { label: 'Chính sách', href: '#top' },
      { label: 'Hỗ trợ', href: '#ai-assistant' },
    ],
  },
  {
    title: 'Nhà trường',
    links: [
      { label: 'Giáo viên', href: '#community' },
      { label: 'Phụ huynh', href: '#community' },
      { label: 'Hoạt động', href: '#community' },
    ],
  },
]
</script>

<template>
  <footer class="bg-ink-950 pb-14 pt-18 text-white sm:pt-22">
    <div class="page-shell">
      <div class="grid gap-12 md:grid-cols-[1.7fr_repeat(3,1fr)]">
        <div>
          <p class="text-2xl font-black tracking-[-0.03em]">THƯ VIỆN SỐ</p>
          <p class="mt-5 max-w-sm text-sm leading-7 text-slate-400">
            Không gian đọc, học và sáng tạo dành cho học sinh thời đại số.
          </p>
        </div>
        <div v-for="group in groups" :key="group.title">
          <p class="font-bold">{{ group.title }}</p>
          <div class="mt-5 grid gap-4">
            <a
              v-for="link in group.links"
              :key="link.label"
              :href="link.href"
              class="focus-ring w-fit rounded text-sm text-slate-400 transition hover:text-white"
            >
              {{ link.label }}
            </a>
          </div>
        </div>
      </div>
      <div
        class="mt-18 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-slate-500 sm:flex-row sm:justify-between"
      >
        <p>© 2026 Thư viện số. Thiết kế dành cho giáo dục.</p>
        <p>Đỏ chủ đạo • AI • STEM • Học sinh tiểu học</p>
      </div>
    </div>
  </footer>
</template>
