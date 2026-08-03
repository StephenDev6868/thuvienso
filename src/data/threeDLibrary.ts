import {
  digitalEbooks,
  digitalResources,
  digitalTeacherBooks,
  digitalTextbooks,
} from '@/data/digitalLibrary'
import type { Book } from '@/types/library'

export type CabinetDecoration = 'early-learning' | 'exploration' | 'life-skills' | 'teacher'

export interface CabinetShelf {
  id: string
  label: string
  books: Book[]
}

export interface ThreeDBookCabinet {
  id: string
  title: string
  shortTitle: string
  eyebrow: string
  description: string
  decoration: CabinetDecoration
  frameColor: string
  frameDarkColor: string
  innerColor: string
  glowColor: string
  accentColor: string
  shelves: CabinetShelf[]
  books: Book[]
}

interface CabinetDefinition extends Omit<ThreeDBookCabinet, 'shelves' | 'books'> {
  books: Book[]
  groupByGrade?: boolean
  groupByExactGrade?: boolean
}

const MAX_BOOKS_PER_SHELF = 18

function compareBooks(left: Book, right: Book) {
  return (
    left.subject.localeCompare(right.subject, 'vi') ||
    (left.volume ?? 0) - (right.volume ?? 0) ||
    left.title.localeCompare(right.title, 'vi')
  )
}

function summarizeShelfSubjects(books: Book[]) {
  const subjects = Array.from(new Set(books.map((book) => book.subject)))
  if (subjects.length <= 2) return subjects.join(' • ')
  return `${subjects.slice(0, 2).join(' • ')} +${subjects.length - 2}`
}

function splitEvenly<T>(items: T[], groupCount: number) {
  const safeGroupCount = Math.max(1, Math.min(groupCount, items.length))
  const groups: T[][] = []
  let offset = 0

  for (let index = 0; index < safeGroupCount; index += 1) {
    const remainingItems = items.length - offset
    const remainingGroups = safeGroupCount - index
    const groupSize = Math.ceil(remainingItems / remainingGroups)
    groups.push(items.slice(offset, offset + groupSize))
    offset += groupSize
  }

  return groups
}

export function fitShelvesToCapacity(shelves: CabinetShelf[], capacity: number) {
  const safeCapacity = Math.max(1, Math.floor(capacity))

  return shelves.flatMap((shelf) => {
    const partCount = Math.ceil(shelf.books.length / safeCapacity)
    if (partCount <= 1) return [shelf]

    return splitEvenly(shelf.books, partCount).map((books, index) => ({
      ...shelf,
      id: `${shelf.id}-part-${index + 1}`,
      label: `${shelf.label} · Kệ ${index + 1}/${partCount}`,
      books,
    }))
  })
}

function createBalancedShelves(cabinetId: string, books: Book[], shelfCount: number) {
  return splitEvenly([...books].sort(compareBooks), shelfCount).map((shelfBooks, index) => ({
    id: `${cabinetId}-shelf-${index + 1}`,
    label: summarizeShelfSubjects(shelfBooks),
    books: shelfBooks,
  }))
}

function createGradeShelves(cabinetId: string, books: Book[], shelfCount: number) {
  const sortedBooks = [...books].sort(
    (left, right) => (left.grade ?? 0) - (right.grade ?? 0) || compareBooks(left, right),
  )

  return splitEvenly(sortedBooks, shelfCount).map((shelfBooks, index) => {
    const grades = Array.from(
      new Set(shelfBooks.flatMap((book) => (book.grade ? [book.grade] : []))),
    ).sort()
    const gradeLabel =
      grades.length > 1 ? `${grades[0]}–${grades[grades.length - 1]}` : String(grades[0] ?? '')

    return {
      id: `${cabinetId}-shelf-${index + 1}`,
      label: `Lớp ${gradeLabel}`,
      books: shelfBooks,
    }
  })
}

