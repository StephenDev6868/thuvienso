import type { Book, LibraryTopic, StemVideo } from '@/types/library'
import { digitalBooks } from '@/data/digitalLibrary'

export const books: Book[] = digitalBooks

export const gradeFilters: Array<number | 'Tất cả'> = [
  'Tất cả',
  ...Array.from(new Set(digitalBooks.map((book) => book.grade))).sort(),
]

export const bookFilters = [
  'Tất cả',
  ...Array.from(new Set(digitalBooks.map((book) => book.subject))),
]

export const topics: LibraryTopic[] = [
  {
    title: 'Tiếng Việt',
    description: 'Truyện, thơ và ngôn ngữ',
    color: '#df2133',
    icon: 'A',
    anchor: 'featured-books',
  },
  {
    title: 'Khoa học',
    description: 'Khám phá thế giới',
    color: '#3e6ff4',
    icon: '🔬',
    anchor: 'stem-videos',
  },
  {
    title: 'Kỹ năng sống',
    description: 'Tự tin và an toàn',
    color: '#ff7045',
    icon: '♥',
    anchor: 'featured-books',
  },
  {
    title: 'Bác Hồ',
    description: 'Những câu chuyện đẹp',
    color: '#ffc94a',
    icon: '★',
    anchor: 'featured-books',
  },
  {
    title: 'STEM',
    description: 'Học qua thực hành',
    color: '#2aa66c',
    icon: '⚙',
    anchor: 'stem-videos',
  },
  {
    title: 'Nghệ thuật',
    description: 'Âm nhạc và mỹ thuật',
    color: '#8757f2',
    icon: '✦',
    anchor: 'featured-books',
  },
]

export const stemVideos: StemVideo[] = [
  {
    title: 'Bàn tay rô-bốt',
    description: 'Chế tạo cơ khí đơn giản',
    color: '#df2133',
    duration: '03:24',
  },
  {
    title: 'Cầu vồng trong nhà',
    description: 'Thí nghiệm ánh sáng',
    color: '#3e6ff4',
    duration: '04:10',
  },
  {
    title: 'Lớp học xanh',
    description: 'Tái chế và môi trường',
    color: '#2aa66c',
    duration: '05:08',
  },
]
