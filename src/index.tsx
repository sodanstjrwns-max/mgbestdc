import { Hono } from 'hono'
import { html } from 'hono/html'
import { Layout, breadcrumbSchema, SITE_URL } from './components/layout'
import { CLINIC, TREATMENTS, getTreatment, DOCTORS, AREAS, AREA_TREATMENTS, CORE_TREATMENTS, GENERAL_TREATMENTS, GENERAL_FAQS } from './data/clinic'
import { HomePage } from './pages/home'
import { TreatmentsListPage, TreatmentDetailPage, procedureSchema, treatmentFaqSchema } from './pages/treatments'
import { DoctorsListPage, DoctorDetailPage, personSchema } from './pages/doctors'
import { StoryPage, storySchema } from './pages/story'
import {
  AboutHubPage, MissionPage, DirectionsPage, PricingPage, FacilityPage, FaqPage, faqPageSchema,
  ReservationPage, AreaPage, areaSchema, areaFaqSchema
} from './pages/info'
import { BlogListPage, BlogDetailPage, blogPostingSchema, blogFaqSchema, blogListSchema } from './pages/blog'
import { BLOG_POSTS, BLOG_CATEGORIES, getPost } from './data/blog'
import { NoticeListPage, NoticeDetailPage, DbColumnDetailPage, DbCasesPage, DbCaseDetailPage, dbBlogPostingSchema, noticeSchema, type DbPost, type DbCase } from './pages/cms'
import { AdminShell, AdminPostList, AdminPostEditor, AdminCases, AdminReservations } from './pages/admin'
import { AdminStats, fetchSiteStats, STATS_TOKEN, MASTER_KEY } from './pages/stats'
import { SignupPage, LoginPage } from './pages/member'
import { hashPassword, verifyPassword, createSessionToken, getSessionUser, sessionSecret, sessionCookieHeader, clearSessionCookieHeader, isValidEmail } from './auth'

type Bindings = {
  DB: D1Database
  R2: R2Bucket
  ADMIN_KEY?: string
  SESSION_SECRET?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// SEO: 메타 디스크립션 최적화 — 짧으면(40자 미만) 병원 소개 문구를 덧붙여 50~160자 확보
function seoDesc(base: string, suffix: string): string {
  const t = (base || '').trim()
  if (t.length >= 40) return t.length > 160 ? t.slice(0, 157) + '…' : t
  const merged = `${t} ${suffix}`.trim()
  return merged.length > 160 ? merged.slice(0, 157) + '…' : merged
}

// 보안 헤더 (동적 HTML 응답 — 정적 자산은 public/_headers)
app.use('*', async (c, next) => {
  // 도메인 정규화: pages.dev·www → mgbestdc.kr 301 (SEO 신호 단일화)
  // 미리보기 배포(*.magok-best-dental.pages.dev 해시 서브도메인)와 로컬은 제외
  const url = new URL(c.req.url)
  if (url.hostname === 'magok-best-dental.pages.dev' || url.hostname === 'www.mgbestdc.kr') {
    url.hostname = 'mgbestdc.kr'
    url.protocol = 'https:'
    return c.redirect(url.toString(), 301)
  }
  await next()
  // 동적 HTML은 항상 재검증 — 글 수정 후 이전 JSON-LD·본문이 캐시에 남지 않도록 보장
  const ct = c.res.headers.get('Content-Type') || ''
  if (ct.includes('text/html') && !c.res.headers.get('Cache-Control')) {
    c.header('Cache-Control', 'no-cache, must-revalidate')
  }
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'SAMEORIGIN')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
})

// ============================================================
// 메인
// ============================================================
app.get('/', async (c) => {
  const member = await getSessionUser(c)
  let homeCases: DbCase[] = []
  try {
    if (c.env?.DB) {
      const res = await c.env.DB.prepare("SELECT * FROM cases WHERE status = 'published' ORDER BY created_at DESC LIMIT 3").all()
      homeCases = (res.results || []) as any
    }
  } catch (e) { /* 테이블 미생성 시 빈 목록 */ }
  return c.html(
    Layout(
      {
        title: `${CLINIC.name} | 마곡 치과, ${CLINIC.directions} — 임플란트·교정·심미치료`,
        description: `마곡·마곡나루 치과를 찾으신다면 — ${CLINIC.directions}, ${CLINIC.directorCredential}가 상담부터 치료까지 책임지는 1인 책임 진료. 임플란트·충치치료·심미치료·투명교정. 월·목 야간 20:30, 토요일 진료.`,
        path: '/',
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            '@id': SITE_URL + '/#website',
            name: CLINIC.name,
            alternateName: '마곡베스트치과',
            url: SITE_URL,
            inLanguage: 'ko',
            publisher: { '@id': SITE_URL + '/#organization' },
            potentialAction: { '@type': 'SearchAction', target: `${SITE_URL}/treatments?q={query}`, 'query-input': 'required name=query' }
          },
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            '@id': SITE_URL + '/#webpage',
            url: SITE_URL,
            name: `${CLINIC.name} — 마곡 치과`,
            isPartOf: { '@id': SITE_URL + '/#website' },
            about: { '@id': SITE_URL + '/#organization' },
            inLanguage: 'ko',
            speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.hero-sub'] },
            primaryImageOfPage: { '@type': 'ImageObject', url: SITE_URL + '/static/img/og.png', width: 1200, height: 630 }
          },
          {
            '@context': 'https://schema.org',
            '@type': 'VideoObject',
            '@id': SITE_URL + '/#hero-video',
            name: `${CLINIC.name} 브랜딩 영상`,
            description: `${CLINIC.name} 진료 공간과 상담 모습을 담은 브랜딩 영상. ${CLINIC.directions}.`,
            thumbnailUrl: SITE_URL + '/static/img/hero-lobby.webp',
            contentUrl: SITE_URL + '/media/video/branding-hero.mp4',
            uploadDate: '2026-07-01',
            inLanguage: 'ko',
            publisher: { '@id': SITE_URL + '/#organization' }
          },
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            '@id': SITE_URL + '/#core-treatments',
            name: '중점 진료',
            itemListElement: CORE_TREATMENTS.map((t, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: t.name,
              url: SITE_URL + '/treatments/' + t.slug
            }))
          },
          // 홈 FAQ 섹션과 동일 내용 (GENERAL_FAQS) — AEO·리치결과용
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            '@id': SITE_URL + '/#faq',
            inLanguage: 'ko',
            mainEntity: GENERAL_FAQS.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a }
            }))
          },
          breadcrumbSchema([{ name: '홈', path: '/' }])
        ]
      },
      HomePage(homeCases, !!member),
      { member }
    )
  )
})

// ============================================================
// 소개 허브 (/about) — 소개 카테고리 진입점
// ============================================================
app.get('/about', (c) =>
  c.html(
    Layout(
      {
        title: `소개 | ${CLINIC.name}`,
        description: `${CLINIC.name} 소개 — 병원소개·의료진·시설·장비·오시는 길을 한눈에 확인하세요. ${CLINIC.directions}.`,
        path: '/about',
        jsonLd: [
          breadcrumbSchema([{ name: '홈', path: '/' }, { name: '소개', path: '/about' }]),
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            '@id': SITE_URL + '/about#collection',
            name: `${CLINIC.name} 소개`,
            url: SITE_URL + '/about',
            inLanguage: 'ko',
            about: { '@id': SITE_URL + '/#organization' },
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: '병원소개', url: SITE_URL + '/mission' },
                { '@type': 'ListItem', position: 2, name: '스토리', url: SITE_URL + '/story' },
                { '@type': 'ListItem', position: 3, name: '의료진 소개', url: SITE_URL + '/doctors' },
                { '@type': 'ListItem', position: 4, name: '시설·장비 안내', url: SITE_URL + '/facility' },
                { '@type': 'ListItem', position: 5, name: '오시는 길', url: SITE_URL + '/directions' }
              ]
            }
          }
        ]
      },
      AboutHubPage()
    )
  )
)

// ============================================================
// 병원소개
// ============================================================
app.get('/mission', (c) =>
  c.html(
    Layout(
      {
        title: `병원소개 | ${CLINIC.name}`,
        description: `${CLINIC.mission} ${CLINIC.vision}를 향한 마곡베스트치과의원의 철학과 가치를 소개합니다.`,
        path: '/mission',
        jsonLd: [
          breadcrumbSchema([{ name: '홈', path: '/' }, { name: '병원소개', path: '/mission' }]),
          {
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            '@id': SITE_URL + '/mission#about',
            name: `${CLINIC.name} 병원소개`,
            url: SITE_URL + '/mission',
            inLanguage: 'ko',
            about: { '@id': SITE_URL + '/#organization' },
            mainEntity: { '@id': SITE_URL + '/#organization' },
            description: `${CLINIC.mission} — ${CLINIC.vision}`
          }
        ]
      },
      MissionPage()
    )
  )
)

// ============================================================
// 스토리 — 김민 대표원장 인터뷰 내러티브 (영상 히어로)
// ============================================================
app.get('/story', (c) =>
  c.html(
    Layout(
      {
        title: `스토리 | ${CLINIC.name}`,
        description: '강서구에서 나고 자란 김민 대표원장이 고향 마곡에 치과를 연 이유, 그리고 진료실에서 지키고 있는 원칙들을 소개합니다.',
        path: '/story',
        jsonLd: [
          breadcrumbSchema([{ name: '홈', path: '/' }, { name: '스토리', path: '/story' }]),
          storySchema(SITE_URL)
        ]
      },
      StoryPage()
    )
  )
)

