import { html, raw } from 'hono/html'
import { CLINIC, CORE_TREATMENTS, GENERAL_TREATMENTS, AREAS } from '../data/clinic'

type SeoMeta = {
  title: string
  description: string
  path: string
  ogType?: string
  ogImage?: string
  jsonLd?: object[]
  noindex?: boolean
  article?: { published: string; modified?: string; tags?: string[] }
}

const SITE_URL = 'https://mgbestdc.kr'

// ============================================================
// <head> — 페이지별 SEO 메타 + OG + 스키마
// ============================================================
export function Head(meta: SeoMeta) {
  const canonical = SITE_URL + encodeURI(meta.path)
  // 전 페이지 공통: Dentist 조직 스키마(@id 앵커)를 항상 먼저 출력 —
  // 개별 페이지 스키마는 { '@id': SITE_URL + '/#organization' } 참조로 연결 (블랑쉬 패턴)
  const ld = [organizationSchema(), ...(meta.jsonLd || [])]
  return html`
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="naver-site-verification" content="dc262d0d13e7b3aed2514747a1d6b435503b9fb6" />
      <title>${meta.title}</title>
      <meta name="description" content="${meta.description}" />
      <link rel="canonical" href="${canonical}" />
      <link rel="alternate" hreflang="ko" href="${canonical}" />
      <link rel="alternate" hreflang="x-default" href="${canonical}" />
      <link rel="alternate" type="application/rss+xml" title="${CLINIC.shortName} 건강칼럼 RSS" href="${SITE_URL}/rss.xml" />
      <meta name="robots" content="${meta.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}" />
      <meta name="author" content="${CLINIC.name}" />
      <meta name="theme-color" content="#F7F9FC" />

      <!-- 지역 SEO: geo 메타 (마곡·강서구) -->
      <meta name="geo.region" content="KR-11" />
      <meta name="geo.placename" content="서울특별시 강서구 마곡동" />
      <meta name="geo.position" content="${CLINIC.geo.lat};${CLINIC.geo.lng}" />
      <meta name="ICBM" content="${CLINIC.geo.lat}, ${CLINIC.geo.lng}" />

      <!-- Open Graph -->
      <meta property="og:type" content="${meta.ogType || 'website'}" />
      <meta property="og:site_name" content="${CLINIC.name}" />
      <meta property="og:title" content="${meta.title}" />
      <meta property="og:description" content="${meta.description}" />
      <meta property="og:url" content="${canonical}" />
      <meta property="og:locale" content="ko_KR" />
      <meta property="og:image" content="${meta.ogImage || SITE_URL + '/static/img/og.png?v=2'}" />
      ${meta.ogImage ? '' : raw('<meta property="og:image:width" content="1200" />\n      <meta property="og:image:height" content="630" />')}
      <meta property="og:image:alt" content="${CLINIC.name} — ${CLINIC.directions}" />

      ${meta.article
        ? raw(
            `<meta property="article:published_time" content="${meta.article.published}" />
      <meta property="article:modified_time" content="${meta.article.modified || meta.article.published}" />
      <meta property="article:author" content="${SITE_URL}/doctors" />` +
              (meta.article.tags || []).map((t) => `\n      <meta property="article:tag" content="${t}" />`).join('')
          )
        : ''}

      <!-- Twitter -->
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${meta.title}" />
      <meta name="twitter:description" content="${meta.description}" />
      <meta name="twitter:image" content="${SITE_URL}/static/img/og.png?v=2" />

      <!-- Favicon -->
      <link rel="icon" type="image/png" href="/static/img/favicon.png" />
      <link rel="apple-touch-icon" href="/static/img/apple-touch-icon.png" />

      <!-- Fonts (Pretendard 본문 + Noto Serif KR 디스플레이 — 블랑쉬 감성 30%) -->
      <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@500;600;700&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css"
        media="print"
        onload="this.media='all'"
      />
      <noscript><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css" /></noscript>
      <link rel="stylesheet" href="/static/style.css?v=design14" />
      ${meta.path === '/' ? raw('<link rel="preload" as="image" href="/static/img/hero-lobby.webp" imagesrcset="/static/img/hero-lobby-720.webp 720w, /static/img/hero-lobby.webp 1920w" imagesizes="100vw" fetchpriority="high" />') : ''}

      <!-- JSON-LD -->
      ${raw(
        ld
          .map((obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`)
          .join('\n')
      )}
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ZYKCDVQMQE"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-ZYKCDVQMQE',{anonymize_ip:true});</script>
<script>(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","yc8341dz7r");</script>
    </head>
  `
}

// ============================================================
// 공통 스키마 빌더
// ============================================================
// 조직 @id 참조 헬퍼 — 개별 스키마에서 publisher/worksFor 등에 사용
export function orgRef() {
  return { '@id': SITE_URL + '/#organization' }
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Dentist', 'LocalBusiness'],
    '@id': SITE_URL + '/#organization',
    name: CLINIC.name,
    alternateName: [CLINIC.nameEn, '마곡베스트치과', '마곡 베스트치과'],
    url: SITE_URL,
    telephone: CLINIC.phone,
    email: CLINIC.email,
    image: SITE_URL + '/static/img/og.png',
    logo: SITE_URL + '/static/img/symbol-512.png',
    slogan: CLINIC.mission,
    foundingDate: '2023-11-01',
    taxID: CLINIC.businessNumber,
    identifier: { '@type': 'PropertyValue', name: '사업자등록번호', value: CLINIC.businessNumber },
    inLanguage: 'ko',
    priceRange: '₩₩',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: CLINIC.phone,
      contactType: '예약 및 진료 상담',
      availableLanguage: 'Korean',
      areaServed: 'KR'
    },
    potentialAction: [
      {
        '@type': 'ReserveAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: SITE_URL + '/reservation',
          actionPlatform: ['http://schema.org/DesktopWebPlatform', 'http://schema.org/MobileWebPlatform']
        },
        result: { '@type': 'Reservation', name: '진료 예약 문의' }
      },
      {
        '@type': 'ReserveAction',
        name: '네이버 예약',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: CLINIC.social.naverBooking,
          actionPlatform: ['http://schema.org/DesktopWebPlatform', 'http://schema.org/MobileWebPlatform']
        },
        result: { '@type': 'Reservation', name: '네이버 진료 예약' }
      },
      {
        '@type': 'CommunicateAction',
        name: '카카오톡 상담',
        target: { '@type': 'EntryPoint', urlTemplate: CLINIC.social.kakao }
      }
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: CLINIC.addressShort,
      addressLocality: '강서구',
      addressRegion: '서울특별시',
      postalCode: CLINIC.postalCode,
      addressCountry: 'KR'
    },
    geo: { '@type': 'GeoCoordinates', latitude: CLINIC.geo.lat, longitude: CLINIC.geo.lng },
    hasMap: `https://map.naver.com/p/search/${encodeURIComponent(CLINIC.name)}`,
    openingHoursSpecification: CLINIC.hoursSchema.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes
    })),
    medicalSpecialty: 'Dentistry',
    paymentAccepted: '현금, 신용카드, 계좌이체',
    currenciesAccepted: 'KRW',
    isAccessibleForFree: false,
    publicAccess: true,
    smokingAllowed: false,
    keywords: '마곡 치과, 마곡나루역 치과, 강서구 치과, 임플란트, 충치치료, 심미치료, 투명교정, 야간진료 치과, 토요일 치과',
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: '월·목 야간진료 (20:30까지)', value: true },
      { '@type': 'LocationFeatureSpecification', name: '토요일 진료', value: true },
      { '@type': 'LocationFeatureSpecification', name: '건물 내 주차', value: true },
      { '@type': 'LocationFeatureSpecification', name: '디지털 구강 스캐너', value: true }
    ],
    // 지역 SEO 핵심: 진료권 명시 (마곡 중심 강서구 일대)
    areaServed: AREAS.map((a) => ({ '@type': 'AdministrativeArea', name: a.full })),
    knowsAbout: [...CORE_TREATMENTS, ...GENERAL_TREATMENTS].map((t) => t.name).concat(['마곡 치과', '마곡나루역 치과', '강서구 치과']),
    founder: {
      '@type': 'Person',
      name: CLINIC.director,
      jobTitle: CLINIC.directorTitle,
      description: CLINIC.directorCredential
    },
    availableService: [...CORE_TREATMENTS, ...GENERAL_TREATMENTS].map((t) => ({
      '@type': 'MedicalProcedure',
      name: t.name,
      url: SITE_URL + '/treatments/' + t.slug
    })),
    sameAs: [CLINIC.social.blog, CLINIC.social.instagram, CLINIC.social.naverPlace, 'https://pf.kakao.com/_xdjNsG'].filter(Boolean)
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
type MemberInfo = { id: number; email: string; name: string } | null