function createExactGradeShelves(cabinetId: string, books: Book[]) {
  const grades = Array.from(
    new Set(books.flatMap((book) => (book.grade ? [book.grade] : []))),
  ).sort()

  return grades.map((grade) => ({
    id: `${cabinetId}-grade-${grade}`,
    label: `Lớp ${grade}`,
    books: books.filter((book) => book.grade === grade).sort(compareBooks),
  }))
}

const definitions: CabinetDefinition[] = [
  {
    id: 'sgk-tieu-hoc',
    title: 'Sách giáo khoa lớp 1–5',
    shortTitle: 'SGK lớp 1–5',
    eyebrow: 'Nền tảng tri thức tiểu học',
    description: 'Toàn bộ sách giáo khoa lớp 1 đến lớp 5, được xếp riêng theo từng khối lớp.',
    decoration: 'exploration',
    frameColor: '#e75b63',
    frameDarkColor: '#8f2634',
    innerColor: '#fff3e6',
    glowColor: '#ffb56f',
    accentColor: '#df2133',
    books: digitalTextbooks,
    groupByExactGrade: true,
  },
  {
    id: 'sach-dien-tu',
    title: 'Kho sách điện tử',
    shortTitle: 'Sách điện tử',
    eyebrow: 'Khám phá • Đọc • Sáng tạo',
    description: 'Truyện, danh nhân, kỹ năng và sách khoa học STEM được số hóa để đọc trực tiếp.',
    decoration: 'early-learning',
    frameColor: '#238f82',
    frameDarkColor: '#125047',
    innerColor: '#eaf8f3',
    glowColor: '#7ed9bd',
    accentColor: '#148c83',
    books: digitalEbooks,
  },
  {
    id: 'ky-nang-song',
    title: 'Kỹ năng sống',
    shortTitle: 'Kỹ năng sống',
    eyebrow: 'Tự tin • An toàn • Tử tế',
    description: 'Tài liệu giúp học sinh hiểu bản thân, bảo vệ mình và yêu môi trường.',
    decoration: 'life-skills',
    frameColor: '#ef7254',
    frameDarkColor: '#963927',
    innerColor: '#fff2e9',
    glowColor: '#ffad7f',
    accentColor: '#ff7045',
    books: digitalResources.filter((book) => book.kind === 'life-skill'),
  },
  {
    id: 'tai-lieu-giao-vien',
    title: 'Tài liệu cho giáo viên',
    shortTitle: 'Tài liệu GV',
    eyebrow: 'Nghiệp vụ và bài giảng',
    description: 'Kế hoạch bài dạy, văn bản ngành và tài liệu tập huấn chuyên môn.',
    decoration: 'teacher',
    frameColor: '#334e78',
    frameDarkColor: '#162640',
    innerColor: '#e8eef7',
    glowColor: '#7197cd',
    accentColor: '#315fd7',
    books: digitalResources.filter((book) => book.kind === 'teacher-resource'),
  },
  {
    id: 'sach-giao-vien',
    title: 'Sách giáo viên lớp 1–5',
    shortTitle: 'Sách giáo viên',
    eyebrow: 'Đồng hành cùng thầy cô',
    description: 'Bộ sách giáo viên được sắp theo lớp và đọc trực tuyến từ NXBGD.',
    decoration: 'teacher',
    frameColor: '#8e455c',
    frameDarkColor: '#4b2030',
    innerColor: '#f6e9ed',
    glowColor: '#d889a2',
    accentColor: '#b4536d',
    books: digitalTeacherBooks,
    groupByGrade: true,
  },
]

export const threeDBookCabinets: ThreeDBookCabinet[] = definitions.map((definition) => {
  const shelfCount = Math.max(1, Math.ceil(definition.books.length / MAX_BOOKS_PER_SHELF))

  return {
    ...definition,
    shelves: definition.groupByExactGrade
      ? createExactGradeShelves(definition.id, definition.books)
      : definition.groupByGrade
        ? createGradeShelves(definition.id, definition.books, shelfCount)
        : createBalancedShelves(definition.id, definition.books, shelfCount),
  }
})

export const threeDLibraryBookCount = threeDBookCabinets.reduce(
  (total, cabinet) => total + cabinet.books.length,
  0,
)
