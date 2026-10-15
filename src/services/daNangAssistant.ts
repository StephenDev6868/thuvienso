import daNangContent from '@/data/da-nang-content.json'
import daNangImages from '@/data/da-nang-images.json'
import { normalizeBookText } from '@/data/digitalLibrary'

export interface DaNangAssistantReply {
  content: string
  routeName: 'discover-da-nang'
  routeQuery?: Record<string, string>
  actionLabel: string
  autoNavigate?: boolean
}

type Place = (typeof daNangContent.places)[number]
type Ward = (typeof daNangContent.wards)[number]

const sources = daNangContent.sources as Record<
  string,
  { title: string; publisher: string; url: string; type: string }
>
const images = daNangImages as Record<string, { gallery?: unknown[] }>

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))]
}

function compactList(values: string[], limit = 6) {
  const items = unique(values)
  const visible = items.slice(0, limit)
  return `${visible.join(', ')}${items.length > limit ? ` và ${items.length - limit} nội dung khác` : ''}`
}

function findMentionedPlace(normalized: string) {
  return [...daNangContent.places]
    .sort((left, right) => right.name.length - left.name.length)
    .find((place) => {
      const aliases = [place.name, place.slug.replaceAll('-', ' ')]
      return aliases.some((alias) => normalized.includes(normalizeBookText(alias)))
    })
}

function findMentionedWard(normalized: string) {
  return [...daNangContent.wards]
    .sort((left, right) => right.name.length - left.name.length)
    .find((ward) => {
      const aliases = [ward.name, ward.shortName, ward.slug.replaceAll('-', ' ')]
      return aliases.some((alias) => normalized.includes(normalizeBookText(alias)))
    })
}

function placeReply(place: Place, openIntent: boolean): DaNangAssistantReply {
  const ward = daNangContent.wards.find((item) => item.id === place.wardId)
  const imageCount = images[`place-${place.id}`]?.gallery?.length ?? 1
  const sourceNames = unique(
    place.sources.map((sourceId) => sources[sourceId]?.publisher ?? '').filter(Boolean),
  )
  const details = [
    `📍 ${place.name}${ward ? ` — ${ward.name}` : ''}`,
    place.summary,
    place.address ? `Địa điểm: ${place.address}.` : '',
    imageCount > 1 ? `Bài viết hiện có ${imageCount} ảnh thực tế và ảnh tư liệu.` : '',
    sourceNames.length ? `Nguồn tham khảo: ${sourceNames.join(', ')}.` : '',
  ].filter(Boolean)

  return {
    content: details.join('\n'),
    routeName: 'discover-da-nang',
    routeQuery: { q: place.name },
    actionLabel: `Xem bài ${place.name}`,
    autoNavigate: openIntent,
  }
}

function wardReply(ward: Ward, openIntent: boolean): DaNangAssistantReply {
  const places = ward.placeIds
    .map((placeId) => daNangContent.places.find((place) => place.id === placeId)?.name ?? '')
    .filter(Boolean)
  const details = [
    `📍 ${ward.name}`,
    ward.overview,
    places.length ? `Địa điểm nổi bật: ${compactList(places)}.` : '',
    ward.culture.festivals.length ? `Lễ hội: ${compactList(ward.culture.festivals, 4)}.` : '',
    ward.specialties.length
      ? `Ẩm thực gợi ý: ${compactList(
          ward.specialties.map((specialty) => specialty.name),
          4,
        )}.`
      : '',
  ].filter(Boolean)

  return {
    content: details.join('\n'),
    routeName: 'discover-da-nang',
    routeQuery: { q: ward.shortName },
    actionLabel: `Khám phá ${ward.shortName}`,
    autoNavigate: openIntent,
  }
}

function collectionReply(normalized: string): DaNangAssistantReply {
  let heading: string
  let items: string[]
  let query: string

  if (normalized.includes('le hoi')) {
    heading = 'Một số lễ hội nổi bật'
    items = daNangContent.wards.flatMap((ward) =>
      ward.culture.festivals.map((festival) => `${festival} (${ward.shortName})`),
    )
    query = 'lễ hội'
  } else if (
    normalized.includes('dac san') ||
    normalized.includes('am thuc') ||
    normalized.includes('mon an')
  ) {
    heading = 'Một số hương vị địa phương'
    items = daNangContent.wards.flatMap((ward) =>
      ward.specialties.map((specialty) => `${specialty.name} (${ward.shortName})`),
    )
    query = 'ẩm thực'
  } else if (normalized.includes('thien nhien') || normalized.includes('bien')) {
    heading = 'Một số điểm đến thiên nhiên'
    items = daNangContent.places
      .filter((place) => place.category === 'nature')
      .map((place) => place.name)
    query = 'thiên nhiên'
  } else {
    heading = 'Một số địa danh và di sản nổi bật'
    items = daNangContent.featuredPlaceIds
      .map((placeId) => daNangContent.places.find((place) => place.id === placeId)?.name ?? '')
      .filter(Boolean)
    query = 'di sản'
  }

  return {
    content: `${heading}: ${compactList(items)}. Dữ liệu hiện bao gồm ${daNangContent.wards.length} phường/xã và ${daNangContent.places.length} địa điểm để bạn tiếp tục hỏi theo tên.`,
    routeName: 'discover-da-nang',
    routeQuery: query ? { q: query } : undefined,
    actionLabel: 'Mở trang Khám phá Đà Nẵng',
  }
}

export function getDaNangAssistantReply(message: string): DaNangAssistantReply | null {
  const normalized = normalizeBookText(message)
  const place = findMentionedPlace(normalized)
  const ward = findMentionedWard(normalized)
  const openIntent =
    /\b(mo|xem)\s+(trang|bai)\b/.test(normalized) ||
    /\b(dua toi|truy cap|den trang|mo kham pha)\b/.test(normalized)

  if (place) return placeReply(place, openIntent)
  if (ward) return wardReply(ward, openIntent)

  const hasDaNangContext =
    normalized.includes('da nang') ||
    normalized.includes('kham pha dn') ||
    normalized.includes('kham pha dia phuong')
  const hasDiscoveryTopic =
    normalized.includes('le hoi') ||
    normalized.includes('dia danh') ||
    normalized.includes('di san') ||
    normalized.includes('dac san') ||
    normalized.includes('am thuc') ||
    normalized.includes('thien nhien')

  if (!hasDaNangContext && !hasDiscoveryTopic) return null

  const reply = collectionReply(normalized)
  reply.autoNavigate = openIntent && !hasDiscoveryTopic
  return reply
}