// ============================================================
// 의료진
// ============================================================
app.get('/doctors', (c) =>
  c.html(
    Layout(
      {
        title: `의료진 소개 | ${CLINIC.name}`,
        description: `${CLINIC.directorCredential} ${DOCTORS[0].name} 대표원장. 1인 책임 진료로 진단부터 사후 관리까지 함께합니다.`,
        path: '/doctors',
        jsonLd: [
          breadcrumbSchema([{ name: '홈', path: '/' }, { name: '의료진', path: '/doctors' }]),
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            '@id': SITE_URL + '/doctors#collection',
            name: `${CLINIC.name} 의료진 소개`,
            url: SITE_URL + '/doctors',
            inLanguage: 'ko',
            about: { '@id': SITE_URL + '/#organization' },
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: DOCTORS.length,
              itemListElement: DOCTORS.map((d, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: `${d.name} ${d.title}`,
                url: `${SITE_URL}/doctors/${d.slug}`,
                item: { '@id': `${SITE_URL}/doctors/${d.slug}/#physician` }
              }))
            }
          }
        ]
      },
      DoctorsListPage()
    )
  )
)

app.get('/doctors/:slug', (c) => {
  const slug = c.req.param('slug')
  const d = DOCTORS.find((x) => x.slug === slug)
  if (!d) return c.notFound()
  const body = DoctorDetailPage(slug)
  if (!body) return c.notFound()
  const schema = personSchema(slug, SITE_URL)
  return c.html(
    Layout(
      {
        title: `${d.name} ${d.title} | ${CLINIC.name}`,
        description: `${d.credential}. ${d.intro.slice(0, 110)}`,
        path: `/doctors/${slug}`,
        ogType: 'profile',
        jsonLd: [
          breadcrumbSchema([{ name: '홈', path: '/' }, { name: '의료진', path: '/doctors' }, { name: d.name, path: `/doctors/${slug}` }]),
          ...(schema ? [schema] : [])
        ]
      },
      body
    )
  )
})

// ============================================================
// 진료
// ============================================================
app.get('/treatments', (c) =>
  c.html(
    Layout(
      {
        title: `진료 안내 | ${CLINIC.name}`,
        description: `임플란트·충치치료·심미치료·교정 등 마곡베스트치과의원의 전체 진료를 안내합니다. ${CLINIC.directions}.`,
        path: '/treatments',
        jsonLd: [
          breadcrumbSchema([{ name: '홈', path: '/' }, { name: '진료안내', path: '/treatments' }]),
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            '@id': SITE_URL + '/treatments#collection',
            name: `${CLINIC.name} 진료 안내`,
            url: SITE_URL + '/treatments',
            inLanguage: 'ko',
            about: { '@id': SITE_URL + '/#organization' },
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: TREATMENTS.length,
              itemListElement: TREATMENTS.map((t, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: t.name,
                url: `${SITE_URL}/treatments/${t.slug}`
              }))
            }
          }
        ]
      },
      TreatmentsListPage()
    )
  )
)

// 진료 slug → 콘텐츠 카테고리명 매핑 (posts.category / cases.category 는 한글 카테고리명 저장)
const TOPIC_CAT: Record<string, string[]> = {
  implant: ['임플란트'],
  cavity: ['충치·신경치료', '충치치료'],
  cosmetic: ['심미치료'],
  ortho: ['교정', '교정치료'],
  tmj: ['턱관절', '턱관절치료'],
  gum: ['잇몸치료'],
  prosthesis: ['보철치료'],
  extraction: ['발치·사랑니'],
  preventive: ['예방·검진', '구강 관리']
}

app.get('/treatments/:slug', async (c) => {
  const slug = c.req.param('slug')
  const t = getTreatment(slug)
  if (!t) return c.notFound()
  const faqSchema = treatmentFaqSchema(t)
  // 토픽 허브: 같은 토픽의 치료사례·칼럼을 D1에서 조회 (진료 ↔ 사례 ↔ 칼럼 연결)
  let topicCases: DbCase[] = []
  let topicColumns: DbPost[] = []
  const cats = TOPIC_CAT[slug] || [t.name]
  try {
    if (c.env?.DB) {
      const ph = cats.map(() => '?').join(',')
      const [cs, col] = await Promise.all([
        c.env.DB.prepare(`SELECT * FROM cases WHERE status = 'published' AND category IN (${ph}) ORDER BY created_at DESC LIMIT 3`).bind(...cats).all(),
        c.env.DB.prepare(`SELECT * FROM posts WHERE type = 'column' AND status = 'published' AND category IN (${ph}) ORDER BY published_at DESC LIMIT 3`).bind(...cats).all()
      ])
      topicCases = (cs.results || []) as any
      topicColumns = (col.results || []) as any
    }
  } catch (e) {}
  return c.html(
    Layout(
      {
        title: `${t.name} | ${CLINIC.name} (${CLINIC.station} 도보 3분)`,
        description: `${t.tagline}. ${t.summary.slice(0, 130)}`,
        path: `/treatments/${slug}`,
        ogType: 'article',
        jsonLd: [
          breadcrumbSchema([{ name: '홈', path: '/' }, { name: '진료안내', path: '/treatments' }, { name: t.name, path: `/treatments/${slug}` }]),
          procedureSchema(t, SITE_URL),
          ...(faqSchema ? [faqSchema] : [])
        ]
      },
      TreatmentDetailPage(t, topicCases, topicColumns)
    )
  )
})

// ============================================================
// 안내 페이지들
// ============================================================
app.get('/directions', (c) =>
  c.html(
    Layout(
      {
        title: `오시는 길 | ${CLINIC.name}`,
        description: `${CLINIC.addressFull}. ${CLINIC.directions}. 진료시간 및 주차 안내.`,
        path: '/directions',
        jsonLd: [
          breadcrumbSchema([{ name: '홈', path: '/' }, { name: '오시는 길', path: '/directions' }]),
          {
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            '@id': SITE_URL + '/directions/#contactpage',
            name: `오시는 길 | ${CLINIC.name}`,
            url: SITE_URL + '/directions',
            inLanguage: 'ko',
            about: { '@id': SITE_URL + '/#organization' },
            mainEntity: {
              '@type': 'Place',
              name: CLINIC.name,
              address: { '@type': 'PostalAddress', streetAddress: CLINIC.addressShort, addressLocality: '강서구', addressRegion: '서울특별시', postalCode: CLINIC.postalCode, addressCountry: 'KR' },
              geo: { '@type': 'GeoCoordinates', latitude: CLINIC.geo.lat, longitude: CLINIC.geo.lng },
              hasMap: CLINIC.social.naverPlace,
              publicAccess: true
            },
            speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1'] }
          }
        ]
      },
      DirectionsPage()
    )
  )
)

app.get('/pricing', (c) =>
  c.html(
    Layout(
      {
        title: `비용 안내 (비급여 진료비용 고지) | ${CLINIC.name}`,
        description: `마곡베스트치과의원 비급여 진료비용 고지. 인레이 30만원·온레이 35만원·크라운 45만원, 레진 충치치료 7~20만원, 앞니 파절·심미 레진 10~40만원, 투명교정 부분 100~150만원·전체 350~400만원. 정확한 비용은 진단 후 안내드립니다.`,
        path: '/pricing',
        jsonLd: [
          breadcrumbSchema([{ name: '홈', path: '/' }, { name: '비용 안내', path: '/pricing' }]),
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            '@id': SITE_URL + '/pricing/#webpage',
            name: `비용 안내 | ${CLINIC.name}`,
            url: SITE_URL + '/pricing',
            inLanguage: 'ko',
            about: { '@id': SITE_URL + '/#organization' },
            mainEntity: {
              '@type': 'OfferCatalog',
              name: `${CLINIC.name} 비급여 진료비용 고지`,
              itemListElement: [
                { name: '인레이', price: 300000 },
                { name: '온레이', price: 350000 },
                { name: '크라운', price: 450000 },
                { name: '치아 기둥(파이버 포스트)', price: 100000 },
                { name: '레진 충치치료(어금니 씹는면·좁은 부위)', price: 100000 },
                { name: '레진 충치치료(어금니 빌드업·넓은 부위)', price: 200000 },
                { name: '앞니 레진', price: 200000 },
                { name: '치아 사이 충치 레진(면당)', price: 150000 },
                { name: '치경부 마모 레진', price: 70000 },
                { name: '앞니 파절 레진(협소)', price: 100000 },
                { name: '앞니 파절 레진(중간)', price: 200000 },
                { name: '앞니 파절 레진(큰 파절)', price: 250000 },
                { name: '다이아스테마 레진(면당)', price: 300000 },
                { name: '블랙트라이앵글 레진(2면)', price: 400000 },
                { name: '투명교정(부분)', minPrice: 1000000, maxPrice: 1500000 },
                { name: '투명교정(전체)', minPrice: 3500000, maxPrice: 4000000 },
                { name: '교정 유지장치(악당)', price: 200000 }
              ].map((o: { name: string; price?: number; minPrice?: number; maxPrice?: number }) => ({
                '@type': 'Offer',
                itemOffered: { '@type': 'MedicalProcedure', name: o.name },
                priceSpecification:
                  o.minPrice != null
                    ? { '@type': 'PriceSpecification', minPrice: o.minPrice, maxPrice: o.maxPrice, priceCurrency: 'KRW' }
                    : { '@type': 'PriceSpecification', price: o.price, priceCurrency: 'KRW' }
              }))
            }
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            '@id': SITE_URL + '/pricing/#faq',
            mainEntity: [
              {
                '@type': 'Question',
                name: '왜 투명교정은 범위로 안내되나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '교정은 치아 이동량과 교정 범위에 따라 장치 개수와 기간이 달라지기 때문입니다. 정밀 진단 후에는 범위가 아닌 확정 비용과 예상 기간을 함께 안내드립니다.'
                }
              },
              {
                '@type': 'Question',
                name: '건강보험이 적용되는 치료는 무엇인가요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '신경치료, 스케일링(연 1회), 충치치료 일부, 발치, 잇몸치료 등은 건강보험이 적용됩니다. 본원은 보험 적용 가능 여부를 진료 전에 먼저 확인해 안내드립니다.'
                }
              },
              {
                '@type': 'Question',
                name: '상담을 예약하면 무엇을 안내받나요?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '김민 원장이 직접 진단한 뒤, 치료가 필요한 이유와 가능한 대안, 항목별 비용을 함께 설명드립니다. 당일 치료를 강요하지 않습니다.'
                }
              }
            ]
          }
        ]
      },
      PricingPage()
    )
  )
)

