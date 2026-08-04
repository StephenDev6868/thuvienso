import catalog from '@/data/digital-library.json'
import ebookCatalog from '@/data/digital-ebooks.json'
import resourceCatalog from '@/data/digital-resources.json'
import teacherBookCatalog from '@/data/teacher-books.json'
import teacherBookCoverUrl from '@/assets/teacher-book-cover.svg'
import { getLibraryAssetUrl, getPdfAssetUrl } from '@/data/libraryAssetUrl'
import type {
  Book,
  DigitalLibraryCollection,
  DigitalLibraryGradeCollection,
  DigitalResourceCollection,
  LibraryItemFormat,
  LibraryItemKind,
  TeacherBookCollection,
} from '@/types/library'

interface CatalogBook {
  id: string
  title: string
  subject: string
  description: string
  grade?: number
  volume?: number
  keywords: string[]
  accent: string
  sourceFolder: string
  fileName: string
  coverFileName: string
  pageCount: number
  fileSizeBytes: number
  pageWidth: number
  pageHeight: number
}

interface CatalogResource {
  id: string
  title: string
  subject: string
  description: string
  grade?: number
  keywords: string[]
  accent: string
  kind: LibraryItemKind
  collectionId: string
  collectionTitle: string
  format: LibraryItemFormat
  sourceFolder: string
  relativePath: string
  fileName: string
  coverFileName: string
  fileSizeBytes: number
  viewerType: 'pdf' | 'office'
  pageCount?: number
  pageWidth?: number
  pageHeight?: number
  previewPath?: string
}

interface CatalogEbook {
  id: string
  title: string
  category: string
  subcategory?: string
  description: string
  grade?: number
  keywords: string[]
  accent: string
  sourceFolder: string
  relativePath: string
  fileName: string
  coverFileName: string
  fileSizeBytes: number
  pageCount: number
  pageWidth: number
  pageHeight: number
}

interface CatalogTeacherBook {
  id: string
  title: string
  subject: string
  grade: number
  volume?: number
  url: string
}

const subjectAccents: Record<string, string> = {
  'Âm nhạc': '#8757f2',
  'Công nghệ': '#0f9f85',
  'Giáo dục thể chất': '#2aa66c',
  'Hoạt động trải nghiệm': '#ff7045',
  'Khoa học': '#2aa66c',
  'Lịch sử và Địa lí': '#b7791f',
  'Mỹ thuật': '#e84d8a',
  'Tin học': '#2563eb',
  'Tiếng Anh': '#3e6ff4',
  'Tiếng Việt': '#df2133',
  Toán: '#315fd7',
  'Đạo đức': '#df2133',
}

const coverAssets = import.meta.glob(
  '../assets/{book-covers,ebook-covers,resource-covers}/*.{jpg,png}',
  {
    eager: true,
    import: 'default',
    query: '?url',
  },
) as Record<string, string>

function requireAsset(assets: Record<string, string>, key: string) {
  const asset =
    assets[key] ??
    Object.entries(assets).find(
      ([assetKey]) => assetKey.normalize('NFC') === key.normalize('NFC'),
    )?.[1]
  if (!asset) throw new Error(`Không tìm thấy tài nguyên thư viện: ${key}`)
  return asset
}

export const digitalLibraryCollection = catalog.collection as DigitalLibraryCollection
export const digitalLibraryGradeCollections = catalog.collections as DigitalLibraryGradeCollection[]
export const digitalResourceCollection = resourceCatalog.collection as DigitalResourceCollection
export const teacherBookCollection = teacherBookCatalog.collection as TeacherBookCollection

export const digitalTextbooks: Book[] = (catalog.books as CatalogBook[]).map((book) => ({
  ...book,
  kind: 'textbook',
  collectionId: `sgk-lop-${book.grade}`,
  collectionTitle: 'Sách giáo khoa',
  format: 'pdf',
  viewerType: 'pdf',
  relativePath: book.fileName,
  pdfUrl: getPdfAssetUrl(book.sourceFolder, book.fileName),
  originalUrl: getPdfAssetUrl(book.sourceFolder, book.fileName),
  coverUrl: requireAsset(coverAssets, `../assets/book-covers/${book.coverFileName}`),
}))

export const digitalEbooks: Book[] = (ebookCatalog.items as CatalogEbook[]).map((book) => {
  const originalUrl = getPdfAssetUrl(book.sourceFolder, book.relativePath)
  return {
    ...book,
    subject: book.subcategory || book.category,
    kind: 'ebook',
    collectionId: 'sach-dien-tu',
    collectionTitle: 'Sách điện tử',
    format: 'pdf',
    viewerType: 'pdf',
    pageCount: book.pageCount,
    pageWidth: book.pageWidth,
    pageHeight: book.pageHeight,
    pdfUrl: originalUrl,
    originalUrl,
    coverUrl: requireAsset(coverAssets, `../assets/ebook-covers/${book.coverFileName}`),
  }
})

export const digitalResources: Book[] = (resourceCatalog.documents as CatalogResource[]).map(
  (document) => {
    const originalUrl =
      document.viewerType === 'pdf'
        ? getPdfAssetUrl(document.sourceFolder, document.relativePath)
        : getLibraryAssetUrl(document.sourceFolder, document.relativePath)
    const common = {
      ...document,
      originalUrl,
      coverUrl: requireAsset(coverAssets, `../assets/resource-covers/${document.coverFileName}`),
    }

    if (document.viewerType === 'office') {
      if (!document.previewPath) {
        throw new Error(`Tài liệu Office chưa có bản xem trước: ${document.id}`)
      }
      return {
        ...common,
        viewerType: 'office' as const,
        previewPath: document.previewPath,
        previewUrl: document.previewPath,
      }
    }

    return {
      ...common,
      viewerType: 'pdf' as const,
      pageCount: document.pageCount ?? 0,
      pageWidth: document.pageWidth ?? 595,
      pageHeight: document.pageHeight ?? 842,
      pdfUrl: originalUrl,
    }
  },
)

