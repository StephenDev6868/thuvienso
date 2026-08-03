<script setup lang="ts">
import { Flower2, Grid2X2, Heart, QrCode, Star } from '@lucide/vue'
import type { Component } from 'vue'
import { useRouter } from 'vue-router'

import { digitalBooks } from '@/data/digitalLibrary'
import { bookFilters } from '@/data/library'
import { useAppStore } from '@/stores/app'

type QuickAction = 'new' | 'popular' | 'favorite' | 'category' | 'leave'

interface QuickLink {
  title: string
  description: string
  icon: Component
  color: string
  action: QuickAction
}

const appStore = useAppStore()
const router = useRouter()

const links: QuickLink[] = [
  {
    title: 'Sách mới',
    description: `${digitalBooks.length} tài liệu`,
    icon: Star,
    color: '#f5a623',
    action: 'new',
  },
  {
    title: 'Sách hay',
    description: 'Được yêu thích',
    icon: Flower2,
    color: '#f05265',
    action: 'popular',
  },
  {
    title: 'Sách yêu thích',
    description: 'Dành riêng cho bạn',
    icon: Heart,
    color: '#ef4444',
    action: 'favorite',
  },
  {
    title: 'Thể loại',
    description: `${bookFilters.length - 1} danh mục`,
    icon: Grid2X2,
    color: '#4a90e2',
    action: 'category',
  },
  {
    title: 'Đơn xin nghỉ phép',
    description: 'Quét QR để điền đơn',
    icon: QrCode,
    color: '#10a37f',
    action: 'leave',
  },
]

function scrollToBooks() {
  globalThis.document.querySelector('#featured-books')?.scrollIntoView({ behavior: 'smooth' })
}

function runAction(action: QuickAction) {
  if (action === 'leave') return appStore.openUtilityModal('leave')
  if (action === 'category') return router.push({ name: 'three-d-library' })
  if (action === 'favorite') appStore.searchBooks('')
  scrollToBooks()
}
</script>

<template>
  <section
    id="quick-access"
    class="quick-access-section page-shell -mt-3 scroll-mt-20 pb-6 md:-mt-6 md:pb-8"
  >
    <div class="quick-access-grid">
      <button
        v-for="link in links"
        :key="link.title"
        type="button"
        class="quick-access-card focus-ring group"
        @click="runAction(link.action)"
      >
        <span class="quick-access-icon" :style="{ '--quick-color': link.color }">
          <component :is="link.icon" :size="22" fill="currentColor" />
        </span>
        <span class="quick-access-copy">
          <strong class="quick-access-title">
            {{ link.title }}
          </strong>
          <span class="quick-access-description">
            {{ link.description }}
          </span>
        </span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.quick-access-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: clamp(8px, 1vw, 16px);
}

.quick-access-section {
  width: 100%;
  max-width: none;
  padding-right: clamp(12px, 1.5vw, 28px);
  padding-left: clamp(12px, 1.5vw, 28px);
}

.quick-access-card {
  position: relative;
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr);
  min-width: 0;
  min-height: 62px;
  align-items: center;
  gap: clamp(7px, 0.8vw, 14px);
  padding: 7px clamp(12px, 1vw, 18px) 7px clamp(9px, 0.8vw, 14px);
  border: 2px solid rgb(255 255 255 / 0.9);
  border-radius: 18px;
  background: rgb(255 255 255 / 0.92);
  box-shadow: 0 20px 42px -30px rgb(24 32 51 / 0.55);
  text-align: left;
  transition: 180ms ease;
}

.quick-access-card:hover {
  transform: translateY(-2px);
}

.quick-access-icon {
  display: grid;
  width: 46px;
  height: 46px;
  place-items: center;
  border-radius: 15px;
  color: var(--quick-color, white);
  background: color-mix(in srgb, currentColor, white 78%);
}

.quick-access-copy {
  min-width: 0;
}

.quick-access-title,
.quick-access-description {
  display: block;
  white-space: nowrap;
}

.quick-access-title {
  color: #17213a;
  font-size: clamp(11px, 1.15vw, 15px);
  font-weight: 900;
}

.quick-access-description {
  margin-top: 4px;
  color: #41516f;
  font-size: clamp(9px, 0.9vw, 12px);
  font-weight: 700;
}

@media (max-width: 1023px) {
  .quick-access-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .quick-access-card {
    grid-template-columns: 36px minmax(0, 1fr);
    gap: 5px;
    padding: 7px;
  }

  .quick-access-icon {
    width: 36px;
    height: 36px;
    border-radius: 12px;
  }

  .quick-access-title {
    font-size: 11px;
  }

  .quick-access-description {
    font-size: 9px;
  }
}

@media (max-width: 767px) {
  .quick-access-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