app.get('/facility', (c) =>
  c.html(
    Layout(
      {
        title: `시설 둘러보기 | ${CLINIC.name}`,
        description: `프라임스캐너, 임플란트 카보 엔진, 에어플로우 등 마곡베스트치과의 디지털 장비와 진료 공간을 소개합니다.`,
        path: '/facility',
        jsonLd: [
          breadcrumbSchema([{ name: '홈', path: '/' }, { name: '시설 둘러보기', path: '/facility' }]),
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            '@id': SITE_URL + '/facility/#equipment',
            name: `${CLINIC.name} 주요 장비`,
            itemListElement: CLINIC.equipment.map((e, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              item: { '@type': 'Product', name: e.name, description: e.desc }
            }))
          }
        ]
      },
      FacilityPage()
    )
  )
)

app.get('/faq', (c) =>
  c.html(
    Layout(
      {
        title: `자주 묻는 질문 | ${CLINIC.name}`,
        description: `임플란트·충치치료·심미치료·교정 등 진료별 자주 묻는 질문과 병원 이용 안내를 한 곳에 모았습니다.`,
        path: '/faq',
        jsonLd: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '자주 묻는 질문', path: '/faq' }]), faqPageSchema()]
      },
      FaqPage()
    )
  )
)

app.get('/reservation', (c) =>
  c.html(
    Layout(
      {
        title: `예약 문의 | ${CLINIC.name}`,
        description: `마곡베스트치과의원 예약 문의. ${CLINIC.phone}, ${CLINIC.directions}.`,
        path: '/reservation',
        jsonLd: [
          breadcrumbSchema([{ name: '홈', path: '/' }, { name: '예약 문의', path: '/reservation' }]),
          {
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            '@id': SITE_URL + '/reservation/#contactpage',
            name: `예약 문의 | ${CLINIC.name}`,
            url: SITE_URL + '/reservation',
            inLanguage: 'ko',
            about: { '@id': SITE_URL + '/#organization' },
            significantLink: [CLINIC.social.naverBooking, CLINIC.social.kakao, `tel:${CLINIC.phoneRaw}`]
          }
        ]
      },
      ReservationPage()
    )
  )
)

// ============================================================
// 회원 인증 — 회원가입/로그인/로그아웃 (After 사진 열람)
// ============================================================
const safeRedirect = (r: string | undefined) => {
  const v = (r || '').trim()
  return v.startsWith('/') && !v.startsWith('//') ? v : '/cases'
}

app.get('/signup', async (c) => {
  const redirect = safeRedirect(c.req.query('redirect'))
  const user = await getSessionUser(c)
  if (user) return c.redirect(redirect)
  return c.html(
    Layout(
      {
        title: `회원가입 | ${CLINIC.name}`,
        description: `${CLINIC.name} 회원가입 — 가입 후 치료 전·후 사진을 확인하실 수 있습니다.`,
        path: '/signup',
        noindex: true
      },
      SignupPage(redirect)
    )
  )
})

app.get('/login', async (c) => {
  const redirect = safeRedirect(c.req.query('redirect'))
  const user = await getSessionUser(c)
  if (user) return c.redirect(redirect)
  return c.html(
    Layout(
      {
        title: `로그인 | ${CLINIC.name}`,
        description: `${CLINIC.name} 로그인 — 로그인 후 치료 전·후 사진을 확인하실 수 있습니다.`,
        path: '/login',
        noindex: true
      },
      LoginPage(redirect)
    )
  )
})

app.get('/logout', (c) => {
  c.header('Set-Cookie', clearSessionCookieHeader())
  return c.redirect(safeRedirect(c.req.query('redirect')))
})

app.post('/api/auth/signup', async (c) => {
  try {
    if (!c.env?.DB) return c.json({ ok: false, error: '서비스 준비 중입니다.' }, 500)
    const body = await c.req.json().catch(() => ({}))
    const name = String(body.name || '').trim().slice(0, 40)
    const email = String(body.email || '').trim().toLowerCase().slice(0, 120)
    const password = String(body.password || '')
    if (!name) return c.json({ ok: false, error: '이름을 입력해 주세요.' }, 400)
    if (!isValidEmail(email)) return c.json({ ok: false, error: '올바른 이메일 주소를 입력해 주세요.' }, 400)
    if (password.length < 8) return c.json({ ok: false, error: '비밀번호는 8자 이상이어야 합니다.' }, 400)
    if (body.consent !== true) return c.json({ ok: false, error: '개인정보 수집·이용 동의가 필요합니다.' }, 400)

    const exists = await c.env.DB.prepare('SELECT id FROM members WHERE email = ?').bind(email).first()
    if (exists) return c.json({ ok: false, error: '이미 가입된 이메일입니다. 로그인해 주세요.' }, 409)

    const { hash, salt } = await hashPassword(password)
    const res = await c.env.DB.prepare(
      "INSERT INTO members (email, password_hash, salt, name, consented_at, last_login_at) VALUES (?,?,?,?,datetime('now','+9 hours'),datetime('now','+9 hours'))"
    ).bind(email, hash, salt, name).run()

    const id = Number(res.meta.last_row_id)
    const token = await createSessionToken(id, email, name, sessionSecret(c))
    c.header('Set-Cookie', sessionCookieHeader(token))
    return c.json({ ok: true, id })
  } catch (e) {
    return c.json({ ok: false, error: '가입 처리 중 오류가 발생했습니다.' }, 500)
  }
})

app.post('/api/auth/login', async (c) => {
  try {
    if (!c.env?.DB) return c.json({ ok: false, error: '서비스 준비 중입니다.' }, 500)
    const body = await c.req.json().catch(() => ({}))
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    if (!isValidEmail(email) || !password) return c.json({ ok: false, error: '이메일과 비밀번호를 입력해 주세요.' }, 400)

    const row: any = await c.env.DB.prepare('SELECT id, email, name, password_hash, salt FROM members WHERE email = ?').bind(email).first()
    if (!row) return c.json({ ok: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401)
    const ok = await verifyPassword(password, row.salt, row.password_hash)
    if (!ok) return c.json({ ok: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401)

    await c.env.DB.prepare("UPDATE members SET last_login_at = datetime('now','+9 hours') WHERE id = ?").bind(row.id).run().catch(() => {})
    const token = await createSessionToken(row.id, row.email, row.name || '', sessionSecret(c))
    c.header('Set-Cookie', sessionCookieHeader(token))
    return c.json({ ok: true })
  } catch (e) {
    return c.json({ ok: false, error: '로그인 처리 중 오류가 발생했습니다.' }, 500)
  }
})

app.get('/api/auth/me', async (c) => {
  const user = await getSessionUser(c)
  return c.json({ ok: true, user })
})

app.get('/cases', async (c) => {
  const cat = (c.req.query('cat') || '').trim() || undefined
  const member = await getSessionUser(c)
  let rows: DbCase[] = []
  try {
    if (c.env?.DB) {
      const res = cat
        ? await c.env.DB.prepare("SELECT * FROM cases WHERE status = 'published' AND category = ? ORDER BY created_at DESC LIMIT 100").bind(cat).all()
        : await c.env.DB.prepare("SELECT * FROM cases WHERE status = 'published' ORDER BY created_at DESC LIMIT 100").all()
      rows = (res.results || []) as any
    }
  } catch (e) { /* 테이블 미생성 시 빈 목록 */ }
  return c.html(
    Layout(
      {
        title: cat ? `${cat} 진료사례 | ${CLINIC.name}` : `비포·애프터 진료사례 | ${CLINIC.name}`,
        description: `마곡베스트치과의원의 실제 ${cat ? cat + ' ' : ''}진료 사례 모음. 임플란트·충치치료·심미치료 과정을 사례별로 확인하실 수 있습니다.`,
        path: '/cases',
        jsonLd: [
          breadcrumbSchema([{ name: '홈', path: '/' }, { name: '진료사례', path: '/cases' }]),
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            '@id': `${SITE_URL}/cases#collection`,
            name: cat ? `${cat} 진료사례` : '비포·애프터 진료사례',
            url: `${SITE_URL}/cases`,
            about: { '@id': `${SITE_URL}/#organization` },
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: rows.length,
              itemListElement: rows.slice(0, 20).map((r, i) => ({ '@type': 'ListItem', position: i + 1, name: r.title, url: `${SITE_URL}/cases/${r.id}` }))
            }
          }
        ]
      },
      DbCasesPage(rows, cat, !!member),
      { member }
    )
  )
})

