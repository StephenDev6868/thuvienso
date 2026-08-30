<script setup lang="ts">
import {
  Check,
  ChevronRight,
  Download,
  FlipHorizontal2,
  ImagePlus,
  LockKeyhole,
  Move,
  Palette,
  RefreshCcw,
  RotateCcw,
  RotateCw,
  ShieldCheck,
  Sparkles,
  Type,
  UploadCloud,
  ZoomIn,
  ZoomOut,
} from '@lucide/vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import frameReadingUrl from '@/assets/avatar-frames/frame-reading.png'
import frameSchoolUrl from '@/assets/avatar-frames/frame-school.png'
import frameStemUrl from '@/assets/avatar-frames/frame-stem.png'

type ThemeId = 'school' | 'stem' | 'reading'

interface AvatarTheme {
  id: ThemeId
  name: string
  description: string
  eyebrow: string
  primary: string
  secondary: string
  accent: string
  pale: string
}

const CANVAS_SIZE = 1080
const PHOTO_CENTER_X = 540
const PHOTO_CENTER_Y = 540
const PHOTO_RADIUS = 375
const AUTHORITY_TITLE = 'UỶ BAN NHÂN DÂN PHƯỜNG HOÀ KHÁNH'
const SCHOOL_TITLE = 'TRƯỜNG TIỂU HỌC BÙI THỊ XUÂN'

const frameUrls: Record<ThemeId, string> = {
  school: frameSchoolUrl,
  stem: frameStemUrl,
  reading: frameReadingUrl,
}

const themes: AvatarTheme[] = [
  {
    id: 'school',
    name: 'Khung đỏ',
    description: 'Mẫu đỏ tươi nguyên bản',
    eyebrow: 'TRƯỜNG TIỂU HỌC BÙI THỊ XUÂN',
    primary: '#e30613',
    secondary: '#ff2a17',
    accent: '#ffd15c',
    pale: '#fff0f2',
  },
  {
    id: 'stem',
    name: 'Khung xanh lá',
    description: 'Mẫu xanh lá nguyên bản',
    eyebrow: 'TRƯỜNG TIỂU HỌC BÙI THỊ XUÂN',
    primary: '#07831d',
    secondary: '#10ca25',
    accent: '#ffd34e',
    pale: '#eaf6ff',
  },
  {
    id: 'reading',
    name: 'Khung xanh dương',
    description: 'Mẫu xanh dương nguyên bản',
    eyebrow: 'TRƯỜNG TIỂU HỌC BÙI THỊ XUÂN',
    primary: '#063fc7',
    secondary: '#03a9ec',
    accent: '#ffcb57',
    pale: '#edf8ff',
  },
]

const canvas = ref<HTMLCanvasElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedThemeId = ref<ThemeId>('school')
const image = ref<HTMLImageElement | null>(null)
const imageName = ref('')
const zoom = ref(1)
const rotation = ref(0)
const flipped = ref(false)
const offsetX = ref(0)
const offsetY = ref(0)
const displayName = ref('Bạn tôi')
const message = ref('Chào mừng năm học mới')
const textColor = ref('#fff4ce')
const textSize = ref(42)
const isDraggingFile = ref(false)
const isMovingImage = ref(false)
const notice = ref('')
const framesReady = ref(0)

const frameOverlays = new Map<ThemeId, HTMLCanvasElement>()

let objectUrl = ''
let dragStartX = 0
let dragStartY = 0
let dragOriginX = 0
let dragOriginY = 0

const selectedTheme = computed(
  () => themes.find((theme) => theme.id === selectedThemeId.value) ?? themes[0],
)

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const safeRadius = Math.min(radius, width / 2, height / 2)
  context.beginPath()
  context.moveTo(x + safeRadius, y)
  context.arcTo(x + width, y, x + width, y + height, safeRadius)
  context.arcTo(x + width, y + height, x, y + height, safeRadius)
  context.arcTo(x, y + height, x, y, safeRadius)
  context.arcTo(x, y, x + width, y, safeRadius)
  context.closePath()
}

function fitText(context: CanvasRenderingContext2D, text: string, maxWidth: number, size: number) {
  let currentSize = size
  context.font = `900 ${currentSize}px Inter, Arial, sans-serif`
  while (context.measureText(text).width > maxWidth && currentSize > 24) {
    currentSize -= 2
    context.font = `900 ${currentSize}px Inter, Arial, sans-serif`
  }
  return currentSize
}

function drawStar(context: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  context.beginPath()
  for (let index = 0; index < 10; index += 1) {
    const angle = -Math.PI / 2 + (index * Math.PI) / 5
    const pointRadius = index % 2 === 0 ? radius : radius * 0.42
    const pointX = x + Math.cos(angle) * pointRadius
    const pointY = y + Math.sin(angle) * pointRadius
    if (index === 0) context.moveTo(pointX, pointY)
    else context.lineTo(pointX, pointY)
  }
  context.closePath()
  context.fill()
}

function drawTextOnArc(
  context: CanvasRenderingContext2D,
  text: string,
  radius: number,
  startAngle: number,
  endAngle: number,
  centerX = 540,
  centerY = 540,
  withStroke = false,
  horizontalScale = 1,
  tracking = 1.5,
) {
  if (!text) return
  const letters = [...text]
  const letterWidths = letters.map(
    (letter) => context.measureText(letter).width * horizontalScale + tracking,
  )
  const naturalSweep = letterWidths.reduce((total, width) => total + width, 0) / radius
  const maximumSweep = Math.abs(endAngle - startAngle)
  const sweep = Math.min(naturalSweep, maximumSweep)
  const widthScale = sweep / naturalSweep
  let currentAngle = (startAngle + endAngle - sweep) / 2

  letters.forEach((letter, index) => {
    const letterSweep = ((letterWidths[index] ?? 0) / radius) * widthScale
    const angle = currentAngle + letterSweep / 2
    context.save()
    context.translate(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius)
    context.rotate(angle + Math.PI / 2)
    context.scale(horizontalScale, 1)
    if (withStroke) context.strokeText(letter, 0, 0)
    context.fillText(letter, 0, 0)
    context.restore()
    currentAngle += letterSweep
  })
}

