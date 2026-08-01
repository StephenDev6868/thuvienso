<script setup lang="ts">
import {
  ArrowRight,
  BookOpen,
  Calculator,
  Check,
  ChevronRight,
  Clock3,
  FlaskConical,
  Globe2,
  Headphones,
  HeartHandshake,
  Languages,
  Landmark,
  Music2,
  Play,
  Search,
  Sparkles,
  X,
} from '@lucide/vue'
import type { Component } from 'vue'
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import audioHero from '@/assets/learning-media/audio-hero.png'
import videoHero from '@/assets/learning-media/video-hero.png'
import { allDigitalVideos, digitalAudiobooks } from '@/data/mediaLibrary'

type MediaKind = 'audio' | 'video'

interface MediaItem {
  id: string
  title: string
  subtitle: string
  category: string
  grade: string
  duration: string
  cover: string
  accent: string
  icon: Component
  mediaUrl?: string
  embedUrl?: string
  source: 'local' | 'youtube'
}

const route = useRoute()
const query = ref('')
const selectedGrade = ref('Tất cả khối')
const selectedCategory = ref('Tất cả chủ đề')
const activeItem = ref<MediaItem | null>(null)
const nativePlayer = ref<HTMLMediaElement | null>(null)

const kind = computed<MediaKind>(() => (route.name === 'video-lessons' ? 'video' : 'audio'))
const isAudio = computed(() => kind.value === 'audio')

function iconForCategory(category: string): Component {
  const normalized = category.toLocaleLowerCase('vi')
  if (normalized.includes('khoa học') || normalized.includes('stem')) return FlaskConical
  if (
    normalized.includes('danh nhân') ||
    normalized.includes('lịch sử') ||
    normalized.includes('bác hồ')
  )
    return Landmark
  if (normalized.includes('tiếng anh')) return Languages
  if (normalized.includes('văn hóa') || normalized.includes('vùng miền')) return Globe2
  if (normalized.includes('thơ') || normalized.includes('đồng dao')) return Music2
  if (normalized.includes('kỹ năng') || normalized.includes('giới tính')) return HeartHandshake
  if (normalized.includes('toán')) return Calculator
  return BookOpen
}

const audioItems: MediaItem[] = digitalAudiobooks.map((item) => ({
  id: item.id,
  title: item.title,
  subtitle: item.subcategory || item.category,
  category: item.category,
  grade: item.grade ? `Lớp ${item.grade}` : 'Mọi lứa tuổi',
  duration: item.duration,
  cover: item.coverUrl,
  accent: item.accent,
  icon: iconForCategory(item.category),
  mediaUrl: item.mediaUrl,
  source: 'local',
}))

const videoItems: MediaItem[] = allDigitalVideos.map((item) => ({
  id: item.id,
  title: item.title,
  subtitle: `${item.subject || item.category}${item.grade ? ` · Lớp ${item.grade}` : ''}`,
  category: item.category,
  grade: item.grade ? `Lớp ${item.grade}` : 'Mọi khối',
  duration: item.duration,
  cover: item.coverUrl || videoHero,
  accent: item.accent,
  icon: iconForCategory(item.subject || item.category),
  mediaUrl: item.format === 'youtube' ? undefined : item.mediaUrl,
  embedUrl: item.format === 'youtube' ? item.embedUrl : undefined,
  source: item.format === 'youtube' ? 'youtube' : 'local',
}))

const items = computed(() => (isAudio.value ? audioItems : videoItems))
const gradeOptions = ['Tất cả khối', 'Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5']
const categoryOptions = computed(() => [
  'Tất cả chủ đề',
  ...new Set(items.value.map((item) => item.category)),
])
const quickCategories = computed(() => categoryOptions.value.slice(1, 8))
const filteredItems = computed(() => {
  const normalized = query.value.trim().toLocaleLowerCase('vi')
  return items.value.filter((item) => {
    const matchesQuery =
      !normalized ||
      `${item.title} ${item.subtitle} ${item.category}`.toLocaleLowerCase('vi').includes(normalized)
    const matchesGrade = selectedGrade.value === 'Tất cả khối' || item.grade === selectedGrade.value
    const matchesCategory =
      selectedCategory.value === 'Tất cả chủ đề' || item.category === selectedCategory.value
    return matchesQuery && matchesGrade && matchesCategory
  })
})

