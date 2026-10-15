<script setup lang="ts">
import {
  Bookmark,
  ChevronRight,
  Compass,
  ExternalLink,
  Heart,
  Landmark,
  MapPin,
  MessageCircle,
  Mountain,
  Search,
  Send,
  Sparkles,
  Trees,
  Utensils,
  Waves,
} from '@lucide/vue'
import type { Component } from 'vue'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import dragonBridgeUrl from '@/assets/images/maps/dragon-bridge-3d-v2.png'
import tourVesselUrl from '@/assets/images/maps/vessel-tour-3d.png'
import daNangContent from '@/data/da-nang-content.json'
import daNangImages from '@/data/da-nang-images.json'

type Category = 'Tất cả' | 'Di sản' | 'Thiên nhiên' | 'Văn hóa' | 'Ẩm thực'
interface FeedPost {
  id: string
  name: string
  summary: string
  category: Exclude<Category, 'Tất cả'>
  ward: string
  regionId: string
  author: string
  time: string
  likes: number
  image: string
  imageSourceUrl: string
  imageCaption: string
  imageAuthor: string
  imageLicense: string
  imageExact: boolean
  gallery: FeedImage[]
  highlights: string[]
  postType: 'place' | 'ward'
}

interface FeedImage {
  imageUrl: string
  sourceUrl: string
  sourceName: string
  caption: string
  period: string
}

const categories: { label: Category; icon: Component }[] = [
  { label: 'Tất cả', icon: Compass },
  { label: 'Di sản', icon: Landmark },
  { label: 'Thiên nhiên', icon: Trees },
  { label: 'Văn hóa', icon: Sparkles },
  { label: 'Ẩm thực', icon: Utensils },
]
const activeCategory = ref<Category>('Tất cả')
const activeRegion = ref('all')
const route = useRoute()
const query = ref(typeof route.query.q === 'string' ? route.query.q : '')
const savedPosts = ref<string[]>([])
const likedPosts = ref<string[]>([])
const visibleCount = ref(8)

interface SourcedImage {
  imageUrl: string
  sourceUrl: string
  author: string
  license: string
  caption: string
  exact: boolean
  gallery?: FeedImage[]
}

const imageCatalog = daNangImages as Record<string, SourcedImage>
const wardById = new Map(daNangContent.wards.map((ward) => [ward.id, ward]))

function placeCategory(rawCategory: string): Exclude<Category, 'Tất cả'> {
  if (rawCategory === 'nature') return 'Thiên nhiên'
  if (rawCategory === 'culture' || rawCategory === 'craft') return 'Văn hóa'
  return 'Di sản'
}

const placePosts: FeedPost[] = daNangContent.places.map((place, index) => {
  const ward = place.wardId ? wardById.get(place.wardId) : undefined
  const image = imageCatalog[`place-${place.id}`]!
  return {
    id: `place-${place.id}`,
    name: place.name,
    summary: place.summary,
    category: placeCategory(place.category),
    ward: ward?.shortName ?? place.otherAdministrativeUnit ?? 'Đà Nẵng',
    regionId: ward?.regionId ?? 'da-nang-do-thi',
    author: place.category === 'nature' ? 'Đà Nẵng xanh' : 'Dấu xưa Đà Nẵng',
    time: `${(index % 9) + 1} giờ trước`,
    likes: 54 + ((index * 17) % 143),
    image: image.imageUrl,
    imageSourceUrl: image.sourceUrl,
    imageCaption: image.caption,
    imageAuthor: image.author,
    imageLicense: image.license,
    imageExact: image.exact,
    gallery: image.gallery ?? [],
    highlights: [place.unesco.listed ? 'UNESCO' : '', place.category.replace('_', ' ')].filter(
      Boolean,
    ),
    postType: 'place',
  }
})