// 진료사례 상세 — 사례별 고유 URL
app.get('/cases/:id', async (c) => {
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id) || id <= 0) return c.notFound()
  let row: DbCase | null = null
  let others: DbCase[] = []
  try {
    if (c.env?.DB) {
      const res = await c.env.DB.prepare("SELECT * FROM cases WHERE id = ? AND status = 'published'").bind(id).first()
      row = (res as any) || null
      if (row) {
        const o = await c.env.DB.prepare("SELECT * FROM cases WHERE id != ? AND status = 'published' ORDER BY (category = ?) DESC, created_at DESC LIMIT 3").bind(id, row.category).all()
        others = (o.results || []) as any
      }
    }
  } catch (e) {}
  if (!row) return c.notFound()
  const member = await getSessionUser(c)
  return c.html(
    Layout(
      {
        title: `${row.title} | ${row.category} 진료사례 | ${CLINIC.name}`,
        description: `${row.category} 진료 사례 — ${(row.description || row.title).slice(0, 140)}`,
        path: `/cases/${id}`,
        ogType: 'article',
        ogImage: row.before_img ? `${SITE_URL}/media/${row.before_img}` : undefined,
        jsonLd: [
          breadcrumbSchema([{ name: '홈', path: '/' }, { name: '진료사례', path: '/cases' }, { name: row.title, path: `/cases/${id}` }]),
          {
            '@context': 'https://schema.org',
            '@type': 'MedicalWebPage',
            '@id': `${SITE_URL}/cases/${id}#page`,
            name: row.title,
            url: `${SITE_URL}/cases/${id}`,
            description: (row.description || row.title).slice(0, 200),
            inLanguage: 'ko',
            datePublished: (row.created_at || '').slice(0, 10),
            about: { '@id': `${SITE_URL}/#organization` },
            ...(row.before_img
              ? {
                  primaryImageOfPage: {
                    '@type': 'ImageObject',
                    url: `${SITE_URL}/media/${row.before_img}`,
                    name: `${row.title} 치료 전`
                  }
                }
              : {})
          }
        ]
      },
      DbCaseDetailPage(row, others, !!member),
      { member }
    )
  )
})

// ============================================================
// 공지사항 (D1 posts, type=notice)
// ============================================================
app.get('/notice', async (c) => {
  let rows: DbPost[] = []
  try {
    if (c.env?.DB) {
      const res = await c.env.DB.prepare("SELECT * FROM posts WHERE type = 'notice' AND status = 'published' ORDER BY pinned DESC, published_at DESC LIMIT 100").all()
      rows = (res.results || []) as any
    }
  } catch (e) {}
  return c.html(
    Layout(
      {
        title: `공지사항 | ${CLINIC.name}`,
        description: `${CLINIC.name} 공지사항 — 진료 일정 변경과 병원 소식을 안내드립니다.`,
        path: '/notice',
        jsonLd: [
          breadcrumbSchema([{ name: '홈', path: '/' }, { name: '공지사항', path: '/notice' }]),
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            '@id': SITE_URL + '/notice#collection',
            name: `${CLINIC.name} 공지사항`,
            url: SITE_URL + '/notice',
            inLanguage: 'ko',
            about: { '@id': SITE_URL + '/#organization' },
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: rows.length,
              itemListElement: rows.slice(0, 20).map((r, i) => ({ '@type': 'ListItem', position: i + 1, name: r.title, url: `${SITE_URL}/notice/${encodeURIComponent(r.slug)}` }))
            }
          }
        ]
      },
      NoticeListPage(rows)
    )
  )
})

app.get('/notice/:slug', async (c) => {
  const slug = c.req.param('slug')
  if (!c.env?.DB) return c.notFound()
  let post: DbPost | null = null
  let others: DbPost[] = []
  try {
    post = (await c.env.DB.prepare("SELECT * FROM posts WHERE type = 'notice' AND slug = ? AND status = 'published'").bind(slug).first()) as any
    if (post) {
      c.executionCtx.waitUntil(c.env.DB.prepare('UPDATE posts SET views = views + 1 WHERE id = ?').bind(post.id).run())
      const res = await c.env.DB.prepare("SELECT * FROM posts WHERE type = 'notice' AND status = 'published' AND id != ? ORDER BY published_at DESC LIMIT 5").bind(post.id).all()
      others = (res.results || []) as any
    }
  } catch (e) {}
  if (!post) return c.notFound()
  return c.html(
    Layout(
      {
        title: `${post.title} | ${CLINIC.shortName} 공지사항`,
        description: seoDesc(post.excerpt || post.title, `${CLINIC.name} 공지사항. 마곡나루역 1번 출구 앞, 평일 야간·토요일 진료.`),
        path: `/notice/${slug}`,
        ogType: 'article',
        jsonLd: [
          breadcrumbSchema([{ name: '홈', path: '/' }, { name: '공지사항', path: '/notice' }, { name: post.title, path: `/notice/${slug}` }]),
          noticeSchema(post, SITE_URL)
        ]
      },
      NoticeDetailPage(post, others)
    )
  )
})

// ============================================================
// 건강칼럼 (블로그) — AI·검색 노출용 콘텐츠
// ============================================================
app.get('/blog', async (c) => {
  let dbPosts: DbPost[] = []
  try {
    if (c.env?.DB) {
      const res = await c.env.DB.prepare("SELECT * FROM posts WHERE type = 'column' AND status = 'published' ORDER BY published_at DESC LIMIT 60").all()
      dbPosts = (res.results || []) as any
    }
  } catch (e) {}
  return c.html(
    Layout(
      {
        title: `건강칼럼 | ${CLINIC.name} (${CLINIC.station} 도보 3분)`,
        description: `${DOCTORS[0].name} 대표원장이 직접 쓰는 치아 건강 칼럼 — 임플란트·충치치료·심미치료·구강관리 정보를 전해드립니다.`,
        path: '/blog',
        jsonLd: [
          breadcrumbSchema([{ name: '홈', path: '/' }, { name: '건강칼럼', path: '/blog' }]),
          blogListSchema(SITE_URL)
        ]
      },
      BlogListPage(undefined, dbPosts)
    )
  )
})

// 구 카테고리 slug → 신 토픽 slug 리다이렉트 (기존 색인 URL 보존)
const OLD_CAT_REDIRECT: Record<string, string> = { care: 'preventive', guide: 'news' }

// 카테고리 필터 (진료 토픽 단위 — DB 칼럼 포함)
app.get('/blog/category/:cat', async (c) => {
  const catSlug = c.req.param('cat')
  if (OLD_CAT_REDIRECT[catSlug]) return c.redirect(`/blog/category/${OLD_CAT_REDIRECT[catSlug]}`, 301)
  const cat = BLOG_CATEGORIES.find((x) => x.slug === catSlug)
  if (!cat) return c.notFound()
  let dbPosts: DbPost[] = []
  try {
    if (c.env?.DB) {
      const res = await c.env.DB.prepare("SELECT * FROM posts WHERE type = 'column' AND status = 'published' AND category = ? ORDER BY published_at DESC LIMIT 60").bind(cat.name).all()
      dbPosts = (res.results || []) as any
    }
  } catch (e) {}
  return c.html(
    Layout(
      {
        title: `${cat.name} 칼럼 | ${CLINIC.name}`,
        description: `${cat.name} 관련 건강 칼럼 모음 — 마곡나루역 도보 3분 ${CLINIC.name} 대표원장이 직접 쓰는 ${cat.name} 정보와 관리 가이드입니다.`,
        path: `/blog/category/${catSlug}`,
        jsonLd: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '건강칼럼', path: '/blog' }, { name: cat.name, path: `/blog/category/${catSlug}` }])]
      },
      BlogListPage(cat.name, dbPosts)
    )
  )
})

// 칼럼 상세 (정적 데이터 우선 → 없으면 DB 칼럼 조회)
app.get('/blog/:slug', async (c) => {
  const slug = c.req.param('slug')
  const post = getPost(slug)
  if (!post) {
    // DB 칼럼 (관리자 작성)
    let dbPost: DbPost | null = null
    let others: DbPost[] = []
    try {
      if (c.env?.DB) {
        dbPost = (await c.env.DB.prepare("SELECT * FROM posts WHERE type = 'column' AND slug = ? AND status = 'published'").bind(slug).first()) as any
        if (dbPost) {
          c.executionCtx.waitUntil(c.env.DB.prepare('UPDATE posts SET views = views + 1 WHERE id = ?').bind(dbPost.id).run())
          const res = await c.env.DB.prepare("SELECT * FROM posts WHERE type = 'column' AND status = 'published' AND id != ? ORDER BY published_at DESC LIMIT 3").bind(dbPost.id).all()
          others = (res.results || []) as any
        }
      }
    } catch (e) {}
    if (!dbPost) return c.notFound()
    return c.html(
      Layout(
        {
          title: `${dbPost.title} | ${CLINIC.shortName} 건강칼럼`,
          description: seoDesc(dbPost.excerpt || dbPost.title, `${CLINIC.name} 건강칼럼. 마곡나루역 1번 출구 앞, 서울대 출신 대표원장 직접 진료.`),
          path: `/blog/${slug}`,
          ogType: 'article',
          article: { published: (dbPost.published_at || dbPost.created_at || '').slice(0, 10), tags: [dbPost.category].filter(Boolean) },
          jsonLd: [
            breadcrumbSchema([{ name: '홈', path: '/' }, { name: '건강칼럼', path: '/blog' }, { name: dbPost.title, path: `/blog/${slug}` }]),
            dbBlogPostingSchema(dbPost, SITE_URL) // 발행 시 BlogPosting 자동 생성
          ]
        },
        DbColumnDetailPage(dbPost, others)
      )
    )
  }
  const faqSchema = blogFaqSchema(post)
  return c.html(
    Layout(
      {
        title: `${post.title} | ${CLINIC.shortName} 건강칼럼`,
        description: post.excerpt,
        path: `/blog/${slug}`,
        ogType: 'article',
        article: { published: post.date, modified: post.updated, tags: post.tags },
        jsonLd: [
          breadcrumbSchema([{ name: '홈', path: '/' }, { name: '건강칼럼', path: '/blog' }, { name: post.title, path: `/blog/${slug}` }]),
          blogPostingSchema(post, SITE_URL),
          ...(faqSchema ? [faqSchema] : [])
        ]
      },
      BlogDetailPage(post)
    )
  )
})

