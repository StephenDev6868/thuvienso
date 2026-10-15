/* global URL, console */
import fs from 'node:fs/promises'

const content = JSON.parse(
  await fs.readFile(new URL('../src/data/da-nang-content.json', import.meta.url)),
)
const candidates = JSON.parse(
  await fs.readFile('/private/tmp/da-nang-image-candidates-v3.json', 'utf8'),
)

const validCandidateIds = new Set([
  'place-thanh-dien-hai',
  'place-dinh-hai-chau',
  'place-dinh-thac-gian',
  'place-bai-bien-my-khe',
  'place-ban-dao-son-tra',
  'place-chua-linh-ung-son-tra',
  'place-lang-chai-man-thai',
  'place-ngu-hanh-son',
  'place-lang-da-non-nuoc',
  'place-hai-van-quan',
  'place-lang-nam-o',
  'place-song-cu-de',
  'place-phong-le',
  'place-nghia-trung-hoa-vang',
  'place-dinh-phong-le',
  'place-lang-duc-dong-phuoc-kieu',
  'place-dinh-tran-thanh-chiem',
  'place-pho-co-hoi-an',
  'place-chua-cau',
  'place-bien-cua-dai',
  'place-lang-rau-tra-que',
  'place-bien-an-bang',
  'place-thanh-dia-my-son',
  'place-ba-na-hills',
])

const sources = Object.fromEntries(
  candidates
    .filter((item) => item.found && validCandidateIds.has(item.id))
    .map((item) => [
      item.id,
      {
        imageUrl: item.imageUrl,
        sourceUrl: item.sourceUrl,
        author: item.author,
        license: item.license,
        licenseUrl: item.licenseUrl,
        title: item.title,
      },
    ]),
)

sources['place-thap-bang-an'] = {
  imageUrl:
    'https://commons.wikimedia.org/wiki/Special:FilePath/Th%C3%A1p%20B%E1%BA%B1ng%20An%20%28B%E1%BA%B1ng%20An%20Tower%29%2C%20photo%20by%20V%C4%A9nh%20T%C3%A2n%20%28Th%C3%A1i%20T%E1%BA%BF%20Th%C3%B4ng%29%2C%201930.jpg?width=1200',
  sourceUrl:
    'https://commons.wikimedia.org/wiki/File:Th%C3%A1p_B%E1%BA%B1ng_An_(B%E1%BA%B1ng_An_Tower),_photo_by_V%C4%A9nh_T%C3%A2n_(Th%C3%A1i_T%E1%BA%BF_Th%C3%B4ng),_1930.jpg',
  author: 'Vĩnh Tân (Thái Tế Thông)',
  license: 'Xem tại nguồn',
  licenseUrl:
    'https://commons.wikimedia.org/wiki/File:Th%C3%A1p_B%E1%BA%B1ng_An_(B%E1%BA%B1ng_An_Tower),_photo_by_V%C4%A9nh_T%C3%A2n_(Th%C3%A1i_T%E1%BA%BF_Th%C3%B4ng),_1930.jpg',
  title: 'Tháp Bằng An, 1930',
}
sources['place-cu-lao-cham'] = {
  imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Chamislands1.JPG?width=1200',
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:Chamislands1.JPG',
  author: 'Duyenpaul',
  license: 'Public domain',
  licenseUrl: 'https://commons.wikimedia.org/wiki/File:Chamislands1.JPG',
  title: 'Cù Lao Chàm nhìn từ Cửa Đại',
}
sources['place-phu-duong-tam-ky'] = {
  imageUrl:
    'https://commons.wikimedia.org/wiki/Special:FilePath/%C4%90%C6%B0%E1%BB%9Dng%20ph%E1%BB%91%20%E1%BB%9F%20Tam%20K%E1%BB%B3%2C%20Qu%E1%BA%A3ng%20Nam.JPG?width=1200',
  sourceUrl:
    'https://commons.wikimedia.org/wiki/File:%C4%90%C6%B0%E1%BB%9Dng_ph%E1%BB%91_%E1%BB%9F_Tam_K%E1%BB%B3,_Qu%E1%BA%A3ng_Nam.JPG',
  author: 'Wikimedia Commons contributor',
  license: 'Xem tại nguồn',
  licenseUrl:
    'https://commons.wikimedia.org/wiki/File:%C4%90%C6%B0%E1%BB%9Dng_ph%E1%BB%91_%E1%BB%9F_Tam_K%E1%BB%B3,_Qu%E1%BA%A3ng_Nam.JPG',
  title: 'Không gian đô thị Tam Kỳ',
}
sources['place-dinh-lang-hoa-my'] = {
  imageUrl: 'https://api.sovaba.travel/uploads/dinh_lang_hoa_myjpg_4c4af927e8.jpg',
  sourceUrl:
    'https://sovaba.travel/blog/bai-viet-le-hoi-lang-hoa-my-net-dep-van-hoa-truyen-thong-giua-pho-thi-da-nang',
  author: 'Sovaba Travel',
  license: 'Xem điều khoản tại nguồn',
  licenseUrl:
    'https://sovaba.travel/blog/bai-viet-le-hoi-lang-hoa-my-net-dep-van-hoa-truyen-thong-giua-pho-thi-da-nang',
  title: 'Mặt tiền Đình làng Hòa Mỹ hiện nay',
}
sources['place-hoa-my-historical'] = {
  imageUrl:
    'https://commons.wikimedia.org/wiki/Special:FilePath/Walter%20Leamy%2C%20Jr.%20Distributes%20Gum%20to%20Children%2C%2013%20October%201968%20%2829259231621%29.jpg?width=1200',
  sourceUrl:
    'https://commons.wikimedia.org/wiki/File:Walter_Leamy,_Jr._Distributes_Gum_to_Children,_13_October_1968_(29259231621).jpg',
  author: 'USMC Archives',
  license: 'CC BY 2.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
  title: 'Tư liệu làng Hòa Mỹ, năm 1968',
}