const wardPosts: FeedPost[] = daNangContent.wards.map((ward, index) => {
  const specialtyNames = ward.specialties.map((item) => item.name)
  const culture = [
    ...ward.culture.heritageHighlights,
    ...ward.culture.festivals,
    ...ward.culture.crafts,
  ]
  const isFoodPost = index % 2 === 0 && specialtyNames.length > 0
  const image = imageCatalog[`ward-${ward.id}`]!
  return {
    id: `ward-${ward.id}`,
    name: isFoodPost ? `Hương vị ${ward.shortName}` : `Một ngày khám phá ${ward.shortName}`,
    summary: isFoodPost
      ? `${ward.overview} Những hương vị nên thử: ${specialtyNames.join(', ')}.`
      : `${ward.overview} ${ward.culture.summary}.`,
    category: isFoodPost ? 'Ẩm thực' : 'Văn hóa',
    ward: ward.shortName,
    regionId: ward.regionId,
    author: isFoodPost ? 'Bếp xứ Quảng' : 'Chuyện phường mình',
    time: `${(index % 6) + 1} ngày trước`,
    likes: 61 + ((index * 13) % 118),
    image: image.imageUrl,
    imageSourceUrl: image.sourceUrl,
    imageCaption: image.caption,
    imageAuthor: image.author,
    imageLicense: image.license,
    imageExact: image.exact,
    gallery: image.gallery ?? [],
    highlights: (isFoodPost ? specialtyNames : culture).slice(0, 3),
    postType: 'ward',
  }
})

const pinnedPostIds = ['place-dinh-lang-hoa-my']
const posts = [...placePosts, ...wardPosts].sort((first, second) => {
  const pinnedDifference =
    Number(pinnedPostIds.includes(second.id)) - Number(pinnedPostIds.includes(first.id))
  if (pinnedDifference !== 0) return pinnedDifference

  const firstFeatured = daNangContent.featuredPlaceIds.includes(first.id.replace('place-', ''))
  const secondFeatured = daNangContent.featuredPlaceIds.includes(second.id.replace('place-', ''))
  return Number(secondFeatured) - Number(firstFeatured)
})
const featuredWards = daNangContent.wards.slice(0, 8)
const specialties = [
  ...new Set(daNangContent.wards.flatMap((ward) => ward.specialties.map((item) => item.name))),
].slice(0, 6)
const culturalCount = daNangContent.wards.reduce(
  (total, ward) => total + ward.culture.festivals.length + ward.culture.crafts.length,
  0,
)

const filteredPosts = computed(() => {
  const normalized = query.value.trim().toLocaleLowerCase('vi')
  return posts.filter(
    (post) =>
      (activeCategory.value === 'Tất cả' || post.category === activeCategory.value) &&
      (activeRegion.value === 'all' || post.regionId === activeRegion.value) &&
      (!normalized ||
        `${post.name} ${post.summary} ${post.ward} ${post.highlights.join(' ')}`
          .toLocaleLowerCase('vi')
          .includes(normalized)),
  )
})
const displayedPosts = computed(() => filteredPosts.value.slice(0, visibleCount.value))
watch([activeCategory, activeRegion, query], () => {
  visibleCount.value = 8
})
watch(
  () => route.query.q,
  (routeQuery) => {
    query.value = typeof routeQuery === 'string' ? routeQuery : ''
  },
)

function selectRegion(regionId: string) {
  activeRegion.value = activeRegion.value === regionId ? 'all' : regionId
}

function explore(keyword = '', category: Category = 'Tất cả') {
  query.value = keyword
  activeCategory.value = category
  activeRegion.value = 'all'
}
function toggleSaved(id: string) {
  savedPosts.value = savedPosts.value.includes(id)
    ? savedPosts.value.filter((item) => item !== id)
    : [...savedPosts.value, id]
}
function toggleLiked(id: string) {
  likedPosts.value = likedPosts.value.includes(id)
    ? likedPosts.value.filter((item) => item !== id)
    : [...likedPosts.value, id]
}
</script>