function drawSchoolRibbon(context: CanvasRenderingContext2D, theme: AvatarTheme) {
  const ribbonColor = theme.id === 'school' ? '#d7192d' : theme.secondary
  context.save()
  context.shadowColor = 'rgba(16, 24, 40, .28)'
  context.shadowBlur = 14
  context.shadowOffsetY = 7
  context.fillStyle = ribbonColor
  context.beginPath()
  context.moveTo(150, 148)
  context.lineTo(250, 126)
  context.lineTo(250, 205)
  context.lineTo(150, 190)
  context.lineTo(184, 169)
  context.closePath()
  context.fill()
  context.beginPath()
  context.moveTo(930, 148)
  context.lineTo(830, 126)
  context.lineTo(830, 205)
  context.lineTo(930, 190)
  context.lineTo(896, 169)
  context.closePath()
  context.fill()
  context.fillStyle = ribbonColor
  context.beginPath()
  context.moveTo(230, 119)
  context.quadraticCurveTo(540, 82, 850, 119)
  context.lineTo(833, 205)
  context.quadraticCurveTo(540, 172, 247, 205)
  context.closePath()
  context.fill()
  context.strokeStyle = '#ffffff'
  context.lineWidth = 7
  context.stroke()
  context.restore()

  context.fillStyle = '#ffffff'
  context.textAlign = 'center'
  const schoolSize = fitText(context, SCHOOL_TITLE, 535, 31)
  context.font = `900 ${schoolSize}px Inter, Arial, sans-serif`
  context.fillText(SCHOOL_TITLE, 540, 157)
}

function drawLaurel(context: CanvasRenderingContext2D, theme: AvatarTheme) {
  context.save()
  context.strokeStyle = theme.accent
  context.fillStyle = theme.accent
  context.lineCap = 'round'
  context.lineWidth = 8
  for (const side of [-1, 1]) {
    context.beginPath()
    context.moveTo(540 + side * 417, 688)
    context.quadraticCurveTo(540 + side * 482, 488, 540 + side * 407, 292)
    context.stroke()
    for (let index = 0; index < 8; index += 1) {
      const progress = index / 8
      const y = 650 - progress * 310
      const x = 540 + side * (425 + Math.sin(progress * Math.PI) * 24)
      context.save()
      context.translate(x, y)
      context.rotate(side * (-0.72 + progress * 0.45))
      context.beginPath()
      context.ellipse(0, 0, 16, 38, 0, 0, Math.PI * 2)
      context.fill()
      context.restore()
    }
  }
  context.restore()
}

function drawBooks(context: CanvasRenderingContext2D, x: number, y: number, scale = 1) {
  const books = [
    { width: 214, height: 45, color: '#f4b83f', shift: 0 },
    { width: 194, height: 42, color: '#20a378', shift: 17 },
    { width: 224, height: 43, color: '#ef493f', shift: -6 },
    { width: 178, height: 40, color: '#2f7fd2', shift: 27 },
  ]
  context.save()
  context.translate(x, y)
  context.scale(scale, scale)
  books.forEach((book, index) => {
    const bookY = -index * 39
    context.fillStyle = book.color
    roundedRect(context, book.shift, bookY, book.width, book.height, 11)
    context.fill()
    context.fillStyle = '#fff7df'
    roundedRect(context, book.shift + 13, bookY + 8, book.width - 24, book.height - 16, 7)
    context.fill()
    context.fillStyle = book.color
    context.fillRect(book.shift + 18, bookY + 8, 10, book.height - 16)
  })
  context.restore()
}

function drawGraduationCap(context: CanvasRenderingContext2D, x: number, y: number, scale = 1) {
  context.save()
  context.translate(x, y)
  context.scale(scale, scale)
  context.fillStyle = '#101827'
  context.beginPath()
  context.moveTo(-110, 0)
  context.lineTo(0, -48)
  context.lineTo(110, 0)
  context.lineTo(0, 50)
  context.closePath()
  context.fill()
  context.fillStyle = '#26344d'
  context.beginPath()
  context.moveTo(-68, 19)
  context.quadraticCurveTo(0, 76, 68, 19)
  context.lineTo(57, 76)
  context.quadraticCurveTo(0, 112, -57, 76)
  context.closePath()
  context.fill()
  context.strokeStyle = '#f4b83f'
  context.lineWidth = 7
  context.beginPath()
  context.moveTo(24, -5)
  context.quadraticCurveTo(104, 25, 83, 105)
  context.stroke()
  context.fillStyle = '#f4b83f'
  context.beginPath()
  context.arc(83, 105, 11, 0, Math.PI * 2)
  context.fill()
  context.restore()
}

function drawOpenBook(context: CanvasRenderingContext2D, x: number, y: number, scale = 1) {
  context.save()
  context.translate(x, y)
  context.scale(scale, scale)
  context.fillStyle = '#ffffff'
  context.strokeStyle = '#d8dce7'
  context.lineWidth = 6
  context.beginPath()
  context.moveTo(-170, -60)
  context.quadraticCurveTo(-88, -92, 0, -42)
  context.lineTo(0, 100)
  context.quadraticCurveTo(-88, 54, -170, 80)
  context.closePath()
  context.fill()
  context.stroke()
  context.beginPath()
  context.moveTo(0, -42)
  context.quadraticCurveTo(88, -92, 170, -60)
  context.lineTo(170, 80)
  context.quadraticCurveTo(88, 54, 0, 100)
  context.closePath()
  context.fill()
  context.stroke()
  context.strokeStyle = '#aeb8ca'
  context.lineWidth = 4
  for (const side of [-1, 1]) {
    for (let line = 0; line < 4; line += 1) {
      context.beginPath()
      context.moveTo(side * 22, -7 + line * 24)
      context.lineTo(side * (132 - line * 4), -32 + line * 25)
      context.stroke()
    }
  }
  context.restore()
}

