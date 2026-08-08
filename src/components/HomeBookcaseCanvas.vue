<script setup lang="ts">
import { ArrowRight, Flower2, Globe2, Palette, Volleyball } from '@lucide/vue'
import type { Component } from 'vue'
import { computed } from 'vue'

import badgeGrade1Url from '@/assets/thu-vien-so-assets-exact-look/badges/badge-grade-1.svg'
import badgeGrade2Url from '@/assets/thu-vien-so-assets-exact-look/badges/badge-grade-2.svg'
import badgeGrade3Url from '@/assets/thu-vien-so-assets-exact-look/badges/badge-grade-3.svg'
import badgeGrade4Url from '@/assets/thu-vien-so-assets-exact-look/badges/badge-grade-4.svg'
import badgeGrade5Url from '@/assets/thu-vien-so-assets-exact-look/badges/badge-grade-5.svg'
import bookshelfFrameUrl from '@/assets/thu-vien-so-assets-exact-look/bookshelf/bookshelf-3d-hd.png'
import mobileBookshelfFrameUrl from '@/assets/thu-vien-so-assets-exact-look/bookshelf/bookshelf-mobile-hd.png'
import bookshelfPlantUrl from '@/assets/thu-vien-so-assets-exact-look/bookshelf/bookshelf-plant.svg'
import studentAvatarUrl from '@/assets/thu-vien-so-assets-exact-look/characters/student-avatar-hd.png'
import woodenBoardUrl from '@/assets/thu-vien-so-assets-exact-look/misc/icon-wooden-board.svg'
import type { CabinetShelf } from '@/data/threeDLibrary'
import type { Book } from '@/types/library'

const props = defineProps<{
  shelves: CabinetShelf[]
  activeGrade: number | 'Tất cả'
}>()

const emit = defineEmits<{
  openBook: [book: Book]
  setGrade: [grade: number | 'Tất cả']
  showAll: []
}>()

const displayShelves = computed(() => props.shelves.slice(0, 3))
const gradeBadgeUrls = [
  badgeGrade1Url,
  badgeGrade2Url,
  badgeGrade3Url,
  badgeGrade4Url,
  badgeGrade5Url,
]
const bookSlots: Array<{
  subjects: string[]
  icon?: Component
  symbol?: string
  iconFill?: string
  color: string
  darkColor: string
}> = [
  { subjects: ['Âm nhạc'], symbol: '♪', color: '#ffad18', darkColor: '#d97a06' },
  { subjects: ['Đạo đức'], symbol: '♥', color: '#ef5657', darkColor: '#bd2938' },
  {
    subjects: ['Giáo dục thể chất'],
    icon: Volleyball,
    iconFill: '#f6a623',
    color: '#c14fd1',
    darkColor: '#87309d',
  },
  {
    subjects: ['Hoạt động trải nghiệm'],
    icon: Flower2,
    iconFill: '#fff0a6',
    color: '#25b888',
    darkColor: '#08785e',
  },
  {
    subjects: ['Mỹ thuật', 'Mĩ thuật'],
    icon: Palette,
    iconFill: '#ffd565',
    color: '#55ad64',
    darkColor: '#27743b',
  },
  { subjects: ['Tiếng Việt'], symbol: 'A', color: '#ef6a32', darkColor: '#bb351c' },
  { subjects: ['Toán'], symbol: '+', color: '#ef4a3d', darkColor: '#b82324' },
  {
    subjects: ['Tự nhiên và Xã hội', 'Khoa học', 'Lịch sử và Địa lí'],
    icon: Globe2,
    iconFill: '#68d2a0',
    color: '#73aa35',
    darkColor: '#47751d',
  },
]

function gradeFromShelfLabel(label: string) {
  const grade = Number(label.match(/\d+/)?.[0] ?? 1)
  return Math.min(5, Math.max(1, grade))
}

function shortSubject(subject: string) {
  return subject
    .replace('Giáo dục thể chất', 'GDTC')
    .replace('Hoạt động trải nghiệm', 'HĐTN')
    .replace('Lịch sử và Địa lí', 'LS & ĐL')
    .replace('Tự nhiên và Xã hội', 'TN & XH')
    .replace('Tiếng Việt', 'T. VIỆT')
    .replace('Tiếng Anh', 'T. ANH')
}

