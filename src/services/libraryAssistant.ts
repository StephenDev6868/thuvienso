import {
  digitalBooks,
  extractRequestedGrade,
  normalizeBookText,
  searchDigitalBooks,
} from '@/data/digitalLibrary'

export interface LibraryAssistantReply {
  content: string
  openBookId?: string
}

const availableLibraryGrades = Array.from(new Set(digitalBooks.map((book) => book.grade))).sort()
const availableLibraryGradeLabel = availableLibraryGrades.join(', ')

export function getLibraryAssistantReply(message: string): LibraryAssistantReply {
  const normalized = normalizeBookText(message)
  const matches = searchDigitalBooks(message)
  const openIntent = /\b(doc|mo|xem)\b/.test(normalized)
  const requestedGrade = extractRequestedGrade(message)

  if (
    normalized.includes('kho sach') ||
    normalized.includes('danh sach') ||
    normalized.includes('nhung mon nao') ||
    normalized.includes('sach gi')
  ) {
    const availableBooks = requestedGrade
      ? digitalBooks.filter((book) => book.grade === requestedGrade)
      : digitalBooks
    const subjects = Array.from(new Set(availableBooks.map((book) => book.subject)))
    const scope = requestedGrade
      ? `lớp ${requestedGrade}`
      : `các lớp ${Array.from(new Set(digitalBooks.map((book) => book.grade))).join(', ')}`
    return {
      content: `Kho thư viện hiện có ${availableBooks.length} cuốn SGK ${scope} thuộc các môn: ${subjects.join(', ')}. Bạn chỉ cần nói “Mở sách…” kèm lớp, tên sách và tập nếu có.`,
    }
  }

  if (openIntent) {
    if (!matches.length) {
      return {
        content: `Mình chưa tìm thấy cuốn đó trong kho SGK lớp ${availableLibraryGradeLabel}. Bạn có thể hỏi “Kho sách có những môn nào?” để xem toàn bộ danh mục.`,
      }
    }

    const bestMatch = matches[0]!
    const sameSubjectBooks = matches.filter((book) => book.subject === bestMatch.subject)
    const availableGrades = Array.from(new Set(sameSubjectBooks.map((book) => book.grade))).sort()
    const requestedVolume = /\btap\s*[12]\b/.test(normalized)

    if (!requestedGrade && availableGrades.length > 1) {
      return {
        content: `${bestMatch.subject} hiện có sách lớp ${availableGrades.join(', lớp ')}. Bạn muốn mình mở sách lớp nào?`,
      }
    }

    const sameGradeVolumes = sameSubjectBooks.filter(
      (book) => book.grade === bestMatch.grade && book.volume,
    )
    if (!requestedVolume && sameGradeVolumes.length > 1) {
      return {
        content: `${bestMatch.subject} lớp ${bestMatch.grade} có ${sameGradeVolumes.map((book) => `Tập ${book.volume}`).join(' và ')}. Bạn muốn mình mở tập nào?`,
      }
    }

    return {
      content: `Mình đã tìm thấy “${bestMatch.title}” (${bestMatch.pageCount} trang). Đang mở trình đọc sách cho bạn...`,
      openBookId: bestMatch.id,
    }
  }

  if (matches.length) {
    const suggestions = matches.slice(0, 3)
    return {
      content: `Mình tìm thấy: ${suggestions.map((book) => `“${book.title}” (${book.pageCount} trang)`).join(', ')}. Hãy nói “Mở sách…” kèm tên cuốn bạn muốn đọc.`,
    }
  }

  if (normalized.includes('phu huynh')) {
    return {
      content: `Chào phụ huynh! Kho hiện có ${digitalBooks.length} cuốn SGK lớp ${availableLibraryGradeLabel}. Bạn có thể hỏi theo lớp, môn hoặc yêu cầu mình mở trực tiếp một cuốn sách.`,
    }
  }

  if (normalized.includes('stem') || normalized.includes('thi nghiem')) {
    return {
      content:
        'Bạn có thể xem các video STEM ở mục Học liệu, hoặc mở sách Tự nhiên và Xã hội 1 để khám phá các bài học khoa học.',
    }
  }

  return {
    content: `Mình có thể tìm và mở trực tiếp ${digitalBooks.length} cuốn SGK lớp ${availableLibraryGradeLabel}. Ví dụ: “Mở sách Toán lớp 4 - Tập 1”.`,
  }
}