function drawClock(context: CanvasRenderingContext2D, x: number, y: number, scale = 1) {
  context.save()
  context.translate(x, y)
  context.scale(scale, scale)
  context.fillStyle = '#ffffff'
  context.strokeStyle = '#202a3b'
  context.lineWidth = 10
  context.beginPath()
  context.arc(0, 0, 74, 0, Math.PI * 2)
  context.fill()
  context.stroke()
  context.fillStyle = '#202a3b'
  for (let hour = 0; hour < 12; hour += 1) {
    const angle = (hour * Math.PI) / 6
    context.beginPath()
    context.arc(Math.sin(angle) * 57, -Math.cos(angle) * 57, 4, 0, Math.PI * 2)
    context.fill()
  }
  context.strokeStyle = '#202a3b'
  context.lineWidth = 7
  context.lineCap = 'round'
  context.beginPath()
  context.moveTo(0, 0)
  context.lineTo(-4, -38)
  context.moveTo(0, 0)
  context.lineTo(31, 18)
  context.stroke()
  context.fillStyle = '#e62d3e'
  context.beginPath()
  context.arc(0, 0, 8, 0, Math.PI * 2)
  context.fill()
  context.restore()
}

function drawPencilCup(context: CanvasRenderingContext2D, x: number, y: number, scale = 1) {
  context.save()
  context.translate(x, y)
  context.scale(scale, scale)
  const colors = ['#ef3c4f', '#f6bd2f', '#2a83d7', '#26a46d', '#8a55cc']
  colors.forEach((color, index) => {
    context.save()
    context.translate(-48 + index * 24, -74 - (index % 2) * 17)
    context.rotate(-0.22 + index * 0.1)
    context.fillStyle = color
    roundedRect(context, -7, -74, 14, 132, 5)
    context.fill()
    context.fillStyle = '#f3d0a3'
    context.beginPath()
    context.moveTo(-7, -74)
    context.lineTo(0, -96)
    context.lineTo(7, -74)
    context.closePath()
    context.fill()
    context.restore()
  })
  context.fillStyle = '#1755ae'
  roundedRect(context, -70, -20, 140, 120, 22)
  context.fill()
  context.fillStyle = '#267bd7'
  roundedRect(context, -56, -7, 112, 90, 16)
  context.fill()
  context.restore()
}

function drawAtom(context: CanvasRenderingContext2D, x: number, y: number, scale = 1) {
  context.save()
  context.translate(x, y)
  context.scale(scale, scale)
  context.strokeStyle = '#ffffff'
  context.lineWidth = 10
  for (const angle of [0, Math.PI / 3, -Math.PI / 3]) {
    context.beginPath()
    context.ellipse(0, 0, 95, 35, angle, 0, Math.PI * 2)
    context.stroke()
  }
  context.fillStyle = '#ffd34e'
  context.beginPath()
  context.arc(0, 0, 19, 0, Math.PI * 2)
  context.fill()
  context.restore()
}

function drawThemeProps(context: CanvasRenderingContext2D, theme: AvatarTheme) {
  context.save()
  context.beginPath()
  context.arc(540, 540, 468, 0, Math.PI * 2)
  context.clip()
  if (theme.id === 'stem') {
    drawBooks(context, 95, 860, 0.88)
    drawAtom(context, 162, 780, 0.78)
    drawPencilCup(context, 908, 820, 0.8)
    context.fillStyle = theme.accent
    drawStar(context, 920, 700, 27)
  } else if (theme.id === 'reading') {
    drawBooks(context, 88, 860, 0.86)
    drawOpenBook(context, 895, 850, 0.63)
    context.fillStyle = theme.accent
    drawStar(context, 145, 742, 30)
    drawStar(context, 920, 690, 23)
  } else {
    drawBooks(context, 80, 870, 0.88)
    drawGraduationCap(context, 184, 720, 0.69)
    drawOpenBook(context, 902, 865, 0.56)
    drawClock(context, 805, 760, 0.68)
    drawPencilCup(context, 960, 780, 0.64)
  }
  context.restore()
}

