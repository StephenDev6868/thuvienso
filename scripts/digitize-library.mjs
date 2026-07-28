import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { stdout } from 'node:process'
import { fileURLToPath } from 'node:url'
import { format, resolveConfig } from 'prettier'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const coverDirectory = join(projectRoot, 'src/assets/book-covers')
const catalogFile = join(projectRoot, 'src/data/digital-library.json')
const manifestDirectory = join(projectRoot, 'src/data/digital-library')
const prettierConfig = (await resolveConfig(catalogFile)) ?? {}

const collections = [
  {
    id: 'sgk-lop-1',
    sourceFolder: 'SGK_1',
    grade: 1,
    title: 'Sách giáo khoa lớp 1',
  },
  {
    id: 'sgk-lop-2',
    sourceFolder: 'SGK_2',
    grade: 2,
    title: 'Sách giáo khoa lớp 2',
  },
  {
    id: 'sgk-lop-3',
    sourceFolder: 'SGK_3',
    grade: 3,
    title: 'Sách giáo khoa lớp 3',
  },
  {
    id: 'sgk-lop-4',
    sourceFolder: 'SGK_4',
    grade: 4,
    title: 'Sách giáo khoa lớp 4',
  },
  {
    id: 'sgk-lop-5',
    sourceFolder: 'SGK_5',
    grade: 5,
    title: 'Sách giáo khoa lớp 5',
  },
]

const titleOverrides = {
  'Am nhac 1.pdf': 'Âm nhạc 1',
  'Dao duc 1.pdf': 'Đạo đức 1',
  'Giao duc The chat 1.pdf': 'Giáo dục Thể chất 1',
  'Hoat dong trai nghiem 1.pdf': 'Hoạt động trải nghiệm 1',
  'My thuat 1.pdf': 'Mỹ thuật 1',
  'Tieng Anh 1.pdf': 'Tiếng Anh 1',
  'Tieng Viet 1 Tap 1.pdf': 'Tiếng Việt 1 - Tập 1',
  'Tieng Viet 1 Tap 2.pdf': 'Tiếng Việt 1 - Tập 2',
  'Toan 1 Tap 1.pdf': 'Toán 1 - Tập 1',
  'Toan 1 Tap 2.pdf': 'Toán 1 - Tập 2',
  'Tu nhien va Xa hoi 1.pdf': 'Tự nhiên và Xã hội 1',
  'GDTC 4.pdf': 'Giáo dục Thể chất 4',
}

const subjectDetails = {
  'Âm nhạc': {
    accent: '#8757f2',
    keywords: ['âm nhạc', 'bài hát', 'nhịp điệu'],
  },
  'Công nghệ': {
    accent: '#0f9f85',
    keywords: ['công nghệ', 'kỹ thuật', 'sáng tạo'],
  },
  'Giáo dục thể chất': {
    accent: '#2aa66c',
    keywords: ['thể chất', 'thể dục', 'vận động'],
  },
  'Hoạt động trải nghiệm': {
    accent: '#ff7045',
    keywords: ['trải nghiệm', 'kỹ năng', 'hoạt động'],
  },
  'Khoa học': {
    accent: '#2aa66c',
    keywords: ['khoa học', 'thí nghiệm', 'tự nhiên'],
  },
  'Lịch sử và Địa lí': {
    accent: '#b7791f',
    keywords: ['lịch sử', 'địa lí', 'việt nam', 'thế giới'],
  },
  'Mỹ thuật': {
    accent: '#e84d8a',
    keywords: ['mỹ thuật', 'mĩ thuật', 'vẽ', 'màu sắc', 'sáng tạo'],
  },
  'Tin học': {
    accent: '#2563eb',
    keywords: ['tin học', 'máy tính', 'công nghệ thông tin'],
  },
  'Tiếng Anh': {
    accent: '#3e6ff4',
    keywords: ['tiếng anh', 'english', 'ngoại ngữ'],
  },
  'Tiếng Việt': {
    accent: '#df2133',
    keywords: ['tiếng việt', 'đọc', 'viết', 'ngữ văn'],
  },
  Toán: {
    accent: '#315fd7',
    keywords: ['toán', 'số học', 'hình học', 'giải toán'],
  },
  'Tự nhiên và Xã hội': {
    accent: '#2aa66c',
    keywords: ['tự nhiên', 'xã hội', 'khoa học', 'gia đình'],
  },
  'Đạo đức': {
    accent: '#df2133',
    keywords: ['đạo đức', 'kỹ năng sống', 'ứng xử'],
  },
}

function normalizeTitle(fileName) {
  if (titleOverrides[fileName]) {
    return titleOverrides[fileName]
  }

  return fileName
    .replace(/\.pdf$/i, '')
    .replace(/\s*-?\s*Kết nối tri thức với cuộc sống$/i, '')
    .replace(/\s+(tập)\s*([12])$/i, ' - Tập $2')
    .replace(/^Mĩ thuật/i, 'Mĩ thuật')
    .replace(/^Tự nhiên và xã hội/i, 'Tự nhiên và Xã hội')
}