function shelfBookItems(shelf: CabinetShelf) {
  const usedBookIds = new Set<string>()
  const items = bookSlots.flatMap((slot) => {
    const book = shelf.books.find(
      (candidate) =>
        !usedBookIds.has(candidate.id) &&
        slot.subjects.some((subject) => candidate.subject.includes(subject)),
    )

    if (!book) return []
    usedBookIds.add(book.id)
    return [{ book, ...slot }]
  })

  for (const book of shelf.books) {
    if (items.length >= 11) break
    if (usedBookIds.has(book.id)) continue

    items.push({ book, ...bookSlots[items.length % bookSlots.length]! })
    usedBookIds.add(book.id)
  }

  return items.slice(0, 11)
}
</script>

<template>
  <section class="exact-library desktop-library" aria-label="Tủ sách 3D">
    <aside class="grade-selector" aria-label="Chọn khối lớp">
      <div class="selector-heading">
        <img :src="woodenBoardUrl" alt="" />
        <strong>Chọn khối lớp</strong>
      </div>

      <div class="grade-buttons">
        <button
          v-for="grade in [1, 2, 3, 4, 5]"
          :key="grade"
          type="button"
          :class="[`grade-${grade}`, { 'is-active': activeGrade === grade }]"
          :aria-label="`Chọn lớp ${grade}`"
          @click="emit('setGrade', grade)"
        >
          <img v-if="grade === 1" :src="studentAvatarUrl" alt="" class="grade-button-avatar" />
          <span>Lớp {{ grade }}</span>
        </button>
      </div>

      <button
        type="button"
        class="all-grades"
        :class="{ 'is-active': activeGrade === 'Tất cả' }"
        aria-label="Xem tất cả lớp"
        @click="emit('setGrade', 'Tất cả')"
      >
        <span>Xem tất cả các lớp</span>
        <ArrowRight aria-hidden="true" />
      </button>
    </aside>

    <div class="bookcase">
      <img :src="bookshelfFrameUrl" alt="Tủ sách 3D ba tầng" class="bookcase-frame" />

      <div
        v-for="(shelf, shelfIndex) in displayShelves"
        :key="shelf.id"
        class="shelf-content"
        :style="{ '--shelf-index': shelfIndex }"
      >
        <img
          :src="gradeBadgeUrls[gradeFromShelfLabel(shelf.label) - 1]"
          :alt="shelf.label"
          class="grade-badge"
        />

        <div class="books">
          <button
            v-for="item in shelfBookItems(shelf)"
            :key="item.book.id"
            type="button"
            class="book"
            :aria-label="`Đọc ${item.book.title}`"
            @click="emit('openBook', item.book)"
          >
            <span
              class="book-art"
              :style="{
                '--book-cover': item.color,
                '--book-cover-dark': item.darkColor,
              }"
              aria-hidden="true"
            >
              <span v-if="item.symbol" class="book-art-symbol">{{ item.symbol }}</span>
              <component
                :is="item.icon"
                v-else-if="item.icon"
                class="book-art-icon"
                :fill="item.iconFill"
                :stroke-width="2.5"
              />
            </span>
            <span class="book-subject">{{ shortSubject(item.book.subject) }}</span>
            <span class="book-tooltip">{{ item.book.title }}</span>
          </button>
        </div>

        <img :src="bookshelfPlantUrl" alt="" class="shelf-plant" />
      </div>

      <button
        type="button"
        class="explore-button"
        aria-label="Khám phá Tủ sách 3D"
        @click="emit('showAll')"
      >
        <span>Khám phá Tủ sách 3D</span>
        <ArrowRight aria-hidden="true" />
      </button>
    </div>
  </section>

  <section class="mobile-library" aria-label="Tủ sách 3D trên mobile">
    <div class="mobile-filter" aria-label="Bộ lọc lớp">
      <button
        type="button"
        class="mobile-chip mobile-chip-all"
        :class="{ 'is-active': activeGrade === 'Tất cả' }"
        @click="emit('setGrade', 'Tất cả')"
      >
        <span aria-hidden="true">▦</span>
        Tất cả
      </button>
      <button
        v-for="grade in [1, 2, 3]"
        :key="`mobile-${grade}`"
        type="button"
        class="mobile-chip"
        :class="{ 'is-active': activeGrade === grade }"
        @click="emit('setGrade', grade)"
      >
        <span aria-hidden="true">{{ ['🌼', '🌸', '🍀'][grade - 1] }}</span>
        Lớp {{ grade }}
      </button>
      <button
        type="button"
        class="mobile-more-chip"
        aria-label="Xem thêm lớp"
        @click="emit('showAll')"
      >
        ⌄
      </button>
    </div>

    <div class="mobile-title-row">
      <h2><span aria-hidden="true">📖</span> TỦ SÁCH 3D</h2>
      <button type="button" @click="emit('showAll')">Xem tất cả <span>›</span></button>
    </div>

    <div class="mobile-bookcase">
      <img :src="mobileBookshelfFrameUrl" alt="Tủ sách 3D ba tầng" class="mobile-frame" />

      <div
        v-for="(shelf, shelfIndex) in displayShelves"
        :key="`mobile-shelf-${shelf.id}`"
        class="mobile-shelf"
        :style="{ '--mobile-shelf-index': shelfIndex }"
      >
        <img
          :src="gradeBadgeUrls[gradeFromShelfLabel(shelf.label) - 1]"
          :alt="shelf.label"
          class="mobile-grade-badge"
        />

        <div class="mobile-books">
          <button
            v-for="item in shelfBookItems(shelf).slice(0, 5)"
            :key="`mobile-${item.book.id}`"
            type="button"
            class="mobile-book"
            :aria-label="`Đọc ${item.book.title}`"
            @click="emit('openBook', item.book)"
          >
            <span
              class="book-art"
              :style="{
                '--book-cover': item.color,
                '--book-cover-dark': item.darkColor,
              }"
              aria-hidden="true"
            >
              <span v-if="item.symbol" class="book-art-symbol">{{ item.symbol }}</span>
              <component
                :is="item.icon"
                v-else-if="item.icon"
                class="book-art-icon"
                :fill="item.iconFill"
                :stroke-width="2.5"
              />
            </span>
            <span class="mobile-book-subject">{{ shortSubject(item.book.subject) }}</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.exact-library {
  container-type: inline-size;
  display: grid;
  grid-template-columns: 16% minmax(0, 1fr);
  gap: 0.65%;
  width: 100%;
  min-width: 0;
  aspect-ratio: 2.05 / 1;
  padding: 0 0 1.4%;
}