<template>
  <main class="discover-page">
    <section class="discover-hero">
      <div class="hero-copy">
        <p><Sparkles :size="15" /> Câu chuyện thành phố bên sông Hàn</p>
        <h1>Khám phá Đà Nẵng</h1>
        <span>Đi qua miền di sản, chạm vào nhịp sống và hương vị xứ Quảng</span>
      </div>
      <div class="hero-stats" aria-label="Thống kê nội dung">
        <div>
          <strong>{{ daNangContent.places.length }}</strong
          ><span>địa danh</span>
        </div>
        <div>
          <strong>{{ daNangContent.wards.length }}</strong
          ><span>phường</span>
        </div>
        <div>
          <strong>{{ daNangContent.regions.length }}</strong
          ><span>vùng</span>
        </div>
      </div>
    </section>

    <div class="discover-layout">
      <aside class="side-column left-side">
        <section class="poster poster-dragon">
          <div class="poster-topline"><span>01</span><i></i><strong>BIỂU TƯỢNG</strong></div>
          <p>Thành phố<br />của những</p>
          <h2>Cây cầu</h2>
          <span class="poster-script">rực rỡ</span>
          <img :src="dragonBridgeUrl" alt="Mô hình Cầu Rồng Đà Nẵng" />
          <div class="river-lines" aria-hidden="true"><i></i><i></i><i></i></div>
          <button type="button" @click="explore('Cầu', 'Di sản')">
            Khám phá biểu tượng <ChevronRight :size="15" />
          </button>
        </section>
        <section class="region-card">
          <header><MapPin :size="17" /><strong>Khám phá theo vùng</strong></header>
          <button
            v-for="(region, index) in daNangContent.regions"
            :key="region.id"
            type="button"
            :class="{ active: activeRegion === region.id }"
            @click="selectRegion(region.id)"
          >
            <span>0{{ index + 1 }}</span>
            <div>
              <strong>{{ region.name }}</strong
              ><small>{{ region.description }}</small>
            </div>
          </button>
        </section>
      </aside>

      <section class="feed-column" aria-label="Bảng tin Khám phá Đà Nẵng">
        <section class="story-panel">
          <div class="story-heading">
            <div><strong>Chuyện từ mỗi phường</strong><span>Chạm để tìm hiểu nhanh</span></div>
            <small>{{ daNangContent.wards.length }} câu chuyện</small>
          </div>
          <div class="story-row">
            <button
              v-for="(ward, index) in featuredWards"
              :key="ward.id"
              type="button"
              @click="explore(ward.shortName)"
            >
              <span class="story-ring" :style="{ '--story-hue': `${index * 37 + 8}` }">
                <Landmark v-if="index % 3 === 0" :size="19" /><Waves
                  v-else-if="index % 3 === 1"
                  :size="19"
                /><Trees v-else :size="19" /> </span
              ><strong>{{ ward.shortName }}</strong>
            </button>
          </div>
        </section>
        <div class="search-field">
          <Search :size="18" /><input
            v-model="query"
            type="search"
            placeholder="Tìm địa danh, lễ hội, làng nghề, món ngon..."
          /><span>{{ filteredPosts.length }} nội dung</span>
        </div>
        <nav class="category-tabs" aria-label="Lọc nội dung Đà Nẵng">
          <button
            v-for="item in categories"
            :key="item.label"
            type="button"
            :class="{ active: activeCategory === item.label }"
            @click="activeCategory = item.label"
          >
            <component :is="item.icon" :size="16" /> {{ item.label }}
          </button>
        </nav>
        <div class="feed-heading">
          <p class="feed-label"><Sparkles :size="15" /> Bảng tin thành phố</p>
          <button v-if="activeRegion !== 'all'" type="button" @click="activeRegion = 'all'">
            Xóa lọc vùng
          </button>
        </div>

        <article v-for="post in displayedPosts" :key="post.id" class="post-card">
          <header class="post-header">
            <div class="post-avatar" :class="`category-${post.category.replace(' ', '')}`">
              <Landmark v-if="post.category === 'Di sản'" :size="18" /><Mountain
                v-else-if="post.category === 'Thiên nhiên'"
                :size="18"
              /><Utensils v-else-if="post.category === 'Ẩm thực'" :size="18" /><Sparkles
                v-else
                :size="18"
              />
            </div>
            <div>
              <strong>{{ post.author }}</strong
              ><span>{{ post.time }} · {{ post.ward }}</span>
            </div>
            <button
              type="button"
              class="save-button"
              :class="{ saved: savedPosts.includes(post.id) }"
              :aria-label="`Lưu ${post.name}`"
              @click="toggleSaved(post.id)"
            >
              <Bookmark :size="19" :fill="savedPosts.includes(post.id) ? 'currentColor' : 'none'" />
            </button>
          </header>
          <div class="post-copy">
            <span class="post-topic">{{
              post.postType === 'ward' ? 'Chuyện địa phương' : post.category
            }}</span>
            <h2>{{ post.name }}</h2>
            <p>{{ post.summary }}</p>
            <div v-if="post.highlights.length" class="highlight-row">
              <span v-for="highlight in post.highlights" :key="highlight"># {{ highlight }}</span>
            </div>
          </div>
          <div v-if="post.gallery.length" class="post-gallery">
            <a
              v-for="(galleryImage, imageIndex) in post.gallery"
              :key="galleryImage.imageUrl"
              :href="galleryImage.sourceUrl"
              class="gallery-tile"
              :class="{ 'gallery-main': imageIndex === 0 }"
              target="_blank"
              rel="noreferrer"
              :title="`${galleryImage.caption} · ${galleryImage.sourceName}`"
            >
              <img :src="galleryImage.imageUrl" :alt="galleryImage.caption" loading="lazy" />
              <span class="gallery-period">{{ galleryImage.period }}</span>
              <span class="gallery-source">{{ galleryImage.sourceName }}</span>
              <strong v-if="imageIndex === 0">{{ galleryImage.caption }}</strong>
              <span v-if="imageIndex === 0" class="gallery-count">
                {{ post.gallery.length }} ảnh thực tế
              </span>
            </a>
          </div>
          <div v-else class="post-media">
            <img :src="post.image" :alt="post.imageCaption" loading="lazy" />
            <div class="image-credit">
              <span>
                {{ post.imageCaption }}
                <small v-if="!post.imageExact">· ảnh khu vực</small>
              </span>
              <a
                :href="post.imageSourceUrl"
                target="_blank"
                rel="noreferrer"
                :title="`${post.imageAuthor} · ${post.imageLicense}`"
              >
                Nguồn ảnh <ExternalLink :size="12" />
              </a>
            </div>
          </div>
          <footer class="post-actions">
            <button
              type="button"
              :class="{ liked: likedPosts.includes(post.id) }"
              @click="toggleLiked(post.id)"
            >
              <Heart :size="18" :fill="likedPosts.includes(post.id) ? 'currentColor' : 'none'" />{{
                post.likes + (likedPosts.includes(post.id) ? 1 : 0)
              }}
              yêu thích
            </button>
            <button type="button"><MessageCircle :size="18" /> Bình luận</button
            ><button type="button" aria-label="Chia sẻ"><Send :size="18" /></button>
          </footer>
        </article>
        <button
          v-if="displayedPosts.length < filteredPosts.length"
          type="button"
          class="load-more"
          @click="visibleCount += 8"
        >
          Xem thêm câu chuyện<span
            >{{ filteredPosts.length - displayedPosts.length }} nội dung còn lại</span
          >
        </button>
        <div v-if="!filteredPosts.length" class="empty-feed">
          Không tìm thấy nội dung phù hợp. Thử một từ khóa khác nhé!
        </div>
      </section>

      <aside class="side-column right-side">
        <section class="poster poster-ocean">
          <div class="poster-topline"><span>02</span><i></i><strong>TRẢI NGHIỆM</strong></div>
          <p>Đón gió</p>
          <h2>Biển xanh</h2>
          <span class="poster-script">vươn ra di sản</span>
          <img :src="tourVesselUrl" alt="Thuyền du lịch trên biển Đà Nẵng" />
          <div class="ocean-waves" aria-hidden="true"></div>
          <button type="button" @click="explore('', 'Thiên nhiên')">
            Theo dòng khám phá <ChevronRight :size="15" />
          </button>
        </section>
        <section class="taste-card">
          <header>
            <Utensils :size="17" />
            <div><strong>Nhất định phải thử</strong><span>Hương vị địa phương</span></div>
          </header>
          <button
            v-for="(specialty, index) in specialties"
            :key="specialty"
            type="button"
            @click="explore(specialty, 'Ẩm thực')"
          >
            <span>{{ index + 1 }}</span
            >{{ specialty }}<ChevronRight :size="14" />
          </button>
        </section>
        <section class="fact-card">
          <span><Sparkles :size="18" /></span>
          <div>
            <strong>{{ culturalCount }}+</strong
            ><small>lễ hội &amp; làng nghề được lưu giữ trong bộ sưu tập.</small>
          </div>
        </section>
      </aside>
    </div>
  </main>
