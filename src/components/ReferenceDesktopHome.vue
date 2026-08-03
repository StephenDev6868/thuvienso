<script setup lang="ts">
import {
  ArrowRight,
  BookOpen,
  Flower2,
  GraduationCap,
  Grid2X2,
  Headphones,
  Heart,
  Home,
  LockKeyhole,
  MessagesSquare,
  Play,
  QrCode,
  Search,
  Shield,
  Trophy,
  UserRound,
} from '@lucide/vue'
import type { Component } from 'vue'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import logoUrl from '../../logo.jpg'
import HomeBookcaseCanvas from '@/components/HomeBookcaseCanvas.vue'
import LibraryHeroSlider from '@/components/LibraryHeroSlider.vue'
import { digitalResourceCollection } from '@/data/digitalLibrary'
import { threeDBookCabinets } from '@/data/threeDLibrary'
import { useAppStore } from '@/stores/app'
import type { Book } from '@/types/library'

interface NavItem {
  label: string
  icon: Component
  action: () => void
  active?: boolean
}

interface QuickItem {
  title: string
  subtitle: string
  icon: Component
  color: string
  action: () => void
}

const appStore = useAppStore()
const router = useRouter()
const query = ref('')
const activeGrade = ref<number | 'Tất cả'>('Tất cả')

const textbookCabinet =
  threeDBookCabinets.find((cabinet) => cabinet.id === 'sgk-tieu-hoc') ?? threeDBookCabinets[0]!

const gradeShelves = computed(() => textbookCabinet.shelves.slice(0, 3))
const visibleShelves = computed(() => {
  if (activeGrade.value === 'Tất cả') return gradeShelves.value
  return textbookCabinet.shelves
    .filter((shelf) => shelf.label.includes(String(activeGrade.value)))
    .slice(0, 3)
})

const stats = [
  { label: 'Đầu sách', value: '1.250+', icon: BookOpen, color: '#f5a623' },
  {
    label: 'Video bài giảng',
    value: `${digitalResourceCollection.documentCount}+`,
    icon: GraduationCap,  
    color: '#315fd7',
  },
  { label: 'Video', value: '50+', icon: Play, color: '#ef4444' },
  { label: 'Sách nói', value: '20+', icon: Headphones, color: '#8757f2' },
  { label: 'Audio', value: '20+', icon: Headphones, color: '#a855f7' },
]

const activities = [
  {
    title: 'Cuộc thi đọc sách',
    desc: 'Cùng nhau đọc sách - Cùng nhau tiến bộ',
    date: '01/05 - 30/05/2024',
    icon: Trophy,
    color: '#f59e0b',
  },
  {
    title: 'Ngày hội STEM',
    desc: 'Khám phá - Sáng tạo - Trải nghiệm',
    date: '15/05/2024',
    icon: Grid2X2,
    color: '#8b5cf6',
  },
  {
    title: 'Giờ kể chuyện',
    desc: 'Những câu chuyện ý nghĩa',
    date: '20/05/2024',
    icon: Flower2,
    color: '#3b82f6',
  },
]

function goHome() {
  void router.push({ name: 'home', hash: '#top' })
}

function goBooks(search = '') {
  appStore.searchBooks(search)
  void router.push({ name: 'home', hash: '#featured-books' })
}

function goThreeD() {
  void router.push({ name: 'three-d-library' })
}

function submitSearch() {
  goBooks(query.value)
}

function setGrade(grade: number | 'Tất cả') {
  activeGrade.value = grade
  appStore.activeGradeFilter = grade
}

function openBook(book: Book) {
  appStore.openReader(book.id)
}

const navItems: NavItem[] = [
  { label: 'Trang chủ', icon: Home, action: goHome, active: true },
  { label: 'Kho sách', icon: BookOpen, action: () => goBooks() },
  { label: 'Tủ sách 3D', icon: Shield, action: goThreeD },
  { label: 'Sách nói', icon: Headphones, action: () => goBooks('truyện') },
  { label: 'Video', icon: GraduationCap, action: () => goBooks('học liệu') },
  { label: 'STEM', icon: Grid2X2, action: () => goBooks('stem') },
  { label: 'Hoạt động', icon: Trophy, action: goThreeD },
]

const quickItems: QuickItem[] = [
  {
    title: 'Sách mới',
    subtitle: 'Cập nhật mỗi ngày',
    icon: Flower2,
    color: '#f5a623',
    action: () => goBooks(),
  },
  {
    title: 'Sách hay',
    subtitle: 'Được yêu thích',
    icon: Flower2,
    color: '#f05265',
    action: () => goBooks(),
  },
  {
    title: 'Sách yêu thích',
    subtitle: 'Dành riêng cho bạn',
    icon: Heart,
    color: '#ef4444',
    action: () => goBooks(),
  },
  {
    title: 'Thể loại',
    subtitle: 'Danh mục sách',
    icon: Grid2X2,
    color: '#3f8fe5',
    action: goThreeD,
  },
  {
    title: 'Đơn xin nghỉ phép',
    subtitle: 'Quét QR để điền đơn',
    icon: QrCode,
    color: '#10a37f',
    action: () => appStore.openUtilityModal('leave'),
  },
]