function drawPlaceholder(context: CanvasRenderingContext2D, theme: AvatarTheme) {
  const placeholderGradient = context.createLinearGradient(180, 150, 840, 840)
  placeholderGradient.addColorStop(0, '#ffffff')
  placeholderGradient.addColorStop(1, theme.pale)
  context.fillStyle = placeholderGradient
  context.beginPath()
  context.arc(PHOTO_CENTER_X, PHOTO_CENTER_Y, PHOTO_RADIUS, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = theme.primary
  context.globalAlpha = 0.1
  context.beginPath()
  context.arc(540, 420, 128, 0, Math.PI * 2)
  context.fill()
  context.beginPath()
  context.ellipse(540, 720, 245, 205, 0, Math.PI, Math.PI * 2)
  context.fill()
  context.globalAlpha = 1
  context.fillStyle = theme.primary
  context.textAlign = 'center'
  context.font = '800 32px Inter, Arial, sans-serif'
  context.fillText('TẢI ẢNH CỦA BẠN', 540, 620)
}

function drawPhoto(context: CanvasRenderingContext2D) {
  if (!image.value) return
  const source = image.value
  const targetDiameter = PHOTO_RADIUS * 2
  const baseScale = Math.max(targetDiameter / source.naturalWidth, targetDiameter / source.naturalHeight)
  const scale = baseScale * zoom.value

  context.save()
  context.beginPath()
  context.arc(PHOTO_CENTER_X, PHOTO_CENTER_Y, PHOTO_RADIUS, 0, Math.PI * 2)
  context.clip()
  context.translate(PHOTO_CENTER_X + offsetX.value, PHOTO_CENTER_Y + offsetY.value)
  context.rotate((rotation.value * Math.PI) / 180)
  context.scale(flipped.value ? -scale : scale, scale)
  context.drawImage(source, -source.naturalWidth / 2, -source.naturalHeight / 2)
  context.restore()
}

function isCheckerboardPixel(data: Uint8ClampedArray, pixelIndex: number) {
  const offset = pixelIndex * 4
  const red = data[offset] ?? 0
  const green = data[offset + 1] ?? 0
  const blue = data[offset + 2] ?? 0
  const brightest = Math.max(red, green, blue)
  const darkest = Math.min(red, green, blue)
  return brightest > 178 && brightest - darkest < 15
}

function removeGeneratedCheckerboard(imageData: ImageData) {
  const { data, width, height } = imageData
  const totalPixels = width * height
  const visited = new Uint8Array(totalPixels)
  const stack = new Uint32Array(totalPixels)
  let stackSize = 0

  const addSeed = (pixelIndex: number) => {
    if (pixelIndex < 0 || pixelIndex >= totalPixels || visited[pixelIndex]) return
    if (!isCheckerboardPixel(data, pixelIndex)) return
    visited[pixelIndex] = 1
    stack[stackSize] = pixelIndex
    stackSize += 1
  }

  addSeed(0)
  addSeed(width - 1)
  addSeed((height - 1) * width)
  addSeed(totalPixels - 1)
  addSeed(Math.floor(height / 2) * width + Math.floor(width / 2))

  while (stackSize > 0) {
    stackSize -= 1
    const pixelIndex = stack[stackSize] ?? 0
    data[pixelIndex * 4 + 3] = 0
    const x = pixelIndex % width
    if (x > 0) addSeed(pixelIndex - 1)
    if (x < width - 1) addSeed(pixelIndex + 1)
    if (pixelIndex >= width) addSeed(pixelIndex - width)
    if (pixelIndex < totalPixels - width) addSeed(pixelIndex + width)
  }
}

function loadFrameOverlay(themeId: ThemeId, sourceUrl: string) {
  return new Promise<void>((resolve) => {
    const sourceImage = new Image()
    sourceImage.onload = () => {
      const sourceCanvas = document.createElement('canvas')
      sourceCanvas.width = sourceImage.naturalWidth
      sourceCanvas.height = sourceImage.naturalHeight
      const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true })
      if (!sourceContext) {
        resolve()
        return
      }
      sourceContext.drawImage(sourceImage, 0, 0)
      const pixels = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height)
      removeGeneratedCheckerboard(pixels)
      sourceContext.putImageData(pixels, 0, 0)

      const overlay = document.createElement('canvas')
      overlay.width = CANVAS_SIZE
      overlay.height = CANVAS_SIZE
      const overlayContext = overlay.getContext('2d')
      if (!overlayContext) {
        resolve()
        return
      }
      const scale = Math.min(
        CANVAS_SIZE / sourceCanvas.width,
        CANVAS_SIZE / sourceCanvas.height,
      )
      const frameWidth = sourceCanvas.width * scale
      const frameHeight = sourceCanvas.height * scale
      overlayContext.drawImage(
        sourceCanvas,
        (CANVAS_SIZE - frameWidth) / 2,
        (CANVAS_SIZE - frameHeight) / 2,
        frameWidth,
        frameHeight,
      )
      frameOverlays.set(themeId, overlay)
      framesReady.value += 1
      drawCanvas()
      resolve()
    }
    sourceImage.onerror = () => resolve()
    sourceImage.src = sourceUrl
  })
}

function drawPremiumFrame(
  context: CanvasRenderingContext2D,
  theme: AvatarTheme,
  overlay: HTMLCanvasElement,
) {
  context.fillStyle = '#e4e5e7'
  context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

  context.save()
  context.shadowColor = 'rgba(16, 24, 40, .35)'
  context.shadowBlur = 42
  context.shadowOffsetY = 22
  context.fillStyle = '#263044'
  context.beginPath()
  context.arc(540, 540, 505, 0, Math.PI * 2)
  context.fill()
  context.restore()

  if (image.value) drawPhoto(context)
  else drawPlaceholder(context, theme)

  context.drawImage(overlay, 0, 0, CANVAS_SIZE, CANVAS_SIZE)
}