</template>

<style scoped>
.discover-page {
  max-width: 1480px;
  margin: 0 auto;
  padding: 8px 18px 72px;
}
.discover-hero {
  position: relative;
  overflow: hidden;
  display: flex;
  min-height: 150px;
  align-items: center;
  justify-content: space-between;
  padding: 28px 46px;
  border-radius: 34px;
  color: #fff;
  background:
    radial-gradient(circle at 83% 15%, rgba(255, 205, 96, 0.55), transparent 18%),
    linear-gradient(118deg, #b80f2d 0%, #df2133 52%, #f07b32 100%);
  box-shadow: 0 26px 55px -32px rgba(126, 10, 30, 0.8);
}
.discover-hero:before {
  position: absolute;
  inset: -90px auto auto 48%;
  width: 300px;
  height: 300px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  box-shadow:
    0 0 0 38px rgba(255, 255, 255, 0.05),
    0 0 0 76px rgba(255, 255, 255, 0.035);
  content: '';
}
.hero-copy {
  position: relative;
  z-index: 1;
}
.hero-copy p,
.feed-label {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 7px;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.hero-copy h1 {
  margin: 0;
  font-size: clamp(30px, 4vw, 43px);
  line-height: 1;
  letter-spacing: -0.045em;
}
.hero-copy > span {
  display: block;
  margin-top: 10px;
  font-size: 13px;
  font-weight: 650;
  opacity: 0.9;
}
.hero-stats {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 8px;
}
.hero-stats div {
  min-width: 82px;
  padding: 13px 12px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 19px;
  background: rgba(117, 0, 20, 0.15);
  text-align: center;
  backdrop-filter: blur(8px);
}
.hero-stats strong {
  display: block;
  font-size: 23px;
  line-height: 1;
}
.hero-stats span {
  display: block;
  margin-top: 5px;
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.82;
}
.discover-layout {
  display: grid;
  grid-template-columns: 250px minmax(0, 650px) 250px;
  justify-content: center;
  gap: 20px;
  align-items: start;
  margin-top: 20px;
}
.side-column {
  position: sticky;
  top: 104px;
  display: grid;
  gap: 16px;
}
.poster,
.region-card,
.story-panel,
.search-field,
.post-card,
.taste-card,
.fact-card {
  border: 1px solid rgba(255, 255, 255, 0.76);
  box-shadow: 0 22px 50px -34px rgba(24, 32, 51, 0.58);
}
.poster {
  position: relative;
  overflow: hidden;
  height: 390px;
  padding: 20px;
  border-radius: 30px;
  color: #fff;
  isolation: isolate;
}
.poster-dragon {
  background:
    radial-gradient(circle at 85% 17%, #ffd165 0 5%, transparent 20%),
    linear-gradient(155deg, #8d0921 0%, #d51e32 48%, #f47c2d 100%);
}
.poster-topline {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 8px;
  letter-spacing: 0.15em;
}
.poster-topline span {
  display: grid;
  width: 25px;
  height: 25px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 50%;
  font-weight: 900;
}
.poster-topline i {
  height: 1px;
  flex: 1;
  background: rgba(255, 255, 255, 0.35);
}
.poster p {
  position: relative;
  z-index: 3;
  margin: 28px 0 0;
  font-size: 20px;
  font-weight: 750;
  line-height: 1.05;
}
.poster h2 {
  position: relative;
  z-index: 3;
  margin: 0;
  color: #ffd65b;
  font-size: 44px;
  line-height: 0.95;
  letter-spacing: -0.065em;
}
.poster-script {
  position: relative;
  z-index: 3;
  display: block;
  margin: 5px 0 0 62px;
  font-family: Georgia, serif;
  font-size: 20px;
  font-style: italic;
}
.poster-dragon img {
  position: absolute;
  z-index: 2;
  top: 178px;
  left: -36px;
  width: 330px;
  max-width: none;
  filter: drop-shadow(0 17px 12px rgba(57, 0, 9, 0.38));
}
.river-lines {
  position: absolute;
  z-index: 1;
  inset: auto -20px 40px;
  height: 105px;
  transform: rotate(-7deg);
}
.river-lines i {
  position: absolute;
  width: 120%;
  height: 42px;
  border: 1px solid rgba(255, 224, 161, 0.35);
  border-radius: 50%;
}
.river-lines i:nth-child(2) {
  top: 20px;
  left: -22px;
}
.river-lines i:nth-child(3) {
  top: 40px;
  left: 8px;
}
.poster button {
  position: absolute;
  z-index: 4;
  right: 18px;
  bottom: 17px;
  left: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 13px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 14px;
  color: #fff;
  background: rgba(80, 0, 12, 0.22);
  font-size: 10px;
  font-weight: 900;
  cursor: pointer;
  backdrop-filter: blur(8px);
}
.poster-ocean {
  background:
    radial-gradient(
      circle at 80% 17%,
      #ffd868 0 9%,
      rgba(255, 216, 104, 0.25) 10% 17%,
      transparent 18%
    ),
    linear-gradient(158deg, #005e91 0%, #008ab8 52%, #4cced0 100%);
}
.poster-ocean p {
  margin-top: 28px;
}
.poster-ocean h2 {
  color: #fff;
  font-size: 45px;
}
.poster-ocean .poster-script {
  margin-left: 18px;
  color: #d9fbef;
  font-size: 17px;
}
.poster-ocean img {
  position: absolute;
  z-index: 2;
  right: -47px;
  bottom: 34px;
  width: 275px;
  filter: drop-shadow(0 17px 12px rgba(0, 45, 73, 0.4));
}
.ocean-waves {
  position: absolute;
  z-index: 1;
  right: -20px;
  bottom: 31px;
  left: -20px;
  height: 112px;
  background: repeating-radial-gradient(
    ellipse at 50% 105%,
    transparent 0 25px,
    rgba(255, 255, 255, 0.2) 27px 29px
  );
}
.poster-ocean button {
  background: rgba(0, 57, 91, 0.3);
}
.region-card,
.taste-card {
  overflow: hidden;
  padding: 15px;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.93);
}
.region-card > header,
.taste-card > header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 2px 12px;
  font-size: 13px;
}
.region-card > button {
  display: flex;
  width: 100%;
  align-items: flex-start;
  gap: 9px;
  padding: 10px 3px;
  border: 0;
  border-top: 1px solid #edf0f4;
  color: #3c485b;
  background: transparent;
  text-align: left;
  cursor: pointer;
}
.region-card > button > span {
  display: grid;
  width: 26px;
  height: 26px;
  flex: none;
  place-items: center;
  border-radius: 9px;
  color: #cf2639;
  background: #fff0f2;
  font-size: 9px;
  font-weight: 900;
}
.region-card button strong {
  display: block;
  font-size: 11px;
}
.region-card button small {
  display: -webkit-box;
  overflow: hidden;
  margin-top: 3px;
  color: #8490a2;
  font-size: 9px;
  line-height: 1.35;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.region-card button.active {
  color: #d51e32;
}
.region-card button.active > span {
  color: #fff;
  background: #d51e32;
}
.feed-column {
  min-width: 0;
}
.story-panel {
  padding: 16px;
  border-radius: 27px;
  background: rgba(255, 255, 255, 0.94);
}
.story-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.story-heading strong {
  display: block;
  font-size: 14px;
}
.story-heading span {
  display: block;
  margin-top: 2px;
  color: #8a96a8;
  font-size: 10px;
}
.story-heading small {
  padding: 6px 9px;
  border-radius: 999px;
  color: #d51e32;
  background: #fff0f2;
  font-size: 9px;
  font-weight: 900;
}
.story-row {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  margin-top: 14px;
  padding-bottom: 2px;
  scrollbar-width: none;
}
.story-row button {
  width: 60px;
  flex: none;
  padding: 0;
  border: 0;
  color: #3e4a5c;
  background: transparent;
  cursor: pointer;
}
.story-ring {
  display: grid;
  width: 53px;
  height: 53px;
  place-items: center;
  margin: auto;
  border: 3px solid hsl(var(--story-hue) 78% 55%);
  border-radius: 50%;
  color: hsl(var(--story-hue) 68% 38%);
  background: hsl(var(--story-hue) 85% 94%);
  box-shadow: inset 0 0 0 3px #fff;
}
.story-row strong {
  display: block;
  overflow: hidden;
  margin-top: 5px;
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.search-field {
  display: flex;
  height: 48px;
  align-items: center;
  gap: 9px;
  margin-top: 12px;
  padding: 0 15px;
  border-radius: 17px;
  color: #7b8799;
  background: rgba(255, 255, 255, 0.94);
}
.search-field input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  color: #182033;
  background: transparent;
  font: inherit;
  font-size: 12px;
}
.search-field > span {
  flex: none;
  padding: 5px 8px;
  border-radius: 999px;
  color: #bf1d31;
  background: #fff0f2;
  font-size: 9px;
  font-weight: 850;
}
.category-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  margin: 13px 0 16px;
  padding-bottom: 2px;
  scrollbar-width: none;
}
.category-tabs button {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #e3e7ed;
  border-radius: 999px;
  color: #59677b;
  background: rgba(255, 255, 255, 0.9);
  font-size: 10px;
  font-weight: 850;
  cursor: pointer;
  transition: 0.2s;
}
.category-tabs button.active {
  border-color: #d82035;
  color: #fff;
  background: #d82035;
  box-shadow: 0 9px 17px -11px #d82035;
}
.feed-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 3px;
}
.feed-label {
  margin: 0;
  color: #c91e32;
}
.feed-heading button {
  border: 0;
  color: #677489;
  background: transparent;
  font-size: 9px;
  font-weight: 800;
  cursor: pointer;
}
.post-card {
  overflow: hidden;
  margin-top: 11px;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.97);
}
.post-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 17px 10px;
}
.post-avatar {
  display: grid;
  width: 38px;
  height: 38px;
  flex: none;
  place-items: center;
  border-radius: 14px;
  color: #fff;
  background: linear-gradient(145deg, #d82035, #f4803f);
}
.post-avatar.category-Thiênnhiên {
  background: linear-gradient(145deg, #0b8f78, #43c58c);
}
.post-avatar.category-Ẩmthực {
  background: linear-gradient(145deg, #dd6c19, #f2b335);
}
.post-avatar.category-Vănhóa {
  background: linear-gradient(145deg, #7357c7, #aa7de1);
}
.post-header strong {
  display: block;
  font-size: 12px;
}
.post-header span {
  display: block;
  margin-top: 3px;
  color: #7c8899;
  font-size: 10px;
}
.save-button {
  display: grid;
  margin-left: auto;
  padding: 6px;
  place-items: center;
  border: 0;
  color: #8591a2;
  background: transparent;
  cursor: pointer;
}
.save-button.saved {
  color: #d82035;
}
.post-copy {
  padding: 0 17px 14px;
}
.post-topic {
  color: #d3263a;
  font-size: 9px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.post-copy h2 {
  margin: 4px 0 5px;
  font-size: 21px;
  letter-spacing: -0.035em;
}
.post-copy p {
  margin: 0;
  color: #5f6e82;
  font-size: 12px;
  line-height: 1.55;
}
.highlight-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 10px;
}
.highlight-row span {
  padding: 5px 8px;
  border-radius: 999px;
  color: #687589;
  background: #f1f4f7;
  font-size: 9px;
  font-weight: 750;
}
.post-media {
  position: relative;
  overflow: hidden;
  height: 300px;
  background: #dcecf1;
}
.post-gallery {
  display: grid;
  height: 340px;
  grid-template-columns: 1.55fr 1fr 1fr;
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 3px;
  overflow: hidden;
  background: #dcecf1;
}
.gallery-tile {
  position: relative;
  overflow: hidden;
  color: #fff;
  background: #283a45;
}
.gallery-tile::after {
  position: absolute;
  inset: 35% 0 0;
  background: linear-gradient(transparent, rgba(7, 18, 27, 0.78));
  content: '';
  pointer-events: none;
}
.gallery-main {
  grid-row: 1 / 3;
}
.gallery-tile img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.45s ease;
}
.gallery-tile:hover img {
  transform: scale(1.035);
}
.gallery-period,
.gallery-source,
.gallery-tile strong,
.gallery-count {
  position: absolute;
  z-index: 2;
}
.gallery-period {
  top: 9px;
  left: 9px;
  padding: 4px 7px;
  border-radius: 999px;
  background: rgba(9, 24, 35, 0.68);
  font-size: 8px;
  font-weight: 850;
  backdrop-filter: blur(7px);
}
.gallery-source {
  right: 8px;
  bottom: 8px;
  max-width: calc(100% - 16px);
  overflow: hidden;
  font-size: 8px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.gallery-tile strong {
  right: 12px;
  bottom: 37px;
  left: 12px;
  font-size: 13px;
  line-height: 1.3;
}
.gallery-count {
  bottom: 11px;
  left: 12px;
  padding: 5px 8px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 9px;
  background: rgba(0, 0, 0, 0.25);
  font-size: 8px;
  font-weight: 850;
  backdrop-filter: blur(7px);
}
.post-media::after {
  position: absolute;
  inset: 55% 0 0;
  background: linear-gradient(transparent, rgba(8, 22, 35, 0.78));
  content: '';
  pointer-events: none;
}
.post-media > img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.post-card:hover .post-media > img {
  transform: scale(1.025);
}
.image-credit {
  position: absolute;
  z-index: 2;
  right: 13px;
  bottom: 11px;
  left: 13px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  color: #fff;
  font-size: 9px;
  font-weight: 750;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.45);
}
.image-credit > span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.image-credit small {
  font-size: inherit;
  opacity: 0.72;
}
.image-credit a {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 9px;
  color: #fff;
  background: rgba(0, 0, 0, 0.25);
  text-decoration: none;
  backdrop-filter: blur(7px);
}
.post-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 11px 15px;
}
.post-actions button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  color: #6e7a8c;
  background: transparent;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
}
.post-actions button.liked {
  color: #d82035;
}
.post-actions button:last-child {
  margin-left: auto;
}
.load-more {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  margin-top: 13px;
  padding: 14px 17px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 17px;
  color: #c81d34;
  background: rgba(255, 255, 255, 0.92);
  font-size: 11px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 16px 35px -30px #182033;
}
.load-more span {
  color: #8894a5;
  font-size: 9px;
  font-weight: 700;
}
.empty-feed {
  padding: 30px;
  border-radius: 22px;
  color: #667085;
  background: #fff;
  text-align: center;
  font-size: 12px;
}
.taste-card > header div span {
  display: block;
  margin-top: 2px;
  color: #8a96a7;
  font-size: 9px;
}
.taste-card > button {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 8px;
  padding: 9px 2px;
  border: 0;
  border-top: 1px solid #edf0f4;
  color: #445064;
  background: transparent;
  text-align: left;
  font-size: 10px;
  font-weight: 750;
  cursor: pointer;
}
.taste-card > button > span {
  display: grid;
  width: 22px;
  height: 22px;
  flex: none;
  place-items: center;
  border-radius: 8px;
  color: #d26718;
  background: #fff3df;
  font-size: 8px;
  font-weight: 900;
}
.taste-card > button svg {
  margin-left: auto;
}
.fact-card {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 14px;
  border-radius: 22px;
  color: #fff;
  background: linear-gradient(135deg, #7c4abe, #a45fc7);
}
.fact-card > span {
  display: grid;
  width: 37px;
  height: 37px;
  flex: none;
  place-items: center;
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.17);
}
.fact-card strong {
  display: block;
  font-size: 18px;
}
.fact-card small {
  display: block;
  font-size: 9px;
  line-height: 1.35;
  opacity: 0.85;
}
@media (max-width: 1160px) {
  .discover-layout {
    grid-template-columns: 230px minmax(0, 650px);
  }
  .right-side {
    display: none;
  }
}
@media (max-width: 800px) {
  .discover-page {
    padding: 4px 12px 100px;
  }
  .discover-hero {
    min-height: 145px;
    padding: 24px;
    border-radius: 27px;
  }
  .hero-stats {
    display: none;
  }
  .hero-copy > span {
    max-width: 330px;
  }
  .discover-layout {
    display: block;
    margin-top: 13px;
  }
  .left-side {
    display: none;
  }
  .post-media {
    height: 235px;
  }
  .post-gallery {
    height: 280px;
    grid-template-columns: 1.35fr 1fr 1fr;
  }
  .gallery-source {
    display: none;
  }
  .post-copy h2 {
    font-size: 20px;
  }
  .story-panel {
    padding: 14px;
  }
  .post-actions button:nth-child(2) {
    display: none;
  }
}
</style>
