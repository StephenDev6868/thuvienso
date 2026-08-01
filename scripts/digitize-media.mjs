import { execFileSync, spawnSync } from 'node:child_process'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, extname, join, relative, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { stdout } from 'node:process'
import { fileURLToPath } from 'node:url'
import { format, resolveConfig } from 'prettier'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dataRoot = join(projectRoot, 'src/data')
const catalogDirectory = join(dataRoot, 'digital-media')
const ebookCoverDirectory = join(projectRoot, 'src/assets/ebook-covers')
const audioCoverDirectory = join(projectRoot, 'src/assets/audio-covers')
const videoThumbnailDirectory = join(projectRoot, 'src/assets/video-thumbnails')
const prettierConfig = (await resolveConfig(join(dataRoot, 'digital-library.json'))) ?? {}

function findSourceFolder(expectedName) {
  const entry = readdirSync(dataRoot, { withFileTypes: true }).find(
    (item) => item.isDirectory() && item.name.normalize('NFC') === expectedName.normalize('NFC'),
  )
  if (!entry) throw new Error(`Không tìm thấy thư mục nguồn: src/data/${expectedName}`)
  return entry.name
}

const sources = {
  ebooks: findSourceFolder('Sách điện tử'),
  audio: findSourceFolder('Sách nói'),
  videos: findSourceFolder('video học tập'),
}

function listFiles(directory, extension) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = join(directory, entry.name)
    if (entry.isDirectory()) return listFiles(filePath, extension)
    return extname(entry.name).toLowerCase() === extension ? [filePath] : []
  })
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

function cleanTitle(fileName) {
  return fileName
    .replace(/\.(pdf|mp3|mp4)$/i, '')
    .replace(/^\s*\[?sách nói\]?\s*/i, '')
    .replace(/^\s*sách điện tử\s*/i, '')
    .replace(/^\s*1\s*\.?(?:\s*pdf)?\s*[-–]?\s*/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.:])/g, '$1')
    .trim()
}

function categoryFromPath(sourceDirectory, filePath) {
  const parts = relative(sourceDirectory, filePath).split(/[\\/]/)
  return {
    category: parts[0]?.normalize('NFC') ?? 'Khác',
    subcategory: parts.length > 2 ? parts.slice(1, -1).join(' / ').normalize('NFC') : undefined,
  }
}