function drawCanvas() {
  const context = canvas.value?.getContext('2d')
  if (!context || !canvas.value) return
  const theme = selectedTheme.value
  context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

  const premiumOverlay = frameOverlays.get(theme.id)
  if (premiumOverlay) {
    drawPremiumFrame(context, theme, premiumOverlay)
    return
  }

  context.fillStyle = '#e7e8eb'
  context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

  context.save()
  context.shadowColor = 'rgba(15, 23, 42, .34)'
  context.shadowBlur = 42
  context.shadowOffsetY = 24
  context.fillStyle = '#2f3441'
  context.beginPath()
  context.arc(540, 540, 500, 0, Math.PI * 2)
  context.fill()
  context.restore()

  const frameGradient = context.createLinearGradient(90, 80, 970, 990)
  frameGradient.addColorStop(0, theme.primary)
  frameGradient.addColorStop(0.56, theme.secondary)
  frameGradient.addColorStop(1, theme.primary)
  context.fillStyle = frameGradient
  context.beginPath()
  context.arc(540, 540, 492, 0, Math.PI * 2)
  context.fill()

  for (const [radius, color, width] of [
    [486, '#ffffff', 10],
    [474, theme.accent, 9],
    [461, '#ffffff', 6],
    [446, 'rgba(15, 23, 42, .28)', 3],
  ] as const) {
    context.strokeStyle = color
    context.lineWidth = width
    context.beginPath()
    context.arc(540, 540, radius, 0, Math.PI * 2)
    context.stroke()
  }

  context.fillStyle = '#ffffff'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = '900 31px Inter, Arial, sans-serif'
  context.shadowColor = 'rgba(0, 0, 0, .28)'
  context.shadowBlur = 5
  drawTextOnArc(context, AUTHORITY_TITLE, 435, -2.52, -0.62)
  context.shadowBlur = 0

  if (image.value) drawPhoto(context)
  else drawPlaceholder(context, theme)

  context.strokeStyle = '#ffffff'
  context.lineWidth = 11
  context.beginPath()
  context.arc(PHOTO_CENTER_X, PHOTO_CENTER_Y, PHOTO_RADIUS + 5, 0, Math.PI * 2)
  context.stroke()
  context.strokeStyle = theme.accent
  context.lineWidth = 8
  context.beginPath()
  context.arc(PHOTO_CENTER_X, PHOTO_CENTER_Y, PHOTO_RADIUS + 15, 0, Math.PI * 2)
  context.stroke()

  drawSchoolRibbon(context, theme)

  drawLaurel(context, theme)
  context.fillStyle = theme.accent
  for (const [x, y, radius] of [
    [915, 264, 18],
    [943, 310, 13],
    [160, 284, 13],
  ] as const) drawStar(context, x, y, radius)
  drawThemeProps(context, theme)

  const hasName = displayName.value.trim().length > 0
  const bannerY = hasName ? 815 : 845
  const bannerHeight = hasName ? 162 : 125
  context.save()
  context.shadowColor = 'rgba(14, 24, 42, .34)'
  context.shadowBlur = 18
  context.shadowOffsetY = 9
  context.fillStyle = theme.primary
  context.beginPath()
  context.moveTo(190, bannerY + 24)
  context.lineTo(105, bannerY + 3)
  context.lineTo(140, bannerY + bannerHeight / 2)
  context.lineTo(105, bannerY + bannerHeight - 3)
  context.lineTo(205, bannerY + bannerHeight - 25)
  context.closePath()
  context.fill()
  context.beginPath()
  context.moveTo(890, bannerY + 24)
  context.lineTo(975, bannerY + 3)
  context.lineTo(940, bannerY + bannerHeight / 2)
  context.lineTo(975, bannerY + bannerHeight - 3)
  context.lineTo(875, bannerY + bannerHeight - 25)
  context.closePath()
  context.fill()
  const bannerGradient = context.createLinearGradient(190, bannerY, 890, bannerY + bannerHeight)
  bannerGradient.addColorStop(0, theme.primary)
  bannerGradient.addColorStop(0.5, theme.secondary)
  bannerGradient.addColorStop(1, theme.primary)
  context.fillStyle = bannerGradient
  roundedRect(context, 180, bannerY, 720, bannerHeight, 42)
  context.fill()
  context.strokeStyle = '#ffffff'
  context.lineWidth = 7
  context.stroke()
  context.restore()

  if (hasName) {
    const nameSize = fitText(context, displayName.value.trim().toUpperCase(), 620, textSize.value + 5)
    context.fillStyle = textColor.value
    context.font = `900 ${nameSize}px Inter, Arial, sans-serif`
    context.fillText(displayName.value.trim().toUpperCase(), 540, bannerY + 55)
  }
  const messageSize = fitText(context, message.value.trim().toUpperCase(), 630, hasName ? textSize.value - 13 : textSize.value - 2)
  context.fillStyle = hasName ? theme.accent : textColor.value
  context.font = `800 ${messageSize}px Inter, Arial, sans-serif`
  context.fillText(message.value.trim().toUpperCase(), 540, bannerY + (hasName ? 112 : 65))

  context.fillStyle = '#ffffff'
  context.font = '900 18px Inter, Arial, sans-serif'
  context.fillText(theme.eyebrow, 540, 993)
}

function resetTransform() {
  zoom.value = 1
  rotation.value = 0
  flipped.value = false
  offsetX.value = 0
  offsetY.value = 0
}

function handleFile(file?: File) {
  if (!file) return
  if (!file.type.startsWith('image/')) {
    notice.value = 'Vui lòng chọn một tệp hình ảnh.'
    return
  }
  if (file.size > 15 * 1024 * 1024) {
    notice.value = 'Ảnh cần có dung lượng nhỏ hơn 15 MB.'
    return
  }

  if (objectUrl) URL.revokeObjectURL(objectUrl)
  objectUrl = URL.createObjectURL(file)
  const loadedImage = new Image()
  loadedImage.onload = () => {
    image.value = loadedImage
    imageName.value = file.name
    resetTransform()
    notice.value = 'Ảnh đã sẵn sàng để căn chỉnh.'
  }
  loadedImage.onerror = () => {
    notice.value = 'Không thể đọc ảnh này. Bạn hãy thử một ảnh khác.'
  }
  loadedImage.src = objectUrl
}

function handleDrop(event: DragEvent) {
  isDraggingFile.value = false
  handleFile(event.dataTransfer?.files?.[0])
}

function canvasPoint(event: PointerEvent) {
  const rect = canvas.value?.getBoundingClientRect()
  if (!rect) return { x: 0, y: 0 }
  return {
    x: ((event.clientX - rect.left) / rect.width) * CANVAS_SIZE,
    y: ((event.clientY - rect.top) / rect.height) * CANVAS_SIZE,
  }
}