.mobile-library {
  display: none;
}

button {
  border: 0;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

button:focus-visible {
  outline: 3px solid rgb(240 82 101 / 0.55);
  outline-offset: 2px;
}

.grade-selector {
  position: relative;
  display: flex;
  align-self: start;
  margin-top: 85px;
  flex-direction: column;
  height: fit-content;
  padding: 5% 8% 6%;
  border: clamp(3px, 0.35cqw, 6px) solid white;
  border-radius: 8% / 5%;
  background: linear-gradient(180deg, #fffaf0, #ffedbd);
  box-shadow:
    inset 0 0 0 2px #e8c68c,
    0 12px 18px -14px rgb(89 48 18 / 0.55);
}

.selector-heading {
  position: relative;
  width: 92%;
  height: auto;
  flex: 0 0 auto;
  aspect-ratio: 360 / 140;
  margin: 0 auto clamp(8px, 0.85cqw, 13px);
}

.selector-heading img {
  width: 100%;
  height: 100%;
  object-fit: fill;
}

.selector-heading strong {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: white;
  font-size: clamp(8px, 1.05cqw, 16px);
  font-weight: 950;
  text-shadow: 0 2px 2px rgb(89 37 10 / 0.55);
}

.grade-buttons {
  display: grid;
  height: auto;
  flex: 0 0 auto;
  grid-template-rows: repeat(5, auto);
  gap: clamp(7px, 0.7cqw, 11px);
}

.grade-buttons button {
  position: relative;
  display: grid;
  width: 100%;
  height: clamp(34px, 3.65cqw, 54px);
  place-items: center;
  padding: 0;
  border: 1px solid var(--grade-border);
  border-radius: clamp(9px, 0.9cqw, 14px);
  color: white;
  background: linear-gradient(180deg, var(--grade-light), var(--grade-color));
  box-shadow:
    inset 0 2px rgb(255 255 255 / 0.25),
    inset 0 -3px rgb(0 0 0 / 0.1),
    0 5px 8px -5px rgb(71 34 13 / 0.58);
  font-size: clamp(12px, 1.35cqw, 20px);
  font-weight: 950;
  line-height: 1;
  text-shadow: 0 1px 1px rgb(60 24 12 / 0.34);
  transition: 160ms ease;
}

.grade-1 {
  --grade-light: #ff6476;
  --grade-color: #df344c;
  --grade-border: #d82945;
}

.grade-2 {
  --grade-light: #ffb126;
  --grade-color: #f08700;
  --grade-border: #dc7900;
}

.grade-3 {
  --grade-light: #83d64b;
  --grade-color: #55ad25;
  --grade-border: #429528;
}

.grade-4 {
  --grade-light: #66b4f5;
  --grade-color: #2f82d7;
  --grade-border: #2771bb;
}

.grade-5 {
  --grade-light: #aa6ff0;
  --grade-color: #7537c6;
  --grade-border: #6630ad;
}

.grade-buttons button .grade-button-avatar {
  position: absolute;
  bottom: 8%;
  left: 6%;
  width: 27%;
  height: 84%;
  object-fit: contain;
  filter: drop-shadow(0 2px 2px rgb(72 30 10 / 0.3));
}

.grade-buttons button:hover,
.grade-buttons button.is-active {
  filter: brightness(1.06) saturate(1.05);
  transform: translateX(3%);
}

.grade-buttons button.is-active {
  filter: brightness(1.07) drop-shadow(0 4px 4px rgb(93 40 12 / 0.32));
}

.all-grades {
  display: inline-flex;
  width: 94%;
  height: clamp(30px, 3.25cqw, 46px);
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: clamp(3px, 0.4cqw, 6px);
  margin: clamp(10px, 1cqw, 16px) auto 0;
  padding: 0 5%;
  border: 1px solid #efcfb5;
  border-radius: 999px;
  color: #f13d52;
  background: linear-gradient(180deg, #fff 0%, #fff4eb 100%);
  box-shadow:
    inset 0 1px rgb(255 255 255 / 0.8),
    0 6px 11px -6px rgb(108 54 21 / 0.55);
  font-size: clamp(9px, 0.82cqw, 13px);
  font-weight: 900;
  white-space: nowrap;
  transition: 160ms ease;
}

.all-grades svg {
  width: 1em;
  height: 1em;
  flex: 0 0 auto;
  stroke-width: 3;
}

.all-grades.is-active,
.all-grades:hover {
  filter: brightness(1.05) drop-shadow(0 4px 4px rgb(93 40 12 / 0.25));
  transform: translateY(-2px);
}

.bookcase {
  position: relative;
  height: 100%;
  min-width: 0;
}

.bookcase-frame {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
  user-select: none;
}

.shelf-content {
  position: absolute;
  z-index: 3;
  top: calc(17.5% + var(--shelf-index) * 24.15%);
  right: 8.5%;
  left: 7.8%;
  display: grid;
  grid-template-columns: 11.5% minmax(0, 1fr) 7.8%;
  height: 21.5%;
  align-items: end;
  gap: 1%;
}

.grade-badge {
  display: block;
  width: 100%;
  max-height: 86%;
  object-fit: contain;
  transform: translateY(5%);
}

.books {
  display: grid;
  grid-template-columns: repeat(11, minmax(0, 1fr));
  align-items: end;
  gap: 0.15%;
  min-width: 0;
  height: 100%;
}

.book {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0;
  transition: 170ms ease;
}

.book-art {
  position: absolute;
  bottom: 0;
  left: 50%;
  display: block;
  width: 91.2%;
  height: 88%;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--book-cover-dark), black 9%);
  border-radius: 9% 11% 7% 7%;
  background:
    linear-gradient(90deg, rgb(255 255 255 / 0.24), transparent 9% 82%, rgb(0 0 0 / 0.12)),
    linear-gradient(160deg, color-mix(in srgb, var(--book-cover), white 12%), var(--book-cover));
  box-shadow:
    inset 0 2px rgb(255 255 255 / 0.3),
    inset -4px 0 rgb(0 0 0 / 0.08),
    0 4px 5px -3px rgb(56 29 8 / 0.58);
  transform: translateX(-50%);
  transform-origin: center bottom;
}

.book-art::before {
  position: absolute;
  inset: 0 auto 0 0;
  width: 16%;
  border-right: 1px solid rgb(255 255 255 / 0.22);
  border-radius: 30% 0 0 30%;
  background:
    linear-gradient(90deg, rgb(255 255 255 / 0.16), transparent 48%), var(--book-cover-dark);
  box-shadow: inset -2px 0 rgb(0 0 0 / 0.12);
  content: '';
}

.book-art::after {
  position: absolute;
  inset: 7% 8% auto 22%;
  height: 2px;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.2);
  content: '';
}

