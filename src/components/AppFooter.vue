<script setup lang="ts">
import { ArrowUpRight, Globe2, MessagesSquare } from '@lucide/vue'
import { RouterLink } from 'vue-router'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const groups = [
  {
    title: 'Khám phá',
    links: [
      { label: 'Kho sách', to: { name: 'home', hash: '#featured-books' } },
      { label: 'Tủ sách 3D', to: { name: 'three-d-library' } },
      { label: 'Bản đồ 3D', to: { name: 'vietnam-3d-map' } },
      { label: 'Sách nói', to: { name: 'home', hash: '#quick-access' } },
      { label: 'Học liệu STEM', to: { name: 'home', hash: '#stem-videos' } },
    ],
  },
  {
    title: 'Tài nguyên',
    links: [
      { label: 'Hướng dẫn', to: { name: 'home', hash: '#top' } },
      { label: 'Chính sách', to: { name: 'home', hash: '#top' } },
      { label: 'Hỗ trợ', to: { name: 'home', hash: '#ai-assistant' } },
    ],
  },
  {
    title: 'Nhà trường',
    links: [
      { label: 'Giáo viên', to: { name: 'home', hash: '#community' } },
      { label: 'Phụ huynh', to: { name: 'home', hash: '#community' } },
      { label: 'Hoạt động', to: { name: 'home', hash: '#community' } },
    ],
  },
]

const contactLinks = [
  {
    label: 'Fanpage nhà trường',
    description: 'Cổng thông tin giáo dục Viettel',
    href: 'https://edu.viettel.vn/danang-thbuithixuan',
    icon: Globe2,
  },
  {
    label: 'Cộng đồng Facebook',
    description: 'Kết nối giáo viên và phụ huynh',
    href: 'https://www.facebook.com/share/g/14jFHSPe8Wd/?mibextid=wwXIfr',
    icon: MessagesSquare,
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
            <RouterLink
              v-for="link in group.links"
              :key="link.label"
              :to="link.to"
              class="focus-ring w-fit rounded text-sm text-slate-400 transition hover:text-white"
            >
              {{ link.label }}
            </RouterLink>
          </div>
        </div>
      </div>

      <section
        id="contact"
        class="relative mt-16 scroll-mt-28 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/10 backdrop-blur-sm sm:p-8 lg:grid lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-10"
        aria-labelledby="contact-title"
      >
        <div
          class="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full bg-red-500/20 blur-3xl"
        />
        <div
          class="pointer-events-none absolute -bottom-24 left-1/3 size-48 rounded-full bg-sky-400/10 blur-3xl"
        />

        <div class="relative">
          <p
            class="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/15 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-red-300"
          >
            <span class="size-1.5 rounded-full bg-red-400" />
            Kết nối cùng nhà trường
          </p>
          <h2 id="contact-title" class="mt-4 text-2xl font-black tracking-[-0.03em] sm:text-3xl">
            Liên hệ với chúng tôi
          </h2>
          <p class="mt-3 max-w-md text-sm leading-6 text-slate-400">
            Theo dõi thông tin mới và cùng đồng hành trong các hoạt động giáo dục của nhà trường.
          </p>
        </div>

        <div class="relative mt-7 grid gap-3 sm:grid-cols-2 lg:mt-0">
          <button
            v-for="contact in contactLinks"
            :key="contact.href"
            type="button"
            class="focus-ring group flex min-h-24 items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.07] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-red-400/40 hover:bg-white/[0.11]"
            :aria-label="`Xem mã QR ${contact.label}`"
            @click="appStore.openUtilityModal('contact')"
          >
            <span
              class="grid size-11 shrink-0 place-items-center rounded-xl bg-red-500/15 text-red-300 transition group-hover:bg-red-500 group-hover:text-white"
            >
              <component :is="contact.icon" :size="20" />
            </span>
            <span class="min-w-0 flex-1">
              <strong class="block text-sm">{{ contact.label }}</strong>
              <span class="mt-1 block text-xs leading-5 text-slate-400">
                {{ contact.description }}
              </span>
            </span>
            <ArrowUpRight
              :size="18"
              class="shrink-0 text-slate-500 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-red-300"
            />
          </button>
        </div>
      </section>

      <div
        class="mt-10 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-slate-500 sm:flex-row sm:justify-between"
      >
        <p>© 2026 Thư viện số. Thiết kế dành cho giáo dục.</p>
        <p>Đỏ chủ đạo • AI • STEM • Học sinh tiểu học</p>
      </div>
    </div>
  </footer>
</template>