const bottomItems: QuickItem[] = [
  {
    title: 'Sách mới',
    subtitle: 'cập nhật',
    icon: BookOpen,
    color: '#3f8fe5',
    action: () => goBooks(),
  },
  {
    title: 'Sách yêu thích',
    subtitle: 'của bạn',
    icon: Heart,
    color: '#ef4444',
    action: () => goBooks(),
  },
  {
    title: 'Sách nói',
    subtitle: 'nghe mọi lúc',
    icon: Headphones,
    color: '#a855f7',
    action: () => goBooks('truyện'),
  },
  {
    title: 'Video bài giảng',
    subtitle: 'học dễ hiểu',
    icon: Play,
    color: '#ef4444',
    action: () => goBooks('video'),
  },
  {
    title: 'Học liệu',
    subtitle: 'đa dạng',
    icon: GraduationCap,
    color: '#315fd7',
    action: () => goBooks('học liệu'),
  },
]
</script>

<template>
  <section class="coded-home">
    <div class="coded-home__shell">
      <header class="coded-header" aria-label="Điều hướng chính">
        <button type="button" class="brand" @click="goHome">
          <img :src="logoUrl" alt="Logo Trường Tiểu học Bùi Thị Xuân" />
          <span>
            <strong>THƯ VIỆN SỐ</strong>
            <small>TRƯỜNG TIỂU HỌC BÙI THỊ XUÂN</small>
          </span>
        </button>

        <nav class="coded-nav">
          <button
            v-for="item in navItems"
            :key="item.label"
            type="button"
            class="nav-tile"
            :class="{ 'is-active': item.active }"
            @click="item.action"
          >
            <component :is="item.icon" :size="22" />
            <span>{{ item.label }}</span>
          </button>
        </nav>

        <form class="coded-search" role="search" @submit.prevent="submitSearch">
          <Search :size="18" />
          <input v-model="query" type="search" placeholder="Tìm kiếm sách, chủ đề..." />
          <button type="submit" aria-label="Tìm kiếm">
            <Search :size="18" />
          </button>
        </form>

        <button type="button" class="pill-action lock" @click="appStore.openSmartLock">
          <LockKeyhole :size="17" />
          Màn hình khóa
        </button>
        <button type="button" class="pill-action contact" @click="appStore.openUtilityModal('contact')">
          <MessagesSquare :size="17" />
          Liên hệ
        </button>
        <button type="button" class="avatar" aria-label="Cá nhân">
          <UserRound :size="24" />
        </button>
      </header>

      <div class="top-grid">
        <LibraryHeroSlider class="desktop-hero-slider" />

        <aside class="welcome-card">
          <div class="wood-sign">
            <strong>Xin chào!</strong>
            <span>Hôm nay bạn muốn<br />đọc sách gì nào?</span>
          </div>
          <div class="balloon" aria-hidden="true" />
          <div class="stats-card">
            <div v-for="stat in stats" :key="stat.label" class="stat">
              <component :is="stat.icon" :size="32" :style="{ color: stat.color }" />
              <strong :style="{ color: stat.color }">{{ stat.value }}</strong>
              <span>{{ stat.label }}</span>
            </div>
          </div>
        </aside>
      </div>

      <div class="quick-row">
        <button
          v-for="item in quickItems"
          :key="item.title"
          type="button"
          class="quick-card"
          @click="item.action"
        >
          <span class="quick-icon" :style="{ '--quick-color': item.color }">
            <component :is="item.icon" :size="30" fill="currentColor" />
          </span>
          <span>
            <strong>{{ item.title }}</strong>
            <small>{{ item.subtitle }}</small>
          </span>
        </button>
      </div>

      <div class="main-grid">
        <HomeBookcaseCanvas
          :shelves="visibleShelves"
          :active-grade="activeGrade"
          @open-book="openBook"
          @set-grade="setGrade"
          @show-all="goThreeD"
        />

        <aside class="right-column">
          <section class="activity-card">
            <header>
              <h3>Hoạt động nổi bật</h3>
              <button type="button" @click="goThreeD">
                Xem tất cả
                <ArrowRight :size="14" />
              </button>
            </header>
            <button
              v-for="activity in activities"
              :key="activity.title"
              type="button"
              class="activity-item"
              @click="goThreeD"
            >
              <span class="activity-icon" :style="{ color: activity.color }">
                <component :is="activity.icon" :size="40" />
              </span>
              <span>
                <strong>{{ activity.title }}</strong>
                <small>{{ activity.desc }}</small>
                <em>{{ activity.date }}</em>
              </span>
            </button>
          </section>

          <section class="study-banner">
            <div>
              <h3>Góc học tập</h3>
              <p>Tài liệu, bài giảng, phiếu bài tập hữu ích cho học sinh</p>
              <button type="button" @click="goBooks('học liệu')">
                Truy cập ngay
                <ArrowRight :size="15" />
              </button>
            </div>
            <div class="study-art" aria-hidden="true">
              <span class="study-star" />
              <span class="study-paper" />
              <span class="study-pencil pencil-a" />
              <span class="study-pencil pencil-b" />
            </div>
          </section>
        </aside>
      </div>

      <div class="bottom-row">
        <button
          v-for="item in bottomItems"
          :key="item.title"
          type="button"
          class="bottom-card"
          @click="item.action"
        >
          <span :style="{ color: item.color }">
            <component :is="item.icon" :size="40" fill="currentColor" />
          </span>
          <span>
            <strong>{{ item.title }}</strong>
            <small>{{ item.subtitle }}</small>
            <em>Xem ngay</em>
          </span>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.coded-home {
  min-height: 100vh;
  background: transparent;
  color: #17213a;
}

.coded-home__shell {
  width: min(100%, 1608px);
  margin: 0 auto;
  padding: 14px 20px 22px;
}

