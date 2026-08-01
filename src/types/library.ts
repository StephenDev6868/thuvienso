export type LibraryItemKind =
  'textbook' | 'ebook' | 'life-skill' | 'teacher-resource' | 'teacher-book'
export type LibraryItemFormat = 'pdf' | 'docx' | 'ppt' | 'pptx' | 'link'

interface LibraryItemBase {
  id: string
  title: string
  subject: string
  description: string
  grade?: number
  volume?: number
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
  coverUrl: string
  originalUrl: string
  pageCount?: number
}

export interface PdfLibraryItem extends LibraryItemBase {
  viewerType: 'pdf'
  pageCount: number
  pageWidth: number
  pageHeight: number
  pdfUrl: string
}

export interface OfficeLibraryItem extends LibraryItemBase {
  viewerType: 'office'
  previewPath: string
  previewUrl: string
}

export interface ExternalLibraryItem extends LibraryItemBase {
  viewerType: 'external'
  externalUrl: string
}

export type Book = PdfLibraryItem | OfficeLibraryItem | ExternalLibraryItem

export interface DigitalLibraryCollection {
  id: string
  title: string
  description: string
  grades: number[]
  bookCount: number
  totalPages: number
}

export interface DigitalResourceCollection {
  id: string
  title: string
  description: string
  documentCount: number
  totalPages: number
  formats: LibraryItemFormat[]
}

export interface TeacherBookCollection {
  id: string
  title: string
  description: string
  bookCount: number
  grades: number[]
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