watch(kind, () => {
  query.value = ''
  selectedGrade.value = 'Tất cả khối'
  selectedCategory.value = 'Tất cả chủ đề'
  closePlayer()
})

watch(
  () => route.query.play,
  (mediaId) => {
    const requestedId = Array.isArray(mediaId) ? mediaId[0] : mediaId
    const requestedItem = items.value.find((item) => item.id === requestedId)
    if (requestedItem) openPlayer(requestedItem)
  },
  { immediate: true },
)

function selectCategory(category: string) {
  selectedCategory.value = selectedCategory.value === category ? 'Tất cả chủ đề' : category
}

function resetFilters() {
  query.value = ''
  selectedGrade.value = 'Tất cả khối'
  selectedCategory.value = 'Tất cả chủ đề'
}

function openPlayer(item: MediaItem) {
  activeItem.value = item
  void nextTick(() => nativePlayer.value?.play().catch(() => undefined))
}

function closePlayer() {
  nativePlayer.value?.pause()
  activeItem.value = null
}
</script>

<template>
  <main class="media-page" :class="isAudio ? 'audio-page' : 'video-page'">
    <div class="media-shell">
      <section class="hero" :style="{ backgroundImage: `url(${isAudio ? audioHero : videoHero})` }">
        <div class="hero-copy">
          <p class="eyebrow"><Sparkles :size="16" /> Không gian học tập số</p>
          <h1>{{ isAudio ? 'Sách nói' : 'Video bài giảng' }}</h1>
          <h2 v-if="isAudio">Lắng nghe tri thức<br />Mở rộng thế giới</h2>
          <h2 v-else>Học dễ dàng – Hiểu vững vàng<br />Cùng video bài giảng sinh động</h2>
          <p class="hero-description">
            {{
              isAudio
                ? 'Khám phá kho sách nói phong phú với những câu chuyện thú vị và bài học bổ ích.'
                : 'Bài giảng bám sát chương trình, hình ảnh trực quan, giúp bạn học tập hiệu quả mỗi ngày.'
            }}
          </p>
          <div class="hero-actions">
            <button class="primary-action" type="button" @click="openPlayer(items[0]!)">
              <Headphones v-if="isAudio" :size="18" />
              <Play v-else :size="18" fill="currentColor" />
              {{ isAudio ? 'Nghe ngay' : 'Xem ngay' }}
            </button>
            <a class="secondary-action" href="#media-content">Tìm hiểu thêm</a>
          </div>
        </div>
      </section>

      <section class="filter-panel" aria-label="Tìm kiếm và lọc">
        <div class="filter-title"><Search :size="19" /> <strong>Tìm kiếm & lọc</strong></div>
        <div class="filter-row">
          <label class="search-box">
            <Search :size="18" />
            <input
              v-model="query"
              type="search"
              :placeholder="
                isAudio
                  ? 'Tìm kiếm sách nói, tác giả, chủ đề...'
                  : 'Tìm kiếm video, môn học, chủ đề...'
              "
            />
          </label>
          <label class="select-wrap">
            <span class="sr-only">Khối lớp</span>
            <select v-model="selectedGrade">
              <option v-for="option in gradeOptions" :key="option">{{ option }}</option>
            </select>
          </label>
          <label class="select-wrap">
            <span class="sr-only">Chủ đề</span>
            <select v-model="selectedCategory">
              <option v-for="option in categoryOptions" :key="option">{{ option }}</option>
            </select>
          </label>
          <button class="search-button" type="button"><Search :size="17" /> Tìm kiếm</button>
        </div>
        <div class="category-row">
          <button
            v-for="(category, index) in quickCategories"
            :key="category"
            type="button"
            :class="{ active: selectedCategory === category }"
            @click="selectCategory(category)"
          >
            <span
              :style="{
                '--chip': [
                  '#ef4444',
                  '#f59e0b',
                  '#10b981',
                  '#8b5cf6',
                  '#0ea5e9',
                  '#84cc16',
                  '#f97316',
                ][index],
              }"
            >
              <component
                :is="items.find((item) => item.category === category)?.icon || BookOpen"
                :size="16"
              />
            </span>
            {{ category }}
            <Check v-if="selectedCategory === category" :size="14" />
          </button>
          <button class="round-arrow" type="button" aria-label="Xem thêm chủ đề">
            <ArrowRight :size="18" />
          </button>
        </div>
      </section>

      <section id="media-content" class="content-section">
        <template v-if="isAudio">
          <div class="wood-title">
            <Headphones :size="22" /> Tủ sách nói <span>{{ filteredItems.length }} câu chuyện</span>
          </div>
          <div v-if="filteredItems.length" class="bookshelf">
            <article v-for="item in filteredItems" :key="item.id" class="audio-card">
              <button
                type="button"
                class="cover-button"
                :aria-label="`Nghe ${item.title}`"
                @click="openPlayer(item)"
              >
                <img :src="item.cover" :alt="item.title" />
                <span
                  class="cover-wash"
                  :style="{
                    background: `linear-gradient(180deg, transparent 25%, ${item.accent}e8)`,
                  }"
                ></span>
                <span class="play-badge"><Play :size="20" fill="currentColor" /></span>
                <small><Clock3 :size="12" /> {{ item.duration }}</small>
              </button>
              <p>{{ item.subtitle }}</p>
            </article>
          </div>
        </template>

        <template v-else>
          <div class="section-heading">
            <div>
              <span class="heading-icon"><Play :size="15" fill="currentColor" /></span
              ><strong>Video nổi bật</strong
              ><small>{{ filteredItems.length }} bài học được chọn cho bạn</small>
            </div>
            <button type="button">Xem tất cả <ChevronRight :size="16" /></button>
          </div>
          <div v-if="filteredItems.length" class="video-grid">
            <article v-for="item in filteredItems" :key="item.id" class="video-card">
              <button
                class="video-thumb"
                type="button"
                :style="{ '--accent': item.accent }"
                @click="openPlayer(item)"
              >
                <img :src="item.cover" alt="" />
                <span class="video-pattern"></span>
                <span v-if="item.source === 'youtube'" class="youtube-label">YouTube</span>
                <component :is="item.icon" class="lesson-icon" :size="38" />
                <span class="play-badge"><Play :size="21" fill="currentColor" /></span>
                <small>{{ item.duration }}</small>
              </button>
              <div class="video-info">
                <strong>{{ item.title }}</strong>
                <span>{{ item.subtitle }}</span>
              </div>
            </article>
          </div>
          <div class="grade-section">
            <div class="section-heading compact">
              <div>
                <strong>Danh mục theo lớp</strong><small>Lộ trình vừa sức cho từng khối</small>
              </div>
            </div>
            <div class="grade-grid">
              <button
                v-for="grade in gradeOptions.slice(1)"
                :key="grade"
                type="button"
                :class="{ active: selectedGrade === grade }"
                @click="selectedGrade = selectedGrade === grade ? 'Tất cả khối' : grade"
              >
                <span>{{ grade.slice(-1) }}</span
                ><strong>{{ grade }}</strong
                ><ChevronRight :size="18" />
              </button>
            </div>
          </div>
        </template>

        <div v-if="!filteredItems.length" class="empty-state">
          <Search :size="34" />
          <strong>Chưa tìm thấy nội dung phù hợp</strong>
          <p>Thử một từ khóa hoặc bộ lọc khác nhé.</p>
          <button type="button" @click="resetFilters">Xóa bộ lọc</button>
        </div>
      </section>
    </div>

    <Transition name="player">
      <div v-if="activeItem" class="player-backdrop" @click.self="closePlayer">
        <section class="player-card" role="dialog" aria-modal="true" :aria-label="activeItem.title">
          <button class="close-player" type="button" aria-label="Đóng" @click="closePlayer">
            <X :size="22" />
          </button>
          <div class="player-visual" :style="{ '--accent': activeItem.accent }">
            <template v-if="isAudio">
              <img :src="activeItem.cover" alt="" />
              <span class="visual-tint"></span>
              <Headphones :size="64" />
            </template>
            <iframe
              v-else-if="activeItem.source === 'youtube'"
              :src="activeItem.embedUrl"
              :title="activeItem.title"
              allow="
                accelerometer;
                autoplay;
                clipboard-write;
                encrypted-media;
                gyroscope;
                picture-in-picture;
                web-share;
              "
              allowfullscreen
            />
            <video
              v-else
              ref="nativePlayer"
              :src="activeItem.mediaUrl"
              :poster="activeItem.cover"
              controls
              autoplay
              playsinline
            />
          </div>
          <div class="player-content">
            <span>{{ isAudio ? 'Đang phát sách nói' : 'Đang xem bài giảng' }}</span>
            <h3>{{ activeItem.title }}</h3>
            <p>{{ activeItem.subtitle }}</p>
            <audio v-if="isAudio" ref="nativePlayer" :src="activeItem.mediaUrl" controls autoplay />
            <small class="media-duration"
              ><Clock3 :size="14" /> Thời lượng {{ activeItem.duration }}</small
            >
          </div>
        </section>
      </div>
    </Transition>
  </main>