button {
  -webkit-tap-highlight-color: transparent;
}

.coded-header {
  display: grid;
  grid-template-columns: 280px 1fr 260px 140px 112px 58px;
  gap: 12px;
  align-items: center;
  height: 78px;
  padding: 8px 14px;
  border-radius: 28px;
  background: rgb(255 255 255 / 0.96);
  box-shadow: 0 18px 42px -30px rgb(24 32 51 / 0.55);
}

.brand,
.nav-tile,
.pill-action,
.avatar,
.quick-card,
.grade-button,
.all-grade,
.activity-item,
.bottom-card {
  border: 0;
  background: transparent;
  cursor: pointer;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
}

.brand img {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  object-fit: contain;
}

.brand strong {
  display: block;
  font-size: 18px;
  font-weight: 900;
}

.brand small {
  display: block;
  margin-top: 5px;
  color: #df2133;
  font-size: 10px;
  font-weight: 900;
}

.coded-nav {
  display: grid;
  grid-template-columns: repeat(7, minmax(64px, 1fr));
  gap: 4px;
  height: 62px;
}

.nav-tile {
  display: grid;
  place-items: center;
  gap: 4px;
  border-radius: 18px;
  color: #17213a;
  font-size: 11px;
  font-weight: 900;
}

.nav-tile.is-active {
  color: #f05265;
  background: #fff1f1;
}

.coded-search {
  display: flex;
  height: 48px;
  align-items: center;
  gap: 9px;
  padding: 0 7px 0 16px;
  border-radius: 999px;
  background: #fff1f1;
}

.coded-search input {
  min-width: 0;
  flex: 1;
  border: 0;
  color: #17213a;
  background: transparent;
  font-size: 13px;
  font-weight: 700;
  outline: none;
}