.book-art-icon {
  position: absolute;
  top: 58%;
  left: 58%;
  z-index: 2;
  width: 42%;
  height: 42%;
  color: white;
  filter: drop-shadow(0 1px 1px rgb(68 24 9 / 0.22));
  transform: translate(-50%, -38%);
}

.book-art-symbol {
  position: absolute;
  top: 57%;
  left: 58%;
  z-index: 2;
  color: white;
  font-size: clamp(18px, 2.15cqw, 34px);
  font-weight: 950;
  line-height: 1;
  text-shadow: 0 2px 1px rgb(68 24 9 / 0.24);
  transform: translate(-50%, -42%);
}

.book:hover {
  z-index: 20;
  filter: brightness(1.06) saturate(1.05);
  transform: translateY(-6%) rotate(-1deg) scale(1.04);
}

.book-subject {
  position: absolute;
  z-index: 3;
  top: 15%;
  right: 7%;
  left: 7%;
  display: -webkit-box;
  overflow: hidden;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.12);
  padding: 2px 2px 3px;
  color: white;
  font-size: clamp(7px, 0.62cqw, 11px);
  font-weight: 950;
  line-height: 1.05;
  text-align: center;
  text-shadow:
    0 1px 1px rgb(89 25 5 / 0.7),
    0 0 4px rgb(89 25 5 / 0.48);
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  box-shadow: inset 0 1px rgb(255 255 255 / 0.16);
}

