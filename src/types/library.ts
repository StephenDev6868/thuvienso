export interface Book {
  id: number
  title: string
  subtitle: string
  category: string
  color: string
  textColor: string
  filters: string[]
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