.coded-search button {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 0;
  border-radius: 50%;
  color: white;
  background: linear-gradient(180deg, #ff6c7c, #e93245);
  cursor: pointer;
}

.pill-action {
  display: flex;
  height: 48px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 999px;
  color: white;
  font-size: 12px;
  font-weight: 900;
}

.pill-action.lock {
  background: linear-gradient(180deg, #ff6c7c, #e93245);
}

.pill-action.contact {
  background: #3f8fe5;
}

.avatar {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 50%;
  background: #fff2e8;
}

.top-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 434px;
  gap: 24px;
  margin-top: 18px;
}

.hero-card,
.welcome-card,
.quick-card,
.grade-panel,
.activity-card,
.study-banner,
.bottom-card {
  border: 2px solid rgb(255 255 255 / 0.9);
  box-shadow: 0 20px 42px -30px rgb(24 32 51 / 0.55);
}

.hero-card {
  position: relative;
  min-height: 302px;
  overflow: hidden;
  border-radius: 26px;
  background:
    radial-gradient(circle at 3% 9%, rgb(255 255 255 / 0.92) 0 2.8rem, transparent 2.9rem),
    radial-gradient(circle at 28% 14%, rgb(255 255 255 / 0.55) 0 2.6rem, transparent 2.7rem),
    radial-gradient(circle at 22% 22%, rgb(255 255 255 / 0.9), transparent 13rem),
    linear-gradient(180deg, #bfe9ff 0%, #fff2fb 44%, #d8f3a7 100%);
}

.hero-card::before {
  position: absolute;
  inset: auto 0 0;
  height: 82px;
  background:
    radial-gradient(circle at 6% 58%, #ff86aa 0 7px, transparent 8px),
    radial-gradient(circle at 16% 45%, #ffd65a 0 8px, transparent 9px),
    radial-gradient(circle at 79% 70%, #fff 0 6px, transparent 7px),
    radial-gradient(circle at 85% 55%, #ff86aa 0 7px, transparent 8px),
    linear-gradient(180deg, rgb(169 226 93 / 0), #8ccf55);
  content: '';
}

.hero-copy {
  position: relative;
  z-index: 3;
  width: 48%;
  padding: 43px 0 0 126px;
}

.hero-copy h1 {
  font-size: 43px;
  font-weight: 900;
  line-height: 1.08;
}

.hero-copy h1 span,
.hero-copy h1 strong {
  display: block;
  -webkit-text-stroke: 5px white;
  paint-order: stroke fill;
}

.hero-copy h1 span {
  color: #2f8ee9;
}

.hero-copy h1 strong {
  color: #f05265;
}

.hero-copy p {
  margin-top: 20px;
  max-width: 390px;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.65;
}

.primary-cta,
.bookcase-cta,
.study-banner button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 0;
  border-radius: 999px;
  color: white;
  background: linear-gradient(180deg, #ff6c7c, #e93245);
  box-shadow: 0 14px 24px -16px rgb(223 33 51 / 0.8);
  cursor: pointer;
}

.primary-cta {
  height: 48px;
  margin-top: 22px;
  padding: 0 24px;
  font-size: 14px;
  font-weight: 900;
}

.hero-scene {
  position: absolute;
  inset: 0;
}

.cloud {
  position: absolute;
  height: 28px;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.78);
  filter: blur(0.2px);
}

.cloud::before,
.cloud::after {
  position: absolute;
  bottom: 7px;
  border-radius: 50%;
  background: inherit;
  content: '';
}

.cloud::before {
  left: 18px;
  width: 42px;
  height: 42px;
}

.cloud::after {
  right: 18px;
  width: 34px;
  height: 34px;
}

.cloud-1 {
  right: 384px;
  top: 34px;
  width: 126px;
}

.cloud-2 {
  left: 30px;
  top: 42px;
  width: 112px;
  opacity: 0.75;
}

.rainbow {
  position: absolute;
  right: 58px;
  top: 34px;
  width: 235px;
  height: 118px;
  border-radius: 230px 230px 0 0;
  background: repeating-radial-gradient(
    circle at 50% 100%,
    transparent 0 46px,
    #ff758f 47px 58px,
    #ffd166 59px 70px,
    #8ce071 71px 82px,
    #62c8f7 83px 94px,
    #a78bfa 95px 106px,
    transparent 107px
  );
  opacity: 0.86;
}

.school,
.star-shape,
.book-stack,
.child {
  position: absolute;
  filter: drop-shadow(0 12px 10px rgb(24 32 51 / 0.16));
}

.school {
  right: 66px;
  bottom: 54px;
  width: 76px;
  height: 82px;
}

.school-roof {
  position: absolute;
  left: 3px;
  top: 0;
  width: 70px;
  height: 34px;
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
  background: #ff7b4a;
}

.school-body {
  position: absolute;
  left: 8px;
  bottom: 0;
  width: 60px;
  height: 58px;
  border: 5px solid #f7a650;
  border-radius: 9px 9px 6px 6px;
  background:
    linear-gradient(
      90deg,
      #78b7ff 0 13px,
      transparent 14px 22px,
      #78b7ff 23px 36px,
      transparent 37px 45px,
      #78b7ff 46px
    ),
    #fff0b3;
}

.school-clock {
  position: absolute;
  left: 28px;
  top: 27px;
  width: 22px;
  height: 22px;
  border: 3px solid #7a431b;
  border-radius: 50%;
  background: white;
}

.star-shape {
  right: 190px;
  top: 120px;
  width: 58px;
  height: 58px;
  background: #ffc94a;
  clip-path: polygon(
    50% 0,
    62% 33%,
    98% 35%,
    70% 57%,
    80% 92%,
    50% 72%,
    20% 92%,
    30% 57%,
    2% 35%,
    38% 33%
  );
}

.book-stack {
  left: 490px;
  bottom: 35px;
  width: 86px;
  height: 54px;
}

.book-stack span {
  position: absolute;
  left: 0;
  width: 86px;
  height: 17px;
  border: 2px solid rgb(255 255 255 / 0.7);
  border-radius: 5px;
  box-shadow: 0 4px 6px -5px rgb(24 32 51 / 0.6);
}

.book-stack span:nth-child(1) {
  bottom: 0;
  background: #315fd7;
  transform: rotate(-5deg);
}

.book-stack span:nth-child(2) {
  bottom: 16px;
  background: #f97316;
  transform: rotate(3deg);
}

.book-stack span:nth-child(3) {
  bottom: 32px;
  background: #10b981;
  transform: rotate(-2deg);
}

.kids-group {
  position: absolute;
  right: 286px;
  bottom: 26px;
  width: 310px;
  height: 184px;
}

.child {
  bottom: 0;
  width: 124px;
  height: 170px;
}

.child-girl {
  left: 15px;
}

.child-boy {
  right: 20px;
}

.child .face {
  position: absolute;
  left: 31px;
  top: 26px;
  width: 66px;
  height: 68px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 26% 48%, #2d1a10 0 4px, transparent 5px),
    radial-gradient(circle at 68% 48%, #2d1a10 0 4px, transparent 5px),
    radial-gradient(circle at 50% 68%, #d85b59 0 7px, transparent 8px), #ffd7a6;
  box-shadow: inset 0 -7px rgb(174 90 45 / 0.12);
}

.child .hair {
  position: absolute;
  left: 22px;
  top: 10px;
  z-index: 2;
  width: 82px;
  height: 60px;
  border-radius: 48px 48px 28px 28px;
  background: #6b351c;
}

.child-girl .hair::before,
.child-girl .hair::after {
  position: absolute;
  top: 24px;
  width: 30px;
  height: 48px;
  border-radius: 50%;
  background: #6b351c;
  content: '';
}

.child-girl .hair::before {
  left: -13px;
}

.child-girl .hair::after {
  right: -13px;
}

.child-boy .hair {
  height: 44px;
  border-radius: 50% 50% 24px 24px;
  background:
    radial-gradient(circle at 16% 20%, #6b351c 0 16px, transparent 17px),
    radial-gradient(circle at 40% 7%, #6b351c 0 18px, transparent 19px),
    radial-gradient(circle at 70% 18%, #6b351c 0 17px, transparent 18px), #7a431b;
}

.child .body {
  position: absolute;
  left: 34px;
  bottom: 12px;
  width: 58px;
  height: 74px;
  border-radius: 18px 18px 26px 26px;
  background:
    linear-gradient(90deg, transparent 0 22px, #e23647 23px 34px, transparent 35px), #fff8ee;
}

.child .book {
  position: absolute;
  left: 16px;
  bottom: 42px;
  width: 92px;
  height: 48px;
  border-radius: 5px;
  background:
    linear-gradient(
      90deg,
      rgb(255 255 255 / 0.38),
      transparent 49%,
      rgb(0 0 0 / 0.12) 50%,
      transparent 52%
    ),
    #f6b636;
  transform: rotate(-8deg);
}

.child-boy .book {
  background:
    linear-gradient(
      90deg,
      rgb(255 255 255 / 0.38),
      transparent 49%,
      rgb(0 0 0 / 0.12) 50%,
      transparent 52%
    ),
    #29a662;
  transform: rotate(7deg);
}

.hero-arrow {
  position: absolute;
  z-index: 4;
  top: 50%;
  width: 48px;
  height: 48px;
  border: 0;
  border-radius: 50%;
  color: #f05265;
  background: white;
  box-shadow: 0 10px 20px -14px rgb(24 32 51 / 0.7);
  font-size: 38px;
  line-height: 1;
}

.hero-arrow.left {
  left: 18px;
}

.hero-arrow.right {
  right: 18px;
}

.dots {
  position: absolute;
  bottom: 15px;
  left: 50%;
  display: flex;
  gap: 9px;
  transform: translateX(-50%);
}

.dots span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
}

.dots .active {
  background: #f05265;
}

.welcome-card {
  position: relative;
  min-height: 302px;
  overflow: hidden;
  border-radius: 26px;
  background:
    radial-gradient(circle at 92% 9%, #fff4f6 0 3rem, transparent 3.1rem),
    linear-gradient(180deg, #bcefff 0%, #e7f7ff 100%);
}

.wood-sign {
  position: absolute;
  left: 34px;
  top: 18px;
  z-index: 2;
  width: 245px;
  padding: 18px 20px;
  border-radius: 16px;
  color: #7a431b;
  background: linear-gradient(90deg, rgb(255 255 255 / 0.18), transparent), #f2c686;
  box-shadow:
    inset 0 -5px rgb(122 67 27 / 0.12),
    0 12px 24px -20px rgb(122 67 27 / 0.7);
  text-align: center;
}

.wood-sign strong {
  display: block;
  font-size: 25px;
  font-weight: 900;
}

.wood-sign span {
  display: block;
  margin-top: 7px;
  font-weight: 900;
  line-height: 1.45;
}

.balloon {
  position: absolute;
  right: 24px;
  top: -4px;
  width: 90px;
  height: 132px;
  border-radius: 50% 50% 46% 46%;
  background: repeating-linear-gradient(90deg, #fff1f2 0 21px, #fb7185 22px 42px);
  box-shadow: 0 16px 26px -20px rgb(24 32 51 / 0.7);
}

.balloon::after {
  position: absolute;
  left: 50%;
  top: 118px;
  width: 2px;
  height: 76px;
  background: #a16207;
  content: '';
}

.stats-card {
  position: absolute;
  inset: auto 22px 22px 22px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  min-height: 130px;
  align-items: center;
  border-radius: 22px;
  background: rgb(255 255 255 / 0.9);
  box-shadow: 0 16px 34px -24px rgb(24 32 51 / 0.55);
}

.stat {
  display: grid;
  place-items: center;
  gap: 7px;
  min-width: 0;
  border-right: 1px solid #f0ded4;
  text-align: center;
}

.stat:last-child {
  border-right: 0;
}

.stat strong {
  font-size: 18px;
  font-weight: 900;
}

.stat span {
  font-size: 12px;
  font-weight: 800;
}

.quick-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
  width: 100%;
  margin-top: 16px;
}

.quick-card {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  min-width: 0;
  min-height: 62px;
  align-items: center;
  gap: 14px;
  padding: 8px 18px;
  border-radius: 18px;
  background: rgb(255 255 255 / 0.92);
  text-align: left;
}

.quick-icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 16px;
  color: var(--quick-color);
  background: color-mix(in srgb, var(--quick-color), white 78%);
}

.quick-card strong,
.bottom-card strong {
  display: block;
  font-weight: 900;
  white-space: nowrap;
}

.quick-card strong,
.quick-card small {
  overflow: hidden;
  text-overflow: ellipsis;
}

.quick-card small,
.bottom-card small {
  display: block;
  margin-top: 4px;
  color: #41516f;
  font-weight: 700;
  white-space: nowrap;
}

.quick-card strong {
  font-size: 15px;
}

.quick-card small {
  font-size: 12px;
}

.quick-card > span:nth-child(2),
.bottom-card > span:nth-child(2) {
  min-width: 0;
}

.main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 434px;
  align-items: start;
  gap: 24px;
  margin-top: 14px;
}

.grade-panel {
  min-height: 348px;
  padding: 18px 24px 20px;
  border: 3px solid rgb(255 255 255 / 0.94);
  border-radius: 28px;
  background: linear-gradient(180deg, #fff6dd 0%, #fff2ce 100%);
  box-shadow:
    inset 0 0 0 1px rgb(166 98 41 / 0.08),
    0 18px 38px -28px rgb(24 32 51 / 0.55);
}

.panel-title,
.activity-card h3 {
  width: fit-content;
  margin: 0 auto 20px;
  padding: 12px 28px 13px;
  border-radius: 15px;
  color: white;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.12), transparent 36%), #a96429;
  box-shadow:
    inset 0 -7px rgb(82 42 17 / 0.18),
    0 9px 0 -5px #7a431b;
  font-size: 19px;
  font-weight: 900;
  line-height: 1.15;
}

.grade-button {
  display: flex;
  width: 100%;
  height: 50px;
  align-items: center;
  gap: 14px;
  margin-top: 9px;
  padding: 0 18px;
  border-radius: 13px;
  color: white;
  font-size: 20px;
  font-weight: 900;
  box-shadow:
    inset 0 -4px rgb(0 0 0 / 0.09),
    0 8px 15px -12px rgb(24 32 51 / 0.55);
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    filter 160ms ease;
}

.grade-button:hover,
.grade-button.is-active {
  filter: saturate(1.08);
  transform: translateY(-1px);
  box-shadow:
    inset 0 -4px rgb(0 0 0 / 0.1),
    0 12px 22px -14px rgb(24 32 51 / 0.65);
}

.grade-avatar {
  position: relative;
  width: 26px;
  height: 26px;
  flex: 0 0 26px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 34% 44%, #2d1a10 0 2px, transparent 3px),
    radial-gradient(circle at 66% 44%, #2d1a10 0 2px, transparent 3px),
    radial-gradient(circle at 50% 68%, #d85b59 0 4px, transparent 5px), #ffd7a6;
  box-shadow: 0 2px 0 rgb(255 255 255 / 0.3);
}

.grade-avatar::before {
  position: absolute;
  inset: -4px 1px auto;
  height: 12px;
  border-radius: 999px 999px 8px 8px;
  background: #6b351c;
  content: '';
}

.grade-1 {
  background: #f05265;
}
.grade-2 {
  background: #f59e0b;
}
.grade-3 {
  background: #76ba43;
}
.grade-4 {
  background: #3f8fe5;
}
.grade-5 {
  background: #925ee8;
}

.all-grade {
  display: flex;
  height: 42px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 15px auto 0;
  padding: 0 20px;
  border-radius: 999px;
  color: #f05265;
  background: white;
  box-shadow: 0 9px 18px -16px rgb(24 32 51 / 0.6);
  font-size: 14px;
  font-weight: 900;
}

.bookcase-card {
  position: relative;
  min-height: 458px;
  overflow: visible;
  padding: 0 24px 62px;
  border: 4px solid rgb(255 255 255 / 0.96);
  border-radius: 29px;
  background:
    radial-gradient(circle at 20% 14%, rgb(255 213 127 / 0.44), transparent 18rem),
    linear-gradient(180deg, #f3a24d 0%, #d9873b 34%, #bd6d2a 100%);
  box-shadow:
    inset 0 1px rgb(255 255 255 / 0.2),
    0 20px 45px -28px rgb(24 32 51 / 0.58);
}

.bookcase-roof {
  position: absolute;
  z-index: 4;
  inset: -4px 22px auto;
  height: 76px;
  border-radius: 0 0 26px 26px;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.28), transparent 46%),
    repeating-linear-gradient(90deg, #ff767b 0 26px, #f35f67 27px 52px);
  box-shadow:
    inset 0 -17px rgb(143 63 37 / 0.17),
    0 12px 0 -5px rgb(156 80 32 / 0.28);
}

.bookcase-roof::before {
  position: absolute;
  inset: 8px 0 auto;
  display: grid;
  grid-template-columns: repeat(22, 1fr);
  height: 46px;
  background:
    repeating-radial-gradient(
      ellipse at 50% 100%,
      rgb(255 255 255 / 0.18) 0 1px,
      transparent 2px 100%
    ),
    repeating-linear-gradient(90deg, transparent 0 39px, rgb(147 59 42 / 0.12) 40px 42px);
  border-radius: 0 0 24px 24px;
  content: '';
}

.bookcase-title-board {
  position: absolute;
  left: 50%;
  top: 12px;
  z-index: 5;
  width: 394px;
  height: 62px;
  border-radius: 8px 8px 14px 14px;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.18), transparent 38%),
    linear-gradient(90deg, #9a5723 0%, #b86e2b 26%, #a45f26 56%, #8e4e1f 100%);
  box-shadow:
    inset 0 -7px rgb(74 36 11 / 0.16),
    0 10px 16px -13px rgb(74 36 11 / 0.7);
  transform: translateX(-50%);
}

.bookcase-card h2 {
  position: relative;
  z-index: 6;
  margin-top: 28px;
  color: white;
  font-size: 34px;
  font-weight: 900;
  letter-spacing: 0;
  text-align: center;
  text-shadow:
    0 3px 0 rgb(81 43 15 / 0.35),
    0 8px 12px rgb(81 43 15 / 0.2);
}

.bookcase-vine {
  position: absolute;
  z-index: 7;
  top: -18px;
  width: 76px;
  height: 96px;
  pointer-events: none;
}

.bookcase-vine::before,
.bookcase-vine::after {
  position: absolute;
  border-radius: 50%;
  content: '';
}

.bookcase-vine::before {
  inset: 36px 20px auto auto;
  width: 30px;
  height: 30px;
  background:
    radial-gradient(circle at 50% 50%, #ffd65a 0 5px, transparent 6px),
    radial-gradient(circle at 50% 18%, #ff7da0 0 8px, transparent 9px),
    radial-gradient(circle at 50% 82%, #ff7da0 0 8px, transparent 9px),
    radial-gradient(circle at 18% 50%, #ff7da0 0 8px, transparent 9px),
    radial-gradient(circle at 82% 50%, #ff7da0 0 8px, transparent 9px);
}

.bookcase-vine::after {
  inset: 0 0 auto auto;
  width: 64px;
  height: 72px;
  background:
    radial-gradient(ellipse at 26% 24%, #7ac943 0 8px, transparent 9px),
    radial-gradient(ellipse at 54% 16%, #68b73d 0 9px, transparent 10px),
    radial-gradient(ellipse at 70% 44%, #7ac943 0 9px, transparent 10px),
    radial-gradient(ellipse at 40% 60%, #5daa36 0 8px, transparent 9px);
}

.vine-left {
  left: 180px;
}

.vine-right {
  right: 174px;
  transform: scaleX(-1);
}

.bookcase-body {
  position: relative;
  z-index: 3;
  margin: 58px 0 0;
  padding: 18px 34px 24px;
  overflow: hidden;
  border: 5px solid #c17b35;
  border-radius: 28px;
  background:
    linear-gradient(
      90deg,
      rgb(255 212 135 / 0.2),
      transparent 8%,
      transparent 92%,
      rgb(92 44 12 / 0.12)
    ),
    linear-gradient(180deg, rgb(255 198 105 / 0.18), transparent 30%), #a76525;
  box-shadow:
    inset 0 18px 24px rgb(69 33 9 / 0.38),
    inset 0 -8px rgb(255 218 149 / 0.08);
}

.bookcase-body::before,
.bookcase-body::after {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 1;
  width: 22px;
  background: linear-gradient(90deg, rgb(255 224 166 / 0.16), transparent), #bf7832;
  content: '';
}

.bookcase-body::before {
  left: 0;
}

.bookcase-body::after {
  right: 0;
  transform: scaleX(-1);
}

.shelf {
  position: relative;
  z-index: 2;
  display: flex;
  height: 84px;
  align-items: flex-end;
  gap: 13px;
  padding: 0 92px 15px 132px;
  border-bottom: 9px solid #81501f;
}

.shelf::after {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -9px;
  height: 9px;
  background: linear-gradient(180deg, #d38a3d, #794114);
  box-shadow:
    0 -2px 0 rgb(255 220 154 / 0.18),
    0 7px 10px -7px rgb(60 28 8 / 0.7);
  content: '';
}

.shelf + .shelf {
  margin-top: 11px;
}

.shelf-label {
  position: absolute;
  left: 24px;
  top: 18px;
  display: grid;
  width: 70px;
  height: 54px;
  place-items: center;
  border-radius: 50% 46% 50% 44%;
  color: #f05265;
  background:
    radial-gradient(circle at 17% 50%, #fff7e4 0 18px, transparent 19px),
    radial-gradient(circle at 36% 28%, #fff7e4 0 20px, transparent 21px),
    radial-gradient(circle at 58% 33%, #fff7e4 0 18px, transparent 19px),
    radial-gradient(circle at 76% 54%, #fff7e4 0 18px, transparent 19px), #fff7e4;
  box-shadow: 0 7px 12px -10px rgb(24 32 51 / 0.65);
  font-size: 16px;
  font-weight: 900;
}

.book-spine {
  position: relative;
  display: grid;
  width: 62px;
  height: 72px;
  place-items: center;
  border: 0;
  border-radius: 7px 7px 4px 4px;
  color: white;
  background:
    linear-gradient(90deg, rgb(255 255 255 / 0.25), transparent 24%, rgb(0 0 0 / 0.12)),
    var(--book-color);
  box-shadow:
    inset -6px 0 rgb(0 0 0 / 0.14),
    inset 4px 0 rgb(255 255 255 / 0.13),
    0 8px 10px -8px rgb(0 0 0 / 0.45);
  cursor: pointer;
}

.book-title {
  position: absolute;
  top: 8px;
  left: 4px;
  right: 4px;
  overflow: hidden;
  font-size: 10px;
  font-weight: 900;
  text-align: center;
  text-transform: uppercase;
  white-space: nowrap;
}

.book-mark {
  display: grid;
  place-items: center;
  font-size: 34px;
  font-weight: 900;
}

.shelf-more {
  position: absolute;
  right: 24px;
  bottom: 15px;
  width: 56px;
  color: #f05265;
  border-radius: 10px;
  background: #fff7e4;
  box-shadow: 0 8px 12px -11px rgb(24 32 51 / 0.55);
  font-size: 10px;
  font-weight: 900;
  line-height: 1.1;
  padding: 9px 4px;
  text-align: center;
  text-decoration: none;
}

.shelf-flower {
  position: absolute;
  right: 92px;
  bottom: 15px;
  width: 42px;
  height: 56px;
  pointer-events: none;
}

.shelf-flower::before {
  position: absolute;
  left: 14px;
  bottom: 0;
  width: 24px;
  height: 28px;
  border-radius: 5px 5px 8px 8px;
  background: #d9862f;
  box-shadow: inset 0 -5px rgb(92 44 12 / 0.16);
  content: '';
}

.shelf-flower::after {
  position: absolute;
  left: 5px;
  top: 2px;
  width: 34px;
  height: 34px;
  background:
    radial-gradient(circle at 50% 50%, #ffd65a 0 5px, transparent 6px),
    radial-gradient(circle at 50% 18%, #ff6f8f 0 8px, transparent 9px),
    radial-gradient(circle at 50% 82%, #ff6f8f 0 8px, transparent 9px),
    radial-gradient(circle at 18% 50%, #ff6f8f 0 8px, transparent 9px),
    radial-gradient(circle at 82% 50%, #ff6f8f 0 8px, transparent 9px),
    radial-gradient(ellipse at 18% 86%, #5fb238 0 8px, transparent 9px),
    radial-gradient(ellipse at 82% 86%, #5fb238 0 8px, transparent 9px);
  content: '';
}

.bookcase-cta {
  position: absolute;
  left: 50%;
  bottom: -3px;
  height: 50px;
  min-width: 282px;
  padding: 0 34px;
  font-size: 16px;
  font-weight: 900;
  transform: translateX(-50%);
}

.right-column {
  display: grid;
  gap: 14px;
}

.activity-card {
  min-height: 348px;
  padding: 18px;
  border-radius: 22px;
  background: #fff4db;
}

.activity-card header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.activity-card h3 {
  margin: 0;
}

.activity-card header button {
  display: flex;
  align-items: center;
  gap: 5px;
  border: 0;
  border-radius: 999px;
  color: #f05265;
  background: white;
  padding: 9px 15px;
  font-weight: 900;
}

.activity-item {
  display: grid;
  grid-template-columns: 58px 1fr;
  width: 100%;
  min-height: 76px;
  align-items: center;
  gap: 14px;
  margin-top: 10px;
  padding: 10px 14px;
  border-radius: 14px;
  background: rgb(255 255 255 / 0.78);
  text-align: left;
}

.activity-icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 14px;
  background: #fff6e5;
}

.activity-item strong {
  display: block;
  color: #6b4a9f;
  font-size: 14px;
  font-weight: 900;
}

.activity-item small {
  display: block;
  margin-top: 3px;
  color: #41516f;
  font-size: 12px;
  font-weight: 700;
}

.activity-item em {
  display: block;
  margin-top: 5px;
  color: #4b5563;
  font-size: 11px;
  font-style: normal;
  font-weight: 800;
}

.study-banner {
  display: grid;
  grid-template-columns: 1fr 130px;
  min-height: 150px;
  align-items: center;
  padding: 19px 22px;
  border-radius: 22px;
  color: white;
  background:
    radial-gradient(circle at 85% 28%, rgb(255 255 255 / 0.26), transparent 6rem),
    linear-gradient(135deg, #2f8ee9, #126bd0);
}

.study-banner h3 {
  font-size: 22px;
  font-weight: 900;
}

.study-banner p {
  margin-top: 7px;
  max-width: 250px;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.45;
}

.study-banner button {
  height: 36px;
  margin-top: 12px;
  padding: 0 17px;
  color: #126bd0;
  background: white;
  font-weight: 900;
}

.study-art {
  position: relative;
  height: 120px;
  filter: drop-shadow(0 10px 10px rgb(0 0 0 / 0.18));
}

.study-star {
  position: absolute;
  left: 2px;
  bottom: 8px;
  width: 54px;
  height: 54px;
  background: #ffc94a;
  clip-path: polygon(
    50% 0,
    62% 33%,
    98% 35%,
    70% 57%,
    80% 92%,
    50% 72%,
    20% 92%,
    30% 57%,
    2% 35%,
    38% 33%
  );
}

.study-paper {
  position: absolute;
  right: 8px;
  bottom: 12px;
  width: 82px;
  height: 94px;
  border: 5px solid white;
  border-radius: 9px;
  background: repeating-linear-gradient(180deg, transparent 0 16px, #b7d9ff 17px 19px), #fff5d8;
  transform: rotate(8deg);
}

.study-pencil {
  position: absolute;
  width: 16px;
  height: 92px;
  border-radius: 9px 9px 4px 4px;
  background:
    linear-gradient(180deg, #f9fafb 0 12px, transparent 13px),
    linear-gradient(90deg, #ff6c7c 0 50%, #ffd65a 51%);
}

.study-pencil::after {
  position: absolute;
  left: 1px;
  bottom: -12px;
  width: 14px;
  height: 16px;
  clip-path: polygon(50% 100%, 0 0, 100% 0);
  background: #7a431b;
  content: '';
}

.pencil-a {
  right: 14px;
  top: 4px;
  transform: rotate(31deg);
}

.pencil-b {
  right: 58px;
  top: 12px;
  background:
    linear-gradient(180deg, #f9fafb 0 12px, transparent 13px),
    linear-gradient(90deg, #3f8fe5 0 50%, #8ce071 51%);
  transform: rotate(-22deg);
}

.bottom-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  width: calc(100% - 496px);
  margin-top: 14px;
}

.bottom-card {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  min-width: 0;
  min-height: 82px;
  align-items: center;
  gap: 9px;
  padding: 10px 12px;
  border-radius: 18px;
  background: rgb(255 250 242 / 0.9);
  text-align: left;
}

.bottom-card strong {
  font-size: 12px;
}

.bottom-card small {
  font-size: 11px;
}

.bottom-card em {
  display: block;
  margin-top: 6px;
  color: #0f6cc6;
  font-size: 11px;
  font-style: normal;
  font-weight: 900;
  white-space: nowrap;
}

@media (max-width: 1320px) {
  .coded-header {
    grid-template-columns: 250px 1fr 220px 52px 52px 50px;
  }

  .pill-action {
    font-size: 0;
  }

  .top-grid {
    grid-template-columns: minmax(0, 1fr) 370px;
  }

  .main-grid {
    grid-template-columns: minmax(0, 1fr) 370px;
    gap: 18px;
  }

  .bottom-row {
    width: calc(100% - 424px);
  }

  .quick-row {
    gap: 10px;
  }

  .quick-card {
    grid-template-columns: 40px minmax(0, 1fr);
    gap: 7px;
    padding: 7px 8px;
  }

  .quick-icon {
    width: 40px;
    height: 40px;
    border-radius: 13px;
  }

  .quick-card strong {
    font-size: 13px;
  }

  .quick-card small {
    font-size: 10px;
  }

  .bottom-card {
    grid-template-columns: 40px minmax(0, 1fr);
    gap: 6px;
    padding: 8px;
  }

  .bottom-card strong {
    font-size: 11px;
  }

  .bottom-card small,
  .bottom-card em {
    font-size: 10px;
  }
}
</style>