.book-tooltip {
  position: absolute;
  z-index: 30;
  bottom: calc(100% + 7px);
  left: 50%;
  display: none;
  width: 150px;
  padding: 7px 9px;
  border-radius: 9px;
  color: white;
  background: #17213a;
  box-shadow: 0 10px 20px -10px rgb(0 0 0 / 0.8);
  font-size: 9px;
  font-weight: 800;
  line-height: 1.35;
  transform: translateX(-50%);
}

.book:hover .book-tooltip,
.book:focus-visible .book-tooltip {
  display: block;
}

.shelf-plant {
  display: block;
  width: 100%;
  max-height: 82%;
  object-fit: contain;
  object-position: center bottom;
}

.explore-button {
  position: absolute;
  z-index: 9;
  bottom: -1.5%;
  left: 51%;
  display: inline-flex;
  width: 31%;
  height: 10%;
  align-items: center;
  justify-content: center;
  gap: clamp(5px, 0.7cqw, 11px);
  padding: 0 3%;
  border: clamp(1px, 0.14cqw, 2px) solid #ff8d98;
  border-radius: 999px;
  color: white;
  background: linear-gradient(180deg, #ff6675 0%, #f04355 58%, #dc2d40 100%);
  box-shadow:
    inset 0 2px rgb(255 255 255 / 0.3),
    inset 0 -3px rgb(148 20 42 / 0.14),
    0 6px 12px -7px rgb(126 30 35 / 0.75);
  font-size: clamp(9px, 1.15cqw, 17px);
  font-weight: 900;
  line-height: 1;
  white-space: nowrap;
  transform: translateX(-50%);
  transition: 160ms ease;
}

.explore-button svg {
  width: 1.15em;
  height: 1.15em;
  flex: 0 0 auto;
  stroke-width: 3;
}

.explore-button:hover {
  filter: brightness(1.05) drop-shadow(0 4px 4px rgb(102 24 35 / 0.3));
  transform: translateX(-50%) translateY(-3px);
}

@media (max-width: 1420px) {
  .exact-library {
    aspect-ratio: 2 / 1;
  }
}

@media (max-width: 1023px) {
  .desktop-library {
    display: none;
  }

  .mobile-library {
    display: block;
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
  }

  .mobile-filter {
    display: flex;
    gap: 7px;
    align-items: center;
    overflow-x: auto;
    padding: 4px 2px 10px;
    scrollbar-width: none;
  }

  .mobile-filter::-webkit-scrollbar {
    display: none;
  }

  .mobile-chip,
  .mobile-more-chip {
    display: inline-flex;
    height: 38px;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    gap: 5px;
    border: 1px solid #f1d9c9;
    border-radius: 999px;
    color: #644638;
    background: rgb(255 255 255 / 0.9);
    box-shadow: 0 4px 10px -7px rgb(96 45 19 / 0.55);
    font-size: 12px;
    font-weight: 900;
    white-space: nowrap;
  }

  .mobile-chip {
    padding: 0 12px;
  }

  .mobile-chip-all.is-active,
  .mobile-chip.is-active {
    border-color: #f04b5e;
    color: white;
    background: linear-gradient(180deg, #ff6678, #ef3d52);
    box-shadow: 0 7px 12px -8px rgb(210 38 61 / 0.8);
  }

  .mobile-more-chip {
    width: 38px;
    font-size: 20px;
  }

  .mobile-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 5px 8px;
  }

  .mobile-title-row h2 {
    color: #b63227;
    font-size: clamp(18px, 5.2vw, 23px);
    font-weight: 950;
    letter-spacing: -0.02em;
  }

  .mobile-title-row h2 span {
    margin-right: 5px;
    font-size: 0.95em;
  }

  .mobile-title-row button {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 8px 2px 8px 12px;
    color: #d33b34;
    font-size: 12px;
    font-weight: 900;
  }

  .mobile-title-row button span {
    font-size: 18px;
  }

  .mobile-bookcase {
    position: relative;
    width: 100%;
    aspect-ratio: 1122 / 1402;
    filter: drop-shadow(0 18px 18px rgb(101 57 20 / 0.16));
  }

  .mobile-frame {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: fill;
    pointer-events: none;
  }

  .mobile-shelf {
    position: absolute;
    z-index: 2;
    top: calc(17.8% + var(--mobile-shelf-index) * 23.35%);
    right: 14.5%;
    left: 15.5%;
    height: 20.7%;
  }

  .mobile-grade-badge {
    position: absolute;
    z-index: 5;
    top: -1%;
    left: -4%;
    width: 25%;
    height: 30%;
    object-fit: contain;
  }

  .mobile-books {
    position: absolute;
    inset: 11% 2% 0 3%;
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 1.2%;
    align-items: end;
  }

  .mobile-book {
    position: relative;
    width: 100%;
    height: 88%;
    padding: 0;
    transition: 150ms ease;
  }

  .mobile-book .book-art {
    width: 96%;
    height: 87%;
  }

  .mobile-book-subject {
    position: absolute;
    z-index: 3;
    top: 12%;
    right: 4%;
    left: 4%;
    display: -webkit-box;
    overflow: hidden;
    border-radius: 999px;
    background: rgb(255 255 255 / 0.12);
    padding: 2px 1px;
    color: white;
    font-size: clamp(6.5px, 1.95vw, 9px);
    font-weight: 950;
    line-height: 1.05;
    text-align: center;
    text-shadow: 0 1px 2px rgb(78 27 6 / 0.65);
    overflow-wrap: anywhere;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .mobile-book:active {
    transform: translateY(-4%) scale(1.03);
  }
}
</style>
