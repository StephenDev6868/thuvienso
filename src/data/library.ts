import type { Book, LibraryTopic, StemVideo } from '@/types/library'

export const bookFilters = ['Đề xuất', 'Mới cập nhật', 'Đọc nhiều', 'Lớp 1–5', 'Khoa học STEM']

export const books: Book[] = [
  {
    id: 1,
    title: 'Ngày và đêm',
    subtitle: 'Khám phá tự nhiên',
    category: 'Khoa học',
    color: '#3e6ff4',
    textColor: '#3e6ff4',
    filters: ['Đề xuất', 'Đọc nhiều', 'Lớp 1–5', 'Khoa học STEM'],
  },
  {
    id: 2,
    title: 'Cầu vồng trong nhà',
    subtitle: 'Thí nghiệm STEM',
    category: 'STEM',
    color: '#8757f2',
    textColor: '#8757f2',
    filters: ['Đề xuất', 'Mới cập nhật', 'Khoa học STEM'],
  },
  {
    id: 3,
    title: 'Cô bé Lọ Lem',
    subtitle: 'Cổ tích thế giới',
    category: 'Truyện lớp 2',
    color: '#df2133',
    textColor: '#df2133',
    filters: ['Đề xuất', 'Đọc nhiều', 'Lớp 1–5'],
  },
  {
    id: 4,
    title: 'Hành trình đại dương',
    subtitle: 'Khám phá sinh vật biển',
    category: 'Khoa học',
    color: '#2aa66c',
    textColor: '#23925e',
    filters: ['Mới cập nhật', 'Lớp 1–5', 'Khoa học STEM'],
  },
  {
    id: 5,
    title: 'Kỹ năng an toàn',
    subtitle: 'Phòng cháy và thoát hiểm',
    category: 'Kỹ năng sống',
    color: '#ff7045',
    textColor: '#f35e34',
    filters: ['Đọc nhiều', 'Lớp 1–5'],
  },
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
