<script setup lang="ts">
import {
  BookOpenCheck,
  Building2,
  Castle,
  ChevronDown,
  ChevronRight,
  Compass,
  Flag,
  HelpCircle,
  Landmark,
  MapPinned,
  Mountain,
  Search,
  Sparkles,
  Trees,
  Trophy,
  Waves,
} from '@lucide/vue'
import { computed, ref, type Component } from 'vue'

import {
  featuredVietnamMapPlaces,
  vietnamMapRegions,
  vietnamProvinceFeatures,
  type VietnamMapRegion,
  type VietnamProvinceFeature,
} from '@/data/vietnam3DMap'
import vietnamMapStageUrl from '@/assets/images/maps/vietnam-3d-generated-map.png'

const selectedRegion = ref<VietnamMapRegion>('Tất cả')
const query = ref('')
const activePlace = ref<VietnamProvinceFeature>(vietnamProvinceFeatures[0]!)

const filteredPlaces = computed(() => {
  const normalizedQuery = query.value.trim().toLowerCase()

  return vietnamProvinceFeatures.filter((place) => {
    const matchesRegion = selectedRegion.value === 'Tất cả' || place.region === selectedRegion.value
    const matchesQuery =
      !normalizedQuery ||
      [place.name, place.region, place.capital, place.highlight].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      )

    return matchesRegion && matchesQuery
  })
})

const visiblePins = computed(() => {
  const visibleIds = new Set(filteredPlaces.value.map((place) => place.id))
  return vietnamProvinceFeatures.filter((place) => visibleIds.has(place.id))
})

const regionSummary = computed(() => {
  if (selectedRegion.value === 'Tất cả') return 'Khám phá toàn quốc'
  return `${filteredPlaces.value.length} tỉnh/thành thuộc ${selectedRegion.value}`
})

const activeTourismDetails = computed(() => activePlace.value.tourismDetails ?? [])

function selectRegion(region: VietnamMapRegion) {
  selectedRegion.value = region
  const firstPlace = filteredPlaces.value[0]
  if (firstPlace) activePlace.value = firstPlace
}

function selectPlace(place: VietnamProvinceFeature) {
  activePlace.value = place
  selectedRegion.value = place.region
}

function spotKind(spot: string) {
  const normalized = spot.toLowerCase()
  if (
    ['biển', 'vịnh', 'đảo', 'sông', 'hồ', 'đầm', 'bến', 'cát bà', 'cô tô', 'nha trang'].some(
      (keyword) => normalized.includes(keyword),
    )
  ) {
    return 'water'
  }
  if (
    ['núi', 'đèo', 'cao nguyên', 'fansipan', 'bà đen', 'mộc châu', 'pù', 'rừng', 'tràm'].some(
      (keyword) => normalized.includes(keyword),
    )
  ) {
    return 'nature'
  }
  if (
    ['đền', 'chùa', 'văn miếu', 'đại nội', 'lăng', 'tháp', 'hoàng thành', 'thành', 'dinh'].some(
      (keyword) => normalized.includes(keyword),
    )
  ) {
    return 'heritage'
  }
  if (
    ['chợ', 'phố', 'bưu điện', 'nhà hát', 'quảng trường'].some((keyword) =>
      normalized.includes(keyword),
    )
  ) {
    return 'city'
  }
  return 'landscape'
}

function spotIcon(spot: string): Component {
  const kind = spotKind(spot)
  if (kind === 'water') return Waves
  if (kind === 'nature') return Trees
  if (kind === 'heritage') return Landmark
  if (kind === 'city') return Building2
  return Castle
}

function tourismImageStyle(place: VietnamProvinceFeature, spot: string, index: number) {
  const kind = spotKind(spot)
  const palettes = {
    water: ['#63d7ff', '#0ea5e9', '#f8fdff'],
    nature: ['#b7eb7f', '#22c55e', '#f7ffd9'],
    heritage: ['#ffd38a', '#ef7d22', '#fff7e6'],
    city: ['#b9d9ff', '#4478e8', '#ffffff'],
    landscape: ['#c9e7a5', '#8b5cf6', '#fff6d7'],
  }[kind]

  return {
    '--spot-a': palettes[0],
    '--spot-b': palettes[1],
    '--spot-c': palettes[2],
    '--spot-color': place.color,
    '--spot-delay': `${index * 70}ms`,
  }
}
</script>

