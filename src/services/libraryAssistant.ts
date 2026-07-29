import {
  digitalBooks,
  digitalResources,
  digitalTeacherBooks,
  digitalTextbooks,
  extractRequestedGrade,
  normalizeBookText,
  searchDigitalBooks,
} from '@/data/digitalLibrary'

export interface LibraryAssistantReply {
  content: string
  openBookId?: string
}

const availableLibraryGrades = Array.from(
  new Set(digitalTextbooks.flatMap((book) => (book.grade ? [book.grade] : []))),
).sort()
const availableLibraryGradeLabel = availableLibraryGrades.join(', ')

export function getLibraryAssistantReply(message: string): LibraryAssistantReply {
  const normalized = normalizeBookText(message)
  const matches = searchDigitalBooks(message)
  const openIntent = /\b(doc|mo|xem)\b/.test(normalized)
  const requestedGrade = extractRequestedGrade(message)
  const asksForLifeSkills =
    normalized.includes('ky nang song') ||
    normalized.includes('an toan giao thong') ||
    normalized.includes('bao luc hoc duong')
  const asksForTeacherResources =
    normalized.includes('giao vien') ||
    normalized.includes('khbd') ||
    normalized.includes('ke hoach bai day') ||
    normalized.includes('van ban bgd') ||
    normalized.includes('tap huan')
  const asksForTeacherBooks =
    normalized.includes('sach giao vien') || normalized.split(' ').includes('sgv')
  const catalogIntent =
    !openIntent &&
    (normalized.includes('kho sach') ||
      normalized.includes('kho tai lieu') ||
      normalized.includes('danh sach') ||
      normalized.includes('nhung mon nao') ||
      normalized.includes('sach gi') ||
      normalized.includes('tai lieu gi'))

  if (catalogIntent && asksForLifeSkills) {
    const resources = digitalResources.filter((book) => book.kind === 'life-skill')
    const topics = Array.from(new Set(resources.map((book) => book.subject)))
    return {
      content: `Kho Kỹ năng sống hiện có ${resources.length} tài liệu thuộc các chủ đề: ${topics.join(', ')}. Bạn có thể nói “Mở tài liệu…” kèm tên hoặc chủ đề.`,
    }
  }

  if (catalogIntent && asksForTeacherBooks) {
    const availableBooks = requestedGrade
      ? digitalTeacherBooks.filter((book) => book.grade === requestedGrade)
      : digitalTeacherBooks
    const subjects = Array.from(new Set(availableBooks.map((book) => book.subject)))
    const scope = requestedGrade ? ` lớp ${requestedGrade}` : ''
    return {
      content: `Kho Sách giáo viên${scope} hiện có ${availableBooks.length} cuốn: ${subjects.join(', ')}. Bạn có thể nói “Mở sách giáo viên…” kèm môn, lớp và tập.`,
    }
  }

  if (catalogIntent && asksForTeacherResources) {
    const resources = digitalResources.filter((book) => book.kind === 'teacher-resource')
    const topics = Array.from(new Set(resources.map((book) => book.subject)))
    const formats = Array.from(new Set(resources.map((book) => book.format.toUpperCase())))
    return {
      content: `Kho giáo viên hiện có ${resources.length} tài liệu (${formats.join(', ')}) gồm: ${topics.join(', ')}. Bạn có thể yêu cầu mở kế hoạch bài dạy, văn bản hoặc bài tập huấn theo tên.`,
    }
  }

  if (catalogIntent) {
    const availableBooks = requestedGrade
      ? digitalTextbooks.filter((book) => book.grade === requestedGrade)
      : digitalTextbooks
    const subjects = Array.from(new Set(availableBooks.map((book) => book.subject)))
    const scope = requestedGrade
      ? `lớp ${requestedGrade}`
      : `các lớp ${availableLibraryGrades.join(', ')}`
    return {
      content: `Kho thư viện hiện có ${availableBooks.length} cuốn SGK ${scope} thuộc các môn: ${subjects.join(', ')}. Ngoài ra còn có ${digitalTeacherBooks.length} sách giáo viên có liên kết đọc trực tuyến và ${digitalResources.length} tài liệu Kỹ năng sống, tài liệu chuyên môn ở định dạng PDF, Word, PowerPoint. Bạn chỉ cần nói “Mở…” kèm tên tài liệu.`,
    }
  }

  if (openIntent) {
    if (!matches.length) {
      return {
        content: `Mình chưa tìm thấy tài liệu đó trong kho. Bạn có thể hỏi “Kho sách có những môn nào?”, “Kho Kỹ năng sống có gì?” hoặc “Danh sách tài liệu giáo viên”.`,
      }
    }

    const bestMatch = matches[0]!
    if (bestMatch.kind === 'teacher-book') {
      const sameSubjectBooks = digitalTeacherBooks.filter(
        (book) => book.subject === bestMatch.subject,
      )
      const availableGrades = Array.from(
        new Set(sameSubjectBooks.flatMap((book) => (book.grade ? [book.grade] : []))),
      ).sort()
      const requestedVolume = /\btap\s*[12]\b/.test(normalized)

      if (!requestedGrade && availableGrades.length > 1) {
        return {
          content: `Sách giáo viên ${bestMatch.subject} hiện có lớp ${availableGrades.join(', lớp ')}. Bạn muốn mở sách lớp nào?`,
        }
      }

      const sameGradeVolumes = sameSubjectBooks.filter(
        (book) => book.grade === bestMatch.grade && book.volume,
      )
      if (!requestedVolume && sameGradeVolumes.length > 1) {
        return {
          content: `Sách giáo viên ${bestMatch.subject} lớp ${bestMatch.grade} có ${sameGradeVolumes.map((book) => `Tập ${book.volume}`).join(' và ')}. Bạn muốn mở tập nào?`,
        }
      }

      return {
        content: `Mình đã tìm thấy “${bestMatch.title}”. Đang mở sách trực tuyến từ hệ thống NXBGD cho bạn...`,
        openBookId: bestMatch.id,
      }
    }

    if (bestMatch.kind !== 'textbook') {
      const pageLabel = bestMatch.pageCount
        ? ` (${bestMatch.pageCount} ${bestMatch.viewerType === 'office' ? 'slide' : 'trang'})`
        : ''
      return {
        content: `Mình đã tìm thấy “${bestMatch.title}”${pageLabel}, định dạng ${bestMatch.format.toUpperCase()}. Đang mở trình xem tài liệu cho bạn...`,
        openBookId: bestMatch.id,
      }
    }

    const sameSubjectBooks = matches.filter((book) => book.subject === bestMatch.subject)
    const availableGrades = Array.from(
      new Set(sameSubjectBooks.flatMap((book) => (book.grade ? [book.grade] : []))),
    ).sort()
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
      content: `Mình tìm thấy: ${suggestions
        .map(
          (book) =>
            `“${book.title}”${book.pageCount ? ` (${book.pageCount} ${book.viewerType === 'office' ? 'slide' : 'trang'})` : ''}`,
        )
        .join(', ')}. Hãy nói “Mở…” kèm tên tài liệu bạn muốn xem.`,
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
    content: `Mình có thể tìm và mở trực tiếp ${digitalTextbooks.length} cuốn SGK, ${digitalTeacherBooks.length} sách giáo viên lớp 3–5 cùng ${digitalResources.length} tài liệu Kỹ năng sống và tài liệu chuyên môn. Ví dụ: “Mở sách giáo viên Toán lớp 4 tập 1”, “Mở kỹ năng quản trị cảm xúc” hoặc “Mở KHBD Toán lớp 3 tuần 19”.`,
  }
}