function startMove(event: PointerEvent) {
  if (!image.value || !canvas.value) return
  const point = canvasPoint(event)
  const distance = Math.hypot(point.x - PHOTO_CENTER_X, point.y - PHOTO_CENTER_Y)
  if (distance > PHOTO_RADIUS) return
  isMovingImage.value = true
  dragStartX = point.x
  dragStartY = point.y
  dragOriginX = offsetX.value
  dragOriginY = offsetY.value
  canvas.value.setPointerCapture(event.pointerId)
}

function moveImage(event: PointerEvent) {
  if (!isMovingImage.value) return
  const point = canvasPoint(event)
  offsetX.value = dragOriginX + point.x - dragStartX
  offsetY.value = dragOriginY + point.y - dragStartY
}

function stopMove(event: PointerEvent) {
  isMovingImage.value = false
  if (canvas.value?.hasPointerCapture(event.pointerId)) canvas.value.releasePointerCapture(event.pointerId)
}

function handleWheel(event: WheelEvent) {
  if (!image.value) return
  zoom.value = Math.min(2.5, Math.max(0.75, zoom.value + (event.deltaY > 0 ? -0.05 : 0.05)))
}

function downloadAvatar() {
  if (!image.value || !canvas.value) {
    notice.value = 'Bạn hãy tải ảnh lên trước khi xuất kết quả.'
    fileInput.value?.click()
    return
  }
  drawCanvas()
  const link = document.createElement('a')
  link.download = `avatar-bui-thi-xuan-${selectedThemeId.value}.png`
  link.href = canvas.value.toDataURL('image/png', 1)
  link.click()
  notice.value = 'Đã tạo ảnh PNG chất lượng cao.'
}

function chooseTheme(themeId: ThemeId) {
  selectedThemeId.value = themeId
  notice.value = `Đã chọn chủ đề “${themes.find((theme) => theme.id === themeId)?.name}”.`
}

function nudgeZoom(delta: number) {
  zoom.value = Math.min(2.5, Math.max(0.75, Number((zoom.value + delta).toFixed(2))))
}

watch(
  [
    selectedThemeId,
    image,
    zoom,
    rotation,
    flipped,
    offsetX,
    offsetY,
    displayName,
    message,
    textColor,
    textSize,
  ],
  () => drawCanvas(),
)

onMounted(() => {
  void nextTick(drawCanvas)
  void Promise.all(
    (Object.entries(frameUrls) as [ThemeId, string][]).map(([themeId, sourceUrl]) =>
      loadFrameOverlay(themeId, sourceUrl),
    ),
  )
})

onBeforeUnmount(() => {
  if (objectUrl) URL.revokeObjectURL(objectUrl)
})
</script>