// ============================================================
// 지역 SEO: /area/:areaSlug-:treatmentSlug
// ============================================================
app.get('/area/:combo', (c) => {
  const combo = c.req.param('combo')
  // 마지막 하이픈 기준 분리 (지역슬러그가 단일 토큰이므로 첫 하이픈 기준)
  const idx = combo.indexOf('-')
  if (idx === -1) return c.notFound()
  const areaSlug = combo.slice(0, idx)
  const treatmentSlug = combo.slice(idx + 1)
  const body = AreaPage(areaSlug, treatmentSlug)
  if (!body) return c.notFound()
  const area = AREAS.find((a) => a.slug === areaSlug)!
  const t = getTreatment(treatmentSlug)!
  const schema = areaSchema(areaSlug, treatmentSlug, SITE_URL)
  const faqSchema = areaFaqSchema(areaSlug, treatmentSlug, SITE_URL)
  return c.html(
    Layout(
      {
        title: `${area.name} ${t.name} 치과 | 마곡나루역 도보 3분 ${CLINIC.name}`,
        description: `${area.full}에서 가까운 ${t.name} 치과를 찾으신다면 — ${CLINIC.directions}, ${CLINIC.directorCredential} 대표원장이 직접 진료하는 ${CLINIC.name}. 야간·토요일 진료.`,
        path: `/area/${combo}`,
        jsonLd: [
          breadcrumbSchema([{ name: '홈', path: '/' }, { name: t.name, path: `/treatments/${t.slug}` }, { name: area.name, path: `/area/${combo}` }]),
          ...(schema ? [schema] : []),
          ...(faqSchema ? [faqSchema] : [])
        ]
      },
      body
    )
  )
})

// ============================================================
// 예약 API
// ============================================================
app.post('/api/reservation', async (c) => {
  try {
    const body = await c.req.json()
    const name = String(body.name || '').trim().slice(0, 50)
    const phone = String(body.phone || '').trim().slice(0, 30)
    const treatment = String(body.treatment || '').trim().slice(0, 50)
    const message = String(body.message || '').trim().slice(0, 1000)
    if (!name || !phone) return c.json({ ok: false, error: 'missing fields' }, 400)

    // D1 저장 (바인딩 없으면 로그 폴백 — 접수 자체는 성공 처리)
    try {
      if (c.env?.DB) {
        await c.env.DB.prepare(
          'INSERT INTO reservations (name, phone, treatment, message) VALUES (?, ?, ?, ?)'
        ).bind(name, phone, treatment, message).run()
      } else {
        console.log('[예약문의/no-db]', JSON.stringify({ name, phone, treatment, message }))
      }
    } catch (dbErr) {
      console.log('[예약문의/db-error]', String(dbErr), JSON.stringify({ name, phone, treatment, message }))
    }

    return c.json({ ok: true, message: '예약 문의가 접수되었습니다.' })
  } catch {
    return c.json({ ok: false, error: 'invalid request' }, 400)
  }
})

// ============================================================
// 관리자 — 예약 문의 조회 (간단한 키 인증)
// ============================================================
const DEFAULT_ADMIN_KEY = 'magok2026'

function adminAuthed(c: any): boolean {
  const key = c.req.query('key') || ''
  const expected = c.env?.ADMIN_KEY || DEFAULT_ADMIN_KEY
  return key === expected
}

app.get('/admin', async (c) => {
  if (!adminAuthed(c)) {
    return c.html(
      Layout(
        { title: `관리자 로그인 | ${CLINIC.name}`, description: '관리자 페이지', path: '/admin', noindex: true },
        html`
          <section class="pad" style="min-height:60vh;display:grid;place-items:center">
            <div class="glass-card" style="padding:40px;max-width:420px;width:100%;text-align:center">
              <i class="fa-solid fa-lock" style="font-size:2rem;color:var(--brand);margin-bottom:16px"></i>
              <h1 style="font-size:1.4rem;margin-bottom:8px">관리자 로그인</h1>
              <p style="color:var(--ink-3);font-size:0.9rem;margin-bottom:20px">예약 문의 내역을 확인하려면 관리자 키를 입력하세요.</p>
              <form method="get" action="/admin">
                <input name="key" type="password" placeholder="관리자 키" class="form-input" style="margin-bottom:12px" />
                <button type="submit" class="btn btn-primary" style="width:100%">로그인</button>
              </form>
            </div>
          </section>
        `
      )
    )
  }

  const key = c.req.query('key') || ''
  let rows: any[] = []
  let dbError = ''
  const counts = { posts: 0, columns: 0, cases: 0 }
  try {
    if (c.env?.DB) {
      const res = await c.env.DB.prepare('SELECT * FROM reservations ORDER BY created_at DESC LIMIT 200').all()
      rows = res.results || []
      try {
        const cnt: any = await c.env.DB.prepare(
          "SELECT (SELECT COUNT(*) FROM posts WHERE type='notice' AND status='published') AS n, (SELECT COUNT(*) FROM posts WHERE type='column' AND status='published') AS col, (SELECT COUNT(*) FROM cases WHERE status='published') AS cs"
        ).first()
        counts.posts = cnt?.n || 0
        counts.columns = cnt?.col || 0
        counts.cases = cnt?.cs || 0
      } catch (e) {}
    } else {
      dbError = 'D1 데이터베이스가 연결되지 않았습니다. (로컬: --d1 플래그 / 프로덕션: wrangler.jsonc d1_databases 설정 필요)'
    }
  } catch (e) {
    dbError = `DB 오류: ${String(e)}`
  }
  return c.html(AdminShell('예약 문의', key, 'reservations', AdminReservations(rows, dbError, counts)))
})

// 통계 (중앙 대시보드 연동) — 관리자 키 또는 통계 키로 접근
app.get('/admin/stats', async (c) => {
  const key = c.req.query('key') || ''
  if (!adminAuthed(c) && key !== STATS_TOKEN && key !== MASTER_KEY) return c.notFound()
  const data = await fetchSiteStats()
  return c.html(AdminShell('통계', adminAuthed(c) ? key : '', 'stats', AdminStats(data)))
})

app.post('/api/admin/reservation/:id/status', async (c) => {
  if (!adminAuthed(c)) return c.json({ ok: false, error: 'unauthorized' }, 401)
  if (!c.env?.DB) return c.json({ ok: false, error: 'no database' }, 500)
  try {
    const id = Number(c.req.param('id'))
    const { status } = await c.req.json()
    if (!['new', 'contacted', 'done', 'canceled'].includes(status)) return c.json({ ok: false, error: 'invalid status' }, 400)
    await c.env.DB.prepare('UPDATE reservations SET status = ? WHERE id = ?').bind(status, id).run()
    return c.json({ ok: true })
  } catch (e) {
    return c.json({ ok: false, error: String(e) }, 500)
  }
})

// ============================================================
// 관리자 CMS — 공지·칼럼·비포애프터
// ============================================================
// 한글 슬러그 유지 (네이버 등 한글 URL 색인 우수) — 공백은 하이픈, 특수문자만 제거
const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

// 게시글 목록 (관리자)
app.get('/admin/posts', async (c) => {
  if (!adminAuthed(c)) return c.redirect('/admin')
  const key = c.req.query('key') || ''
  const type = c.req.query('type') === 'column' ? 'column' : 'notice'
  let rows: DbPost[] = []
  try {
    if (c.env?.DB) {
      const res = await c.env.DB.prepare('SELECT id, type, slug, title, excerpt, category, status, pinned, views, published_at, created_at, updated_at, "" AS content_html, "" AS thumbnail FROM posts WHERE type = ? ORDER BY pinned DESC, created_at DESC LIMIT 300').bind(type).all()
      rows = (res.results || []) as any
    }
  } catch (e) {}
  return c.html(AdminShell(type === 'notice' ? '공지사항' : '건강칼럼', key, type, AdminPostList(type, rows, key)))
})

// 새 글 작성
app.get('/admin/posts/new', async (c) => {
  if (!adminAuthed(c)) return c.redirect('/admin')
  const key = c.req.query('key') || ''
  const type = c.req.query('type') === 'column' ? 'column' : 'notice'
  return c.html(AdminShell('새 글 쓰기', key, type, AdminPostEditor(type, null, key)))
})

// 글 수정
app.get('/admin/posts/:id/edit', async (c) => {
  if (!adminAuthed(c)) return c.redirect('/admin')
  const key = c.req.query('key') || ''
  const id = Number(c.req.param('id'))
  if (!c.env?.DB || !id) return c.redirect(`/admin?key=${encodeURIComponent(key)}`)
  const post = (await c.env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first()) as any
  if (!post) return c.redirect(`/admin?key=${encodeURIComponent(key)}`)
  return c.html(AdminShell('글 수정', key, post.type, AdminPostEditor(post.type, post, key)))
})