export const digitalTeacherBooks: Book[] = (teacherBookCatalog.books as CatalogTeacherBook[]).map(
  (book) => ({
    id: book.id,
    title: book.title,
    subject: book.subject,
    description: `Sách giáo viên ${book.subject} lớp ${book.grade}${book.volume ? `, tập ${book.volume}` : ''}, đọc trực tuyến trên hệ thống tập huấn NXBGD.`,
    grade: book.grade,
    ...(book.volume ? { volume: book.volume } : {}),
    keywords: [
      'sách giáo viên',
      'sgv',
      book.subject.toLowerCase(),
      `lớp ${book.grade}`,
      ...(book.volume ? [`tập ${book.volume}`] : []),
      'nxbgd',
    ],
    accent: subjectAccents[book.subject] ?? '#315fd7',
    kind: 'teacher-book',
    collectionId: 'sach-giao-vien',
    collectionTitle: 'Sách giáo viên',
    format: 'link',
    viewerType: 'external',
    sourceFolder: 'NXBGD',
    relativePath: book.url,
    fileName: '',
    coverFileName: 'teacher-book-cover.svg',
    fileSizeBytes: 0,
    coverUrl: teacherBookCoverUrl,
    originalUrl: book.url,
    externalUrl: book.url,
  }),
)

export const digitalBooks: Book[] = [
  ...digitalTextbooks,
  ...digitalEbooks,
  ...digitalResources,
  ...digitalTeacherBooks,
]

export function normalizeBookText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .toLocaleLowerCase('vi')
}

const ignoredQueryWords = new Set([
  'ai',
  'ban',
  'cuon',
  'doc',
  'giup',
  'hay',
  'ho',
  'lop',
  'minh',
  'mo',
  'nay',
  'nhe',
  'sach',
  'tai',
  'lieu',
  'toi',
  'xem',
])

function scoreBook(book: Book, rawQuery: string) {
  const query = normalizeBookText(rawQuery)
  const title = normalizeBookText(book.title)
  const subject = normalizeBookText(book.subject)
  const queryTokens = query
    .split(' ')
    .filter((token) => token.length > 1 && !ignoredQueryWords.has(token))
  const searchable = normalizeBookText(
    [book.title, book.subject, book.description, ...book.keywords].join(' '),
  )
  const isTeacherBookQuery = query.includes('sach giao vien') || query.split(' ').includes('sgv')

  let score = 0
  if (query === title) score += 120
  if (query.includes(title)) score += 100
  if (title.includes(query) && query.length > 2) score += 80
  if (query.includes(subject)) score += 55
  if (query.includes('khbd') || query.includes('ke hoach bai day')) {
    score += book.kind === 'teacher-resource' ? 130 : -150
  }
  if (query.includes('tuan') && title.includes('tuan')) {
    score += book.kind === 'teacher-resource' ? 80 : 0
  }
  if (query.includes('ky nang song')) {
    score += book.kind === 'life-skill' ? 100 : -60
  }
  if (query.includes('giao vien') || query.includes('tap huan')) {
    score += book.kind === 'teacher-resource' ? 80 : book.kind === 'teacher-book' ? 40 : -40
  }
  if (isTeacherBookQuery) {
    score += book.kind === 'teacher-book' ? 180 : -150
  } else if (query.split(' ').includes('sach')) {
    score += book.kind === 'textbook' ? 40 : book.kind === 'teacher-book' ? -80 : 0
  } else {
    score += book.kind === 'teacher-book' ? -70 : 0
  }
  if (query.includes('sach dien tu') || query.includes('ebook')) {
    score += book.kind === 'ebook' ? 180 : -100
  }

  const requestedGrade = extractRequestedGrade(rawQuery)
  if (requestedGrade) {
    score += book.grade === requestedGrade ? 90 : -120
  }

  for (const token of new Set(queryTokens)) {
    if (title.split(' ').includes(token)) score += 18
    else if (searchable.includes(token)) score += 7
  }

  const requestedVolume = query.match(/\btap\s*([12])\b/)?.[1]
  if (requestedVolume) {
    score += book.volume === Number(requestedVolume) ? 45 : book.volume ? -60 : 0
  }

  return score
}

export function extractRequestedGrade(query: string) {
  const normalized = normalizeBookText(query)
  const gradeAfterLabel = normalized.match(/\blop\s*([1-5])\b/)?.[1]
  if (gradeAfterLabel) return Number(gradeAfterLabel)

  const withoutVolume = normalized.replace(/\btap\s*[12]\b/g, '')
  const standaloneGrade = withoutVolume.match(/\b([1-5])\b/)?.[1]
  return standaloneGrade ? Number(standaloneGrade) : undefined
}

export function searchDigitalBooks(query: string) {
  return digitalBooks
    .map((book) => ({ book, score: scoreBook(book, query) }))
    .filter(({ score }) => score > 0)
    .sort(
      (left, right) => right.score - left.score || left.book.title.localeCompare(right.book.title),
    )
    .map(({ book }) => book)
}

export function findDigitalBook(bookId: string) {
  return digitalBooks.find((book) => book.id === bookId)
}
