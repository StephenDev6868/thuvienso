import { execFileSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, extname, join, relative, resolve } from 'node:path'
import { stdout } from 'node:process'
import { fileURLToPath } from 'node:url'
import { format, resolveConfig } from 'prettier'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dataDirectory = join(projectRoot, 'src/data')
const coverDirectory = join(projectRoot, 'src/assets/resource-covers')
const catalogFile = join(dataDirectory, 'digital-resources.json')
const manifestDirectory = join(dataDirectory, 'digital-resources')
const previewDirectory = join(projectRoot, 'public/office-previews')
const prettierConfig = (await resolveConfig(catalogFile)) ?? {}
const supportedExtensions = new Set(['.pdf', '.docx', '.ppt', '.pptx'])

const collections = [
  {
    id: 'ky-nang-song',
    sourceFolder: 'KỸ NĂNG SỐNG',
    kind: 'life-skill',
    title: 'Kỹ năng sống',
    description: 'Tài liệu giáo dục kỹ năng sống, an toàn và phát triển bản thân.',
    accent: '#ff7045',
  },
  {
    id: 'tai-lieu-giao-vien',
    sourceFolder: 'TÀI LIỆU CHO GIÁO VIÊN',
    kind: 'teacher-resource',
    title: 'Tài liệu cho giáo viên',
    description: 'Kế hoạch bài dạy, văn bản ngành và tài liệu tập huấn dành cho giáo viên.',
    accent: '#315fd7',
  },
]

const titleOverrides = {
  'tai-lieu-gd-atgt-lop-1.pdf': 'Tài liệu giáo dục an toàn giao thông lớp 1',
  'tai-lieu-gd-atgt-lop-3.pdf': 'Tài liệu giáo dục an toàn giao thông lớp 3',
  'tai-lieu-gd-atgt-lop-4.pdf': 'Tài liệu giáo dục an toàn giao thông lớp 4',
  'Truyện chuyen_di_den_hanh_tinh_rac.pdf': 'Truyện Chuyến đi đến hành tinh rác',
  'Truyện nhat_ky_lac_loi_cua_Pin_Pin.pdf': 'Truyện Nhật ký lạc lối của Pin Pin',
  'Truyện truytimmauxanh.pdf': 'Truyện Truy tìm màu xanh',
  'GIAO-DUC-GIOI-TINH-CHO-TRE.pdf': 'Giáo dục giới tính cho trẻ',
  'Giao-Duc-Gioi-Tinh-Cho-Tre-Nhung-DJieu-Ba-Me-Can-Biet.pdf':
    'Giáo dục giới tính cho trẻ - Những điều ba mẹ cần biết',
  'CHUYEN DE NANG CAO DAY HOC VIET SANG TAO.ppt': 'Chuyên đề nâng cao dạy học viết sáng tạo',
  'Tập huấn dieu chinh CT môn LS& ĐL_Tieu hoc_12 .2025.pptx':
    'Tập huấn điều chỉnh chương trình môn Lịch sử và Địa lí tiểu học 12.2025',
}

function normalizeText(value) {
  return value.normalize('NFC').replace(/\s+/g, ' ').trim()
}

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith('.')) return []
    const entryPath = join(directory, entry.name)
    if (entry.isDirectory()) return listFiles(entryPath)
    return supportedExtensions.has(extname(entry.name).toLowerCase()) ? [entryPath] : []
  })
}

function normalizeTitle(fileName) {
  if (titleOverrides[fileName]) return titleOverrides[fileName]
  return normalizeText(
    basename(fileName, extname(fileName))
      .replace(/^\d+\.\s*/, '')
      .replace(/_/g, ' ')
      .replace(/\s+-\s+/g, ' - '),
  )
}

function extractGrade(filePath) {
  const normalized = filePath
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .toLowerCase()
  return Number(normalized.match(/\blop[\s._-]*([1-5])\b/)?.[1] ?? 0) || undefined
}

