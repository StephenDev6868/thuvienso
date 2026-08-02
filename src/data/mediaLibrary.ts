import audiobookCatalog from '@/data/digital-audiobooks.json'
import videoCatalog from '@/data/digital-videos.json'
import youtubeCatalog from '@/data/youtube-videos.json'
import { getLibraryAssetUrl } from '@/data/libraryAssetUrl'

export interface DigitalMediaItem {
  id: string
  title: string
  category: string
  subcategory?: string
  description: string
  grade?: number
  subject?: string
  lesson?: number
  volume?: number
  keywords: string[]
  accent: string
  format: 'mp3' | 'mp4'
  sourceFolder: string
  relativePath: string
  fileName: string
  coverFileName: string
  fileSizeBytes: number
  durationSeconds: number
  duration: string
  mediaUrl: string
  coverUrl: string
}

export interface YouTubeVideoItem {
  id: string
  title: string
  category: string
  description: string
  grade?: number
  subject?: string
  keywords: string[]
  accent: string
  format: 'youtube'
  youtubeId?: string
  playlistId?: string
  startSeconds?: number
  sourceUrl: string
  embedUrl: string
  coverUrl: string
  duration: string
}

export type DigitalVideoItem = DigitalMediaItem | YouTubeVideoItem

interface CatalogYouTubeItem {
  id: string
  title: string
  category: string
  youtubeId?: string
  playlistId?: string
  startSeconds?: number
  grade?: number
  subject?: string
}

type CatalogMediaItem = Omit<DigitalMediaItem, 'mediaUrl' | 'coverUrl'>

const audioCoverAssets = import.meta.glob('../assets/audio-covers/*.svg', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

const videoCoverAssets = import.meta.glob('../assets/video-thumbnails/*.{png,svg}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

function requireNormalizedAsset(assets: Record<string, string>, expectedKey: string) {
  const asset =
    assets[expectedKey] ??
    Object.entries(assets).find(
      ([assetKey]) => assetKey.normalize('NFC') === expectedKey.normalize('NFC'),
    )?.[1]
  if (!asset) throw new Error(`Không tìm thấy media đã số hóa: ${expectedKey}`)
  return asset
}

function hydrateMedia(
  item: CatalogMediaItem,
  coverAssets: Record<string, string>,
  coverDirectory: string,
): DigitalMediaItem {
  return {
    ...item,
    mediaUrl: getLibraryAssetUrl(item.sourceFolder, item.relativePath),
    coverUrl: requireNormalizedAsset(
      coverAssets,
      `../assets/${coverDirectory}/${item.coverFileName}`,
    ),
  }
}

export const digitalAudiobooks: DigitalMediaItem[] = (
  audiobookCatalog.items as CatalogMediaItem[]
).map((item) => hydrateMedia(item, audioCoverAssets, 'audio-covers'))

export const digitalVideos: DigitalMediaItem[] = (videoCatalog.items as CatalogMediaItem[]).map(
  (item) => hydrateMedia(item, videoCoverAssets, 'video-thumbnails'),
)

const youtubeAccents = ['#e84d5b', '#e59b32', '#4b9d88', '#597fc2', '#8f68b3', '#c46e47']

export const digitalYouTubeVideos: YouTubeVideoItem[] = (
  youtubeCatalog.items as CatalogYouTubeItem[]
).map((item, index) => {
  const sourceUrl = item.youtubeId
    ? `https://www.youtube.com/watch?v=${item.youtubeId}${item.startSeconds ? `&t=${item.startSeconds}s` : ''}`
    : `https://www.youtube.com/playlist?list=${item.playlistId}`
  const embedUrl = item.youtubeId
    ? `https://www.youtube-nocookie.com/embed/${item.youtubeId}?rel=0${item.startSeconds ? `&start=${item.startSeconds}` : ''}`
    : `https://www.youtube-nocookie.com/embed/videoseries?list=${item.playlistId}`

  return {
    ...item,
    description: `Video YouTube “${item.title}” thuộc chủ đề ${item.category}.`,
    keywords: [
      item.title,
      item.category,
      'youtube',
      'video học tập',
      'bài giảng',
      ...(item.grade ? [`lớp ${item.grade}`] : []),
    ],
    accent: youtubeAccents[index % youtubeAccents.length]!,
    format: 'youtube',
    sourceUrl,
    embedUrl,
    coverUrl: item.youtubeId ? `https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg` : '',
    duration: item.playlistId ? 'Danh sách phát' : 'YouTube',
  }
})

export const allDigitalVideos: DigitalVideoItem[] = [...digitalVideos, ...digitalYouTubeVideos]

export function normalizeMediaText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .toLocaleLowerCase('vi')
}

function scoreMedia(
  item: DigitalMediaItem | YouTubeVideoItem,
  rawQuery: string,
  kind: 'audio' | 'video',
) {
  const query = normalizeMediaText(rawQuery)
  const title = normalizeMediaText(item.title)
  const searchable = normalizeMediaText(
    [
      item.title,
      item.category,
      'subcategory' in item ? item.subcategory : undefined,
      item.description,
      ...item.keywords,
    ]
      .filter(Boolean)
      .join(' '),
  )
  const tokens = query.split(' ').filter((token) => token.length > 1)
  let score = 0
  if (query === title) score += 150
  if (query.includes(title)) score += 110
  if (title.includes(query) && query.length > 2) score += 90
  if (kind === 'audio' && (query.includes('sach noi') || query.includes('nghe'))) score += 45
  if (kind === 'video' && (query.includes('video') || query.includes('bai giang'))) score += 45
  const grade = Number(query.match(/\blop\s*([1-5])\b/)?.[1] ?? 0) || undefined
  if (grade) score += item.grade === grade ? 65 : -50
  for (const token of new Set(tokens)) {
    if (title.split(' ').includes(token)) score += 16
    else if (searchable.includes(token)) score += 6
  }
  return score
}

export function searchAudiobooks(query: string) {
  return digitalAudiobooks
    .map((item) => ({ item, score: scoreMedia(item, query, 'audio') }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .map(({ item }) => item)
}

export function searchVideos(query: string) {
  return allDigitalVideos
    .map((item) => ({ item, score: scoreMedia(item, query, 'video') }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .map(({ item }) => item)
}

export function findDigitalMedia(mediaId: string) {
  return [...digitalAudiobooks, ...allDigitalVideos].find((item) => item.id === mediaId)
}