<template>
  <main class="map-page">
    <section class="map-hero">
      <div class="map-hero__intro">
        <span class="map-eyebrow">
          <Compass :size="18" />
          Bản đồ Việt Nam
        </span>
        <h1>Khám phá Việt Nam</h1>
        <p>
          Cùng tìm hiểu lịch sử, địa lý và những điểm đến đặc trưng trên khắp mọi miền đất nước.
        </p>
      </div>

      <div class="map-hero__tools" aria-label="Công cụ nhanh">
        <button type="button">
          <HelpCircle :size="18" />
          Hướng dẫn
        </button>
        <button type="button">
          <Trophy :size="18" />
          Thử thách
        </button>
        <button type="button">
          <BookOpenCheck :size="18" />
          Báo cáo
        </button>
      </div>
    </section>

    <section class="map-workspace">
      <aside class="region-panel" aria-label="Chọn vùng miền">
        <div class="panel-heading">
          <span>
            <MapPinned :size="20" />
          </span>
          <div>
            <h2>Chọn vùng miền</h2>
            <p>{{ regionSummary }}</p>
          </div>
        </div>

        <label class="map-search" for="province-search">
          <Search :size="18" />
          <input
            id="province-search"
            v-model="query"
            type="search"
            placeholder="Tìm tỉnh, thành phố..."
          />
        </label>

        <div class="region-list">
          <button
            v-for="region in vietnamMapRegions"
            :key="region"
            type="button"
            :class="{ active: selectedRegion === region }"
            @click="selectRegion(region)"
          >
            <span class="region-icon">
              <Mountain v-if="region.includes('Bắc') || region.includes('Tây Nguyên')" :size="24" />
              <Compass v-else-if="region === 'Tất cả'" :size="24" />
              <Flag v-else :size="24" />
            </span>
            <span>
              <strong>{{ region }}</strong>
              <small>
                {{
                  region === 'Tất cả'
                    ? 'Khám phá toàn quốc'
                    : `${vietnamProvinceFeatures.filter((place) => place.region === region).length} điểm học`
                }}
              </small>
            </span>
            <ChevronRight :size="18" />
          </button>
        </div>
      </aside>

      <section class="map-stage" aria-label="Bản đồ tương tác Việt Nam">
        <div class="map-canvas">
          <img class="map-stage-image" :src="vietnamMapStageUrl" alt="Bản đồ 3D Việt Nam" />

          <div
            class="dragon-bridge-effects"
            :class="{ active: activePlace.id === 'da-nang' }"
            aria-hidden="true"
          >
            <span class="dragon-fire">
              <i class="fire-plume fire-plume--outer" />
              <i class="fire-plume fire-plume--middle" />
              <i class="fire-plume fire-plume--core" />
              <i class="fire-ember fire-ember--one" />
              <i class="fire-ember fire-ember--two" />
              <i class="fire-smoke" />
            </span>
            <span class="dragon-water">
              <i class="water-jet water-jet--one" />
              <i class="water-jet water-jet--two" />
              <i class="water-jet water-jet--three" />
              <i class="water-drop water-drop--one" />
              <i class="water-drop water-drop--two" />
              <i class="water-drop water-drop--three" />
              <i class="water-mist" />
            </span>
          </div>

          <button
            v-for="place in visiblePins"
            :key="place.id"
            type="button"
            class="map-hotspot"
            :class="{ active: activePlace.id === place.id }"
            :style="{ left: `${place.x}%`, top: `${place.y}%`, '--pin-color': place.color }"
            :aria-label="`Khám phá ${place.name}`"
            @click="selectPlace(place)"
          >
            <span />
            <strong>{{ place.name }}</strong>
          </button>
        </div>
      </section>

      <aside class="province-panel" aria-live="polite">
        <div class="province-badge" :style="{ '--badge-color': activePlace.color }">
          <Sparkles :size="18" />
          {{ activePlace.region }}
        </div>
        <h2>{{ activePlace.name }}</h2>
        <p class="province-highlight">{{ activePlace.highlight }}</p>

        <div class="province-facts">
          <article>
            <strong>Lịch sử</strong>
            <p>{{ activePlace.history }}</p>
          </article>
          <article>
            <strong>Địa lý</strong>
            <p>{{ activePlace.geography }}</p>
          </article>
          <article>
            <strong>Du lịch</strong>
            <div v-if="activeTourismDetails.length" class="real-tourism-gallery">
              <a
                v-for="spot in activeTourismDetails"
                :key="spot.name"
                class="real-tourism-card"
                :href="spot.sourceUrl"
                target="_blank"
                rel="noreferrer"
              >
                <img :src="spot.imageUrl" :alt="spot.name" loading="lazy" />
                <span class="real-tourism-info">
                  <em>{{ spot.category }}</em>
                  <strong>{{ spot.name }}</strong>
                  <small>{{ spot.description }}</small>
                </span>
              </a>
            </div>
            <div v-else class="tourism-gallery">
              <figure
                v-for="(spot, index) in activePlace.tourism"
                :key="spot"
                class="tourism-card"
                :style="tourismImageStyle(activePlace, spot, index)"
              >
                <span class="postcard-scene">
                  <span class="scene-sun" />
                  <span class="scene-hill scene-hill-a" />
                  <span class="scene-hill scene-hill-b" />
                  <span class="scene-water" />
                  <component :is="spotIcon(spot)" :size="34" />
                </span>
                <figcaption>{{ spot }}</figcaption>
              </figure>
            </div>
          </article>
        </div>
      </aside>
    </section>

    <section class="featured-strip" aria-label="Khám phá nổi bật">
      <header>
        <h2>
          <Sparkles :size="22" />
          Khám phá nổi bật
        </h2>
        <button type="button" aria-label="Thu gọn danh sách nổi bật">
          <ChevronDown :size="22" />
        </button>
      </header>

      <div class="featured-list">
        <button
          v-for="place in featuredVietnamMapPlaces"
          :key="place.id"
          type="button"
          :style="{ '--feature-color': place.color }"
          @click="selectPlace(place)"
        >
          <span class="feature-art">
            <MapPinned :size="30" />
          </span>
          <strong>{{ place.name }}</strong>
          <small>{{ place.highlight }}</small>
        </button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.map-page {
  min-height: 100vh;
  padding: clamp(18px, 3vw, 34px) clamp(16px, 4vw, 56px) clamp(110px, 8vw, 72px);
  color: #172033;
}

