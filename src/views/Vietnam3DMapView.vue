<script setup lang="ts">
import {
  BookOpenCheck,
  Building2,
  Castle,
  ChevronDown,
  Compass,
  HelpCircle,
  Landmark,
  MapPinned,
  Sparkles,
  Trees,
  Trophy,
  Waves,
  X,
} from '@lucide/vue'
import { computed, nextTick, ref, watch, type Component } from 'vue'

import {
  featuredVietnamMapPlaces,
  vietnamProvinceFeatures,
  type VietnamProvinceFeature,
  type VietnamTourismSpot,
} from '@/data/vietnam3DMap'
import dragonBridgeUrl from '@/assets/images/maps/dragon-bridge-3d-v2.png'
import hoanKiemTowerUrl from '@/assets/images/maps/hoan-kiem-tower-3d.png'
import landmark81Url from '@/assets/images/maps/landmark-81-3d.png'
import fishingVesselUrl from '@/assets/images/maps/vessel-fishing-3d.png'
import sailVesselUrl from '@/assets/images/maps/vessel-sail-3d.png'
import tourVesselUrl from '@/assets/images/maps/vessel-tour-3d.png'
import vietnamFlagUrl from '@/assets/images/maps/vietnam-flag-wave-3d.png'
import vietnamMapSvg from '@/assets/images/maps/vietnam-34-accurate-3d.svg?raw'

const activePlace = ref<VietnamProvinceFeature>(vietnamProvinceFeatures[0]!)
const provincePopupOpen = ref(false)
const mapVectorRef = ref<HTMLElement | null>(null)
const featuredHotspotIds = new Set(['ha-noi', 'ho-chi-minh', 'da-nang'])
const hotspotPriorityLayers = new Map([
  ['ha-noi', 28],
  ['ho-chi-minh', 27],
  ['da-nang', 26],
  ['hai-phong', 25],
  ['can-tho', 24],
  ['hue', 23],
  ['quang-ninh', 22],
  ['khanh-hoa', 21],
  ['dong-nai', 20],
  ['bac-ninh', 19],
])
const oldMapWidth = 1101.8141
const wideMapWidth = 1400
const haNoiPlace = vietnamProvinceFeatures.find((place) => place.id === 'ha-noi')!
const daNangPlace = vietnamProvinceFeatures.find((place) => place.id === 'da-nang')!
const hoChiMinhPlace = vietnamProvinceFeatures.find((place) => place.id === 'ho-chi-minh')!
const hoangSaPlace = vietnamProvinceFeatures.find((place) => place.id === 'hoang-sa')!
const truongSaPlace = vietnamProvinceFeatures.find((place) => place.id === 'truong-sa')!
const seaVessels = [
  { id: 'fishing-north', src: fishingVesselUrl, x: 72, y: 24, width: 72, rotation: -7, delay: -0.6, flipped: false },
  { id: 'sail-central', src: sailVesselUrl, x: 88, y: 37, width: 62, rotation: 4, delay: -1.9, flipped: false },
  { id: 'tour-da-nang', src: tourVesselUrl, x: 89, y: 51, width: 76, rotation: -5, delay: -1.1, flipped: false },
  { id: 'fishing-south', src: fishingVesselUrl, x: 92, y: 64, width: 58, rotation: 8, delay: -2.4, flipped: true },
  { id: 'sail-south', src: sailVesselUrl, x: 76, y: 74, width: 54, rotation: -5, delay: -3.2, flipped: true },
  { id: 'tour-gulf', src: tourVesselUrl, x: 34, y: 89, width: 64, rotation: 7, delay: -1.6, flipped: true },
] as const

const provinceHotspots = computed(() =>
  vietnamProvinceFeatures.filter((place) => place.kind !== 'archipelago'),
)

const activeTourismDetails = computed(() => activePlace.value.tourismDetails ?? [])
const featuredSpotCards = computed(() =>
  featuredVietnamMapPlaces.map((place) => ({
    place,
    spot: place.tourismDetails?.[0],
  })),
)
const tourismMedia = ref<Record<string, { imageUrl: string; sourceUrl: string }>>({})

function tourismMediaKey(placeId: string, spot: VietnamTourismSpot) {
  return `${placeId}:${spot.name}`
}

function tourismImageUrl(spot: VietnamTourismSpot, placeId = activePlace.value.id) {
  return spot.imageUrl ?? tourismMedia.value[tourismMediaKey(placeId, spot)]?.imageUrl ?? ''
}