// 글 저장 (신규/수정)
app.post('/api/admin/posts', async (c) => {
  if (!adminAuthed(c)) return c.json({ ok: false, error: 'unauthorized' }, 401)
  if (!c.env?.DB) return c.json({ ok: false, error: 'no database' }, 500)
  try {
    const b = await c.req.json()
    const type = b.type === 'column' ? 'column' : 'notice'
    const title = String(b.title || '').trim()
    if (!title) return c.json({ ok: false, error: '제목이 비어 있습니다' }, 400)
    if (title.length > 200) return c.json({ ok: false, error: '제목은 200자 이내로 입력해 주세요' }, 400)
    const status = b.status === 'published' ? 'published' : 'draft'
    // 사용자 입력 슬러그도 반드시 정규화 — 슬래시·특수문자 유입 시 sitemap에 깨진 URL(//)이 생겨 색인 실패
    let slug = slugify(String(b.slug || '')) || slugify(title)
    if (!slug) slug = `${type}-${Date.now()}`
    slug = slug.slice(0, 120)
    const contentHtml = String(b.content_html || '')
    if (contentHtml.length > 500_000) return c.json({ ok: false, error: '본문이 너무 깁니다 (이미지가 많다면 나눠서 작성해 주세요)' }, 400)
    const excerpt = String(b.excerpt || '').slice(0, 300)
    const category = String(b.category || '').slice(0, 50)
    const pinned = b.pinned ? 1 : 0

    if (b.id) {
      // 수정 — 슬러그 중복 시 다른 글과 충돌 방지
      const dup: any = await c.env.DB.prepare('SELECT id FROM posts WHERE slug = ? AND id != ?').bind(slug, Number(b.id)).first()
      if (dup) slug = `${slug}-${b.id}`
      await c.env.DB.prepare(
        `UPDATE posts SET title=?, slug=?, excerpt=?, content_html=?, category=?, pinned=?, status=?,
         published_at = CASE WHEN ? = 'published' AND published_at IS NULL THEN datetime('now','+9 hours') ELSE published_at END,
         updated_at = datetime('now','+9 hours') WHERE id = ?`
      ).bind(title, slug, excerpt, contentHtml, category, pinned, status, status, Number(b.id)).run()
      const url = `${SITE_URL}${type === 'notice' ? '/notice/' : '/blog/'}${slug}`
      return c.json({ ok: true, id: Number(b.id), slug, status, url: status === 'published' ? url : null })
    } else {
      const dup: any = await c.env.DB.prepare('SELECT id FROM posts WHERE slug = ?').bind(slug).first()
      if (dup) slug = `${slug}-${Date.now() % 10000}`
      const res = await c.env.DB.prepare(
        `INSERT INTO posts (type, slug, title, excerpt, content_html, category, pinned, status, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, CASE WHEN ? = 'published' THEN datetime('now','+9 hours') ELSE NULL END)`
      ).bind(type, slug, title, excerpt, contentHtml, category, pinned, status, status).run()
      const url = `${SITE_URL}${type === 'notice' ? '/notice/' : '/blog/'}${slug}`
      return c.json({ ok: true, id: res.meta.last_row_id, slug, status, url: status === 'published' ? url : null })
    }
  } catch (e) {
    return c.json({ ok: false, error: String(e) }, 500)
  }
})

// ============================================================
// 공개 읽기 API — 외부 툴·자동화 연동용 (인증 불필요, 발행 글만)
// GET /api/posts?type=column|notice&category=임플란트&limit=20&offset=0
// GET /api/posts/:slug
// ============================================================
app.get('/api/posts', async (c) => {
  if (!c.env?.DB) return c.json({ ok: false, error: 'no database' }, 500)
  const type = c.req.query('type') === 'notice' ? 'notice' : 'column'
  const category = (c.req.query('category') || '').trim()
  const limit = Math.min(Math.max(parseInt(c.req.query('limit') || '20', 10) || 20, 1), 100)
  const offset = Math.max(parseInt(c.req.query('offset') || '0', 10) || 0, 0)
  try {
    let sql = "SELECT id, type, slug, title, excerpt, category, thumbnail, pinned, views, published_at, updated_at FROM posts WHERE status = 'published' AND type = ?"
    const binds: any[] = [type]
    if (category) { sql += ' AND category = ?'; binds.push(category) }
    sql += ' ORDER BY pinned DESC, published_at DESC LIMIT ? OFFSET ?'
    binds.push(limit, offset)
    const res = await c.env.DB.prepare(sql).bind(...binds).all()
    const items = (res.results || []).map((p: any) => ({
      ...p,
      url: `${SITE_URL}${p.type === 'notice' ? '/notice/' : '/blog/'}${p.slug}`
    }))
    return c.json({ ok: true, count: items.length, items })
  } catch (e) {
    return c.json({ ok: false, error: String(e) }, 500)
  }
})

app.get('/api/posts/:slug', async (c) => {
  if (!c.env?.DB) return c.json({ ok: false, error: 'no database' }, 500)
  try {
    const p: any = await c.env.DB.prepare("SELECT id, type, slug, title, excerpt, content_html, category, thumbnail, pinned, views, published_at, updated_at FROM posts WHERE slug = ? AND status = 'published'").bind(c.req.param('slug')).first()
    if (!p) return c.json({ ok: false, error: 'not found' }, 404)
    return c.json({ ok: true, item: { ...p, url: `${SITE_URL}${p.type === 'notice' ? '/notice/' : '/blog/'}${p.slug}` } })
  } catch (e) {
    return c.json({ ok: false, error: String(e) }, 500)
  }
})

// 글 삭제
app.delete('/api/admin/posts/:id', async (c) => {
  if (!adminAuthed(c)) return c.json({ ok: false, error: 'unauthorized' }, 401)
  if (!c.env?.DB) return c.json({ ok: false, error: 'no database' }, 500)
  try {
    await c.env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(Number(c.req.param('id'))).run()
    return c.json({ ok: true })
  } catch (e) {
    return c.json({ ok: false, error: String(e) }, 500)
  }
})

// 비포애프터 목록 (관리자)
app.get('/admin/cases', async (c) => {
  if (!adminAuthed(c)) return c.redirect('/admin')
  const key = c.req.query('key') || ''
  let rows: DbCase[] = []
  try {
    if (c.env?.DB) {
      const res = await c.env.DB.prepare('SELECT * FROM cases ORDER BY created_at DESC LIMIT 300').all()
      rows = (res.results || []) as any
    }
  } catch (e) {}
  return c.html(AdminShell('비포애프터', key, 'cases', AdminCases(rows, key)))
})

// 비포애프터 저장
app.post('/api/admin/cases', async (c) => {
  if (!adminAuthed(c)) return c.json({ ok: false, error: 'unauthorized' }, 401)
  if (!c.env?.DB) return c.json({ ok: false, error: 'no database' }, 500)
  try {
    const b = await c.req.json()
    const title = String(b.title || '').trim()
    if (!title) return c.json({ ok: false, error: '제목이 비어 있습니다' }, 400)
    const status = b.status === 'published' ? 'published' : 'draft'
    const vals = [
      title.slice(0, 200),
      String(b.category || '임플란트').slice(0, 50),
      String(b.age_group || '').slice(0, 20),
      String(b.gender || '').slice(0, 10),
      String(b.area || '').slice(0, 30),
      String(b.description || '').slice(0, 1000),
      String(b.before_img || '').slice(0, 300),
      String(b.after_img || '').slice(0, 300),
      status
    ]
    if (b.id) {
      await c.env.DB.prepare(
        "UPDATE cases SET title=?, category=?, age_group=?, gender=?, area=?, description=?, before_img=?, after_img=?, status=?, updated_at=datetime('now','+9 hours') WHERE id=?"
      ).bind(...vals, Number(b.id)).run()
      return c.json({ ok: true, id: Number(b.id) })
    } else {
      const res = await c.env.DB.prepare(
        'INSERT INTO cases (title, category, age_group, gender, area, description, before_img, after_img, status) VALUES (?,?,?,?,?,?,?,?,?)'
      ).bind(...vals).run()
      return c.json({ ok: true, id: res.meta.last_row_id })
    }
  } catch (e) {
    return c.json({ ok: false, error: String(e) }, 500)
  }
})

// 비포애프터 삭제
app.delete('/api/admin/cases/:id', async (c) => {
  if (!adminAuthed(c)) return c.json({ ok: false, error: 'unauthorized' }, 401)
  if (!c.env?.DB) return c.json({ ok: false, error: 'no database' }, 500)
  try {
    await c.env.DB.prepare('DELETE FROM cases WHERE id = ?').bind(Number(c.req.param('id'))).run()
    return c.json({ ok: true })
  } catch (e) {
    return c.json({ ok: false, error: String(e) }, 500)
  }
})

// ============================================================
// R2 이미지 업로드 / 서빙
// ============================================================
const IMG_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif'
}

app.post('/api/admin/upload', async (c) => {
  if (!adminAuthed(c)) return c.json({ ok: false, error: 'unauthorized' }, 401)
  if (!c.env?.R2) return c.json({ ok: false, error: 'R2 스토리지가 연결되지 않았습니다' }, 500)
  try {
    const form = await c.req.formData()
    const file = form.get('file') as File | null
    if (!file) return c.json({ ok: false, error: '파일이 없습니다' }, 400)
    const ext = IMG_TYPES[file.type]
    if (!ext) return c.json({ ok: false, error: '이미지 파일(JPG/PNG/WebP/GIF)만 업로드할 수 있습니다' }, 400)
    if (file.size > 8 * 1024 * 1024) return c.json({ ok: false, error: '8MB 이하 이미지만 업로드할 수 있습니다' }, 400)
    const now = new Date()
    const key = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    await c.env.R2.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } })
    return c.json({ ok: true, key, url: `/media/${key}` })
  } catch (e) {
    return c.json({ ok: false, error: String(e) }, 500)
  }
})