<template>
  <main class="avatar-page pb-16 pt-3 sm:pt-6">
    <section class="page-shell">
      <div class="hero-card relative overflow-hidden rounded-[34px] px-5 py-8 sm:px-9 lg:px-12 lg:py-10">
        <div class="hero-orb hero-orb-one" />
        <div class="hero-orb hero-orb-two" />
        <div class="relative z-10 max-w-3xl">
          <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-white/18 px-4 py-2 text-xs font-black tracking-[0.12em] text-white backdrop-blur">
            <Sparkles :size="16" />
            GÓC SÁNG TẠO
          </div>
          <h1 class="max-w-2xl text-3xl font-black leading-tight tracking-[-0.035em] text-white sm:text-4xl lg:text-5xl">
            Thay avatar theo chủ đề
          </h1>
          <p class="mt-4 max-w-2xl text-sm font-semibold leading-7 text-white/85 sm:text-base">
            Chọn một trong ba màu khung của trường, tải ảnh và căn chỉnh để tạo avatar.
          </p>
          <div class="mt-6 flex flex-wrap gap-3 text-xs font-extrabold text-white/90">
            <span class="inline-flex items-center gap-2 rounded-full bg-black/12 px-3 py-2"><ShieldCheck :size="15" /> Ảnh được xử lý riêng tư</span>
            <span class="inline-flex items-center gap-2 rounded-full bg-black/12 px-3 py-2"><Download :size="15" /> Tải PNG chất lượng cao</span>
          </div>
        </div>
      </div>

      <div class="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.02fr)_minmax(400px,.98fr)]">
        <section class="panel p-4 sm:p-6" aria-labelledby="preview-title">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div>
              <p class="section-kicker">Xem trước</p>
              <h2 id="preview-title" class="mt-1 text-xl font-black text-ink-950">Avatar của bạn</h2>
            </div>
            <span class="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-2 text-xs font-extrabold text-emerald-700 sm:inline-flex">
              <LockKeyhole :size="14" /> Không lưu ảnh
            </span>
          </div>

          <div
            class="preview-stage relative mx-auto max-w-[620px] rounded-[30px] p-3 sm:p-5"
            :class="{ 'is-dropping': isDraggingFile }"
            @dragenter.prevent="isDraggingFile = true"
            @dragover.prevent="isDraggingFile = true"
            @dragleave.prevent="isDraggingFile = false"
            @drop.prevent="handleDrop"
          >
            <canvas
              ref="canvas"
              :width="CANVAS_SIZE"
              :height="CANVAS_SIZE"
              class="block aspect-square w-full touch-none rounded-[24px] bg-white shadow-[0_24px_55px_-30px_rgba(24,32,51,.55)]"
              :class="image ? (isMovingImage ? 'cursor-grabbing' : 'cursor-grab') : ''"
              aria-label="Bản xem trước avatar theo chủ đề"
              @pointerdown="startMove"
              @pointermove="moveImage"
              @pointerup="stopMove"
              @pointercancel="stopMove"
              @wheel.prevent="handleWheel"
            />
            <div v-if="isDraggingFile" class="drop-overlay pointer-events-none absolute inset-3 grid place-items-center rounded-[24px] sm:inset-5">
              <div class="rounded-3xl bg-white px-7 py-5 text-center shadow-xl">
                <UploadCloud :size="34" class="mx-auto text-red-500" />
                <strong class="mt-2 block text-sm">Thả ảnh vào đây</strong>
              </div>
            </div>
          </div>

          <div v-if="image" class="mt-5 rounded-[22px] bg-slate-50 p-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <span class="min-w-0 truncate text-sm font-bold text-slate-600">{{ imageName }}</span>
              <button type="button" class="tool-button" @click="fileInput?.click()"><ImagePlus :size="17" /> Đổi ảnh</button>
            </div>
            <div class="mt-4 grid grid-cols-[auto_1fr_auto] items-center gap-3">
              <button type="button" class="icon-button" aria-label="Thu nhỏ" @click="nudgeZoom(-0.1)"><ZoomOut :size="18" /></button>
              <input v-model.number="zoom" type="range" min="0.75" max="2.5" step="0.01" aria-label="Mức thu phóng ảnh" class="accent-red-500" />
              <button type="button" class="icon-button" aria-label="Phóng to" @click="nudgeZoom(0.1)"><ZoomIn :size="18" /></button>
            </div>
            <div class="mt-3 flex flex-wrap gap-2">
              <button type="button" class="tool-button" @click="rotation -= 90"><RotateCcw :size="17" /> Xoay trái</button>
              <button type="button" class="tool-button" @click="rotation += 90"><RotateCw :size="17" /> Xoay phải</button>
              <button type="button" class="tool-button" :class="{ active: flipped }" @click="flipped = !flipped"><FlipHorizontal2 :size="17" /> Lật ảnh</button>
              <button type="button" class="tool-button" @click="resetTransform"><RefreshCcw :size="17" /> Đặt lại</button>
            </div>
            <p class="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500"><Move :size="15" /> Kéo trực tiếp trên ảnh hoặc cuộn để thu phóng.</p>
          </div>

          <button v-else type="button" class="upload-button mt-5" @click="fileInput?.click()">
            <span class="grid size-11 place-items-center rounded-2xl bg-white/16"><UploadCloud :size="23" /></span>
            <span class="text-left"><strong class="block">Tải ảnh lên</strong><small class="mt-0.5 block font-semibold text-white/75">JPG, PNG, WEBP • Tối đa 15 MB</small></span>
          </button>
          <input ref="fileInput" type="file" accept="image/*" class="sr-only" @change="handleFile(($event.target as HTMLInputElement).files?.[0])" />
        </section>

        <div class="space-y-6">
          <section class="panel p-5 sm:p-6" aria-labelledby="theme-title">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="section-kicker">Bước 1</p>
                <h2 id="theme-title" class="mt-1 text-xl font-black">Chọn màu khung</h2>
              </div>
              <Palette :size="25" class="text-red-500" />
            </div>
            <div class="mt-5 grid grid-cols-3 gap-3">
              <button
                v-for="theme in themes"
                :key="theme.id"
                type="button"
                class="theme-card text-left"
                :class="{ selected: selectedThemeId === theme.id }"
                :aria-pressed="selectedThemeId === theme.id"
                @click="chooseTheme(theme.id)"
              >
                <span
                  class="theme-swatch generated-frame-swatch"
                  :style="{
                    '--theme-a': theme.primary,
                    '--theme-b': theme.secondary,
                    '--theme-c': theme.accent,
                    backgroundImage: `url(${frameUrls[theme.id]})`,
                  }"
                >
                  <span v-if="selectedThemeId === theme.id" class="selected-check"><Check :size="14" stroke-width="4" /></span>
                </span>
                <strong class="mt-2.5 block text-sm leading-snug">{{ theme.name }}</strong>
                <small class="mt-1 hidden text-[11px] font-semibold leading-4 text-slate-500 sm:block">{{ theme.description }}</small>
              </button>
            </div>
          </section>

          <section class="panel p-5 sm:p-6" aria-labelledby="text-title">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="section-kicker">Bước 2</p>
                <h2 id="text-title" class="mt-1 text-xl font-black">Nội dung cố định theo mẫu</h2>
              </div>
              <Type :size="25" class="text-red-500" />
            </div>
            <div class="fixed-copy-panel mt-5">
              <span class="grid size-10 shrink-0 place-items-center rounded-2xl bg-blue-100 text-blue-700"><LockKeyhole :size="20" /></span>
              <div>
                <strong class="block text-sm font-black text-ink-950">Chữ và logo đã được đóng vào khung</strong>
                <p class="mt-1 text-xs font-semibold leading-5 text-slate-500">
                  Cả ba khung được sử dụng nguyên bản, gồm sẵn logo Trường Tiểu học Bùi Thị Xuân và nội dung “Chào mừng năm học mới 2026 - 2027”.
                </p>
              </div>
            </div>
          </section>

          <section class="panel overflow-hidden p-3">
            <button type="button" class="download-button" @click="downloadAvatar"><Download :size="21" /> Tải avatar PNG</button>
            <p v-if="notice" class="px-3 pb-2 pt-3 text-center text-xs font-bold text-slate-500" role="status">{{ notice }}</p>
          </section>
        </div>
      </div>

      <section class="mt-6 grid gap-4 rounded-[30px] bg-white/90 p-5 shadow-card sm:grid-cols-3 sm:p-7" aria-label="Hướng dẫn nhanh">
        <div v-for="(step, index) in ['Chọn màu khung phù hợp', 'Tải ảnh và kéo để căn chỉnh', 'Kiểm tra rồi tải avatar PNG']" :key="step" class="guide-step">
          <span>{{ index + 1 }}</span><p>{{ step }}</p><component :is="index < 2 ? ChevronRight : Check" :size="18" class="ml-auto text-red-400" />
        </div>
      </section>
    </section>
  </main>