.map-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  max-width: 1440px;
  margin: 0 auto clamp(18px, 2.6vw, 30px);
}

.map-hero__intro {
  max-width: 600px;
}

.map-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.88);
  color: #1667c7;
  font-size: 14px;
  font-weight: 900;
  box-shadow: 0 14px 36px -26px rgb(24 32 51 / 0.4);
}

.map-hero h1 {
  margin: 12px 0 8px;
  color: #ff9518;
  font-size: clamp(44px, 7vw, 86px);
  font-weight: 1000;
  line-height: 0.9;
  text-shadow:
    0 4px 0 #fff,
    0 12px 24px rgb(213 115 13 / 0.26);
}

.map-hero p {
  max-width: 540px;
  color: #253149;
  font-size: clamp(15px, 1.8vw, 18px);
  font-weight: 700;
  line-height: 1.55;
}

.map-hero__tools {
  display: grid;
  gap: 10px;
  min-width: 138px;
}

.map-hero__tools button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 46px;
  border-radius: 16px;
  background: rgb(255 255 255 / 0.92);
  padding: 0 16px;
  color: #253149;
  font-size: 13px;
  font-weight: 900;
  box-shadow: 0 16px 38px -28px rgb(24 32 51 / 0.5);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.map-hero__tools button:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 44px -28px rgb(24 32 51 / 0.55);
}