function normalizeSubject(title) {
  const subject = title
    .replace(/\s+\d+\s*(?:-\s*Tập\s*[12])?$/i, '')
    .replace(/^Mĩ thuật$/i, 'Mỹ thuật')
    .replace(/^Giáo dục Thể chất$/i, 'Giáo dục thể chất')
    .replace(/^Lịch sử và địa lí$/i, 'Lịch sử và Địa lí')
  return subject
}

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\bva\b/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function createBookMetadata(fileName, collection) {
  const title = normalizeTitle(fileName)
  const subject = normalizeSubject(title)
  const volume = Number(title.match(/\bTập\s*([12])\b/i)?.[1] ?? 0) || undefined
  const details = subjectDetails[subject] ?? {
    accent: '#64748b',
    keywords: [subject.toLowerCase()],
  }
  const volumeSuffix = volume ? `-tap-${volume}` : ''

  return {
    id: `sgk${collection.grade}-${slugify(subject)}${volumeSuffix}`,
    title,
    subject,
    ...(volume ? { volume } : {}),
    description: `Sách giáo khoa ${subject} dành cho học sinh lớp ${collection.grade}${volume ? `, tập ${volume}` : ''}.`,
    keywords: [
      ...details.keywords,
      `lớp ${collection.grade}`,
      ...(volume ? [`tập ${volume}`] : []),
    ],
    accent: details.accent,
  }
}

function parsePdfInfo(filePath) {
  const output = execFileSync('pdfinfo', [filePath], { encoding: 'utf8' })
  const pages = Number(output.match(/^Pages:\s+(\d+)/m)?.[1] ?? 0)
  const fileSizeBytes = Number(output.match(/^File size:\s+(\d+)/m)?.[1] ?? 0)
  const sizeMatch = output.match(/^Page size:\s+([\d.]+) x ([\d.]+) pts/m)

  return {
    pageCount: pages,
    fileSizeBytes,
    pageWidth: Number(sizeMatch?.[1] ?? 595),
    pageHeight: Number(sizeMatch?.[2] ?? 842),
  }
}

async function writeJson(filePath, value) {
  const json = await format(JSON.stringify(value), { ...prettierConfig, parser: 'json' })
  writeFileSync(filePath, json)
}

mkdirSync(coverDirectory, { recursive: true })
mkdirSync(manifestDirectory, { recursive: true })

const books = collections.flatMap((collection) => {
  const sourceDirectory = join(projectRoot, 'src/data', collection.sourceFolder)
  if (!existsSync(sourceDirectory)) {
    throw new Error(`Không tìm thấy kho PDF: ${sourceDirectory}`)
  }

  const pdfFiles = readdirSync(sourceDirectory)
    .filter((fileName) => fileName.toLowerCase().endsWith('.pdf'))
    .sort((left, right) => left.localeCompare(right, 'vi'))

  return pdfFiles.map((fileName) => {
    const bookMetadata = createBookMetadata(fileName, collection)
    const pdfPath = join(sourceDirectory, fileName)
    const pdfInfo = parsePdfInfo(pdfPath)
    const coverFileName = `${bookMetadata.id}.jpg`
    const coverPrefix = join(coverDirectory, bookMetadata.id)

    execFileSync('pdftoppm', [
      '-f',
      '1',
      '-l',
      '1',
      '-singlefile',
      '-jpeg',
      '-jpegopt',
      'quality=88',
      '-scale-to',
      '1200',
      pdfPath,
      coverPrefix,
    ])

    return {
      ...bookMetadata,
      grade: collection.grade,
      sourceFolder: collection.sourceFolder,
      fileName,
      coverFileName,
      ...pdfInfo,
    }
  })
})

const collectionSummaries = collections.map((collection) => {
  const collectionBooks = books.filter((book) => book.grade === collection.grade)
  return {
    id: collection.id,
    title: collection.title,
    description: `Thư viện số sách giáo khoa lớp ${collection.grade}, đọc trực tiếp trên trình duyệt.`,
    grade: collection.grade,
    bookCount: collectionBooks.length,
    totalPages: collectionBooks.reduce((total, book) => total + book.pageCount, 0),
  }
})

const catalog = {
  schemaVersion: 2,
  collection: {
    id: 'sgk-tieu-hoc',
    title: 'Kho sách giáo khoa tiểu học',
    description: 'Thư viện số sách giáo khoa đầy đủ từ lớp 1 đến lớp 5.',
    grades: collections.map((collection) => collection.grade),
    bookCount: books.length,
    totalPages: books.reduce((total, book) => total + book.pageCount, 0),
  },
  collections: collectionSummaries,
  books,
}

await writeJson(catalogFile, catalog)
for (const book of books) {
  await writeJson(join(manifestDirectory, `${book.id}.json`), { schemaVersion: 1, book })
}
stdout.write(`Đã số hóa ${books.length} sách vào ${catalogFile}\n`)
stdout.write(`Đã tạo ${books.length} hồ sơ JSON trong ${manifestDirectory}\n`)
stdout.write(`Đã tạo ${books.length} ảnh bìa trong ${coverDirectory}\n`)