function tourismSourceUrl(spot: VietnamTourismSpot, placeId = activePlace.value.id) {
  return tourismMedia.value[tourismMediaKey(placeId, spot)]?.sourceUrl ?? spot.sourceUrl ?? '#'
}

async function resolveTourismMedia(placeId: string, spot: VietnamTourismSpot) {
  const key = tourismMediaKey(placeId, spot)
  if (spot.imageUrl || tourismMedia.value[key] || !spot.imageQuery) return

  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: `${spot.imageQuery} filetype:bitmap`,
    gsrnamespace: '6',
    gsrlimit: '1',
    prop: 'imageinfo',
    iiprop: 'url',
    iiurlwidth: '640',
    format: 'json',
    origin: '*',
  })

  try {
    const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`)
    if (!response.ok) return

    const payload = (await response.json()) as {
      query?: {
        pages?: Record<
          string,
          {
            imageinfo?: Array<{ thumburl?: string; url?: string; descriptionurl?: string }>
          }
        >
      }
    }
    const page = Object.values(payload.query?.pages ?? {})[0]
    const image = page?.imageinfo?.[0]
    const imageUrl = image?.thumburl ?? image?.url
    if (!imageUrl) return

    tourismMedia.value[key] = {
      imageUrl,
      sourceUrl: image?.descriptionurl ?? spot.sourceUrl ?? imageUrl,
    }
  } catch {
    // The source link remains available when Commons is temporarily unreachable.
  }
}

watch(
  activeTourismDetails,
  (spots) => {
    const placeId = activePlace.value.id
    void Promise.all(spots.map((spot) => resolveTourismMedia(placeId, spot)))
  },
  { immediate: true },
)

watch(
  featuredSpotCards,
  (cards) => {
    void Promise.all(
      cards.flatMap(({ place, spot }) => (spot ? [resolveTourismMedia(place.id, spot)] : [])),
    )
  },
  { immediate: true },
)

function selectPlace(place: VietnamProvinceFeature) {
  activePlace.value = place
  provincePopupOpen.value = true
}

function closeProvincePopup() {
  provincePopupOpen.value = false
}

function mapX(place: VietnamProvinceFeature) {
  if (place.kind === 'archipelago') return place.x
  return (place.x * oldMapWidth) / wideMapWidth
}

function mapPositionStyle(place: VietnamProvinceFeature, index = 0) {
  const labelOffsets = [
    { x: -24, y: 0 },
    { x: 24, y: -8 },
    { x: 0, y: -18 },
    { x: -38, y: -26 },
    { x: 38, y: -12 },
    { x: 0, y: -32 },
  ]
  const labelOffset = labelOffsets[index % labelOffsets.length]!

  return {
    left: `${mapX(place)}%`,
    top: `${place.y}%`,
    '--pin-color': place.color,
    '--label-offset-x': `${labelOffset.x}px`,
    '--label-offset-y': `${labelOffset.y}px`,
    '--hotspot-layer': `${hotspotPriorityLayers.get(place.id) ?? 8}`,
  }
}

function seaVesselStyle(vessel: (typeof seaVessels)[number]) {
  return {
    left: `${vessel.x}%`,
    top: `${vessel.y}%`,
    width: `${vessel.width}px`,
    '--vessel-rotation': `${vessel.rotation}deg`,
    '--vessel-delay': `${vessel.delay}s`,
  }
}

function selectMapTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return
  const interactiveShape = target.closest<SVGElement>('[data-place-id]')
  const placeId = interactiveShape?.dataset.placeId
  const place = vietnamProvinceFeatures.find((item) => item.id === placeId)
  if (place) selectPlace(place)
}

function handleMapClick(event: MouseEvent) {
  selectMapTarget(event.target)
}

function handleMapKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  if (!(event.target instanceof Element) || !event.target.closest('[data-place-id]')) return
  event.preventDefault()
  selectMapTarget(event.target)
}

watch(
  () => activePlace.value.id,
  async (placeId) => {
    await nextTick()
    mapVectorRef.value?.querySelectorAll('.is-active').forEach((item) => {
      item.classList.remove('is-active')
    })
    mapVectorRef.value?.querySelectorAll('.is-featured').forEach((item) => {
      item.classList.remove('is-featured')
    })
    featuredHotspotIds.forEach((id) => {
      mapVectorRef.value?.querySelector(`[data-place-id="${id}"]`)?.classList.add('is-featured')
    })
    mapVectorRef.value?.querySelector(`[data-place-id="${placeId}"]`)?.classList.add('is-active')
  },
  { immediate: true },
)

function isFeaturedHotspot(place: VietnamProvinceFeature) {
  return featuredHotspotIds.has(place.id)
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
          Khám phá dữ liệu 34 tỉnh, thành phố cùng hai đặc khu Hoàng Sa và Trường Sa của Việt Nam.
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
      <section class="map-stage" aria-label="Bản đồ tương tác Việt Nam">
        <div class="map-canvas">
          <div
            ref="mapVectorRef"
            class="map-vector"
            @click="handleMapClick"
            @keydown="handleMapKeydown"
            v-html="vietnamMapSvg"
          />

          <button
            type="button"
            class="city-landmark city-landmark--hanoi"
            :class="{ active: activePlace.id === 'ha-noi' }"
            :style="{ left: `${mapX(haNoiPlace)}%`, top: '16.2%' }"
            aria-label="Khám phá Hà Nội"
            @click="selectPlace(haNoiPlace)"
          >
            <img
              class="city-landmark__image city-landmark__image--hanoi"
              :src="hoanKiemTowerUrl"
              alt=""
            />
          </button>

          <button
            type="button"
            class="city-landmark city-landmark--hcm"
            :class="{ active: activePlace.id === 'ho-chi-minh' }"
            :style="{ left: `${mapX(hoChiMinhPlace)}%`, top: '82.2%' }"
            aria-label="Khám phá TP. Hồ Chí Minh"
            @click="selectPlace(hoChiMinhPlace)"
          >
            <img
              class="city-landmark__image city-landmark__image--hcm"
              :src="landmark81Url"
              alt=""
            />
          </button>

          <div
            class="dragon-bridge-effects"
            :class="{ active: activePlace.id === 'da-nang' }"
            :style="{ left: `${mapX(daNangPlace)}%`, top: '52.5%' }"
          >
            <img class="dragon-bridge-landmark" :src="dragonBridgeUrl" alt="" />
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
            v-for="island in [hoangSaPlace, truongSaPlace]"
            :key="`${island.id}-flag`"
            type="button"
            class="island-flag"
            :class="{ active: activePlace.id === island.id }"
            :style="{ left: `${mapX(island)}%`, top: `${island.y}%` }"
            :aria-label="`Khám phá ${island.name} của Việt Nam`"
            @click="selectPlace(island)"
          >
            <span class="island-flag__pole" aria-hidden="true">
              <i class="island-flag__finial" />
            </span>
            <img class="island-flag__cloth" :src="vietnamFlagUrl" alt="" />
            <strong>{{ island.name }}</strong>
          </button>

          <button
            v-for="(place, index) in provinceHotspots"
            :key="place.id"
            type="button"
            class="map-hotspot"
            :class="{ active: activePlace.id === place.id, featured: isFeaturedHotspot(place) }"
            :style="mapPositionStyle(place, index)"
            :aria-label="`Khám phá ${place.name}`"
            @click="selectPlace(place)"
          >
            <span />
            <strong>{{ place.name }}</strong>
          </button>

          <span
            v-for="vessel in seaVessels"
            :key="vessel.id"
            class="sea-vessel"
            :class="{ 'is-flipped': vessel.flipped }"
            :style="seaVesselStyle(vessel)"
            aria-hidden="true"
          >
            <img :src="vessel.src" alt="" />
          </span>

          <a
            class="map-attribution"
            href="https://commons.wikimedia.org/wiki/File:Administrative_divisions_of_Vietnam.svg"
            target="_blank"
            rel="noreferrer"
          >
            Ranh giới tham chiếu: Ahfosh, CC BY 4.0
          </a>

          <div
            v-if="provincePopupOpen"
            class="province-popover-backdrop"
            aria-hidden="true"
            @click="closeProvincePopup"
          />
          <aside
            v-if="provincePopupOpen"
            class="province-popover"
            aria-live="polite"
            aria-label="Thông tin tỉnh, thành phố"
          >
            <button
              type="button"
              class="province-popover__close"
              aria-label="Đóng thông tin tỉnh, thành phố"
              @click="closeProvincePopup"
            >
              <X :size="20" />
            </button>

            <div class="province-badge" :style="{ '--badge-color': activePlace.color }">
              <Sparkles :size="18" />
              {{ activePlace.parentAdministrativeUnit ?? activePlace.region }}
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
                <a
                  v-if="activePlace.officialSourceUrl"
                  class="administrative-source"
                  :href="activePlace.officialSourceUrl"
                  target="_blank"
                  rel="noreferrer"
                >
                  Xem nguồn hành chính
                </a>
              </article>
              <article>
                <strong>Du lịch</strong>
                <div v-if="activeTourismDetails.length" class="real-tourism-gallery">
                  <a
                    v-for="spot in activeTourismDetails"
                    :key="spot.name"
                    class="real-tourism-card"
                    :href="tourismSourceUrl(spot)"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      v-if="tourismImageUrl(spot)"
                      :src="tourismImageUrl(spot)"
                      :alt="spot.name"
                      loading="lazy"
                    />
                    <span v-else class="tourism-image-loading" aria-hidden="true">
                      <MapPinned :size="30" />
                    </span>
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
        </div>
      </section>

      <aside class="province-panel" aria-live="polite">
        <div class="province-badge" :style="{ '--badge-color': activePlace.color }">
          <Sparkles :size="18" />
          {{ activePlace.parentAdministrativeUnit ?? activePlace.region }}
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
            <a
              v-if="activePlace.officialSourceUrl"
              class="administrative-source"
              :href="activePlace.officialSourceUrl"
              target="_blank"
              rel="noreferrer"
            >
              Xem nguồn hành chính
            </a>
          </article>
          <article>
            <strong>Du lịch</strong>
            <div v-if="activeTourismDetails.length" class="real-tourism-gallery">
              <a
                v-for="spot in activeTourismDetails"
                :key="spot.name"
                class="real-tourism-card"
                :href="tourismSourceUrl(spot)"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  v-if="tourismImageUrl(spot)"
                  :src="tourismImageUrl(spot)"
                  :alt="spot.name"
                  loading="lazy"
                />
                <span v-else class="tourism-image-loading" aria-hidden="true">
                  <MapPinned :size="30" />
                </span>
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
          v-for="{ place, spot } in featuredSpotCards"
          :key="place.id"
          type="button"
          :style="{ '--feature-color': place.color }"
          @click="selectPlace(place)"
        >
          <span class="feature-art">
            <img
              v-if="spot && tourismImageUrl(spot, place.id)"
              :src="tourismImageUrl(spot, place.id)"
              :alt="spot.name"
              loading="lazy"
            />
            <MapPinned v-else :size="30" />
          </span>
          <span class="feature-place">{{ place.name }}</span>
          <strong>{{ spot?.name ?? place.highlight }}</strong>
          <small>{{ spot?.description ?? place.highlight }}</small>
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
  grid-template-columns: minmax(620px, 1fr) minmax(300px, 380px);
  gap: clamp(16px, 2vw, 24px);
  max-width: 1580px;
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
.province-popover h2,
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
  aspect-ratio: 1400 / 1985;
  min-height: 860px;
  border-radius: 28px;
  background: #5bd2f0;
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 0.42),
    inset 0 -42px 78px rgb(0 111 160 / 0.16),
    0 30px 80px -45px rgb(24 32 51 / 0.65);
  isolation: isolate;
}

.map-canvas::before,
.map-canvas::after {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  content: '';
}

.map-canvas::before {
  background:
    radial-gradient(circle at 32% 22%, rgb(255 255 255 / 0.34), transparent 18%),
    radial-gradient(circle at 78% 44%, rgb(255 255 255 / 0.18), transparent 22%),
    linear-gradient(140deg, transparent 0 44%, rgb(255 255 255 / 0.16) 48%, transparent 52% 100%);
  mix-blend-mode: screen;
}

.map-canvas::after {
  background:
    radial-gradient(ellipse at 36% 26%, rgb(20 84 76 / 0.14), transparent 26%),
    radial-gradient(ellipse at 53% 58%, rgb(20 84 76 / 0.12), transparent 22%),
    radial-gradient(ellipse at 47% 86%, rgb(20 84 76 / 0.12), transparent 24%);
  filter: blur(9px);
  opacity: 0.65;
}

.map-vector {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  user-select: none;
}

.map-vector :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.map-vector :deep([data-place-id]) {
  pointer-events: auto;
}

.map-vector :deep(.province-shape) {
  paint-order: stroke fill;
  transition:
    filter 0.2s ease,
    stroke-width 0.2s ease,
    transform 0.2s ease;
}

.map-vector :deep(.province-shape.is-featured),
.map-vector :deep(.archipelago.is-featured) {
  filter: brightness(1.08) saturate(1.18) drop-shadow(0 7px 5px rgb(22 72 50 / 0.36));
  stroke: #ffffff;
  stroke-width: 3.6;
}

.map-vector :deep(.province-shape.is-active),
.map-vector :deep(.archipelago.is-active) {
  filter: brightness(1.16) saturate(1.25) drop-shadow(0 10px 7px rgb(22 72 50 / 0.46));
  stroke: #ffffff;
  stroke-width: 4.8;
}

.city-landmark {
  position: absolute;
  z-index: 5;
  display: grid;
  width: 96px;
  height: 86px;
  place-items: center;
  border: 0;
  background: transparent;
  cursor: pointer;
  transform: translate(-50%, -52%);
}

.city-landmark::before,
.dragon-bridge-effects::after {
  position: absolute;
  right: 19px;
  bottom: 2px;
  left: 19px;
  height: 14px;
  border-radius: 50%;
  background: rgb(24 80 57 / 0.22);
  filter: blur(4px);
  content: '';
}

.landmark-label {
  position: absolute;
  left: 50%;
  bottom: calc(100% - 10px);
  z-index: 4;
  min-width: max-content;
  border-radius: 999px;
  background: #2188e8;
  padding: 8px 12px;
  color: white;
  font-size: 12px;
  font-weight: 1000;
  line-height: 1;
  box-shadow: 0 14px 28px -18px rgb(20 92 180 / 0.76);
  transform: translateX(-50%);
}

.city-landmark__image {
  position: relative;
  z-index: 2;
  display: block;
  object-fit: contain;
  filter: drop-shadow(0 10px 7px rgb(24 71 55 / 0.38));
  pointer-events: none;
}

.city-landmark__image--hanoi {
  width: 94px;
  height: 94px;
}

.city-landmark__image--hcm {
  width: 92px;
  height: 116px;
  transform: translateY(-13px);
}

.city-landmark--hcm .landmark-label {
  bottom: calc(100% + 14px);
}

.city-landmark.active,
.city-landmark:hover,
.city-landmark:focus-visible {
  animation: landmark-float 1.7s ease-in-out infinite;
}

.dragon-bridge-effects {
  --dragon-mouth-x: 158px;
  --dragon-mouth-y: 27px;

  position: absolute;
  z-index: 4;
  width: 164px;
  height: 78px;
  pointer-events: none;
  transform: translate(-50%, -50%);
}

.dragon-bridge-landmark {
  position: absolute;
  inset: 8px auto auto 0;
  z-index: 2;
  width: 164px;
  height: 60px;
  object-fit: contain;
  filter: drop-shadow(0 9px 6px rgb(24 71 55 / 0.42));
}

.dragon-bridge-effects::before {
  position: absolute;
  z-index: 1;
  left: calc(var(--dragon-mouth-x) - 9px);
  top: calc(var(--dragon-mouth-y) - 9px);
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
  z-index: 3;
  left: var(--dragon-mouth-x);
  top: var(--dragon-mouth-y);
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
  z-index: 3;
  left: var(--dragon-mouth-x);
  top: var(--dragon-mouth-y);
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

.island-flag {
  position: absolute;
  z-index: 6;
  width: 132px;
  height: 124px;
  border: 0;
  background: transparent;
  cursor: pointer;
  outline: none;
  transform: translate(-50%, -100%);
}

.island-flag::after {
  position: absolute;
  left: 50%;
  bottom: 4px;
  width: 24px;
  height: 10px;
  border: 3px solid rgb(255 255 255 / 0.88);
  border-radius: 50%;
  background: #22c55e;
  box-shadow:
    0 0 0 7px rgb(34 197 94 / 0.18),
    0 8px 12px rgb(19 78 74 / 0.28);
  content: '';
  transform: translateX(-50%);
}

.island-flag__pole {
  position: absolute;
  left: 50%;
  bottom: 10px;
  z-index: 2;
  width: 6px;
  height: 96px;
  border-radius: 999px;
  background: linear-gradient(90deg, #83551f, #f7d57f 46%, #996221);
  box-shadow: 2px 5px 7px rgb(24 71 55 / 0.28);
  transform: translateX(-50%);
}

.island-flag__finial {
  position: absolute;
  top: -7px;
  left: 50%;
  width: 11px;
  height: 11px;
  border: 2px solid #9a6a19;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff8b0, #f4c430 48%, #b7791f);
  transform: translateX(-50%);
}

.island-flag__cloth {
  position: absolute;
  left: calc(50% + 2px);
  bottom: 53px;
  z-index: 3;
  display: block;
  width: 94px;
  max-width: none;
  height: 63px;
  object-fit: contain;
  overflow: visible;
  filter: drop-shadow(3px 7px 4px rgb(78 45 16 / 0.26));
  transform-origin: 0 48%;
  animation: vietnam-flag-wave 1.65s ease-in-out infinite;
}

.island-flag strong {
  position: absolute;
  left: 50%;
  bottom: -23px;
  z-index: 3;
  min-width: max-content;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.94);
  padding: 6px 9px;
  color: #075985;
  font-size: 10px;
  font-weight: 1000;
  line-height: 1;
  box-shadow: 0 10px 20px -14px rgb(12 74 110 / 0.8);
  transform: translateX(-50%);
}

.island-flag:hover::after,
.island-flag:focus-visible::after,
.island-flag.active::after {
  animation: island-flag-pulse 1.7s ease-in-out infinite;
}

.island-flag:hover .island-flag__cloth,
.island-flag:focus-visible .island-flag__cloth,
.island-flag.active .island-flag__cloth {
  animation-duration: 1.15s;
  filter: drop-shadow(3px 8px 5px rgb(78 45 16 / 0.34)) saturate(1.12);
}

.sea-vessel {
  --vessel-scale: 1;

  position: absolute;
  z-index: 2;
  display: block;
  pointer-events: none;
  transform-origin: 50% 70%;
  animation: sea-vessel-drift 4.2s ease-in-out var(--vessel-delay) infinite;
  will-change: transform;
}

.sea-vessel::after {
  position: absolute;
  right: 10%;
  bottom: 2%;
  left: 10%;
  z-index: -1;
  height: 15%;
  border-radius: 50%;
  background: radial-gradient(
    ellipse,
    rgb(255 255 255 / 0.82) 0 18%,
    rgb(148 225 255 / 0.42) 38%,
    transparent 72%
  );
  filter: blur(1.5px);
  content: '';
  transform: translateY(45%) scaleX(1.15);
}

.sea-vessel img {
  display: block;
  width: 100%;
  max-width: none;
  height: auto;
  filter: drop-shadow(0 8px 5px rgb(17 94 89 / 0.34));
}

.sea-vessel.is-flipped img {
  transform: scaleX(-1);
}

.map-hotspot {
  position: absolute;
  z-index: var(--hotspot-layer);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
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
  display: inline-flex;
  width: 13px;
  height: 13px;
  flex: 0 0 auto;
  border: 3px solid rgb(255 255 255 / 0.96);
  border-radius: 999px;
  background: var(--pin-color);
  opacity: 1;
  box-shadow:
    0 0 0 5px color-mix(in srgb, var(--pin-color), transparent 78%),
    0 12px 20px rgb(24 32 51 / 0.16);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.map-hotspot strong {
  position: absolute;
  left: 50%;
  bottom: calc(100% - 5px);
  z-index: 1;
  display: inline-flex;
  min-width: 0;
  max-width: none;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, var(--pin-color), #ffffff 74%);
  border-radius: 6px;
  background: rgb(255 255 255 / 0.94);
  padding: 4px 6px;
  color: #10305e;
  font-size: 8.5px;
  font-weight: 1000;
  line-height: 1.12;
  overflow-wrap: normal;
  text-align: center;
  text-shadow: none;
  white-space: nowrap;
  word-break: keep-all;
  box-shadow:
    0 8px 16px -12px rgb(15 53 92 / 0.72),
    inset 3px 0 0 var(--pin-color);
  pointer-events: none;
  transform: translateX(calc(-50% + var(--label-offset-x)))
    translateY(var(--label-offset-y));
}

.map-hotspot.active,
.map-hotspot:hover,
.map-hotspot:focus-visible {
  z-index: 40;
  background: rgb(255 255 255 / 0.14);
  transform: translate(-50%, -50%) scale(1.08);
}

.map-hotspot.featured span,
.map-hotspot.active span,
.map-hotspot:hover span,
.map-hotspot:focus-visible span,
.map-hotspot.active strong,
.map-hotspot:hover strong,
.map-hotspot:focus-visible strong {
  display: inline-flex;
  opacity: 1;
}

.map-hotspot.featured span {
  animation: hotspot-pulse 1.7s ease-in-out infinite;
}

.map-hotspot.featured strong {
  display: inline-flex;
  border-color: color-mix(in srgb, var(--pin-color), #ffffff 58%);
  background: color-mix(in srgb, var(--pin-color), #ffffff 82%);
}

.map-hotspot.active strong,
.map-hotspot:hover strong,
.map-hotspot:focus-visible strong {
  max-width: none;
  padding: 5px 8px;
  color: white;
  background: color-mix(in srgb, var(--pin-color), #1d75d8 38%);
  font-size: 10px;
  text-shadow: 0 1px 2px rgb(10 53 92 / 0.32);
  box-shadow: 0 12px 22px -12px rgb(20 92 180 / 0.9);
}

.map-attribution {
  position: absolute;
  right: 12px;
  bottom: 10px;
  z-index: 4;
  border-radius: 6px;
  background: rgb(255 255 255 / 0.82);
  padding: 5px 7px;
  color: #31556e;
  font-size: 8px;
  font-weight: 800;
  text-decoration: none;
  backdrop-filter: blur(6px);
}

.province-popover,
.province-popover-backdrop {
  display: none;
}

.province-popover__close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: #eef7ff;
  color: #1d4f7a;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgb(34 109 184 / 0.08);
  transition:
    transform 0.2s ease,
    background 0.2s ease;
}

.province-popover__close:hover,
.province-popover__close:focus-visible {
  background: #dcf0ff;
  transform: scale(1.05);
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

@keyframes hotspot-pulse {
  0%,
  100% {
    box-shadow:
      0 0 0 6px color-mix(in srgb, var(--pin-color), transparent 78%),
      0 12px 20px rgb(24 32 51 / 0.16);
    transform: scale(1);
  }
  50% {
    box-shadow:
      0 0 0 11px color-mix(in srgb, var(--pin-color), transparent 86%),
      0 16px 26px rgb(24 32 51 / 0.24);
    transform: scale(1.18);
  }
}

@keyframes landmark-float {
  0%,
  100% {
    transform: translate(-50%, -52%) translateY(0);
  }
  50% {
    transform: translate(-50%, -52%) translateY(-5px);
  }
}

@keyframes vietnam-flag-wave {
  0%,
  100% {
    transform: perspective(140px) rotateY(4deg) skewY(-1deg) scaleX(0.98);
  }
  35% {
    transform: perspective(140px) rotateY(-11deg) skewY(2.5deg) scaleX(1.04);
  }
  68% {
    transform: perspective(140px) rotateY(8deg) skewY(-2deg) scaleX(0.96);
  }
}

@keyframes island-flag-pulse {
  0%,
  100% {
    box-shadow:
      0 0 0 7px rgb(34 197 94 / 0.18),
      0 8px 12px rgb(19 78 74 / 0.28);
  }
  50% {
    box-shadow:
      0 0 0 13px rgb(34 197 94 / 0.08),
      0 10px 18px rgb(19 78 74 / 0.34);
  }
}

@keyframes sea-vessel-drift {
  0%,
  100% {
    transform: translate(-50%, -50%) rotate(var(--vessel-rotation)) scale(var(--vessel-scale))
      translate3d(-2px, 2px, 0);
  }
  50% {
    transform: translate(-50%, -50%) rotate(var(--vessel-rotation)) scale(var(--vessel-scale))
      translate3d(3px, -4px, 0);
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

.province-panel h2,
.province-popover h2 {
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

.tourism-image-loading {
  display: grid;
  min-height: 112px;
  place-items: center;
  background:
    radial-gradient(circle at 68% 24%, #ffe486 0 9%, transparent 10%),
    linear-gradient(145deg, #bdeeff, #76d49b);
  color: white;
}

.administrative-source {
  display: inline-flex;
  margin-top: 7px;
  color: #0878bd;
  font-size: 11px;
  font-weight: 900;
  text-underline-offset: 3px;
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

@keyframes province-popover-in {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.96);
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
  position: relative;
  display: grid;
  aspect-ratio: 1.55;
  place-items: center;
  overflow: hidden;
  margin-bottom: 10px;
  border-radius: 14px;
  background:
    radial-gradient(circle at 28% 30%, rgb(255 255 255 / 0.75), transparent 30%),
    linear-gradient(135deg, color-mix(in srgb, var(--feature-color), white 58%), #d9f6ff);
  color: color-mix(in srgb, var(--feature-color), #172033 18%);
}

.feature-art::after {
  position: absolute;
  inset: auto 0 0;
  height: 44%;
  background: linear-gradient(180deg, transparent, rgb(12 31 57 / 0.42));
  content: '';
  opacity: 0;
  pointer-events: none;
}

.feature-art img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.feature-art:has(img)::after {
  opacity: 1;
}

.feature-place {
  display: block;
  margin-bottom: 4px;
  color: color-mix(in srgb, var(--feature-color), #172033 16%);
  font-size: 11px;
  font-weight: 1000;
  line-height: 1.2;
}

.featured-list strong,
.featured-list small {
  display: block;
  overflow-wrap: normal;
}

.featured-list strong {
  color: #253149;
  font-size: 13px;
  font-weight: 1000;
  line-height: 1.25;
}

.featured-list small {
  margin-top: 3px;
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.4;
  display: -webkit-box;
  min-height: 46px;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

@media (max-width: 1180px) {
  .map-workspace {
    grid-template-columns: 1fr;
  }

  .province-panel {
    display: none;
  }

  .province-popover-backdrop {
    position: absolute;
    inset: 0;
    z-index: 62;
    display: block;
    background:
      radial-gradient(circle at 70% 18%, rgb(255 255 255 / 0.2), transparent 28%),
      linear-gradient(180deg, rgb(27 107 145 / 0.08), rgb(13 49 77 / 0.3));
    backdrop-filter: blur(2px);
  }

  .province-popover {
    position: absolute;
    top: 18px;
    right: 18px;
    z-index: 70;
    display: block;
    width: min(420px, calc(100% - 36px));
    max-height: calc(100% - 36px);
    overflow-y: auto;
    border: 1px solid rgb(255 255 255 / 0.78);
    border-radius: 26px;
    background:
      linear-gradient(145deg, rgb(255 255 255 / 0.98), rgb(242 250 255 / 0.94)),
      white;
    padding: 22px;
    box-shadow:
      0 34px 80px -36px rgb(13 49 77 / 0.72),
      inset 0 1px 0 rgb(255 255 255 / 0.92);
    backdrop-filter: blur(18px);
    scrollbar-color: rgb(14 165 233 / 0.42) transparent;
    scrollbar-width: thin;
    animation: province-popover-in 240ms ease both;
  }

  .province-popover .province-badge {
    max-width: calc(100% - 52px);
  }

  .province-popover .province-facts {
    gap: 10px;
  }

  .province-popover .province-facts article {
    background: rgb(247 251 255 / 0.92);
  }

  .province-popover .real-tourism-gallery {
    max-height: 330px;
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

  .map-stage,
  .province-panel {
    width: 100%;
  }

  .map-canvas {
    min-height: 620px;
    border-radius: 28px;
  }

  .province-popover {
    right: 14px;
    bottom: 14px;
    left: 14px;
    top: auto;
    width: auto;
    max-height: min(78%, 620px);
    padding: 18px;
    border-radius: 24px;
  }

  .province-popover h2 {
    padding-right: 48px;
    font-size: 32px;
  }

  .province-popover .real-tourism-card {
    grid-template-columns: 96px minmax(0, 1fr);
    min-height: 104px;
  }

  .province-popover .real-tourism-card img,
  .province-popover .tourism-image-loading {
    min-height: 104px;
  }

  .dragon-bridge-effects {
    transform: translate(-50%, -50%) scale(0.82);
  }

  .city-landmark__image--hanoi {
    width: 78px;
    height: 78px;
  }

  .city-landmark__image--hcm {
    width: 76px;
    height: 98px;
  }

  .island-flag {
    transform: translate(-50%, -100%) scale(0.84);
    transform-origin: 50% 100%;
  }

  .sea-vessel {
    --vessel-scale: 0.82;
  }

  .map-hotspot {
    width: 38px;
    height: 38px;
  }

  .map-hotspot strong {
    max-width: none;
    padding: 4px 6px;
    font-size: 7.5px;
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

  .city-landmark__image--hanoi {
    width: 66px;
    height: 66px;
  }

  .city-landmark__image--hcm {
    width: 64px;
    height: 84px;
  }

  .island-flag {
    transform: translate(-50%, -100%) scale(0.7);
  }

  .sea-vessel {
    --vessel-scale: 0.66;
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
    max-width: none;
    padding: 3px 5px;
    font-size: 6.5px;
  }

  .tourism-gallery {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .city-landmark,
  .island-flag::after,
  .island-flag__cloth,
  .sea-vessel,
  .map-hotspot span {
    animation: none !important;
  }
}
</style>