</template>

<style scoped>
.avatar-page { min-height: calc(100vh - 7rem); }
.hero-card { background: linear-gradient(125deg, #c7182a 0%, #e93244 52%, #ff7959 100%); box-shadow: 0 26px 70px -36px rgb(135 19 35 / .65); }
.hero-orb { position: absolute; border-radius: 999px; background: rgb(255 255 255 / .12); }
.hero-orb-one { width: 310px; height: 310px; right: 8%; top: -150px; }
.hero-orb-two { width: 220px; height: 220px; right: -55px; bottom: -105px; }
.panel { border: 1px solid rgb(255 255 255 / .82); border-radius: 30px; background: rgb(255 255 255 / .94); box-shadow: 0 22px 60px -38px rgb(24 32 51 / .42); backdrop-filter: blur(18px); }
.section-kicker { color: #df2133; font-size: 11px; font-weight: 900; letter-spacing: .14em; text-transform: uppercase; }
.preview-stage { background: linear-gradient(145deg, #fff1f2, #f4f8ff); border: 2px dashed transparent; transition: border-color .2s, background .2s; }
.preview-stage.is-dropping { border-color: #df2133; background: #fff0f2; }
.drop-overlay { background: rgb(223 33 51 / .16); backdrop-filter: blur(3px); }
.upload-button { display: flex; width: 100%; align-items: center; justify-content: center; gap: 14px; border-radius: 20px; background: linear-gradient(115deg, #df2133, #f05b42); padding: 14px 20px; color: white; box-shadow: 0 16px 32px -20px rgb(223 33 51 / .75); transition: transform .2s, box-shadow .2s; }
.upload-button:hover { transform: translateY(-2px); box-shadow: 0 20px 36px -18px rgb(223 33 51 / .72); }
.tool-button { display: inline-flex; min-height: 38px; align-items: center; gap: 7px; border-radius: 12px; border: 1px solid #e2e8f0; background: white; padding: 7px 11px; color: #475569; font-size: 12px; font-weight: 800; transition: .2s; }
.tool-button:hover, .tool-button.active { border-color: #fda4af; background: #fff1f2; color: #df2133; }
.icon-button { display: grid; width: 38px; height: 38px; place-items: center; border-radius: 12px; background: white; color: #df2133; box-shadow: 0 4px 14px -8px rgb(24 32 51 / .4); }
.theme-card { position: relative; border: 2px solid #eef1f5; border-radius: 19px; padding: 9px; transition: transform .2s, border-color .2s, box-shadow .2s; }
.theme-card:hover { transform: translateY(-2px); border-color: #fecdd3; }
.theme-card.selected { border-color: #df2133; box-shadow: 0 12px 25px -20px rgb(223 33 51 / .8); }
.theme-swatch { position: relative; display: grid; aspect-ratio: 1.7; place-items: center; overflow: hidden; border-radius: 13px; background: linear-gradient(135deg, var(--theme-a), var(--theme-b)); }
.theme-swatch:not(.generated-frame-swatch)::before, .theme-swatch:not(.generated-frame-swatch)::after { position: absolute; border-radius: 999px; background: var(--theme-c); content: ''; opacity: .88; }
.theme-swatch::before { width: 24px; height: 24px; left: 12px; top: 10px; }
.theme-swatch::after { width: 16px; height: 16px; right: 14px; bottom: 12px; }
.generated-frame-swatch { background-color: #f1f3f5; background-position: center; background-repeat: no-repeat; background-size: contain; }
.selected-check { position: absolute; right: 7px; top: 7px; display: grid; width: 24px; height: 24px; place-items: center; border-radius: 999px; background: white; color: #df2133; }
.field-label { display: block; color: #334155; font-size: 12px; font-weight: 900; }
.field-label span { color: #94a3b8; font-weight: 700; }
.fixed-copy-panel { display: flex; align-items: flex-start; gap: 12px; border: 1px solid #bfdbfe; border-radius: 18px; background: #eff6ff; padding: 14px; }
.field-input { margin-top: 7px; display: block; width: 100%; height: 46px; border: 1px solid #e2e8f0; border-radius: 14px; background: #f8fafc; padding: 0 14px; color: #182033; font-size: 14px; font-weight: 700; outline: none; transition: .2s; }
.field-input:focus { border-color: #fb7185; background: white; box-shadow: 0 0 0 4px rgb(244 63 94 / .08); }
.download-button { display: flex; width: 100%; min-height: 58px; align-items: center; justify-content: center; gap: 10px; border-radius: 20px; background: linear-gradient(115deg, #df2133, #f05b42); color: white; font-size: 15px; font-weight: 900; box-shadow: 0 17px 30px -18px rgb(223 33 51 / .78); transition: transform .2s; }
.download-button:hover { transform: translateY(-2px); }
.guide-step { display: flex; min-height: 58px; align-items: center; gap: 12px; border-radius: 18px; background: #fff7f7; padding: 11px 14px; }
.guide-step span { display: grid; width: 34px; height: 34px; flex: 0 0 auto; place-items: center; border-radius: 12px; background: #df2133; color: white; font-size: 13px; font-weight: 900; }
.guide-step p { color: #334155; font-size: 12px; font-weight: 800; }
@media (max-width: 639px) { .panel { border-radius: 24px; } .hero-card { border-radius: 26px; } }
</style>