function Header(member: MemberInfo = null) {
  return html`
    <header class="site-header">
      <div class="container">
        <a href="/" class="logo" aria-label="${CLINIC.name} 홈">
          <img src="/static/img/logo-h.png?v=2" alt="마곡베스트치과 로고" class="logo-img" width="977" height="141" />
        </a>

        <nav aria-label="주요 메뉴">
          <ul class="gnb">
            <li>
              <a href="/about">소개 <i class="fa-solid fa-chevron-down"></i></a>
              <div class="mega" style="min-width:250px">
                <div class="mega-grid" style="grid-template-columns:1fr">
                  <a href="/mission" class="mega-item"><i class="fa-solid fa-hand-holding-heart"></i><span><span class="mi-name">병원소개</span></span></a>
                  <a href="/story" class="mega-item"><i class="fa-solid fa-book-open"></i><span><span class="mi-name">스토리</span></span></a>
                  <a href="/doctors" class="mega-item"><i class="fa-solid fa-user-doctor"></i><span><span class="mi-name">의료진</span></span></a>
                  <a href="/facility" class="mega-item"><i class="fa-solid fa-hospital"></i><span><span class="mi-name">시설·장비</span></span></a>
                  <a href="/directions" class="mega-item"><i class="fa-solid fa-location-dot"></i><span><span class="mi-name">오시는 길</span></span></a>
                </div>
              </div>
            </li>
            <li>
              <a href="/treatments">진료 <i class="fa-solid fa-chevron-down"></i></a>
              <div class="mega" style="min-width:520px">
                <div class="mega-grid" style="grid-template-columns:1fr 1fr">
                  ${raw(
                    [...CORE_TREATMENTS, ...GENERAL_TREATMENTS].map(
                      (t) => `
                    <a href="/treatments/${t.slug}" class="mega-item${t.category === 'core' ? ' core' : ''}">
                      <i class="fa-solid ${t.icon}"></i>
                      <span><span class="mi-name">${t.name}</span></span>
                    </a>`
                    ).join('')
                  )}
                  <a href="/treatments" class="mega-item" style="grid-column:1/-1"><i class="fa-solid fa-list"></i><span><span class="mi-name">전체 진료 보기</span></span></a>
                </div>
              </div>
            </li>
            <li><a href="/cases">치료사례</a></li>
            <li>
              <a href="/blog">칼럼 <i class="fa-solid fa-chevron-down"></i></a>
              <div class="mega" style="min-width:250px">
                <div class="mega-grid" style="grid-template-columns:1fr">
                  <a href="/blog" class="mega-item"><i class="fa-solid fa-pen-nib"></i><span><span class="mi-name">건강칼럼</span></span></a>
                  <a href="/notice" class="mega-item"><i class="fa-solid fa-bullhorn"></i><span><span class="mi-name">공지사항</span></span></a>
                </div>
              </div>
            </li>
            <li>
              <a href="/reservation">상담·안내 <i class="fa-solid fa-chevron-down"></i></a>
              <div class="mega" style="min-width:250px">
                <div class="mega-grid" style="grid-template-columns:1fr">
                  <a href="/reservation" class="mega-item"><i class="fa-solid fa-calendar-check"></i><span><span class="mi-name">예약 문의</span></span></a>
                  <a href="/pricing" class="mega-item"><i class="fa-solid fa-won-sign"></i><span><span class="mi-name">비용 안내</span></span></a>
                  <a href="/faq" class="mega-item"><i class="fa-solid fa-circle-question"></i><span><span class="mi-name">자주 묻는 질문</span></span></a>
                </div>
              </div>
            </li>
          </ul>
        </nav>

        <div class="header-cta">
          ${member
            ? html`<a href="/logout" class="btn-member" title="${member.name}님 로그아웃"><i class="fa-solid fa-user-check"></i> 로그아웃</a>`
            : html`<a href="/login" class="btn-member"><i class="fa-regular fa-user"></i> 로그인</a>`}
          <a href="tel:${CLINIC.phoneRaw}" class="btn-call"><i class="fa-solid fa-phone"></i> ${CLINIC.phone}</a>
          <a href="/reservation" class="btn btn-primary"><i class="fa-solid fa-calendar-check"></i> 예약문의</a>
          <button class="menu-toggle" aria-label="메뉴 열기" aria-expanded="false" aria-controls="mobile-nav"><span></span><span></span><span></span></button>
        </div>
      </div>
    </header>

    <div class="mobile-nav" id="mobile-nav">
      <details>
        <summary>소개</summary>
        <div class="sub">
          <a href="/mission">병원소개</a>
          <a href="/story">스토리</a>
          <a href="/doctors">의료진</a>
          <a href="/facility">시설·장비</a>
          <a href="/directions">오시는 길</a>
        </div>
      </details>
      <details>
        <summary>진료</summary>
        <div class="sub">
          ${raw([...CORE_TREATMENTS, ...GENERAL_TREATMENTS].map((t) => `<a href="/treatments/${t.slug}">${t.name}</a>`).join(''))}
          <a href="/treatments">전체 진료 보기</a>
        </div>
      </details>
      <a href="/cases" class="top-link">치료사례</a>
      <details>
        <summary>칼럼</summary>
        <div class="sub">
          <a href="/blog">건강칼럼</a>
          <a href="/notice">공지사항</a>
        </div>
      </details>
      <details>
        <summary>상담·안내</summary>
        <div class="sub">
          <a href="/reservation">예약 문의</a>
          <a href="/pricing">비용 안내</a>
          <a href="/faq">자주 묻는 질문</a>
        </div>
      </details>
      ${member
        ? html`<a href="/logout" class="top-link"><i class="fa-solid fa-user-check"></i> ${member.name}님 · 로그아웃</a>`
        : html`<a href="/login" class="top-link"><i class="fa-regular fa-user"></i> 로그인 / 회원가입</a>`}
      <div class="mobile-cta">
        <a href="tel:${CLINIC.phoneRaw}" class="btn btn-ghost"><i class="fa-solid fa-phone"></i> ${CLINIC.phone}</a>
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
              <img src="/static/img/logo-h-white.png?v=2" alt="마곡베스트치과 로고" class="logo-img" width="977" height="141" loading="lazy" />
            </div>
            <p>${CLINIC.mission}<br />${CLINIC.directions} — 보건복지부 인증 통합치의학과 전문의가 진단부터 사후 관리까지 직접 진료합니다.</p>
          </div>
          <div class="footer-col">
            <div class="footer-h">진료안내</div>
            ${raw(CORE_TREATMENTS.map((t) => `<a href="/treatments/${t.slug}">${t.name}</a>`).join(''))}
            <a href="/treatments">전체 진료보기</a>
          </div>
          <div class="footer-col">
            <div class="footer-h">바로가기</div>
            <a href="/about">병원 소개</a>
            <a href="/story">스토리</a>
            <a href="/doctors">의료진</a>
            <a href="/cases">치료사례</a>
            <a href="/blog">건강칼럼</a>
            <a href="/notice">공지사항</a>
            <a href="/faq">자주 묻는 질문</a>
            <a href="/reservation">예약 문의</a>
            <a href="${CLINIC.social.naverBooking}" target="_blank" rel="noopener">네이버 예약</a>
          </div>
          <div class="footer-col">
            <div class="footer-h">오시는 길</div>
            <ul class="footer-contact">
              <li><i class="fa-solid fa-location-dot"></i><span>${CLINIC.addressFull}</span></li>
              <li><i class="fa-solid fa-train-subway"></i><span>${CLINIC.directions}</span></li>
              <li><i class="fa-solid fa-phone"></i><a href="tel:${CLINIC.phoneRaw}">${CLINIC.phone}</a></li>
            </ul>
            <div class="footer-sns" aria-label="외부 채널">
              <a href="${CLINIC.social.naverBooking}" target="_blank" rel="noopener" aria-label="네이버 예약" title="네이버 예약"><span class="n-ico">N</span></a>
              <a href="${CLINIC.social.kakao}" target="_blank" rel="noopener" aria-label="카카오톡 채널" title="카카오톡 채널"><i class="fa-solid fa-comment"></i></a>
              <a href="${CLINIC.social.blog}" target="_blank" rel="noopener" aria-label="네이버 블로그" title="네이버 블로그"><i class="fa-solid fa-blog"></i></a>
              <a href="${CLINIC.social.instagram}" target="_blank" rel="noopener" aria-label="인스타그램" title="인스타그램"><i class="fa-brands fa-instagram"></i></a>
            </div>
          </div>
        </div>

        <nav class="footer-areas" aria-label="진료권 안내">
          <span class="fa-label">진료권 안내</span>
          <div class="fa-links">
            ${raw(AREAS.map((a) => `<a href="/area/${a.slug}-implant">${a.name} 임플란트</a><a href="/area/${a.slug}-ortho">${a.name} 교정</a>`).join(''))}
          </div>
        </nav>

        <div class="footer-bottom">
          <div class="footer-biz">
            상호 <b>${CLINIC.name}</b> · 대표자 ${CLINIC.director} · 사업자등록번호 ${CLINIC.businessNumber}<br />
            주소 ${CLINIC.addressLegal} · 개업 ${CLINIC.openedYear}년 · TEL ${CLINIC.phone}
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
// 퍼널 장치: 플로팅 CTA (데스크톱) + 스티키 바 (모바일)
// ============================================================
function FloatingCta() {
  const kakao = CLINIC.social.kakao || `tel:${CLINIC.phoneRaw}`
  const kakaoIsLink = !!CLINIC.social.kakao
  return html`
    <nav class="float-cta" aria-label="빠른 상담">
      <a href="${kakao}" class="fc-kakao" ${raw(kakaoIsLink ? 'target="_blank" rel="noopener"' : '')} id="float-kakao">
        <i class="fa-solid fa-comment"></i> 카톡 상담
      </a>
      <a href="${CLINIC.social.naverBooking}" class="fc-naver" target="_blank" rel="noopener" id="float-naver">
        <span class="n-ico" aria-hidden="true">N</span> 네이버 예약
      </a>
      <a href="/reservation" class="fc-reserve" id="float-reserve">
        <i class="fa-solid fa-calendar-check"></i> 예약 문의
      </a>
      <a href="#" class="fc-top" id="btn-top" aria-label="맨 위로"><i class="fa-solid fa-arrow-up"></i></a>
    </nav>

    <nav class="sticky-bar" aria-label="모바일 빠른 상담">
      <a href="tel:${CLINIC.phoneRaw}" class="sb-call"><i class="fa-solid fa-phone"></i> 전화</a>
      <a href="${kakao}" class="sb-kakao" ${raw(kakaoIsLink ? 'target="_blank" rel="noopener"' : '')}><i class="fa-solid fa-comment"></i> 카톡</a>
      <a href="${CLINIC.social.naverBooking}" class="sb-naver" target="_blank" rel="noopener"><span class="n-ico" aria-hidden="true">N</span> 네이버 예약</a>
    </nav>
  `
}

// ============================================================
// 전체 페이지 래퍼
// ============================================================
export function Layout(meta: SeoMeta, body: ReturnType<typeof html>, opts?: { member?: MemberInfo }) {
  return html`<!DOCTYPE html>
    <html lang="ko">
      ${Head(meta)}
      <body>
        <div class="aurora" aria-hidden="true"><span class="a1"></span><span class="a2"></span><span class="a3"></span></div>
        <div class="scroll-progress"></div>
        ${Header(opts?.member || null)}
        <main>${body}</main>
        ${Footer()}
        ${FloatingCta()}
        <script src="/static/app.js?v=design5" defer></script>
      </body>
    </html>`
}

export { SITE_URL }