function getTeacherSubject(relativePath, title) {
  const searchable = `${relativePath} ${title}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .toLowerCase()

  if (searchable.includes('khbd')) {
    if (searchable.includes('tieng viet')) return 'Kế hoạch bài dạy - Tiếng Việt'
    if (searchable.includes('tu nhien va xa hoi')) {
      return 'Kế hoạch bài dạy - Tự nhiên và Xã hội'
    }
    if (searchable.includes('khoa hoc')) return 'Kế hoạch bài dạy - Khoa học'
    if (searchable.includes('dao duc')) return 'Kế hoạch bài dạy - Đạo đức'
    if (searchable.includes('toan')) return 'Kế hoạch bài dạy - Toán'
    return 'Kế hoạch bài dạy'
  }
  if (searchable.includes('van ban cua bgd')) return 'Văn bản BGD&ĐT'
  return 'Tài liệu tập huấn'
}

function getSubject(collection, relativePath, title) {
  if (collection.kind === 'teacher-resource') return getTeacherSubject(relativePath, title)
  return normalizeText(relativePath.split('/')[0] ?? collection.title)
}

function createKeywords(collection, relativePath, title, subject, extension, grade) {
  const folders = dirname(relativePath)
    .split('/')
    .filter((part) => part !== '.')
    .map(normalizeText)
  return Array.from(
    new Set([
      collection.title.toLowerCase(),
      subject.toLowerCase(),
      extension.slice(1),
      ...folders.map((folder) => folder.toLowerCase()),
      ...title.toLowerCase().split(/[^\p{L}\p{N}]+/gu),
      ...(grade ? [`lớp ${grade}`] : []),
      ...(extension === '.docx' ? ['word', 'docx'] : []),
      ...(extension === '.ppt' || extension === '.pptx'
        ? ['powerpoint', 'bài trình chiếu', 'slide']
        : []),
    ]),
  ).filter((keyword) => keyword.length > 1)
}

function parsePdfInfo(filePath) {
  const output = execFileSync('pdfinfo', [filePath], { encoding: 'utf8' })
  const sizeMatch = output.match(/^Page size:\s+([\d.]+) x ([\d.]+) pts/m)
  return {
    pageCount: Number(output.match(/^Pages:\s+(\d+)/m)?.[1] ?? 0),
    fileSizeBytes: Number(output.match(/^File size:\s+(\d+)/m)?.[1] ?? statSync(filePath).size),
    pageWidth: Number(sizeMatch?.[1] ?? 595),
    pageHeight: Number(sizeMatch?.[2] ?? 842),
  }
}

function createPdfCover(pdfPath, coverPathPrefix) {
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
    coverPathPrefix,
  ])
}

function findGeneratedPreview(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name)
    if (entry.isDirectory()) {
      const nestedPreview = findGeneratedPreview(entryPath)
      if (nestedPreview) return nestedPreview
    } else if (entry.name === 'Preview.html') {
      return dirname(entryPath)
    }
  }
  return undefined
}

function createOfficePreview(filePath, itemId) {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'stempai-office-preview-'))
  const outputDirectory = join(previewDirectory, itemId)
  try {
    execFileSync('qlmanage', ['-p', '-o', temporaryDirectory, filePath], { stdio: 'ignore' })
    const generatedPreview = findGeneratedPreview(temporaryDirectory)
    if (!generatedPreview) throw new Error(`Không tạo được bản xem trước Office: ${filePath}`)
    rmSync(outputDirectory, { force: true, recursive: true })
    cpSync(generatedPreview, outputDirectory, { recursive: true })
  } finally {
    rmSync(temporaryDirectory, { force: true, recursive: true })
  }

  const previewHtml = readFileSync(join(outputDirectory, 'Preview.html'), 'utf8')
  const slideCount = Array.from(previewHtml.matchAll(/<div class="slide"/g)).length
  return {
    previewPath: `/office-previews/${itemId}/Preview.html`,
    ...(slideCount ? { pageCount: slideCount } : {}),
  }
}

function createOfficeCover(filePath, coverFileName) {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'stempai-office-cover-'))
  try {
    execFileSync('qlmanage', ['-t', '-s', '1200', '-o', temporaryDirectory, filePath], {
      stdio: 'ignore',
    })
    const generatedCover = readdirSync(temporaryDirectory).find((file) =>
      file.toLowerCase().endsWith('.png'),
    )
    if (!generatedCover) throw new Error(`Không tạo được ảnh bìa Office: ${filePath}`)
    cpSync(join(temporaryDirectory, generatedCover), join(coverDirectory, coverFileName))
  } finally {
    rmSync(temporaryDirectory, { force: true, recursive: true })
  }
}

async function writeJson(filePath, value) {
  const json = await format(JSON.stringify(value), { ...prettierConfig, parser: 'json' })
  writeFileSync(filePath, json)
}

mkdirSync(coverDirectory, { recursive: true })
mkdirSync(manifestDirectory, { recursive: true })
mkdirSync(previewDirectory, { recursive: true })

const documents = collections.flatMap((collection) => {
  const sourceDirectory = join(dataDirectory, collection.sourceFolder)
  if (!existsSync(sourceDirectory)) {
    throw new Error(`Không tìm thấy kho tài liệu: ${sourceDirectory}`)
  }

  return listFiles(sourceDirectory)
    .sort((left, right) => left.localeCompare(right, 'vi'))
    .map((filePath) => {
      const relativePath = relative(sourceDirectory, filePath).normalize('NFC')
      const fileName = basename(filePath).normalize('NFC')
      const extension = extname(fileName).toLowerCase()
      const title = normalizeTitle(fileName)
      const grade = extractGrade(relativePath)
      const subject = getSubject(collection, relativePath, title)
      const id = `${collection.id}-${slugify(relativePath.replace(extension, ''))}`
      const isPdf = extension === '.pdf'
      const coverFileName = `${id}.${isPdf ? 'jpg' : 'png'}`

      const commonMetadata = {
        id,
        title,
        subject,
        description:
          collection.kind === 'life-skill'
            ? `Tài liệu ${subject.toLowerCase()} dành cho học sinh và gia đình.`
            : `Tài liệu ${subject.toLowerCase()} dành cho giáo viên.`,
        ...(grade ? { grade } : {}),
        keywords: createKeywords(collection, relativePath, title, subject, extension, grade),
        accent: collection.accent,
        kind: collection.kind,
        collectionId: collection.id,
        collectionTitle: collection.title,
        format: extension.slice(1),
        sourceFolder: collection.sourceFolder,
        relativePath,
        fileName,
        coverFileName,
        fileSizeBytes: statSync(filePath).size,
      }

      if (isPdf) {
        const pdfInfo = parsePdfInfo(filePath)
        createPdfCover(filePath, join(coverDirectory, id))
        return {
          ...commonMetadata,
          viewerType: 'pdf',
          ...pdfInfo,
        }
      }

      const previewInfo = createOfficePreview(filePath, id)
      createOfficeCover(filePath, coverFileName)
      return {
        ...commonMetadata,
        viewerType: 'office',
        ...previewInfo,
      }
    })
})

const collectionSummaries = collections.map((collection) => {
  const collectionDocuments = documents.filter(
    (document) => document.collectionId === collection.id,
  )
  return {
    ...collection,
    documentCount: collectionDocuments.length,
    totalPages: collectionDocuments.reduce(
      (total, document) => total + (document.pageCount ?? 0),
      0,
    ),
    formats: Array.from(new Set(collectionDocuments.map((document) => document.format))).sort(),
  }
})

const catalog = {
  schemaVersion: 1,
  collection: {
    id: 'hoc-lieu-mo-rong',
    title: 'Kho học liệu mở rộng',
    description: 'Tài liệu kỹ năng sống và tài liệu chuyên môn dành cho giáo viên.',
    documentCount: documents.length,
    totalPages: documents.reduce((total, document) => total + (document.pageCount ?? 0), 0),
    formats: Array.from(new Set(documents.map((document) => document.format))).sort(),
  },
  collections: collectionSummaries,
  documents,
}

await writeJson(catalogFile, catalog)
for (const document of documents) {
  await writeJson(join(manifestDirectory, `${document.id}.json`), {
    schemaVersion: 1,
    document,
  })
}

stdout.write(`Đã số hóa ${documents.length} tài liệu vào ${catalogFile}\n`)
stdout.write(`Đã tạo ${documents.length} hồ sơ JSON trong ${manifestDirectory}\n`)
stdout.write(`Đã tạo ${documents.length} ảnh bìa trong ${coverDirectory}\n`)
stdout.write(
  `Đã tạo bản xem trước cho ${documents.filter((document) => document.viewerType === 'office').length} tệp Office trong ${previewDirectory}\n`,
)
