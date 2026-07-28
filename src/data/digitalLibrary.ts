import catalog from '@/data/digital-library.json'
import type { Book, DigitalLibraryCollection, DigitalLibraryGradeCollection } from '@/types/library'

type CatalogBook = Omit<Book, 'pdfUrl' | 'coverUrl'>

const pdfAssets = import.meta.glob('./SGK_*/*.pdf', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

const coverAssets = import.meta.glob('../assets/book-covers/*.jpg', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

function requireAsset(assets: Record<string, string>, key: string) {
  const asset = assets[key]
  if (!asset) throw new Error(`Không tìm thấy tài nguyên thư viện: ${key}`)
  return asset
}

export const digitalLibraryCollection = catalog.collection as DigitalLibraryCollection
export const digitalLibraryGradeCollections = catalog.collections as DigitalLibraryGradeCollection[]

export const digitalBooks: Book[] = (catalog.books as CatalogBook[]).map((book) => ({
  ...book,
  pdfUrl: requireAsset(pdfAssets, `./${book.sourceFolder}/${book.fileName}`),
  coverUrl: requireAsset(coverAssets, `../assets/book-covers/${book.coverFileName}`),
}))

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

  let score = 0
  if (query === title) score += 120
  if (query.includes(title)) score += 100
  if (title.includes(query) && query.length > 2) score += 80
  if (query.includes(subject)) score += 55

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