</template>

<style scoped>
.media-page {
  min-height: 100vh;
  padding: 8px 12px 90px;
  color: #11264b;
}
.media-shell {
  width: min(1500px, 100%);
  margin: 0 auto;
}
.hero {
  position: relative;
  min-height: 390px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.86);
  border-radius: 30px;
  background-position: center;
  background-size: cover;
  box-shadow: 0 22px 50px -34px rgba(19, 68, 112, 0.45);
}
.hero-copy {
  position: relative;
  z-index: 1;
  width: 48%;
  padding: 50px 28px 42px 72px;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 8px;
  color: #e84251;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.hero h1 {
  margin: 0 0 9px;
  color: #e62e3e;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(42px, 4.2vw, 70px);
  font-weight: 900;
  font-style: italic;
  letter-spacing: -0.05em;
  line-height: 1;
  text-transform: uppercase;
  text-shadow: 0 3px 0 rgba(255, 255, 255, 0.75);
}
.hero h2 {
  margin: 0;
  color: #174897;
  font-size: clamp(21px, 2vw, 31px);
  font-weight: 900;
  line-height: 1.28;
  letter-spacing: -0.03em;
}
.hero-description {
  max-width: 455px;
  margin: 17px 0 21px;
  color: #334462;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.65;
}
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.primary-action,
.secondary-action {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 16px;
  padding: 0 21px;
  font-size: 14px;
  font-weight: 900;
  transition: 0.2s ease;
}
.primary-action {
  border: 0;
  background: linear-gradient(135deg, #ff5a68, #e93646);
  color: white;
  box-shadow: 0 12px 24px -12px #e93646;
}
.secondary-action {
  border: 1px solid #eedfe0;
  background: rgba(255, 255, 255, 0.88);
  color: #153467;
  box-shadow: 0 10px 24px -18px #173a69;
}
.primary-action:hover,
.secondary-action:hover {
  transform: translateY(-2px);
}
.filter-panel {
  margin-top: 16px;
  padding: 18px 24px 16px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 16px 45px -35px #1d4d77;
  backdrop-filter: blur(18px);
}
.filter-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 16px;
}
.filter-title svg {
  color: #ee4151;
}
.filter-row {
  display: grid;
  grid-template-columns: minmax(260px, 2fr) minmax(135px, 0.8fr) minmax(150px, 0.9fr) auto;
  gap: 12px;
}
.search-box {
  display: flex;
  height: 46px;
  align-items: center;
  gap: 10px;
  border: 1px solid #dce4ee;
  border-radius: 12px;
  background: #fff;
  padding: 0 14px;
  color: #ef4554;
}
.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  color: #1c3155;
  font-size: 13px;
}
.search-box input::placeholder {
  color: #8290a6;
}
.select-wrap select {
  width: 100%;
  height: 46px;
  border: 1px solid #dce4ee;
  border-radius: 12px;
  background: #fff;
  padding: 0 35px 0 14px;
  color: #1c3155;
  font-size: 13px;
  font-weight: 800;
  outline: none;
}
.search-button {
  display: inline-flex;
  height: 46px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 0;
  border-radius: 12px;
  background: #ef4352;
  padding: 0 24px;
  color: #fff;
  font-weight: 900;
  box-shadow: 0 9px 18px -13px #e82f42;
}
.category-row {
  display: flex;
  gap: 9px;
  overflow-x: auto;
  padding-top: 13px;
  scrollbar-width: none;
}
.category-row::-webkit-scrollbar {
  display: none;
}
.category-row button {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 7px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: #f7f9fc;
  padding: 6px 12px 6px 7px;
  color: #17345e;
  font-size: 12px;
  font-weight: 850;
  transition: 0.2s ease;
}
.category-row button > span {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 9px;
  background: color-mix(in srgb, var(--chip) 14%, white);
  color: var(--chip);
}
.category-row button.active {
  border-color: #ffc4ca;
  background: #fff1f2;
  color: #e93445;
}
.category-row .round-arrow {
  width: 41px;
  justify-content: center;
  padding: 0;
  background: white;
  box-shadow: 0 6px 16px -10px #1f3c61;
  color: #ee4050;
}
.content-section {
  margin-top: 18px;
  scroll-margin-top: 110px;
}
.wood-title {
  display: flex;
  width: fit-content;
  min-width: 330px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  margin: 0 auto -13px;
  border: 4px solid #89501f;
  border-radius: 18px 18px 8px 8px;
  background: linear-gradient(#bd7837, #8f4f1d);
  padding: 10px 30px;
  color: white;
  font-family: Georgia, serif;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  text-shadow: 0 2px 0 #673712;
  box-shadow:
    inset 0 2px #db9d5c,
    0 8px 12px -10px #3d240f;
  position: relative;
  z-index: 2;
}
.wood-title span {
  margin-left: 7px;
  font-family: inherit;
  font-size: 10px;
  letter-spacing: 0;
  opacity: 0.78;
  text-transform: none;
}
.bookshelf {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 24px 13px;
  border: 14px solid #9a5b26;
  border-radius: 28px;
  background:
    linear-gradient(
      90deg,
      rgba(93, 49, 20, 0.18),
      transparent 8%,
      transparent 92%,
      rgba(93, 49, 20, 0.18)
    ),
    repeating-linear-gradient(0deg, #bd7b42 0, #bd7b42 3px, #af6a34 4px, #c68449 7px);
  padding: 38px 28px 29px;
  box-shadow:
    inset 0 0 0 5px #d3914f,
    inset 0 -16px 0 #814719,
    0 23px 50px -28px #55300f;
}
.audio-card {
  min-width: 0;
}
.cover-button {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 0.74;
  overflow: hidden;
  border: 5px solid #7d441d;
  border-radius: 12px 12px 7px 7px;
  padding: 0;
  background: #ddd;
  color: white;
  box-shadow:
    4px 6px 0 #6c3c1d,
    0 14px 18px -13px #301a0d;
  transition: 0.22s ease;
}
.cover-button:hover {
  transform: translateY(-5px) rotate(-0.5deg);
}
.cover-button img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cover-wash {
  position: absolute;
  inset: 0;
  opacity: 0.86;
}
.cover-button strong {
  position: absolute;
  inset: 12px 8px auto;
  color: white;
  font-family: Georgia, serif;
  font-size: clamp(14px, 1.25vw, 21px);
  line-height: 1.05;
  text-shadow: 0 2px 4px rgba(27, 28, 29, 0.5);
}
.play-badge {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  width: 47px;
  height: 47px;
  place-items: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: #ee4050;
  transform: translate(-50%, -50%);
  box-shadow: 0 8px 18px -9px #2e1d12;
}
.cover-button small,
.video-thumb small {
  position: absolute;
  bottom: 6px;
  left: 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 5px;
  background: rgba(13, 25, 37, 0.84);
  padding: 3px 6px;
  color: white;
  font-size: 10px;
  font-weight: 900;
}
.audio-card p {
  overflow: hidden;
  margin: 10px 4px 0;
  color: #fff9ef;
  font-size: 11px;
  font-weight: 800;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 1px 2px #563419;
}
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding: 0 10px;
}
.section-heading > div {
  display: flex;
  align-items: center;
  gap: 8px;
}
.section-heading strong {
  font-size: 17px;
}
.section-heading small {
  color: #70809b;
  font-size: 11px;
  font-weight: 700;
}
.heading-icon {
  display: grid;
  width: 25px;
  height: 25px;
  place-items: center;
  border-radius: 8px;
  background: #ef4151;
  color: white;
}
.section-heading button {
  display: flex;
  align-items: center;
  gap: 4px;
  border: 0;
  border-radius: 12px;
  background: white;
  padding: 9px 13px;
  color: #17345e;
  font-size: 12px;
  font-weight: 900;
  box-shadow: 0 8px 20px -15px #16345f;
}
.video-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 14px;
}
.video-card {
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 17px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 12px 28px -22px #18385f;
  transition: 0.23s ease;
}
.video-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 34px -22px #17375b;
}
.video-thumb {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 1.55;
  overflow: hidden;
  border: 0;
  background: var(--accent);
  padding: 0;
}
.video-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.75);
  opacity: 1;
}
.video-pattern {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent) 82%, white),
    color-mix(in srgb, var(--accent) 35%, white)
  );
  opacity: 0.1;
}
.youtube-label {
  position: absolute;
  top: 9px;
  left: 9px;
  z-index: 2;
  border-radius: 7px;
  background: #ff0033;
  padding: 4px 7px;
  color: white;
  font-size: 9px;
  font-weight: 950;
  letter-spacing: 0.03em;
}
.lesson-icon {
  position: absolute;
  right: 15px;
  bottom: 12px;
  color: rgba(255, 255, 255, 0.82);
}
.video-thumb .play-badge {
  width: 45px;
  height: 45px;
}
.video-info {
  min-height: 95px;
  padding: 12px 13px 13px;
}
.video-info strong {
  display: -webkit-box;
  overflow: hidden;
  color: #17345f;
  font-size: 13px;
  line-height: 1.4;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.video-info span {
  display: block;
  margin-top: 9px;
  color: #7b879c;
  font-size: 10px;
  font-weight: 800;
}
.grade-section {
  margin-top: 22px;
  border: 1px solid rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.86);
  padding: 18px;
  box-shadow: 0 15px 35px -28px #16375f;
}
.section-heading.compact {
  margin-bottom: 14px;
  padding: 0;
}
.section-heading.compact > div {
  align-items: baseline;
}
.grade-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 13px;
}
.grade-grid button {
  display: flex;
  min-height: 70px;
  align-items: center;
  gap: 12px;
  border: 2px solid transparent;
  border-radius: 16px;
  background: linear-gradient(135deg, #fff1f1, #ffd9da);
  padding: 10px 14px;
  color: #d94c55;
  transition: 0.2s ease;
}
.grade-grid button:nth-child(2) {
  background: linear-gradient(135deg, #fff5cf, #ffd75f);
  color: #d57815;
}
.grade-grid button:nth-child(3) {
  background: linear-gradient(135deg, #eff9d9, #cbe696);
  color: #4c863d;
}
.grade-grid button:nth-child(4) {
  background: linear-gradient(135deg, #e8f4ff, #c8e2fa);
  color: #2876ba;
}
.grade-grid button:nth-child(5) {
  background: linear-gradient(135deg, #f6edff, #dfcafa);
  color: #864eb4;
}
.grade-grid button.active {
  border-color: currentColor;
  transform: translateY(-2px);
}
.grade-grid button span {
  display: grid;
  width: 39px;
  height: 39px;
  place-items: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.65);
  font-size: 18px;
  font-weight: 950;
}
.grade-grid button strong {
  flex: 1;
  text-align: left;
  font-size: 16px;
}
.grade-grid button svg {
  opacity: 0.65;
}
.empty-state {
  display: grid;
  min-height: 280px;
  place-items: center;
  align-content: center;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.82);
  color: #74839a;
  text-align: center;
}
.empty-state strong {
  margin-top: 12px;
  color: #18345e;
  font-size: 18px;
}
.empty-state p {
  margin: 6px 0 15px;
}
.empty-state button {
  border: 0;
  border-radius: 12px;
  background: #ef4050;
  padding: 10px 16px;
  color: white;
  font-weight: 900;
}
.player-backdrop {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(15, 30, 53, 0.56);
  padding: 20px;
  backdrop-filter: blur(8px);
}
.player-card {
  position: relative;
  display: grid;
  width: min(780px, 100%);
  grid-template-columns: 0.92fr 1.08fr;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 30px;
  background: #fff;
  box-shadow: 0 35px 90px -35px #0f1d35;
}
.close-player {
  position: absolute;
  z-index: 3;
  top: 14px;
  right: 14px;
  display: grid;
  width: 39px;
  height: 39px;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #18345d;
  box-shadow: 0 8px 20px -12px #1b3357;
}
.player-visual {
  position: relative;
  display: grid;
  min-height: 390px;
  place-items: center;
  overflow: hidden;
  background: var(--accent);
  color: white;
}
.player-visual > img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.65;
  filter: blur(1px) saturate(0.8);
  transform: scale(1.08);
}
.visual-tint {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    140deg,
    color-mix(in srgb, var(--accent) 82%, transparent),
    rgba(20, 34, 55, 0.46)
  );
}
.player-visual > svg {
  position: relative;
  filter: drop-shadow(0 8px 20px rgba(17, 32, 49, 0.25));
}
.player-visual > button {
  position: relative;
  display: grid;
  width: 74px;
  height: 74px;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: white;
  color: #ed3e4f;
  box-shadow: 0 16px 30px -15px #132844;
}
.player-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px 38px 36px;
}
.player-content > span {
  color: #ed4050;
  font-size: 11px;
  font-weight: 950;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.player-content h3 {
  margin: 8px 0 5px;
  color: #17335b;
  font-size: 27px;
  line-height: 1.18;
}
.player-content p {
  margin: 0 0 28px;
  color: #748196;
  font-size: 13px;
  font-weight: 700;
}
.progress {
  width: 100%;
  height: 5px;
  appearance: none;
  border-radius: 99px;
  outline: none;
  background: linear-gradient(90deg, #ef4050 var(--progress), #e8edf3 var(--progress));
}
.progress::-webkit-slider-thumb {
  width: 15px;
  height: 15px;
  appearance: none;
  border: 3px solid white;
  border-radius: 50%;
  background: #ef4050;
  box-shadow: 0 2px 7px #a5afbd;
}
.time-row {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  color: #8290a4;
}
.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 13px;
  margin-top: 24px;
}
.controls button {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: #f2f5f8;
  color: #17345e;
}
.controls .main-control {
  width: 56px;
  height: 56px;
  background: #ef4050;
  color: white;
  box-shadow: 0 12px 23px -13px #e23044;
}
.player-enter-active,
.player-leave-active {
  transition: 0.22s ease;
}
.player-enter-from,
.player-leave-to {
  opacity: 0;
}
.player-enter-from .player-card,
.player-leave-to .player-card {
  transform: translateY(20px) scale(0.96);
}
.player-visual > video,
.player-visual > iframe {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  min-height: 390px;
  background: #0e1726;
  object-fit: contain;
}
.player-visual > iframe {
  border: 0;
}
.player-content audio {
  width: 100%;
  accent-color: #ef4050;
}
.media-duration {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 15px;
  color: #7b879b;
  font-weight: 800;
}
@media (max-width: 1100px) {
  .hero {
    min-height: 350px;
  }
  .hero-copy {
    padding: 40px 25px 35px 48px;
  }
  .video-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .bookshelf {
    grid-template-columns: repeat(4, 1fr);
  }
  .grade-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 760px) {
  .media-page {
    padding: 2px 8px 90px;
  }
  .hero {
    min-height: 610px;
    border-radius: 24px;
    background-position: 66% bottom;
    background-size: auto 53%;
    background-repeat: no-repeat;
    background-color: #effaff;
  }
  .hero::after {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(247, 252, 255, 0.98) 0 48%,
      rgba(247, 252, 255, 0.15) 66%,
      rgba(247, 252, 255, 0)
    );
    content: '';
  }
  .hero-copy {
    width: 100%;
    padding: 30px 23px;
    text-align: center;
  }
  .eyebrow {
    justify-content: center;
  }
  .hero h1 {
    font-size: 39px;
  }
  .hero h2 {
    font-size: 21px;
  }
  .hero-description {
    margin: 13px auto 17px;
    font-size: 13px;
  }
  .hero-actions {
    justify-content: center;
  }
  .filter-panel {
    padding: 16px 13px;
    border-radius: 22px;
  }
  .filter-row {
    grid-template-columns: 1fr 1fr;
  }
  .search-box {
    grid-column: 1/-1;
  }
  .search-button {
    grid-column: 1/-1;
  }
  .category-row {
    margin-right: -5px;
  }
  .wood-title {
    min-width: 260px;
    font-size: 17px;
  }
  .wood-title span {
    display: none;
  }
  .bookshelf {
    grid-template-columns: repeat(2, 1fr);
    gap: 22px 13px;
    border-width: 9px;
    border-radius: 22px;
    padding: 33px 15px 24px;
  }
  .audio-card p {
    font-size: 10px;
  }
  .cover-button strong {
    font-size: 17px;
  }
  .video-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .section-heading small {
    display: none;
  }
  .video-info {
    min-height: 92px;
    padding: 10px;
  }
  .video-info strong {
    font-size: 12px;
  }
  .grade-grid {
    grid-template-columns: 1fr;
  }
  .player-card {
    grid-template-columns: 1fr;
    max-height: 88vh;
    overflow-y: auto;
  }
  .player-visual {
    min-height: 245px;
  }
  .player-content {
    padding: 28px 25px 24px;
  }
  .player-content h3 {
    font-size: 23px;
  }
}
@media (max-width: 390px) {
  .hero {
    min-height: 575px;
  }
  .filter-row {
    grid-template-columns: 1fr;
  }
  .search-box,
  .search-button {
    grid-column: auto;
  }
  .video-grid {
    grid-template-columns: 1fr;
  }
  .bookshelf {
    padding-inline: 10px;
  }
}
</style>
