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

const spellingVideoAliases = [
  {
    id: 'video-bai-37-em-em-im-um',
    aliases: [
      'đánh vần em êm im um',
      'danh van em êm im um',
      'đánh vần chữ em êm im um',
      'danh van chu em êm im um',
    ],
  },
  {
    id: 'video-bai-36-om-om-om',
    aliases: [
      'đánh vần om ôm ơm',
      'danh van om ôm ơm',
      'đánh vần chữ om ôm ơm',
      'danh van chu om ôm ơm',
    ],
  },
  {
    id: 'video-bai-51-et-et-it',
    aliases: [
      'đánh vần et êt it',
      'danh van et êt it',
      'đánh vần chữ et êt it',
      'danh van chu et êt it',
    ],
  },
  {
    id: 'video-bai-41-ui-ui',
    aliases: ['đánh vần ui ưi', 'danh van ui ưi', 'đánh vần chữ ui ưi', 'danh van chu ui ưi'],
  },
  {
    id: 'video-bai-26-ph-ph-qu-qu',
    aliases: [
      'đánh vần ph qu',
      'danh van ph qu',
      'đánh vần chữ ph qu',
      'danh van chu ph qu',
    ],
  },
  {
    id: 'video-bai-22-t-t-tr-tr',
    aliases: [
      'đánh vần chữ t tr',
      'danh van chu t tr',
      'đánh vần t tr',
      'danh van t tr',
    ],
  },
  {
    id: 'video-bai-8-d-d-d-d',
    aliases: [
      'đánh vần chữ d đ',
      'danh van chu d đ',
      'đánh vần d đ',
      'danh van d đ',
    ],
  },
  {
    id: 'video-bai-4-e-e-e-e',
    aliases: [
      'đánh vần chữ e ê',
      'danh van chu e ê',
      'đánh vần chữ e',
      'danh van chu e',
      'đánh vần chữ ê',
      'danh van chu ê',
    ],
  },
  {
    id: 'video-bai-6-o-o',
    aliases: ['đánh vần chữ o', 'danh van chu o'],
  },
  {
    id: 'video-bai-7-o-o',
    aliases: ['đánh vần chữ ô', 'danh van chu ô'],
  },
  {
    id: 'video-bai-9-o-o',
    aliases: ['đánh vần chữ ơ', 'danh van chu ơ'],
  },
  {
    id: 'video-bai-11-i-i-k-k',
    aliases: ['đánh vần chữ i', 'danh van chu i'],
  },
  {
    id: 'video-bai-28-y-y',
    aliases: ['đánh vần chữ y', 'danh van chu y'],
  },
  {
    id: 'video-bai-3-c-c',
    aliases: ['đánh vần chữ c', 'danh van chu c'],
  },
  {
    id: 'video-bai-2-b-b',
    aliases: ['đánh vần chữ b', 'danh van chu b'],
  },
  {
    id: 'video-bai-1-a-a',
    aliases: ['đánh vần chữ a', 'danh van chu a'],
  },
]

function normalizeMediaTextWithAccents(value: string) {
  return value
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .toLocaleLowerCase('vi')
}

function findSpellingVideoId(rawQuery: string) {
  const query = ` ${normalizeMediaTextWithAccents(rawQuery)} `
  return spellingVideoAliases.find((item) =>
    item.aliases.some((alias) => query.includes(` ${normalizeMediaTextWithAccents(alias)} `)),
  )?.id
}

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
  if (kind === 'video' && query.includes('phat am') && searchable.includes('phat am')) score += 80
  const grade = Number(query.match(/\blop\s*([1-5])\b/)?.[1] ?? 0) || undefined
  if (grade) score += item.grade === grade ? 65 : -50
  const lesson = Number(query.match(/\bbai\s*(\d+)\b/)?.[1] ?? 0) || undefined
  if (lesson && 'lesson' in item) score += item.lesson === lesson ? 45 : -10
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
  const spellingVideoId = findSpellingVideoId(query)

  return allDigitalVideos
    .map((item) => ({ item, score: scoreMedia(item, query, 'video') }))
    .map(({ item, score }) => ({
      item,
      score: item.id === spellingVideoId ? score + 10000 : score,
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .map(({ item }) => item)
}

export function findDigitalMedia(mediaId: string) {
  return [...digitalAudiobooks, ...allDigitalVideos].find((item) => item.id === mediaId)
}