.map-workspace {
  display: grid;
  grid-template-columns: minmax(250px, 330px) minmax(420px, 1fr) minmax(270px, 360px);
  gap: clamp(16px, 2vw, 24px);
  max-width: 1440px;
  margin: 0 auto;
  align-items: start;
}

.region-panel,
.province-panel,
.featured-strip {
  border: 1px solid rgb(255 255 255 / 0.72);
  border-radius: 28px;
  background: rgb(255 255 255 / 0.92);
  box-shadow: 0 24px 70px -38px rgb(24 32 51 / 0.5);
  backdrop-filter: blur(18px);
}

.region-panel {
  padding: 18px;
}

.panel-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.panel-heading > span {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 16px;
  background: #eaf7ff;
  color: #2382da;
}

.panel-heading h2,
.province-panel h2,
.featured-strip h2 {
  margin: 0;
  color: #1d2638;
  font-size: 18px;
  font-weight: 1000;
}

.panel-heading p {
  margin: 3px 0 0;
  color: #607089;
  font-size: 12px;
  font-weight: 800;
}

.map-search {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  margin-bottom: 14px;
  border-radius: 16px;
  background: #f2f8ff;
  padding: 0 14px;
  color: #4783c5;
}

.map-search input {
  min-width: 0;
  flex: 1;
  border: 0;
  background: transparent;
  color: #253149;
  font-size: 14px;
  font-weight: 800;
  outline: none;
}

.map-search input::placeholder {
  color: #8394aa;
}

.region-list {
  display: grid;
  gap: 10px;
}

.region-list button {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 20px;
  align-items: center;
  gap: 10px;
  min-height: 62px;
  border-radius: 18px;
  background: #f9fbff;
  padding: 9px 10px;
  text-align: left;
  color: #253149;
  box-shadow: inset 0 0 0 1px rgb(24 32 51 / 0.06);
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    color 0.2s ease;
}

.region-list button.active {
  background: linear-gradient(135deg, #2b91f0, #43b5ff);
  color: white;
  box-shadow: 0 16px 28px -20px rgb(43 145 240 / 0.7);
}

.region-list button:hover {
  transform: translateX(3px);
}

.region-icon {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 15px;
  background: rgb(255 255 255 / 0.8);
  color: #28a95d;
}

.region-list strong,
.region-list small {
  display: block;
  overflow-wrap: anywhere;
}

.region-list strong {
  font-size: 13px;
  font-weight: 1000;
}

.region-list small {
  margin-top: 2px;
  color: currentColor;
  font-size: 11px;
  font-weight: 800;
  opacity: 0.72;
}

.map-stage {
  min-width: 0;
}

.map-canvas {
  position: relative;
  overflow: hidden;
  aspect-ratio: 2 / 3;
  min-height: 760px;
  border-radius: 34px;
  background: #5bd2f0;
  box-shadow: 0 30px 80px -45px rgb(24 32 51 / 0.65);
}

.map-stage-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
}

.dragon-bridge-effects {
  position: absolute;
  z-index: 3;
  left: 62.5%;
  top: 45.8%;
  width: 112px;
  height: 74px;
  pointer-events: none;
  transform: translate(-50%, -50%);
}

.dragon-bridge-effects::before {
  position: absolute;
  right: 22px;
  top: 27px;
  width: 18px;
  height: 18px;
  border: 4px solid rgb(255 255 255 / 0.78);
  border-radius: 999px;
  background: #f97316;
  box-shadow: 0 0 0 8px rgb(249 115 22 / 0.18);
  content: '';
  animation: dragon-signal 1.9s ease-in-out infinite;
}

.dragon-fire {
  position: absolute;
  left: 69px;
  top: 25px;
  width: 116px;
  height: 92px;
  opacity: 0;
  transform-origin: left top;
  animation: dragon-fire-breath 5.2s ease-in-out infinite;
}

.fire-plume {
  position: absolute;
  left: 0;
  top: 0;
  display: block;
  width: 106px;
  height: 72px;
  border-top: 8px solid #ffcf33;
  border-right: 6px solid #e33117;
  border-radius: 0 92% 0 0;
  filter: drop-shadow(2px 6px 4px rgb(147 31 10 / 0.4)) drop-shadow(0 0 8px rgb(255 75 16 / 0.9));
  transform: rotate(5deg) scale(0.96);
  transform-origin: left top;
  animation: fire-jet-flicker 0.22s ease-in-out infinite alternate;
}

