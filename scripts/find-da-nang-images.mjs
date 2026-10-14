/* global URL, URLSearchParams, fetch, setTimeout, console */
import fs from 'node:fs/promises'

const content = JSON.parse(
  await fs.readFile(new URL('../src/data/da-nang-content.json', import.meta.url)),
)
const searchAliases = {
  'thanh-dien-hai': 'Dien Hai',
  'dinh-hai-chau': 'Hai Chau',
  'dinh-nai-nam': 'Nai Nam',
  'dinh-thac-gian': 'Thac Gian',
  'nghia-trung-go-do': 'Go Do',
  'bai-bien-my-khe': 'My Khe',
  'ban-dao-son-tra': 'Son Tra',
  'chua-linh-ung-son-tra': 'Linh Ung',
  'lang-chai-man-thai': 'Man Thai',
  'ngu-hanh-son': 'Marble Mountains',
  'lang-da-non-nuoc': 'Non Nuoc',
  k20: 'K20 Da Nang',
  'dinh-an-ngai-dong': 'An Ngai Dong',
  'hai-van-quan': 'Hai Van',
  'lang-nam-o': 'Nam O',
  'song-cu-de': 'Cu De',
  'b1-hong-phuoc': 'Hong Phuoc',
  'phong-le': 'Phong Le',
  'dinh-phong-le': 'Phong Le',
  'nha-tho-qua-giang': 'Qua Giang',
  'phu-duong-tam-ky': 'Tam Ky',
  'tuong-dai-me-vnah': 'Vietnamese heroic mother monument',
  'lang-bich-hoa-tam-thanh': 'Tam Thanh mural',
  'bien-tam-thanh': 'Tam Thanh Beach',
  'lang-hoa-sua-huong-tra': 'Huong Tra',
  'dinh-huong-tra': 'Huong Tra',
  'dia-dao-ky-anh': 'Ky Anh tunnel',
  'bai-say-song-dam': 'Song Dam',
  'van-thanh-khong-mieu': 'Confucian temple Quang Nam',
  'lang-duc-dong-phuoc-kieu': 'Phuoc Kieu',
  'dinh-tran-thanh-chiem': 'Thanh Chiem',
  'bien-ha-my': 'Ha My Beach',
  'thap-bang-an': 'Bang An Tower',
  'doi-bo-bo': 'Bo Bo Hill',
  'pho-co-hoi-an': 'Hoi An',
  'chua-cau': 'Japanese Bridge Hoi An',
  'lang-moc-kim-bong': 'Kim Bong',
  'rung-dua-bay-mau': 'Cam Thanh coconut',
  'bien-cua-dai': 'Cua Dai',
  'lang-gom-thanh-ha': 'Thanh Ha pottery',
  'lang-rau-tra-que': 'Tra Que',
  'bien-an-bang': 'An Bang Beach',
  'thanh-dia-my-son': 'My Son Sanctuary',
  'ba-na-hills': 'Ba Na Hills',
  'cu-lao-cham': 'Cham Islands',
}
const targets = [
  ...content.places.map((place) => ({
    id: `place-${place.id}`,
    name: place.name,
    query: place.media?.cover?.searchQuery || `${place.name} Đà Nẵng Việt Nam`,
    searchTitle: searchAliases[place.id] || place.name,
  })),
]

const normalize = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
const importantWords = (value) =>
  normalize(value)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !['phuong', 'thanh', 'pho'].includes(word))
const stripHtml = (value = '') =>
  value
    .replace(/<[^>]+>/g, '')
    .replace(/&[^;]+;/g, ' ')
    .trim()

async function findImage(target) {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: `intitle:"${normalize(target.searchTitle)}"`,
    gsrnamespace: '6',
    gsrlimit: '8',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: '1200',
    format: 'json',
    origin: '*',
  })
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    headers: { 'User-Agent': 'StempAI-DaNangImageResearch/1.0 (educational-library)' },
  })
  if (!response.ok) throw new Error(`${response.status} ${target.id}`)
  const payload = await response.json()
  const words = importantWords(target.name)
  const candidates = Object.values(payload.query?.pages ?? {})
    .map((page) => {
      const info = page.imageinfo?.[0]
      const title = page.title.replace(/^File:/, '')
      const normalizedTitle = normalize(title)
      const score =
        words.reduce((total, word) => total + (normalizedTitle.includes(word) ? 4 : 0), 0) +
        (normalizedTitle.includes('da nang') || normalizedTitle.includes('danang') ? 1 : 0) -
        (/\.svg$|\.pdf$|logo|map|bản đồ/i.test(title) ? 20 : 0)
      return { page, info, title, score }
    })
    .filter((item) => item.info?.thumburl && /\.(jpe?g|png|webp|tiff?)$/i.test(item.title))
    .sort((a, b) => b.score - a.score || a.page.index - b.page.index)
  const best = candidates[0]
  if (!best) return { ...target, found: false, candidates: [] }
  const metadata = best.info.extmetadata ?? {}
  return {
    ...target,
    found: true,
    score: best.score,
    title: best.title,
    imageUrl: best.info.thumburl,
    sourceUrl: best.info.descriptionurl,
    author: stripHtml(metadata.Artist?.value) || 'Wikimedia Commons contributor',
    license: metadata.LicenseShortName?.value || metadata.UsageTerms?.value || 'See source',
    licenseUrl: metadata.LicenseUrl?.value || best.info.descriptionurl,
    alternatives: candidates.slice(0, 4).map((item) => item.title),
  }
}

const outputPath = '/private/tmp/da-nang-image-candidates-v3.json'
let results = []
try {
  results.push(...JSON.parse(await fs.readFile(outputPath, 'utf8')))
} catch {
  // Start a new catalog when there is no saved progress.
}
const completedIds = new Set(results.map((item) => item.id))
for (const target of targets.filter((item) => !completedIds.has(item.id))) {
  let result
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      result = await findImage(target)
      break
    } catch (error) {
      if (attempt === 4) throw error
      await new Promise((resolve) => setTimeout(resolve, 4000 * (attempt + 1)))
    }
  }
  results.push(result)
  await fs.writeFile(outputPath, `${JSON.stringify(results, null, 2)}\n`)
  await new Promise((resolve) => setTimeout(resolve, 1800))
}

await fs.writeFile(outputPath, `${JSON.stringify(results, null, 2)}\n`)
const weak = results.filter((item) => !item.found || item.score < 4)
console.log(
  JSON.stringify(
    { total: results.length, found: results.filter((item) => item.found).length, weak },
    null,
    2,
  ),
)