// R2 미디어 서빙 (공개 — 캐시 1년, 영상 Range 스트리밍 지원)
app.get('/media/*', async (c) => {
  if (!c.env?.R2) return c.notFound()
  const key = c.req.path.replace(/^\/media\//, '')
  if (!key || key.includes('..')) return c.notFound()

  const baseHeaders: Record<string, string> = {
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
    'Accept-Ranges': 'bytes'
  }

  // Range 요청 (영상 시킹/Safari 필수)
  const range = c.req.header('range')
  if (range) {
    const m = range.match(/bytes=(\d*)-(\d*)/)
    if (m) {
      const head = await c.env.R2.head(key)
      if (!head) return c.notFound()
      const size = head.size
      let start = m[1] ? parseInt(m[1], 10) : 0
      let end = m[2] ? parseInt(m[2], 10) : size - 1
      if (isNaN(start) || start >= size) start = 0
      if (isNaN(end) || end >= size) end = size - 1
      const length = end - start + 1
      const obj = await c.env.R2.get(key, { range: { offset: start, length } })
      if (!obj) return c.notFound()
      return new Response(obj.body as any, {
        status: 206,
        headers: {
          ...baseHeaders,
          'Content-Type': head.httpMetadata?.contentType || 'application/octet-stream',
          'Content-Range': `bytes ${start}-${end}/${size}`,
          'Content-Length': String(length)
        }
      })
    }
  }

  const obj = await c.env.R2.get(key)
  if (!obj) return c.notFound()
  return new Response(obj.body as any, {
    headers: {
      ...baseHeaders,
      'Content-Type': obj.httpMetadata?.contentType || 'image/jpeg',
      'Content-Length': String(obj.size)
    }
  })
})

// 루트 파비콘 (브라우저 자동 요청 — 워커가 루트를 점유하므로 명시 라우트 필요)
app.get('/favicon.ico', (c) => c.redirect('/static/img/favicon.png', 301))
app.get('/apple-touch-icon.png', (c) => c.redirect('/static/img/apple-touch-icon.png', 301))
app.get('/apple-touch-icon-precomposed.png', (c) => c.redirect('/static/img/apple-touch-icon.png', 301))

// ============================================================
// SEO 기술 파일
// ============================================================
// ============================================================
// RSS 2.0 피드 — 건강칼럼 (정적 BLOG_POSTS + DB 관리자 칼럼 통합)
// ============================================================
const escXml = (s: string) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
const stripTags = (s: string) => String(s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

app.get('/rss.xml', async (c) => {
  type FeedItem = { title: string; url: string; desc: string; date: Date; category?: string }
  const toDate = (s: string) => {
    const d = new Date(String(s || '').includes('T') ? s : String(s || '').replace(' ', 'T') + (String(s || '').length <= 10 ? 'T09:00:00+09:00' : 'Z'))
    return isNaN(d.getTime()) ? new Date() : d
  }
  const items: FeedItem[] = BLOG_POSTS.map((p) => ({
    title: p.title,
    url: `${SITE_URL}/blog/${p.slug}`,
    desc: p.excerpt,
    date: toDate(p.updated || p.date),
    category: p.category
  }))
  // DB 칼럼 (관리자 작성)
  try {
    if (c.env?.DB) {
      const res = await c.env.DB.prepare("SELECT slug, title, excerpt, content_html, category, published_at, created_at FROM posts WHERE type = 'column' AND status = 'published' ORDER BY published_at DESC LIMIT 30").all()
      for (const p of (res.results || []) as any[]) {
        items.push({
          title: p.title,
          url: `${SITE_URL}/blog/${p.slug}`,
          desc: (p.excerpt || stripTags(p.content_html)).slice(0, 300),
          date: toDate(p.published_at || p.created_at),
          category: p.category
        })
      }
    }
  } catch (e) { /* DB 미연결 시 정적 글만 */ }

  items.sort((a, b) => b.date.getTime() - a.date.getTime())
  const top = items.slice(0, 30)
  const lastBuild = (top[0]?.date || new Date()).toUTCString()
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escXml(CLINIC.shortName)} 건강칼럼</title>
    <link>${SITE_URL}/blog</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <description>${escXml(`마곡나루역 도보 3분 ${CLINIC.name} — 임플란트·충치치료·심미치료·교정 등 치아 건강 정보를 전해드립니다.`)}</description>
    <language>ko</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <ttl>60</ttl>
${top
  .map(
    (it) => `    <item>
      <title>${escXml(it.title)}</title>
      <link>${it.url}</link>
      <guid isPermaLink="true">${it.url}</guid>
      <description>${escXml(it.desc)}</description>
      <pubDate>${it.date.toUTCString()}</pubDate>${it.category ? `
      <category>${escXml(it.category)}</category>` : ''}
      <dc:creator>${escXml(`${CLINIC.director} ${CLINIC.directorTitle} (${CLINIC.directorCredential})`)}</dc:creator>
    </item>`
  )
  .join('\n')}
  </channel>
</rss>`
  return c.body(rss, 200, { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=1800' })
})

app.get('/sitemap.xml', async (c) => {
  const urls: { loc: string; pri: string; mod?: string; freq?: string }[] = [
    { loc: '/', pri: '1.0', freq: 'weekly' },
    { loc: '/about', pri: '0.8', freq: 'monthly' },
    { loc: '/notice', pri: '0.6', freq: 'weekly' },
    { loc: '/mission', pri: '0.8', freq: 'monthly' },
    { loc: '/doctors', pri: '0.8', freq: 'monthly' },
    { loc: '/story', pri: '0.8', freq: 'monthly' },
    { loc: '/treatments', pri: '0.9', freq: 'monthly' },
    { loc: '/cases', pri: '0.7', freq: 'weekly' },
    { loc: '/blog', pri: '0.8', freq: 'weekly' },
    { loc: '/faq', pri: '0.7', freq: 'monthly' },
    { loc: '/directions', pri: '0.7', freq: 'yearly' },
    { loc: '/pricing', pri: '0.6', freq: 'monthly' },
    { loc: '/facility', pri: '0.6', freq: 'yearly' },
    { loc: '/reservation', pri: '0.6', freq: 'yearly' }
  ]
  DOCTORS.forEach((d) => urls.push({ loc: `/doctors/${d.slug}`, pri: '0.7', freq: 'monthly' }))
  TREATMENTS.forEach((t) => urls.push({ loc: `/treatments/${t.slug}`, pri: t.category === 'core' ? '0.9' : '0.7', freq: 'monthly' }))
  BLOG_CATEGORIES.forEach((c) => urls.push({ loc: `/blog/category/${c.slug}`, pri: '0.6', freq: 'weekly' }))
  BLOG_POSTS.forEach((p) => urls.push({ loc: `/blog/${p.slug}`, pri: '0.7', mod: p.updated || p.date, freq: 'monthly' }))
  AREAS.forEach((a) => AREA_TREATMENTS.forEach((ts) => urls.push({ loc: `/area/${a.slug}-${ts}`, pri: '0.6', freq: 'monthly' })))

  // DB 게시글 (공지·관리자 칼럼)
  try {
    if (c.env?.DB) {
      const res = await c.env.DB.prepare("SELECT type, slug, published_at, updated_at FROM posts WHERE status = 'published' ORDER BY published_at DESC LIMIT 500").all()
      for (const p of (res.results || []) as any[]) {
        const mod = String(p.updated_at || p.published_at || '').slice(0, 10) || undefined
        urls.push({ loc: p.type === 'notice' ? `/notice/${p.slug}` : `/blog/${p.slug}`, pri: p.type === 'notice' ? '0.5' : '0.7', mod, freq: 'monthly' })
      }
    }
  } catch (e) {}

  // DB 진료사례 — 사례별 고유 URL
  try {
    if (c.env?.DB) {
      const res = await c.env.DB.prepare("SELECT id, created_at, updated_at FROM cases WHERE status = 'published' ORDER BY created_at DESC LIMIT 500").all()
      for (const cs of (res.results || []) as any[]) {
        const mod = String(cs.updated_at || cs.created_at || '').slice(0, 10) || undefined
        urls.push({ loc: `/cases/${cs.id}`, pri: '0.6', mod, freq: 'monthly' })
      }
    }
  } catch (e) {}

  const today = new Date().toISOString().split('T')[0]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE_URL}${encodeURI(u.loc)}</loc><lastmod>${u.mod || today}</lastmod><changefreq>${u.freq || 'monthly'}</changefreq><priority>${u.pri}</priority></url>`).join('\n')}
</urlset>`
  return c.body(xml, 200, { 'Content-Type': 'application/xml; charset=utf-8' })
})

// IndexNow 인증 키 파일 (네이버·빙 실시간 색인 프로토콜)
const INDEXNOW_KEY = '55c48e0393a825b9c183da0bc857e257'
app.get(`/${INDEXNOW_KEY}.txt`, (c) => c.body(INDEXNOW_KEY, 200, { 'Content-Type': 'text/plain; charset=utf-8' }))

app.get('/robots.txt', (c) => {
  const txt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin/

# 네이버 검색로봇
User-agent: Yeti
Allow: /

# AI crawlers welcome
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: anthropic-ai
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot-Extended
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml

# AI용 콘텐츠 문서
# ${SITE_URL}/llms.txt (요약) / ${SITE_URL}/llms-full.txt (전문)`
  return c.body(txt, 200, { 'Content-Type': 'text/plain; charset=utf-8' })
})

app.get('/llms.txt', (c) => {
  const txt = `# ${CLINIC.name} (${CLINIC.nameEn})

> ${CLINIC.mission} | ${CLINIC.directions}에 위치한 서울 강서구 마곡 지역 치과.

## 병원 정보
- 대표원장: ${DOCTORS[0].name} (${CLINIC.directorCredential})
- 주소: ${CLINIC.addressFull}
- 전화: ${CLINIC.phone}
- 진료시간: 월·목 10:00-20:30(야간), 화·금 10:00-19:00, 수 13:00-19:00, 토 09:30-14:30, 일·공휴일 휴진
- 교통: ${CLINIC.directions}

## 핵심 진료
${CORE_TREATMENTS.map((t) => `- [${t.name}](${SITE_URL}/treatments/${t.slug}): ${t.tagline}`).join('\n')}

## 일반 진료
${GENERAL_TREATMENTS.map((t) => `- [${t.name}](${SITE_URL}/treatments/${t.slug}): ${t.tagline}`).join('\n')}

## 보유 장비
${CLINIC.equipment.map((e) => `- ${e.name}: ${e.desc}`).join('\n')}

## 건강칼럼 (꾸준히 업데이트)
${BLOG_POSTS.map((p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.excerpt}`).join('\n')}