.fire-plume--outer {
  border-top-color: #ffb11b;
  border-right-color: #d92714;
}

.fire-plume--middle {
  top: 5px;
  width: 98px;
  height: 66px;
  border-top-width: 5px;
  border-top-color: #ffe066;
  border-right-width: 4px;
  border-right-color: #ff671f;
  opacity: 0.9;
  transform: rotate(11deg) scale(0.92);
  animation-delay: -0.1s;
}

.fire-plume--core {
  top: -4px;
  width: 90px;
  height: 60px;
  border-top-width: 3px;
  border-top-color: #fff5ad;
  border-right-width: 3px;
  border-right-color: #ffba24;
  opacity: 0.82;
  filter: drop-shadow(0 0 5px rgb(255 243 163 / 0.95)) drop-shadow(0 0 10px rgb(255 75 16 / 0.72));
  transform: rotate(-1deg) scale(0.9);
  animation-delay: -0.17s;
}

.fire-ember {
  position: absolute;
  left: 85px;
  top: 59px;
  width: 7px;
  height: 11px;
  border-radius: 55% 45% 60% 40%;
  background: linear-gradient(145deg, #fff7ad, #ffb21a 52%, #e52b15);
  box-shadow:
    inset 2px 1px 2px rgb(255 255 255 / 0.65),
    0 0 8px rgb(255 61 12 / 0.85);
  animation: fire-ember-fall 0.82s linear infinite;
}

.fire-ember--two {
  left: 104px;
  top: 47px;
  width: 5px;
  height: 8px;
  animation-delay: -0.38s;
}

.fire-smoke {
  position: absolute;
  left: 68px;
  top: 53px;
  width: 55px;
  height: 32px;
  border-radius: 50%;
  background: radial-gradient(
    ellipse,
    rgb(255 206 75 / 0.46),
    rgb(238 56 19 / 0.24) 48%,
    transparent 72%
  );
  filter: blur(3px);
  animation: fire-glow-pulse 0.7s ease-in-out infinite alternate;
}

.dragon-water {
  position: absolute;
  left: 69px;
  top: 25px;
  width: 116px;
  height: 92px;
  opacity: 0;
  transform-origin: left top;
  animation: dragon-water-burst 5.2s ease-in-out infinite;
}

.water-jet {
  position: absolute;
  left: 0;
  top: 0;
  display: block;
  width: 106px;
  height: 72px;
  border-top: 7px solid rgb(229 252 255 / 0.94);
  border-right: 5px solid rgb(85 205 247 / 0.72);
  border-radius: 0 92% 0 0;
  filter: drop-shadow(2px 6px 4px rgb(16 139 197 / 0.35))
    drop-shadow(0 0 4px rgb(255 255 255 / 0.8));
  transform: rotate(5deg) scale(0.96);
}

.water-jet--two {
  top: 5px;
  width: 98px;
  height: 66px;
  border-top-width: 3px;
  border-right-width: 3px;
  opacity: 0.76;
  transform: rotate(11deg) scale(0.92);
}

.water-jet--three {
  top: -4px;
  width: 90px;
  height: 60px;
  border-top-width: 2px;
  border-right-width: 3px;
  opacity: 0.58;
  transform: rotate(-1deg) scale(0.9);
}

.water-drop {
  position: absolute;
  left: 85px;
  top: 59px;
  width: 7px;
  height: 11px;
  border-radius: 55% 45% 60% 40%;
  background: linear-gradient(145deg, white, #4cc9f0 58%, #168bd2);
  box-shadow:
    inset 2px 1px 2px rgb(255 255 255 / 0.85),
    0 4px 6px rgb(18 119 177 / 0.28);
  animation: water-drop-fall 0.82s linear infinite;
}

.water-drop--two {
  left: 104px;
  top: 47px;
  width: 5px;
  height: 8px;
  animation-delay: -0.31s;
}

.water-drop--three {
  left: 72px;
  top: 69px;
  width: 4px;
  height: 7px;
  animation-delay: -0.57s;
}

.water-mist {
  position: absolute;
  left: 68px;
  top: 53px;
  width: 55px;
  height: 32px;
  border-radius: 50%;
  background: radial-gradient(
    ellipse,
    rgb(234 252 255 / 0.72),
    rgb(109 219 249 / 0.2) 48%,
    transparent 72%
  );
  filter: blur(3px);
  animation: water-mist-pulse 0.7s ease-in-out infinite alternate;
}

.dragon-bridge-effects.active .dragon-fire,
.dragon-bridge-effects.active .dragon-water,
.dragon-bridge-effects.active::before {
  filter: saturate(1.14);
}

.map-hotspot {
  position: absolute;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  cursor: pointer;
  outline: none;
  transform: translate(-50%, -50%);
  transition:
    transform 0.2s ease,
    background 0.2s ease;
}

.map-hotspot span {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  border: 4px solid rgb(255 255 255 / 0.92);
  border-radius: 999px;
  background: var(--pin-color);
  opacity: 0;
  box-shadow:
    0 0 0 6px color-mix(in srgb, var(--pin-color), transparent 78%),
    0 12px 20px rgb(24 32 51 / 0.16);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.map-hotspot strong {
  position: absolute;
  left: 50%;
  bottom: calc(100% - 2px);
  display: none;
  min-width: max-content;
  max-width: 136px;
  border-radius: 999px;
  background: #2188e8;
  padding: 8px 12px;
  color: white;
  font-size: 12px;
  font-weight: 1000;
  line-height: 1;
  overflow-wrap: anywhere;
  box-shadow: 0 14px 28px -18px rgb(20 92 180 / 0.76);
  transform: translateX(-50%);
}

.map-hotspot.active,
.map-hotspot:hover,
.map-hotspot:focus-visible {
  background: rgb(255 255 255 / 0.14);
  transform: translate(-50%, -50%) scale(1.08);
}

.map-hotspot.active span,
.map-hotspot:hover span,
.map-hotspot:focus-visible span,
.map-hotspot.active strong,
.map-hotspot:hover strong,
.map-hotspot:focus-visible strong {
  display: inline-flex;
  opacity: 1;
}

@keyframes dragon-signal {
  0%,
  100% {
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.18);
  }
}

@keyframes dragon-fire-breath {
  0%,
  7%,
  46%,
  100% {
    opacity: 0;
    transform: translateX(-5px) scaleX(0.08) scaleY(0.45);
  }
  12%,
  38% {
    opacity: 1;
    transform: translateX(0) scaleX(1) scaleY(1);
  }
  23% {
    opacity: 0.96;
    transform: translateX(0) scaleX(1.08) scaleY(1.12);
  }
}

@keyframes dragon-water-burst {
  0%,
  48%,
  56%,
  100% {
    opacity: 0;
    transform: rotate(-3deg) scaleX(0.08) scaleY(0.35);
  }
  61%,
  94% {
    opacity: 1;
    transform: rotate(0) scaleX(1) scaleY(1);
  }
  76% {
    opacity: 0.96;
    transform: rotate(1deg) scaleX(1.05) scaleY(0.98);
  }
}

@keyframes fire-jet-flicker {
  from {
    opacity: 0.78;
  }
  to {
    opacity: 1;
  }
}

@keyframes fire-ember-fall {
  from {
    opacity: 0.95;
    transform: translate(0, -7px) rotate(18deg) scale(0.7);
  }
  to {
    opacity: 0;
    transform: translate(13px, 31px) rotate(18deg) scale(1.05);
  }
}

@keyframes fire-glow-pulse {
  from {
    opacity: 0.38;
    transform: scale(0.8);
  }
  to {
    opacity: 0.82;
    transform: scale(1.1);
  }
}

@keyframes water-drop-fall {
  from {
    opacity: 0.95;
    transform: translate(0, -7px) rotate(18deg) scale(0.7);
  }
  to {
    opacity: 0;
    transform: translate(13px, 31px) rotate(18deg) scale(1.05);
  }
}

@keyframes water-mist-pulse {
  from {
    opacity: 0.38;
    transform: scale(0.8);
  }
  to {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

.province-panel {
  position: sticky;
  top: 112px;
  padding: 22px;
}

.province-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--badge-color), white 82%);
  padding: 9px 12px;
  color: color-mix(in srgb, var(--badge-color), #172033 26%);
  font-size: 12px;
  font-weight: 1000;
}

.province-panel h2 {
  margin-top: 16px;
  font-size: clamp(28px, 3vw, 40px);
  line-height: 1;
}

.province-highlight {
  margin: 8px 0 18px;
  color: #f28a16;
  font-size: 16px;
  font-weight: 1000;
}

.province-facts {
  display: grid;
  gap: 12px;
}

.province-facts article {
  border-radius: 18px;
  background: #f7fbff;
  padding: 14px;
}

.province-facts strong {
  color: #253149;
  font-size: 13px;
  font-weight: 1000;
}

.province-facts p {
  margin: 6px 0 0;
  color: #536177;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
}

.tourism-gallery {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.real-tourism-gallery {
  display: grid;
  max-height: 520px;
  gap: 12px;
  margin-top: 10px;
  overflow-y: auto;
  padding-right: 4px;
  scrollbar-color: rgb(14 165 233 / 0.38) transparent;
  scrollbar-width: thin;
}

.real-tourism-card {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  gap: 12px;
  min-height: 112px;
  overflow: hidden;
  border-radius: 18px;
  background: white;
  color: inherit;
  text-decoration: none;
  box-shadow:
    inset 0 0 0 1px rgb(34 109 184 / 0.1),
    0 18px 34px -30px rgb(24 32 51 / 0.42);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.real-tourism-card:hover {
  transform: translateY(-2px);
  box-shadow:
    inset 0 0 0 1px rgb(14 165 233 / 0.22),
    0 22px 38px -28px rgb(24 32 51 / 0.5);
}

.real-tourism-card img {
  width: 100%;
  height: 100%;
  min-height: 112px;
  object-fit: cover;
  background: #dff6ff;
}

.real-tourism-info {
  min-width: 0;
  padding: 12px 12px 12px 0;
}

.real-tourism-info em {
  display: inline-flex;
  width: fit-content;
  border-radius: 999px;
  background: #e9f8ff;
  padding: 5px 8px;
  color: #0573b6;
  font-size: 10px;
  font-style: normal;
  font-weight: 1000;
}

.real-tourism-info strong {
  display: block;
  margin-top: 7px;
  color: #172033;
  font-size: 13px;
  font-weight: 1000;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.real-tourism-info small {
  display: block;
  margin-top: 6px;
  color: #5f6f86;
  font-size: 11px;
  font-weight: 750;
  line-height: 1.45;
}

.tourism-card {
  overflow: hidden;
  min-width: 0;
  margin: 0;
  border-radius: 15px;
  background: white;
  box-shadow:
    inset 0 0 0 1px rgb(34 109 184 / 0.09),
    0 12px 28px -24px rgb(24 32 51 / 0.42);
  animation: postcard-in 380ms var(--spot-delay) ease both;
}

.postcard-scene {
  position: relative;
  display: grid;
  aspect-ratio: 1.45;
  place-items: center;
  overflow: hidden;
  background:
    radial-gradient(circle at 22% 20%, rgb(255 255 255 / 0.72), transparent 18%),
    linear-gradient(180deg, var(--spot-c) 0%, var(--spot-a) 55%, var(--spot-b) 100%);
  color: color-mix(in srgb, var(--spot-color), #172033 16%);
}

.postcard-scene svg {
  position: relative;
  z-index: 3;
  padding: 7px;
  border-radius: 15px;
  background: rgb(255 255 255 / 0.68);
  filter: drop-shadow(0 8px 10px rgb(24 32 51 / 0.13));
}

.scene-sun,
.scene-hill,
.scene-water {
  position: absolute;
  pointer-events: none;
}

.scene-sun {
  top: 13%;
  right: 15%;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: #ffd45a;
  box-shadow: 0 0 0 8px rgb(255 212 90 / 0.24);
}

.scene-hill {
  bottom: 10%;
  width: 72%;
  height: 45%;
  border-radius: 999px 999px 0 0;
  background: color-mix(in srgb, var(--spot-b), #ffffff 42%);
}

.scene-hill-a {
  left: -18%;
}

.scene-hill-b {
  right: -20%;
  bottom: 2%;
  background: color-mix(in srgb, var(--spot-color), #ffffff 56%);
}

.scene-water {
  right: -8%;
  bottom: -8%;
  left: -8%;
  height: 30%;
  border-radius: 50% 50% 0 0;
  background: rgb(255 255 255 / 0.4);
}

.tourism-card figcaption {
  min-height: 42px;
  padding: 8px 9px 9px;
  color: #253149;
  font-size: 11px;
  font-weight: 1000;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

@keyframes postcard-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.featured-strip {
  max-width: 1240px;
  margin: 28px auto 0;
  padding: 20px;
}

.featured-strip header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.featured-strip h2 {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.featured-strip header button {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 999px;
  background: #f1f6ff;
  color: #8796aa;
}

.featured-list {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 14px;
}

.featured-list button {
  min-width: 0;
  border-radius: 18px;
  background: #f8fbff;
  padding: 12px;
  text-align: left;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.featured-list button:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 34px -28px rgb(24 32 51 / 0.55);
}

.feature-art {
  display: grid;
  aspect-ratio: 1.55;
  place-items: center;
  margin-bottom: 10px;
  border-radius: 14px;
  background:
    radial-gradient(circle at 28% 30%, rgb(255 255 255 / 0.75), transparent 30%),
    linear-gradient(135deg, color-mix(in srgb, var(--feature-color), white 58%), #d9f6ff);
  color: color-mix(in srgb, var(--feature-color), #172033 18%);
}

.featured-list strong,
.featured-list small {
  display: block;
  overflow-wrap: anywhere;
}

.featured-list strong {
  color: #253149;
  font-size: 13px;
  font-weight: 1000;
}

.featured-list small {
  margin-top: 3px;
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.35;
}

@media (max-width: 1180px) {
  .map-workspace {
    grid-template-columns: 300px minmax(0, 1fr);
  }

  .province-panel {
    position: static;
    grid-column: 1 / -1;
  }

  .featured-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .map-page {
    padding-inline: 14px;
  }

  .map-hero {
    display: block;
  }

  .map-hero__tools {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-top: 16px;
  }

  .map-hero__tools button {
    justify-content: center;
    padding: 0 10px;
    font-size: 12px;
  }

  .map-workspace {
    display: flex;
    flex-direction: column;
  }

  .region-panel,
  .map-stage,
  .province-panel {
    width: 100%;
  }

  .region-list {
    display: flex;
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: thin;
  }

  .region-list button {
    min-width: 214px;
  }

  .map-canvas {
    min-height: 620px;
    border-radius: 28px;
  }

  .dragon-bridge-effects {
    transform: translate(-50%, -50%) scale(0.82);
  }

  .map-hotspot {
    width: 38px;
    height: 38px;
  }

  .map-hotspot strong {
    max-width: 112px;
    font-size: 10px;
  }

  .tourism-gallery {
    grid-template-columns: repeat(3, minmax(112px, 1fr));
  }

  .featured-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .map-hero h1 {
    font-size: 48px;
  }

  .map-hero__tools {
    grid-template-columns: 1fr;
  }

  .map-canvas {
    min-height: 560px;
  }

  .dragon-bridge-effects {
    transform: translate(-50%, -50%) scale(0.66);
  }

  .map-hotspot {
    width: 34px;
    height: 34px;
  }

  .map-hotspot span {
    width: 13px;
    height: 13px;
    border-width: 3px;
  }

  .map-hotspot strong {
    max-width: 92px;
    padding: 7px 9px;
    font-size: 9px;
  }

  .tourism-gallery {
    grid-template-columns: 1fr;
  }
}
</style>
