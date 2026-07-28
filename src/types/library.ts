export interface Book {
  id: string
  title: string
  subject: string
  description: string
  grade: number
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
  pdfUrl: string
  coverUrl: string
}

export interface DigitalLibraryCollection {
  id: string
  title: string
  description: string
  grades: number[]
  bookCount: number
  totalPages: number
}

export interface DigitalLibraryGradeCollection {
  id: string
  title: string
  description: string
  grade: number
  bookCount: number
  totalPages: number
}

export interface LibraryTopic {
  title: string
  description: string
  color: string
  icon: string
  anchor: string
}

export interface StemVideo {
  title: string
  description: string
  color: string
  duration: string
}

export interface ChatMessage {
  id: number
  role: 'assistant' | 'user'
  content: string
}
