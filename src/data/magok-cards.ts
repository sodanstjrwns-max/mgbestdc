// ============================================================
// "마곡 {진료}" 핵심 하위 페이지 6장 — 대표 사진·카드 (2026-10-14, 하위 페이지 카드 1단계)
// - 네이버 서브카드·구글 사이트링크 썸네일용: 페이지마다 고유 대표 사진 1장을
//   og:image · 본문 첫 <img> · JSON-LD image · 사이트맵 image:image 네 곳에 똑같이 쓴다.
// - 사진은 모두 병원 실사(public/static/img 원본)에서 만든 파생본 — AI 생성·전후 사진·환자 얼굴 없음.
//   og 1200×630 jpg / 본문 1200×800 webp / 카드 600×600 webp (public/static/img/cards/)
// - 홈·허브(/area/magok) 카드 그리드와 ItemList JSON-LD 가 이 배열 하나를 같은 순서로 쓴다.
// ============================================================

export type MagokCard = {
  treatment: string // 진료 slug (clinic.ts TREATMENTS)
  path: string // /area/magok-{treatment}
  name: string // 카드·H1 제목 ("마곡 임플란트") — "{지역} {진료}"로 시작
  h1Rest: string // H1 강조 부분 ("임플란트")
  title: string // <title> — "{지역} {진료} | {선택 기준} — 병원명"
  line: string // 카드 한 줄 설명
  alt: string // 본문 대표 사진 alt (페이지 주제로 시작)
  source: string // 원본 실사 파일 (public/static/img)
}

export const MAGOK_CARD_DATE = '2026-10-14'

const CLINIC_NAME = '마곡베스트치과의원'

export const MAGOK_CARDS: MagokCard[] = [
  {
    treatment: 'implant',
    path: '/area/magok-implant',
    name: '마곡 임플란트',
    h1Rest: '임플란트',
    title: `마곡 임플란트 | 퇴근 후 상담부터 식립 뒤 관리까지 — ${CLINIC_NAME}`,
    line: '퇴근 후 상담부터 식립 뒤 정기 관리까지 한 원장이 맡습니다',
    alt: '마곡 임플란트 — 식립 기구를 든 임플란트 진료 장면',
    source: 'tx-implant.webp'
  },
  {
    treatment: 'ortho',
    path: '/area/magok-ortho',
    name: '마곡 교정치료',
    h1Rest: '교정치료',
    title: `마곡 교정치료 | 투명교정, 일과 함께 이어가기 — ${CLINIC_NAME}`,
    line: '투명교정으로 업무와 교정을 함께 이어가는 방법',
    alt: '마곡 교정치료 — 영상을 짚으며 치아 배열을 살피는 장면',
    source: 'tx-ortho.webp'
  },
  {
    treatment: 'cosmetic',
    path: '/area/magok-cosmetic',
    name: '마곡 심미치료',
    h1Rest: '심미치료',
    title: `마곡 심미치료 | 상담 전에 정리할 세 가지 — ${CLINIC_NAME}`,
    line: '색·모양·틈, 상담 전에 정리해 두면 좋은 것',
    alt: '마곡 심미치료 — 라미네이트 셸과 색 견본',
    source: 'core-cosmetic.webp'
  },
  {
    treatment: 'cavity',
    path: '/area/magok-cavity',
    name: '마곡 충치치료',
    h1Rest: '충치치료',
    title: `마곡 충치치료 | 간식 빈도와 퇴근 후 치료 일정 — ${CLINIC_NAME}`,
    line: '간식·음료 습관과 충치, 퇴근 후 치료 일정 안내',
    alt: '마곡 충치치료 — 건강한 어금니 모형',
    source: 'core-cavity.webp'
  },
  {
    treatment: 'gum',
    path: '/area/magok-gum',
    name: '마곡 잇몸치료',
    h1Rest: '잇몸치료',
    title: `마곡 잇몸치료 | 스케일링으로 충분한지 가르는 기준 — ${CLINIC_NAME}`,
    line: '잇몸 출혈, 스케일링으로 충분한지 가르는 기준',
    alt: '마곡 잇몸치료 — 확대경을 쓰고 잇몸을 살피는 대표원장',
    source: 'tx-gum.webp'
  },
  {
    treatment: 'extraction',
    path: '/area/magok-extraction',
    name: '마곡 사랑니 발치',
    h1Rest: '사랑니 발치',
    title: `마곡 사랑니 발치 | 빼야 하는 사랑니 판단 기준 — ${CLINIC_NAME}`,
    line: '빼야 하는 사랑니 판단 기준과 발치 날짜 고르기',
    alt: '마곡 사랑니 발치 — 수술 가운을 갖추고 발치 진료 중인 장면',
    source: 'tx-extraction.webp'
  }
]

// 지역×진료 페이지 대상 진료(clinic.ts AREA_TREATMENTS) 밖에서 마곡에만 둔 페이지 — 사이트맵·llms 에 별도 추가
export const MAGOK_EXTRA_TREATMENTS = ['gum', 'extraction']

export const magokCard = (treatment: string) => MAGOK_CARDS.find((c) => c.treatment === treatment)

export function magokCardImg(treatment: string) {
  const base = `/static/img/cards/magok-${treatment}`
  return {
    og: `${base}-1200x630.jpg`, // 1200×630
    body: `${base}-1200.webp`, // 1200×800
    square: `${base}-600.webp` // 600×600
  }
}

// ============================================================
// 진료 페이지(/treatments/:slug) og 이미지 — 본문 히어로 사진과 같은 사진의 1200×630 파생본
// ============================================================
export const TX_OG_SLUGS = ['implant', 'cavity', 'cosmetic', 'ortho', 'tmj', 'gum', 'prosthesis', 'extraction', 'preventive']
export const txOgImage = (slug: string) => (TX_OG_SLUGS.includes(slug) ? `/static/img/og/tx-${slug}-1200x630.jpg` : '')

const escAttr = (t: string) => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** 6장 사진 카드 그리드 (홈·허브 공용). compact = 하위 페이지 하단 형제 카드 */
export function magokCardGridHtml(cards: MagokCard[] = MAGOK_CARDS, opts: { compact?: boolean; idPrefix?: string } = {}) {
  const pre = opts.idPrefix || 'mc'
  return `<div class="area-card-grid${opts.compact ? ' compact' : ''}">${cards
    .map((c) => {
      const id = `${pre}-${c.treatment}`
      return `<a href="${c.path}" class="area-card" aria-labelledby="${id}">
            <span class="ac-img"><img src="${magokCardImg(c.treatment).square}" width="600" height="600" loading="lazy" decoding="async" alt="${escAttr(c.name)}" /></span>
            <span class="ac-body">
              <span class="ac-title" id="${id}">${c.name}</span>
              <span class="ac-line">${c.line}</span>
            </span>
          </a>`
    })
    .join('')}</div>`
}

/** ItemList JSON-LD — 화면 카드와 1:1, 같은 순서 */
export function magokItemListSchema(siteUrl: string, id: string, cards: MagokCard[] = MAGOK_CARDS) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': id,
    name: '마곡 진료 안내',
    numberOfItems: cards.length,
    itemListElement: cards.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: siteUrl + c.path,
      name: c.name,
      image: siteUrl + magokCardImg(c.treatment).square
    }))
  }
}