function extractGrade(value) {
  const normalized = value.normalize('NFC')
  return Number(normalized.match(/(?:lớp|lop)\s*([1-5])/i)?.[1] ?? 0) || undefined
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '00:00'
  const rounded = Math.round(seconds)
  const hours = Math.floor(rounded / 3600)
  const minutes = Math.floor((rounded % 3600) / 60)
  const remainingSeconds = rounded % 60
  return hours
    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

function getMp3Duration(filePath) {
  const buffer = readFileSync(filePath)
  let offset = 0
  if (buffer.toString('ascii', 0, 3) === 'ID3' && buffer.length >= 10) {
    const tagSize =
      ((buffer[6] & 0x7f) << 21) |
      ((buffer[7] & 0x7f) << 14) |
      ((buffer[8] & 0x7f) << 7) |
      (buffer[9] & 0x7f)
    offset = 10 + tagSize
  }

  const bitrateTables = {
    '1-3': [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
    '2-3': [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
  }

  for (let index = offset; index < Math.min(buffer.length - 4, offset + 64_000); index += 1) {
    if (buffer[index] !== 0xff || (buffer[index + 1] & 0xe0) !== 0xe0) continue
    const versionBits = (buffer[index + 1] >> 3) & 0x03
    const layerBits = (buffer[index + 1] >> 1) & 0x03
    const bitrateIndex = (buffer[index + 2] >> 4) & 0x0f
    if (layerBits !== 1 || bitrateIndex === 0 || bitrateIndex === 15) continue
    const version = versionBits === 3 ? '1' : '2'
    const bitrate = bitrateTables[`${version}-3`]?.[bitrateIndex]
    if (bitrate) return ((buffer.length - index) * 8) / (bitrate * 1000)
  }
  return 0
}

function readUInt64BE(buffer, offset) {
  return Number(buffer.readBigUInt64BE(offset))
}

function findMp4Duration(buffer, start = 0, end = buffer.length) {
  let offset = start
  while (offset + 8 <= end) {
    let size = buffer.readUInt32BE(offset)
    const type = buffer.toString('ascii', offset + 4, offset + 8)
    let headerSize = 8
    if (size === 1 && offset + 16 <= end) {
      size = readUInt64BE(buffer, offset + 8)
      headerSize = 16
    } else if (size === 0) {
      size = end - offset
    }
    if (size < headerSize || offset + size > end) break
    if (type === 'mvhd') {
      const dataOffset = offset + headerSize
      const version = buffer[dataOffset]
      const timeScaleOffset = dataOffset + (version === 1 ? 20 : 12)
      const durationOffset = timeScaleOffset + 4
      const timeScale = buffer.readUInt32BE(timeScaleOffset)
      const duration =
        version === 1 ? readUInt64BE(buffer, durationOffset) : buffer.readUInt32BE(durationOffset)
      return timeScale ? duration / timeScale : 0
    }
    if (['moov', 'trak', 'mdia'].includes(type)) {
      const nested = findMp4Duration(buffer, offset + headerSize, offset + size)
      if (nested) return nested
    }
    offset += size
  }
  return 0
}

function getMp4Duration(filePath) {
  return findMp4Duration(readFileSync(filePath))
}

function parsePdfInfo(filePath) {
  const output = execFileSync('pdfinfo', [filePath], { encoding: 'utf8' })
  const sizeMatch = output.match(/^Page size:\s+([\d.]+) x ([\d.]+) pts/m)
  return {
    pageCount: Number(output.match(/^Pages:\s+(\d+)/m)?.[1] ?? 0),
    pageWidth: Number(sizeMatch?.[1] ?? 595),
    pageHeight: Number(sizeMatch?.[2] ?? 842),
  }
}

function escapeXml(value) {
  return value.replace(
    /[<>&'"]/g,
    (character) =>
      ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character],
  )
}

function createAudioCover(filePath, title, category, index) {
  const palettes = [
    ['#6254c7', '#9b7ef2'],
    ['#db526b', '#ff9a67'],
    ['#148c83', '#61c7a2'],
    ['#216bb2', '#68bde0'],
    ['#bd7117', '#ffc75c'],
    ['#77509a', '#da91d5'],
  ]
  const [dark, light] = palettes[index % palettes.length]
  const words = title.split(' ')
  const lines = [
    words.slice(0, Math.ceil(words.length / 2)).join(' '),
    words.slice(Math.ceil(words.length / 2)).join(' '),
  ].filter(Boolean)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="960" viewBox="0 0 720 960">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs>
  <rect width="720" height="960" rx="44" fill="url(#g)"/><circle cx="585" cy="135" r="120" fill="#fff" opacity=".13"/><circle cx="90" cy="830" r="160" fill="#fff" opacity=".1"/>
  <path d="M245 450v-75c0-128 230-128 230 0v75" fill="none" stroke="#fff" stroke-width="30" stroke-linecap="round"/><rect x="200" y="425" width="75" height="155" rx="34" fill="#fff"/><rect x="445" y="425" width="75" height="155" rx="34" fill="#fff"/><path d="M275 565c40 45 130 45 170 0" fill="none" stroke="#fff" stroke-width="18" stroke-linecap="round"/>
  <text x="360" y="90" fill="#fff" opacity=".9" text-anchor="middle" font-family="Arial,sans-serif" font-size="25" font-weight="700">${escapeXml(category.toUpperCase())}</text>
  ${lines.map((line, lineIndex) => `<text x="360" y="${700 + lineIndex * 62}" fill="#fff" text-anchor="middle" font-family="Arial,sans-serif" font-size="47" font-weight="800">${escapeXml(line)}</text>`).join('')}
  <text x="360" y="890" fill="#fff" opacity=".82" text-anchor="middle" font-family="Arial,sans-serif" font-size="25">THƯ VIỆN SỐ • SÁCH NÓI</text></svg>`
  writeFileSync(filePath, svg)
}

function createVideoFallback(filePath, title, grade, index) {
  const colors = ['#50aa81', '#ef9f40', '#b47ac0', '#4ca0cc', '#9b755c', '#3d9a91']
  const color = colors[index % colors.length]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="${color}"/><circle cx="110" cy="90" r="160" fill="#fff" opacity=".12"/><circle cx="1170" cy="650" r="230" fill="#fff" opacity=".12"/><circle cx="640" cy="315" r="92" fill="#fff" opacity=".94"/><path d="M620 265l82 50-82 50z" fill="#ed4050"/><text x="640" y="520" fill="#fff" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="46">${escapeXml(title)}</text><text x="640" y="585" fill="#fff" opacity=".84" text-anchor="middle" font-family="Arial,sans-serif" font-size="30">${grade ? `LỚP ${grade} • ` : ''}VIDEO HỌC TẬP</text></svg>`
  writeFileSync(filePath, svg)
}

function createVideoThumbnail(videoPath, outputBasePath, fallbackPath, title, grade, index) {
  const temporaryDirectory = join(tmpdir(), `stemp-video-${slugify(basename(videoPath))}`)
  mkdirSync(temporaryDirectory, { recursive: true })
  const result = spawnSync('qlmanage', ['-t', '-s', '1280', '-o', temporaryDirectory, videoPath], {
    stdio: 'ignore',
  })
  const generated = existsSync(temporaryDirectory)
    ? readdirSync(temporaryDirectory).find((fileName) => fileName.endsWith('.png'))
    : undefined
  if (result.status === 0 && generated) {
    copyFileSync(join(temporaryDirectory, generated), `${outputBasePath}.png`)
    return `${basename(outputBasePath)}.png`
  }
  createVideoFallback(fallbackPath, title, grade, index)
  return basename(fallbackPath)
}

async function writeJson(filePath, value) {
  const json = await format(JSON.stringify(value), { ...prettierConfig, parser: 'json' })
  writeFileSync(filePath, json)
}

for (const directory of [
  catalogDirectory,
  ebookCoverDirectory,
  audioCoverDirectory,
  videoThumbnailDirectory,
]) {
  mkdirSync(directory, { recursive: true })
}

const ebookSourceDirectory = join(dataRoot, sources.ebooks)
const ebooks = listFiles(ebookSourceDirectory, '.pdf')
  .sort((left, right) => left.localeCompare(right, 'vi'))
  .map((filePath) => {
    const relativePath = relative(ebookSourceDirectory, filePath).normalize('NFC')
    const title = cleanTitle(basename(filePath).normalize('NFC'))
    const { category, subcategory } = categoryFromPath(ebookSourceDirectory, filePath)
    const id = `ebook-${slugify(relativePath.replace(/\.pdf$/i, ''))}`
    const coverFileName = `${id}.jpg`
    execFileSync('pdftoppm', [
      '-f',
      '1',
      '-l',
      '1',
      '-singlefile',
      '-jpeg',
      '-jpegopt',
      'quality=86',
      '-scale-to',
      '1000',
      filePath,
      join(ebookCoverDirectory, id),
    ])
    return {
      id,
      title,
      category,
      ...(subcategory ? { subcategory } : {}),
      description: `Sách điện tử “${title}” thuộc chủ đề ${subcategory || category}.`,
      grade: extractGrade(`${relativePath} ${title}`),
      keywords: [title, category, subcategory, 'sách điện tử', 'ebook'].filter(Boolean),
      accent: '#0f8f83',
      kind: 'ebook',
      format: 'pdf',
      viewerType: 'pdf',
      sourceFolder: sources.ebooks.normalize('NFC'),
      relativePath,
      fileName: basename(filePath).normalize('NFC'),
      coverFileName,
      fileSizeBytes: statSync(filePath).size,
      ...parsePdfInfo(filePath),
    }
  })

const audioSourceDirectory = join(dataRoot, sources.audio)
const audioBooks = listFiles(audioSourceDirectory, '.mp3')
  .sort((left, right) => left.localeCompare(right, 'vi'))
  .map((filePath, index) => {
    const relativePath = relative(audioSourceDirectory, filePath).normalize('NFC')
    const title = cleanTitle(basename(filePath).normalize('NFC'))
    const { category, subcategory } = categoryFromPath(audioSourceDirectory, filePath)
    const id = `audio-${slugify(relativePath.replace(/\.mp3$/i, ''))}`
    const coverFileName = `${id}.svg`
    const durationSeconds = getMp3Duration(filePath)
    createAudioCover(join(audioCoverDirectory, coverFileName), title, category, index)
    return {
      id,
      title,
      category,
      ...(subcategory ? { subcategory } : {}),
      description: `Sách nói “${title}” thuộc chủ đề ${category}.`,
      grade: extractGrade(`${relativePath} ${title}`),
      keywords: [title, category, subcategory, 'sách nói', 'audio', 'nghe'].filter(Boolean),
      accent: ['#6254c7', '#db526b', '#148c83', '#216bb2', '#bd7117', '#77509a'][index % 6],
      format: 'mp3',
      sourceFolder: sources.audio.normalize('NFC'),
      relativePath,
      fileName: basename(filePath).normalize('NFC'),
      coverFileName,
      fileSizeBytes: statSync(filePath).size,
      durationSeconds: Math.round(durationSeconds),
      duration: formatDuration(durationSeconds),
    }
  })

const videoSourceDirectory = join(dataRoot, sources.videos)
const videos = listFiles(videoSourceDirectory, '.mp4')
  .sort((left, right) => left.localeCompare(right, 'vi'))
  .map((filePath, index) => {
    const relativePath = relative(videoSourceDirectory, filePath).normalize('NFC')
    const title = cleanTitle(basename(filePath).normalize('NFC'))
    const { category, subcategory } = categoryFromPath(videoSourceDirectory, filePath)
    const grade = extractGrade(`${relativePath} ${title}`)
    const id = `video-${slugify(relativePath.replace(/\.mp4$/i, ''))}`
    const durationSeconds = getMp4Duration(filePath)
    const coverFileName = createVideoThumbnail(
      filePath,
      join(videoThumbnailDirectory, id),
      join(videoThumbnailDirectory, `${id}.svg`),
      title,
      grade,
      index,
    )
    return {
      id,
      title,
      category,
      ...(subcategory ? { subcategory } : {}),
      description: `Video học tập “${title}”${grade ? ` dành cho học sinh lớp ${grade}` : ''}.`,
      grade,
      subject: 'Tiếng Việt',
      lesson: Number(title.match(/bài\s*(\d+)/i)?.[1] ?? 0) || undefined,
      volume: Number(title.match(/tập\s*([12])/i)?.[1] ?? 0) || undefined,
      keywords: [
        title,
        category,
        subcategory,
        'video học tập',
        'bài giảng',
        grade ? `lớp ${grade}` : undefined,
      ].filter(Boolean),
      accent: ['#50aa81', '#ef9f40', '#b47ac0', '#4ca0cc', '#9b755c', '#3d9a91'][index % 6],
      format: 'mp4',
      sourceFolder: sources.videos.normalize('NFC'),
      relativePath,
      fileName: basename(filePath).normalize('NFC'),
      coverFileName,
      fileSizeBytes: statSync(filePath).size,
      durationSeconds: Math.round(durationSeconds),
      duration: formatDuration(durationSeconds),
    }
  })

const catalogs = [
  [
    'ebooks',
    {
      schemaVersion: 1,
      collection: {
        id: 'sach-dien-tu',
        title: 'Sách điện tử',
        itemCount: ebooks.length,
        totalPages: ebooks.reduce((sum, item) => sum + item.pageCount, 0),
      },
      items: ebooks,
    },
  ],
  [
    'audiobooks',
    {
      schemaVersion: 1,
      collection: {
        id: 'sach-noi',
        title: 'Sách nói',
        itemCount: audioBooks.length,
        totalDurationSeconds: audioBooks.reduce((sum, item) => sum + item.durationSeconds, 0),
      },
      items: audioBooks,
    },
  ],
  [
    'videos',
    {
      schemaVersion: 1,
      collection: {
        id: 'video-bai-giang',
        title: 'Video bài giảng',
        itemCount: videos.length,
        totalDurationSeconds: videos.reduce((sum, item) => sum + item.durationSeconds, 0),
      },
      items: videos,
    },
  ],
]

for (const [name, catalog] of catalogs)
  await writeJson(join(dataRoot, `digital-${name}.json`), catalog)
for (const item of [...ebooks, ...audioBooks, ...videos])
  await writeJson(join(catalogDirectory, `${item.id}.json`), { schemaVersion: 1, item })

stdout.write(
  `Đã số hóa ${ebooks.length} sách điện tử, ${audioBooks.length} sách nói và ${videos.length} video.\n`,
)
stdout.write(
  `Đã cập nhật catalog và ${ebooks.length + audioBooks.length + videos.length} hồ sơ nội dung.\n`,
)