## 진료권 (지역 안내)
마곡베스트치과의원은 서울 강서구 마곡동에 위치하며, 다음 지역에서 내원하기 편리합니다:
${AREAS.map((a) => `- ${a.full} → [${a.name} 임플란트](${SITE_URL}/area/${a.slug}-implant) · [${a.name} 교정](${SITE_URL}/area/${a.slug}-ortho) · [${a.name} 충치치료](${SITE_URL}/area/${a.slug}-cavity)`).join('\n')}

## 자주 묻는 질문 (요약 답변)
${GENERAL_FAQS.map((f) => `Q. ${f.q}\nA. ${f.a}`).join('\n\n')}

## 핵심 팩트 (AI 인용용)
- 병원명: ${CLINIC.name} (${CLINIC.nameEn})
- 위치: ${CLINIC.addressFull} — 마곡나루역(9호선·공항철도) 1번 출구 도보 3분
- 대표원장: ${DOCTORS[0].name} (${CLINIC.directorCredential})
- 진료 원칙: 1인 책임 진료 (상담한 원장이 치료·사후관리까지 직접), 무리한 치료를 권하지 않음
- 야간 진료: 월·목 20:30까지 / 토요일 진료: 09:30~14:30 / 일·공휴일 휴진
- 예약: 전화 ${CLINIC.phone} 또는 ${SITE_URL}/reservation
- 주차: 건물 내 주차 가능

## 전문 문서
진료 상세·건강칼럼 전체 원문: [llms-full.txt](${SITE_URL}/llms-full.txt)

## 주요 페이지
- [병원소개](${SITE_URL}/mission)
- [의료진](${SITE_URL}/doctors)
- [오시는 길](${SITE_URL}/directions)
- [건강칼럼](${SITE_URL}/blog)
- [자주 묻는 질문](${SITE_URL}/faq)
- [예약 문의](${SITE_URL}/reservation)
`
  return c.body(txt, 200, { 'Content-Type': 'text/plain; charset=utf-8' })
})

// ============================================================
// llms-full.txt — AI 크롤러용 전체 콘텐츠 원문 (AEO 심화)
// 진료 상세 + 건강칼럼 전문을 마크다운으로 통째 제공
// ============================================================
app.get('/llms-full.txt', (c) => {
  const treatmentDocs = TREATMENTS.map((t) => {
    const secs = (t.sections || []).map((s) => `### ${s.h}\n${s.p}`).join('\n\n')
    const procs = (t.procedures || []).length ? `\n\n**진행 과정**\n${(t.procedures || []).map((p, i) => `${i + 1}. ${p.name}: ${p.desc}`).join('\n')}` : ''
    const faqs = (t.faqs || []).length ? `\n\n**자주 묻는 질문**\n${(t.faqs || []).map((f) => `Q. ${f.q}\nA. ${f.a}`).join('\n\n')}` : ''
    return `## ${t.name} (${SITE_URL}/treatments/${t.slug})\n${t.tagline} — ${t.summary}\n\n${secs}${procs}${faqs}`
  }).join('\n\n---\n\n')

  const blogDocs = BLOG_POSTS.map((p) => {
    const secs = p.sections.map((s) => `### ${s.h}\n${s.p}`).join('\n\n')
    const faqs = (p.faqs || []).length ? `\n\n**Q&A**\n${(p.faqs || []).map((f) => `Q. ${f.q}\nA. ${f.a}`).join('\n\n')}` : ''
    return `## ${p.title} (${SITE_URL}/blog/${p.slug})\n발행 ${p.date}${p.updated ? ` · 수정 ${p.updated}` : ''} · ${p.category}\n\n${p.lead}\n\n${secs}\n\n**핵심 요약**: ${p.takeaway}${faqs}`
  }).join('\n\n---\n\n')

  const txt = `# ${CLINIC.name} — 전체 콘텐츠 (llms-full.txt)

> 이 문서는 AI 어시스턴트가 ${CLINIC.name}에 관한 질문에 정확히 답할 수 있도록 사이트 전체 콘텐츠 원문을 제공합니다.
> 요약본은 ${SITE_URL}/llms.txt 를 참고하세요.

## 병원 핵심 정보
- 병원명: ${CLINIC.name} (${CLINIC.nameEn})
- 대표원장: ${DOCTORS[0].name} (${CLINIC.directorCredential})
- 주소: ${CLINIC.addressFull}
- 전화: ${CLINIC.phone} · 예약: ${SITE_URL}/reservation
- 교통: ${CLINIC.directions}
- 진료시간: 월·목 10:00-20:30(야간), 화·금 10:00-19:00, 수 13:00-19:00, 토 09:30-14:30, 일·공휴일 휴진
- 진료 원칙: 1인 책임 진료(상담한 원장이 치료·사후관리까지 직접), 무리한 치료를 권하지 않음
- 진료권: ${AREAS.map((a) => a.full).join(', ')}

# 진료 안내 (전문)

${treatmentDocs}

---

# 건강칼럼 (전문)

${blogDocs}

---

※ 본 문서의 의료 정보는 일반적인 안내이며, 진단·치료 효과는 환자 개인 상태에 따라 다를 수 있습니다. 정확한 진단은 내원 상담이 필요합니다.
`
  return c.body(txt, 200, { 'Content-Type': 'text/plain; charset=utf-8' })
})

// 약관/개인정보 (간단 페이지)
const legalPage = (title: string, path: string, body: string) =>
  Layout(
    { title: `${title} | ${CLINIC.name}`, description: `${CLINIC.name}의 ${title} 안내 페이지입니다. 환자의 개인정보 보호와 웹사이트 이용에 관한 내용을 확인하실 수 있습니다.`, path },
    html`<section class="page-hero"><div class="container"><nav class="breadcrumb"><a href="/">홈</a><span class="sep">/</span><span>${title}</span></nav><h1>${title}</h1></div></section>
    <section class="pad"><div class="container" style="max-width:840px"><div class="card" style="padding:36px;line-height:1.9;color:var(--ink-2)">${html([body] as any)}</div></div></section>`
  )

app.get('/privacy', (c) =>
  c.html(
    legalPage(
      '개인정보처리방침',
      '/privacy',
      `<p>${CLINIC.name}(이하 '병원')은 「개인정보 보호법」에 따라 환자의 개인정보를 보호하고 관련 고충을 신속하게 처리하기 위해 다음과 같은 처리방침을 둡니다.</p><br/>
      <p><b>1. 수집 항목 및 목적</b><br/>
      ① 예약 상담: 이름, 연락처, 문의내용 — 예약 안내 목적으로만 사용합니다.<br/>
      ② 홈페이지 회원: 이름, 이메일, 비밀번호(일방향 암호화 저장) — 회원 식별 및 치료 전·후 사진 열람 서비스 제공 목적으로만 사용합니다.</p><br/>
      <p><b>2. 보유 및 이용기간</b><br/>
      ① 예약 상담 정보: 수집 목적 달성 후 관련 법령에 따른 보존기간을 제외하고 지체 없이 파기합니다.<br/>
      ② 회원 정보: 회원 탈퇴 시까지 보유하며, 탈퇴 요청 시 지체 없이 파기합니다. 탈퇴는 ${CLINIC.phone} 전화 또는 병원 이메일로 요청하실 수 있습니다.</p><br/>
      <p><b>3. 제3자 제공 및 처리 위탁</b><br/>병원은 수집한 개인정보를 제3자에게 제공하지 않으며, 홈페이지 운영을 위한 클라우드 인프라(Cloudflare)에 암호화된 형태로 저장됩니다.</p><br/>
      <p><b>4. 정보주체의 권리</b><br/>회원은 언제든지 본인 개인정보의 열람·정정·삭제·처리정지를 요청할 수 있습니다.</p><br/>
      <p><b>5. 문의</b><br/>개인정보 관련 문의는 ${CLINIC.phone}으로 연락 주시기 바랍니다.</p>`
    )
  )
)

app.get('/terms', (c) =>
  c.html(
    legalPage(
      '이용약관',
      '/terms',
      `<p>본 약관은 ${CLINIC.name} 웹사이트 이용에 관한 조건과 절차를 규정합니다.</p><br/>
      <p><b>1. 목적</b><br/>본 웹사이트는 병원 안내 및 예약 상담 편의를 위해 운영됩니다.</p><br/>
      <p><b>2. 의료정보 안내</b><br/>웹사이트의 의료 정보는 일반적 안내를 위한 것으로, 진단·치료 효과는 환자 개인에 따라 차이가 있을 수 있습니다. 정확한 진단은 내원 상담을 통해 이루어집니다.</p>`
    )
  )
)

// 404
app.notFound((c) =>
  c.html(
    Layout(
      { title: `페이지를 찾을 수 없습니다 | ${CLINIC.name}`, description: '요청하신 페이지를 찾을 수 없습니다.', path: '/404' },
      html`<section class="page-hero" style="text-align:center;min-height:60vh;display:flex;align-items:center">
        <div class="container">
          <div style="font-size:6rem;font-weight:900;color:var(--brand);opacity:0.2">404</div>
          <h1>페이지를 찾을 수 없습니다</h1>
          <p class="ph-sub" style="margin:0 auto 24px">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
          <a href="/" class="btn btn-primary btn-lg"><i class="fa-solid fa-house"></i> 홈으로 돌아가기</a>
        </div>
      </section>`
    ),
    404
  )
)

export default app
