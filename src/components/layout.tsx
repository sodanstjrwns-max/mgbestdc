import { html, raw } from 'hono/html'
import { CLINIC, CORE_TREATMENTS, GENERAL_TREATMENTS } from '../data/clinic'

type SeoMeta = {
  title: string
  description: string
  path: string
  ogType?: string
  jsonLd?: object[]
}

const SITE_URL = 'https://magok-best-dental.pages.dev'

// ============================================================
// <head> — 페이지별 SEO 메타 + OG + 스키마
// ============================================================
export function Head(meta: SeoMeta) {
  const canonical = SITE_URL + meta.path
  const ld = meta.jsonLd || []
  return html`
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${meta.title}</title>
      <meta name="description" content="${meta.description}" />
      <link rel="canonical" href="${canonical}" />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="author" content="${CLINIC.name}" />
      <meta name="theme-color" content="#07090F" />

      <!-- Open Graph -->
      <meta property="og:type" content="${meta.ogType || 'website'}" />
      <meta property="og:site_name" content="${CLINIC.name}" />
      <meta property="og:title" content="${meta.title}" />
      <meta property="og:description" content="${meta.description}" />
      <meta property="og:url" content="${canonical}" />
      <meta property="og:locale" content="ko_KR" />
      <meta property="og:image" content="${SITE_URL}/static/img/og.svg" />

      <!-- Twitter -->
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${meta.title}" />
      <meta name="twitter:description" content="${meta.description}" />
      <meta name="twitter:image" content="${SITE_URL}/static/img/og.svg" />

      <!-- Favicon -->
      <link rel="icon" type="image/svg+xml" href="/static/img/favicon.svg" />
      <link rel="apple-touch-icon" href="/static/img/favicon.svg" />

      <!-- Fonts -->
      <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=JetBrains+Mono:wght@300;400;500&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css"
      />
      <link rel="stylesheet" href="/static/style.css" />

      <!-- JSON-LD -->
      ${raw(
        ld
          .map((obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`)
          .join('\n')
      )}
    </head>
  `
}

// ============================================================
// 공통 스키마 빌더
// ============================================================
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    '@id': SITE_URL + '/#organization',
    name: CLINIC.name,
    alternateName: CLINIC.nameEn,
    url: SITE_URL,
    telephone: CLINIC.phone,
    email: CLINIC.email,
    image: SITE_URL + '/static/img/og.svg',
    priceRange: '₩₩',
    address: {
      '@type': 'PostalAddress',
      streetAddress: CLINIC.addressShort,
      addressLocality: '강서구',
      addressRegion: '서울특별시',
      postalCode: CLINIC.postalCode,
      addressCountry: 'KR'
    },
    geo: { '@type': 'GeoCoordinates', latitude: CLINIC.geo.lat, longitude: CLINIC.geo.lng },
    openingHoursSpecification: CLINIC.hoursSchema.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes
    })),
    medicalSpecialty: 'Dentistry',
    availableService: [...CORE_TREATMENTS, ...GENERAL_TREATMENTS].map((t) => ({
      '@type': 'MedicalProcedure',
      name: t.name
    }))
  }
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: SITE_URL + it.path
    }))
  }
}

// ============================================================
// HEADER (GNB + 메가드롭다운)
// ============================================================
function Header() {
  return html`
    <header class="site-header">
      <div class="container">
        <a href="/" class="logo" aria-label="${CLINIC.name} 홈">
          <span class="logo-mark"><i class="fa-solid fa-tooth"></i></span>
          <span>마곡베스트치과<small>MAGOK BEST DENTAL</small></span>
        </a>

        <nav aria-label="주요 메뉴">
          <ul class="gnb">
            <li><a href="/mission">병원소개</a></li>
            <li><a href="/doctors">의료진</a></li>
            <li>
              <a href="/treatments">진료안내 <i class="fa-solid fa-chevron-down"></i></a>
              <div class="mega">
                <div class="mega-grid">
                  <div class="mega-col-title">핵심 진료</div>
                  ${raw(
                    CORE_TREATMENTS.map(
                      (t) => `
                    <a href="/treatments/${t.slug}" class="mega-item core">
                      <i class="fa-solid ${t.icon}"></i>
                      <span><span class="mi-name">${t.name}</span><span class="mi-desc">${t.tagline}</span></span>
                    </a>`
                    ).join('')
                  )}
                  <div class="mega-col-title">일반 진료</div>
                  ${raw(
                    GENERAL_TREATMENTS.map(
                      (t) => `
                    <a href="/treatments/${t.slug}" class="mega-item">
                      <i class="fa-solid ${t.icon}"></i>
                      <span><span class="mi-name">${t.name}</span><span class="mi-desc">${t.tagline}</span></span>
                    </a>`
                    ).join('')
                  )}
                </div>
              </div>
            </li>
            <li>
              <a href="/cases">진료사례 <i class="fa-solid fa-chevron-down"></i></a>
              <div class="mega" style="min-width:300px">
                <div class="mega-grid" style="grid-template-columns:1fr">
                  <a href="/cases" class="mega-item"><i class="fa-solid fa-images"></i><span><span class="mi-name">비포·애프터</span><span class="mi-desc">치료 전후 비교</span></span></a>
                  <a href="/faq" class="mega-item"><i class="fa-solid fa-circle-question"></i><span><span class="mi-name">자주 묻는 질문</span><span class="mi-desc">진료별 FAQ</span></span></a>
                </div>
              </div>
            </li>
            <li>
              <a href="/directions">안내 <i class="fa-solid fa-chevron-down"></i></a>
              <div class="mega" style="min-width:300px">
                <div class="mega-grid" style="grid-template-columns:1fr">
                  <a href="/directions" class="mega-item"><i class="fa-solid fa-location-dot"></i><span><span class="mi-name">오시는 길</span><span class="mi-desc">${CLINIC.directions}</span></span></a>
                  <a href="/pricing" class="mega-item"><i class="fa-solid fa-won-sign"></i><span><span class="mi-name">비용 안내</span><span class="mi-desc">비급여 진료비 고지</span></span></a>
                  <a href="/facility" class="mega-item"><i class="fa-solid fa-hospital"></i><span><span class="mi-name">시설 둘러보기</span><span class="mi-desc">장비·공간 안내</span></span></a>
                </div>
              </div>
            </li>
          </ul>
        </nav>

        <div class="header-cta">
          <a href="tel:${CLINIC.phoneRaw}" class="btn-call"><i class="fa-solid fa-phone"></i> ${CLINIC.phone}</a>
          <a href="/reservation" class="btn btn-primary"><i class="fa-solid fa-calendar-check"></i> 예약문의</a>
          <button class="menu-toggle" aria-label="메뉴 열기"><span></span><span></span><span></span></button>
        </div>
      </div>
    </header>

    <div class="mobile-nav">
      <a href="/mission" class="top-link">병원소개</a>
      <a href="/doctors" class="top-link">의료진</a>
      <details>
        <summary>진료안내</summary>
        <div class="sub">
          ${raw([...CORE_TREATMENTS, ...GENERAL_TREATMENTS].map((t) => `<a href="/treatments/${t.slug}">${t.name}</a>`).join(''))}
        </div>
      </details>
      <a href="/cases" class="top-link">진료사례</a>
      <a href="/faq" class="top-link">자주 묻는 질문</a>
      <details>
        <summary>안내</summary>
        <div class="sub">
          <a href="/directions">오시는 길</a>
          <a href="/pricing">비용 안내</a>
          <a href="/facility">시설 둘러보기</a>
        </div>
      </details>
      <div class="mobile-cta">
        <a href="tel:${CLINIC.phoneRaw}" class="btn btn-glass"><i class="fa-solid fa-phone"></i> ${CLINIC.phone}</a>
        <a href="/reservation" class="btn btn-primary"><i class="fa-solid fa-calendar-check"></i> 예약 문의하기</a>
      </div>
    </div>
  `
}

// ============================================================
// FOOTER (사업자정보 + SNS + 약관 + 의료광고법 고지)
// ============================================================
function Footer() {
  return html`
    <footer class="site-footer">
      <div class="container">
        <div class="footer-top">
          <div class="footer-brand">
            <div class="logo">
              <span class="logo-mark"><i class="fa-solid fa-tooth"></i></span>
              <span>마곡베스트치과<small>MAGOK BEST DENTAL</small></span>
            </div>
            <p>${CLINIC.mission}<br />${CLINIC.directions}에 위치한 ${CLINIC.region} 강서구의 환자 중심 치과입니다.</p>
          </div>
          <div class="footer-col">
            <h5>진료안내</h5>
            ${raw(CORE_TREATMENTS.map((t) => `<a href="/treatments/${t.slug}">${t.name}</a>`).join(''))}
            <a href="/treatments">전체 진료보기</a>
          </div>
          <div class="footer-col">
            <h5>바로가기</h5>
            <a href="/mission">병원소개</a>
            <a href="/doctors">의료진</a>
            <a href="/cases">진료사례</a>
            <a href="/faq">자주 묻는 질문</a>
            <a href="/reservation">예약 문의</a>
          </div>
          <div class="footer-col">
            <h5>오시는 길</h5>
            <ul class="footer-contact">
              <li><i class="fa-solid fa-location-dot"></i><span>${CLINIC.addressFull}</span></li>
              <li><i class="fa-solid fa-train-subway"></i><span>${CLINIC.directions}</span></li>
              <li><i class="fa-solid fa-phone"></i><a href="tel:${CLINIC.phoneRaw}">${CLINIC.phone}</a></li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <div class="footer-biz">
            상호 <b>${CLINIC.name}</b> · 대표자 ${CLINIC.director} · 사업자등록번호 ${CLINIC.businessNumber}<br />
            주소 ${CLINIC.addressFull} · 개업 ${CLINIC.openedYear}년 · TEL ${CLINIC.phone}
          </div>
          <div class="footer-legal">
            <a href="/privacy">개인정보처리방침</a>
            <a href="/terms">이용약관</a>
            <a href="/sitemap.xml">사이트맵</a>
          </div>
        </div>

        <div class="compliance-note">
          본 웹사이트의 의료 정보는 일반적인 안내를 위한 것으로, 진단·치료 효과는 환자 개인의 상태에 따라 차이가 있을 수 있습니다.
          정확한 진단과 치료 계획은 반드시 내원하여 전문의와 상담하시기 바랍니다.
          모든 의료 콘텐츠는 ${CLINIC.directorCredential} ${CLINIC.director} 대표원장의 검토를 거쳤습니다.
          © ${CLINIC.openedYear}–2026 ${CLINIC.name}. All rights reserved.
        </div>
      </div>
    </footer>
  `
}

// ============================================================
// 전체 페이지 래퍼
// ============================================================
export function Layout(meta: SeoMeta, body: ReturnType<typeof html>) {
  return html`<!DOCTYPE html>
    <html lang="ko">
      ${Head(meta)}
      <body>
        <div class="aurora" aria-hidden="true"><span class="a1"></span><span class="a2"></span><span class="a3"></span></div>
        <div class="scroll-progress"></div>
        ${Header()}
        <main>${body}</main>
        ${Footer()}
        <script src="/static/app.js"></script>
        <script src="/static/fx.js" defer></script>
      </body>
    </html>`
}

export { SITE_URL }