const fallback = {
  'dinh-nai-nam': 'place-phong-le',
  'nghia-trung-go-do': 'place-thanh-dien-hai',
  k20: 'place-ngu-hanh-son',
  'dinh-an-ngai-dong': 'place-hai-van-quan',
  'b1-hong-phuoc': 'place-lang-nam-o',
  'nha-tho-qua-giang': 'place-phong-le',
  'tuong-dai-me-vnah': 'place-phu-duong-tam-ky',
  'lang-bich-hoa-tam-thanh': 'place-phu-duong-tam-ky',
  'bien-tam-thanh': 'place-phu-duong-tam-ky',
  'lang-hoa-sua-huong-tra': 'place-phu-duong-tam-ky',
  'dinh-huong-tra': 'place-phu-duong-tam-ky',
  'dia-dao-ky-anh': 'place-phu-duong-tam-ky',
  'bai-say-song-dam': 'place-phu-duong-tam-ky',
  'van-thanh-khong-mieu': 'place-phu-duong-tam-ky',
  'bien-ha-my': 'place-bien-an-bang',
  'doi-bo-bo': 'place-thap-bang-an',
  'lang-moc-kim-bong': 'place-pho-co-hoi-an',
  'rung-dua-bay-mau': 'place-bien-cua-dai',
  'lang-gom-thanh-ha': 'place-pho-co-hoi-an',
}

const galleries = {
  'place-dinh-lang-hoa-my': [
    {
      imageUrl: 'https://api.sovaba.travel/uploads/dinh_lang_hoa_myjpg_4c4af927e8.jpg',
      sourceUrl:
        'https://sovaba.travel/blog/bai-viet-le-hoi-lang-hoa-my-net-dep-van-hoa-truyen-thong-giua-pho-thi-da-nang',
      sourceName: 'Sovaba Travel',
      caption: 'Mặt tiền Đình làng Hòa Mỹ hiện nay',
      period: 'Hiện nay',
    },
    {
      imageUrl:
        'https://bqn.1cdn.vn/2024/11/23/baodanang.vn-dataimages-202411-original-_images1757424_1.gif',
      sourceUrl: 'https://baodanang.vn/dua-tuong-den-gan-hon-voi-cong-chung-3237106.html',
      sourceName: 'Báo Đà Nẵng',
      caption: 'Biểu diễn tuồng tại Đình làng Hòa Mỹ',
      period: '11/2024',
    },
    {
      imageUrl: 'https://api.sovaba.travel/uploads/khai_hoi_dinh_lang_hoa_my_1dd08c1b61.jpg',
      sourceUrl:
        'https://sovaba.travel/blog/bai-viet-le-hoi-lang-hoa-my-net-dep-van-hoa-truyen-thong-giua-pho-thi-da-nang',
      sourceName: 'Sovaba Travel',
      caption: 'Nghi thức đánh trống khai hội Đình làng Hòa Mỹ',
      period: 'Lễ hội',
    },
    {
      imageUrl: 'https://api.sovaba.travel/uploads/phan_hoi_bai_choi_15e79d2613.jpg',
      sourceUrl:
        'https://sovaba.travel/blog/bai-viet-le-hoi-lang-hoa-my-net-dep-van-hoa-truyen-thong-giua-pho-thi-da-nang',
      sourceName: 'Sovaba Travel',
      caption: 'Hoạt động bài chòi trong phần hội',
      period: 'Lễ hội',
    },
    {
      imageUrl:
        'https://commons.wikimedia.org/wiki/Special:FilePath/Walter%20Leamy%2C%20Jr.%20Distributes%20Gum%20to%20Children%2C%2013%20October%201968%20%2829259231621%29.jpg?width=1200',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Walter_Leamy,_Jr._Distributes_Gum_to_Children,_13_October_1968_(29259231621).jpg',
      sourceName: 'USMC Archives',
      caption: 'Tư liệu làng Hòa Mỹ năm 1968',
      period: '1968',
    },
  ],
}

const records = {}
for (const place of content.places) {
  const targetId = `place-${place.id}`
  const sourceId = sources[targetId] ? targetId : fallback[place.id]
  const source = sources[sourceId] || sources['place-thanh-dien-hai']
  records[targetId] = {
    ...source,
    caption:
      sourceId === targetId
        ? place.name
        : `Ảnh đại diện khu vực ${content.wards.find((ward) => ward.id === place.wardId)?.shortName || 'Đà Nẵng'}`,
    exact: sourceId === targetId,
    ...(galleries[targetId] ? { gallery: galleries[targetId] } : {}),
  }
}

const regionFallbacks = {
  'da-nang-do-thi': 'place-thanh-dien-hai',
  'tam-ky': 'place-phu-duong-tam-ky',
  'dien-ban': 'place-thap-bang-an',
  'hoi-an': 'place-pho-co-hoi-an',
}
for (const ward of content.wards) {
  const ownSourceId = ward.placeIds.map((id) => `place-${id}`).find((id) => records[id]?.exact)
  const sourceId = ownSourceId || regionFallbacks[ward.regionId]
  records[`ward-${ward.id}`] = {
    ...(records[sourceId] || sources['place-thanh-dien-hai']),
    gallery: undefined,
    caption: `Không gian ${ward.shortName}`,
    exact: Boolean(ownSourceId),
  }
}

await fs.writeFile(
  new URL('../src/data/da-nang-images.json', import.meta.url),
  `${JSON.stringify(records, null, 2)}\n`,
)
console.log(`Created ${Object.keys(records).length} sourced image records.`)
