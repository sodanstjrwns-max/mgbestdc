// ============================================================
// 마곡베스트치과의원 — CMS 공개 페이지 (공지사항 / DB 칼럼 / 비포애프터)
// D1 posts·cases 테이블 기반. 관리자 페이지에서 작성한 콘텐츠 렌더링.
// ============================================================
import { html, raw } from 'hono/html'
import { CLINIC, DOCTORS } from '../data/clinic'

export const esc = (s: string) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const fmtDate = (d: string) => (d || '').slice(0, 10).replace(/-/g, '.')

// 카테고리명(한글) → 진료 slug — 사례·칼럼에서 진료 페이지로 역링크 (토픽 허브)
const CAT_TO_TX: Record<string, string> = {
  '임플란트': 'implant',
  '충치·신경치료': 'cavity',
  '충치치료': 'cavity',
  '심미치료': 'cosmetic',
  '교정': 'ortho',
  '교정치료': 'ortho',
  '턱관절': 'tmj',
  '턱관절치료': 'tmj',
  '잇몸치료': 'gum',
  '보철치료': 'prosthesis',
  '발치·사랑니': 'extraction',
  '예방·검진': 'preventive',
  '구강 관리': 'preventive'
}
export const txSlugOfCategory = (cat: string) => CAT_TO_TX[(cat || '').trim()] || null

export type DbPost = {
  id: number
  type: string
  slug: string
  title: string
  excerpt: string
  content_html: string
  category: string
  thumbnail: string
  status: string
  pinned: number
  views: number
  published_at: string
  created_at: string
  updated_at: string
}

export type DbCase = {
  id: number
  title: string
  category: string
  age_group: string
  gender: string
  area: string
  description: string
  before_img: string
  after_img: string
  status: string
  created_at: string
}

// ============================================================
// 공지사항 목록
// ============================================================
export function NoticeListPage(posts: DbPost[]) {
  const pinned = posts.filter((p) => p.pinned)
  const normal = posts.filter((p) => !p.pinned)
  const ordered = [...pinned, ...normal]
  return html`
    <section class="page-hero" data-ghost="NOTICE">
      <div class="container">
        <nav class="breadcrumb"><a href="/">홈</a><span class="sep">/</span><span>공지사항</span></nav>
        <span class="eyebrow">NOTICE</span>
        <h1>공지<span class="grad">사항</span></h1>
        <p class="ph-sub">진료 일정 변경, 병원 소식, 안내 말씀을 전해드립니다.</p>
      </div>
    </section>

    <section class="pad">
      <div class="container" style="max-width:860px">
        ${ordered.length === 0
          ? html`<p style="text-align:center;color:var(--ink-3);padding:80px 0"><i class="fa-regular fa-bell" style="font-size:2rem;display:block;margin-bottom:16px;opacity:0.4"></i>등록된 공지사항이 없습니다.</p>`
          : html`
            <div class="notice-list reveal">
              ${raw(
                ordered
                  .map(
                    (p) => `
                <a href="/notice/${esc(p.slug)}" class="notice-row${p.pinned ? ' is-pinned' : ''}">
                  <span class="nr-badge">${p.pinned ? '<i class="fa-solid fa-thumbtack"></i> 고정' : '공지'}</span>
                  <span class="nr-title">${esc(p.title)}</span>
                  <span class="nr-date">${fmtDate(p.published_at || p.created_at)}</span>
                </a>`
                  )
                  .join('')
              )}
            </div>`}
      </div>
    </section>
  `
}

// ============================================================
// 공지사항 상세
// ============================================================
export function NoticeDetailPage(post: DbPost, others: DbPost[]) {
  return html`
    <section class="page-hero" data-ghost="NOTICE">
      <div class="container">
        <nav class="breadcrumb"><a href="/">홈</a><span class="sep">/</span><a href="/notice">공지사항</a><span class="sep">/</span><span>상세</span></nav>
        <span class="eyebrow">NOTICE</span>
        <h1 style="max-width:880px;font-size:clamp(1.5rem,3.4vw,2.2rem)">${esc(post.title)}</h1>
        <div class="post-meta">
          <span><i class="fa-regular fa-calendar"></i> ${fmtDate(post.published_at || post.created_at)}</span>
          <span><i class="fa-regular fa-eye"></i> ${post.views + 1}</span>
        </div>
      </div>
    </section>

    <section class="pad">
      <div class="container" style="max-width:860px">
        <div class="post-body cms-body reveal">${raw(post.content_html)}</div>
        <div style="margin-top:48px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap">
          <a href="/notice" class="btn btn-ghost"><i class="fa-solid fa-list"></i> 목록으로</a>
          <a href="/reservation" class="btn btn-primary">예약 문의 <i class="fa-solid fa-arrow-right"></i></a>
        </div>
        ${others.length
          ? html`
            <div style="margin-top:56px">
              <h2 class="h4" style="margin-bottom:16px">다른 공지사항</h2>
              <div class="notice-list">
                ${raw(
                  others
                    .map(
                      (p) => `
                  <a href="/notice/${esc(p.slug)}" class="notice-row">
                    <span class="nr-badge">공지</span>
                    <span class="nr-title">${esc(p.title)}</span>
                    <span class="nr-date">${fmtDate(p.published_at || p.created_at)}</span>
                  </a>`
                    )
                    .join('')
                )}
              </div>
            </div>`
          : ''}
      </div>
    </section>
  `
}

// ============================================================
// DB 칼럼 상세 (관리자 작성 글 — Toast UI HTML 렌더)
// ============================================================
export function DbColumnDetailPage(post: DbPost, others: DbPost[]) {
  const doctor = DOCTORS[0]
  return html`
    <article>
      <section class="page-hero" data-ghost="COLUMN">
        <div class="container">
          <nav class="breadcrumb"><a href="/">홈</a><span class="sep">/</span><a href="/blog">건강칼럼</a><span class="sep">/</span><span>${esc(post.category || '칼럼')}</span></nav>
          <span class="eyebrow">${esc(post.category || '건강 칼럼')}</span>
          <h1 style="max-width:880px">${esc(post.title)}</h1>
          <div class="post-meta">
            <span><i class="fa-solid fa-user-doctor"></i> ${doctor.name} ${doctor.title}</span>
            <span><i class="fa-regular fa-calendar"></i> ${fmtDate(post.published_at || post.created_at)}</span>
            <span><i class="fa-regular fa-eye"></i> ${post.views + 1}</span>
          </div>
        </div>
      </section>

      <section class="pad">
        <div class="container">
          <div class="t-detail-grid">
            <div class="post-body cms-body">
              ${raw(post.content_html)}
              <p class="post-disclaimer">본 칼럼은 일반적인 정보 제공을 위한 것으로, 진단·치료 효과는 환자 개인의 상태에 따라 차이가 있을 수 있습니다. 정확한 진단과 치료 계획은 반드시 내원하여 전문의와 상담하시기 바랍니다.</p>
            </div>

            <aside class="t-sidebar">
              <div class="side-card brand">
                <h3 class="h4">상담 예약</h3>
                <p>칼럼 내용에 대해 더 궁금한 점이 있으신가요? 정확한 진단을 통해 안내드립니다.</p>
                <a href="/reservation" class="btn btn-white" style="width:100%"><i class="fa-solid fa-calendar-check"></i> 예약 문의</a>
                <a href="tel:${CLINIC.phoneRaw}" class="btn" style="width:100%;margin-top:10px;background:rgba(255,255,255,0.12);color:#fff"><i class="fa-solid fa-phone"></i> ${CLINIC.phone}</a>
              </div>
              ${txSlugOfCategory(post.category)
                ? html`
                <div class="side-card">
                  <h3 class="h4">관련 진료</h3>
                  <div class="side-links">
                    <a href="/treatments/${txSlugOfCategory(post.category)}"><i class="fa-solid fa-tooth"></i> ${esc(post.category)} 진료 안내 <i class="fa-solid fa-arrow-right" style="margin-left:auto"></i></a>
                    <a href="/cases"><i class="fa-solid fa-images"></i> 치료사례 보기 <i class="fa-solid fa-arrow-right" style="margin-left:auto"></i></a>
                  </div>
                </div>`
                : ''}
              ${others.length
                ? html`
                <div class="side-card">
                  <h3 class="h4">다른 칼럼</h3>
                  <div class="side-links">
                    ${raw(others.map((o) => `<a href="/blog/${esc(o.slug)}">${esc(o.title)} <i class="fa-solid fa-arrow-right"></i></a>`).join(''))}
                  </div>
                </div>`
                : ''}
            </aside>
          </div>
        </div>
      </section>
    </article>
  `
}

// ============================================================
// JSON-LD: DB 칼럼 BlogPosting — 발행 시 서버가 자동 렌더 (작성자는 신경 쓸 필요 없음)
// ============================================================
export function dbBlogPostingSchema(post: DbPost, siteUrl: string) {
  const doctor = DOCTORS[0]
  const published = (post.published_at || post.created_at || '').slice(0, 10)
  const modified = (post.updated_at || post.published_at || post.created_at || '').slice(0, 10)
  // 본문 텍스트 요약 (HTML 태그 제거)
  const plain = String(post.content_html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${siteUrl}/blog/${post.slug}#article`,
    headline: post.title,
    description: post.excerpt || plain.slice(0, 155),
    articleBody: plain.slice(0, 2000),
    url: `${siteUrl}/blog/${post.slug}`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/blog/${post.slug}` },
    image: post.thumbnail ? `${siteUrl}/media/${post.thumbnail}` : `${siteUrl}/static/img/og.png`,
    datePublished: published,
    dateModified: modified,
    inLanguage: 'ko',
    articleSection: post.category || '건강칼럼',
    author: {
      '@type': 'Physician',
      '@id': `${siteUrl}/doctors/${doctor.slug}/#physician`,
      name: `${doctor.name} ${doctor.title}`,
      jobTitle: CLINIC.directorCredential,
      url: `${siteUrl}/doctors/${doctor.slug}`,
      worksFor: { '@id': `${siteUrl}/#organization` }
    },
    publisher: { '@id': `${siteUrl}/#organization` },
    isPartOf: { '@type': 'Blog', name: `${CLINIC.shortName} 건강칼럼`, url: `${siteUrl}/blog` }
  }
}

// JSON-LD: 공지사항 NewsArticle
export function noticeSchema(post: DbPost, siteUrl: string) {
  const published = (post.published_at || post.created_at || '').slice(0, 10)
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    '@id': `${siteUrl}/notice/${post.slug}#article`,
    headline: post.title,
    description: post.excerpt || post.title,
    url: `${siteUrl}/notice/${post.slug}`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/notice/${post.slug}` },
    datePublished: published,
    dateModified: (post.updated_at || '').slice(0, 10) || published,
    inLanguage: 'ko',
    author: { '@id': `${siteUrl}/#organization` },
    publisher: { '@id': `${siteUrl}/#organization` }
  }
}

// After 이미지 렌더 — 로그인 시 원본, 비로그인 시 블러+잠금 (문자열 버전, raw 삽입용)
function afterImgHtml(afterImg: string, title: string, isMember: boolean, returnPath: string): string {
  if (isMember) {
    return afterImg
      ? `<img src="/media/${esc(afterImg)}" alt="${esc(title)} 치료 후" loading="lazy" />`
      : `<i class="fa-solid fa-image" style="font-size:1.6rem;color:var(--ink-3);opacity:0.4"></i>`
  }
  return `${afterImg ? `<img src="/media/${esc(afterImg)}" alt="${esc(title)} 치료 후" loading="lazy" style="filter:blur(14px);transform:scale(1.1)" />` : ''}
    <a href="/login?redirect=${encodeURIComponent(returnPath)}" class="lock-ui" style="text-decoration:none" onclick="event.stopPropagation()"><i class="fa-solid fa-lock"></i><span>로그인 시<br />확인 가능</span></a>`
}

// ============================================================
// 비포·애프터 상세 (DB cases) — 개별 URL /cases/:id
// ============================================================
export function DbCaseDetailPage(c: DbCase, others: DbCase[], isMember = false) {
  const txSlug = txSlugOfCategory(c.category)
  const myPath = `/cases/${c.id}`
  return html`
    <section class="page-hero" data-ghost="CASE">
      <div class="container">
        <nav class="breadcrumb"><a href="/">홈</a><span class="sep">/</span><a href="/cases">진료사례</a><span class="sep">/</span><span>${esc(c.category)}</span></nav>
        <span class="eyebrow">${esc(c.category)} 사례</span>
        <h1 style="max-width:880px;font-size:clamp(1.5rem,3.4vw,2.2rem)">${esc(c.title)}</h1>
        <div class="post-meta">
          <span><i class="fa-solid fa-tooth"></i> ${esc(c.category)}</span>
          ${c.age_group ? html`<span>${esc(c.age_group)}</span>` : ''}
          ${c.gender ? html`<span>${esc(c.gender)}</span>` : ''}
          ${c.area ? html`<span><i class="fa-solid fa-location-dot"></i> ${esc(c.area)}</span>` : ''}
          <span><i class="fa-regular fa-calendar"></i> ${fmtDate(c.created_at)}</span>
        </div>
      </div>
    </section>

    <section class="pad">
      <div class="container" style="max-width:920px">
        ${isMember
          ? html`<div class="notice-box reveal" style="margin-bottom:28px">
          <i class="fa-solid fa-circle-check" style="color:var(--brand)"></i>
          <div>회원님은 치료 전·후 사진을 모두 확인하실 수 있습니다. 치료 결과는 환자 개인의 상태에 따라 차이가 있을 수 있습니다.</div>
        </div>`
          : html`<div class="notice-box reveal" style="margin-bottom:28px">
          <i class="fa-solid fa-circle-info"></i>
          <div>의료법에 따라 치료 후(After) 사진은 <a href="/login?redirect=${encodeURIComponent(myPath)}" style="color:var(--acc);font-weight:700">로그인</a> 후 확인하실 수 있습니다. 치료 결과는 환자 개인의 상태에 따라 차이가 있을 수 있습니다. <a href="/signup?redirect=${encodeURIComponent(myPath)}" style="color:var(--acc);font-weight:700">회원가입 →</a></div>
        </div>`}

        <div class="case-detail-imgs reveal">
          <figure class="ba-img" style="border-radius:var(--radius-lg);border:1px solid var(--line-3)">
            <span class="ba-tag">Before</span>
            ${c.before_img
              ? raw(`<img src="/media/${esc(c.before_img)}" alt="${esc(c.title)} 치료 전" />`)
              : raw(`<i class="fa-solid fa-image" style="font-size:1.6rem;color:var(--ink-3);opacity:0.4"></i>`)}
          </figure>
          <figure class="ba-img${isMember ? '' : ' locked'}" style="border-radius:var(--radius-lg);border:1px solid var(--line-3)">
            ${isMember ? raw(`<span class="ba-tag" style="background:var(--brand)">After</span>`) : ''}
            ${raw(afterImgHtml(c.after_img, c.title, isMember, myPath))}
          </figure>
        </div>

        ${c.description
          ? html`
        <div class="post-body reveal" style="margin-top:32px">
          <p style="font-size:0.98rem;line-height:1.9;color:var(--ink-2)">${esc(c.description)}</p>
        </div>`
          : ''}

        <p class="post-disclaimer reveal" style="margin-top:24px">본 사례는 정보 제공을 위한 것으로, 치료 방법·기간·결과는 환자 개인의 구강 상태에 따라 차이가 있을 수 있습니다. 정확한 진단과 치료 계획은 반드시 내원하여 전문의와 상담하시기 바랍니다.</p>

        <div style="margin-top:40px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap">
          <a href="/cases" class="btn btn-ghost"><i class="fa-solid fa-list"></i> 사례 목록</a>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            ${txSlug ? html`<a href="/treatments/${txSlug}" class="btn btn-ghost">${esc(c.category)} 진료 안내 <i class="fa-solid fa-arrow-right"></i></a>` : ''}
            <a href="/reservation" class="btn btn-primary">예약 문의 <i class="fa-solid fa-arrow-right"></i></a>
          </div>
        </div>

        ${others.length
          ? html`
        <div style="margin-top:56px">
          <h2 class="h4" style="margin-bottom:16px">다른 진료사례</h2>
          <div class="ba-grid">
            ${raw(
              others
                .slice(0, 3)
                .map(
                  (o) => `
            <a href="/cases/${o.id}" class="ba-card">
              <div class="ba-images">
                <div class="ba-img">
                  <span class="ba-tag">Before</span>
                  ${o.before_img ? `<img src="/media/${esc(o.before_img)}" alt="${esc(o.title)} 치료 전" loading="lazy" />` : `<i class="fa-solid fa-image" style="font-size:1.6rem;color:var(--ink-3);opacity:0.4"></i>`}
                </div>
                <div class="ba-img${isMember ? '' : ' locked'}">
                  ${isMember ? `<span class="ba-tag" style="background:var(--brand)">After</span>` : ''}
                  ${afterImgHtml(o.after_img, o.title, isMember, `/cases/${o.id}`)}
                </div>
              </div>
              <div class="ba-body">
                <h3 class="h4">${esc(o.title)}</h3>
                <div class="ba-meta"><span>${esc(o.category)}</span>${o.age_group ? `<span>${esc(o.age_group)}</span>` : ''}</div>
              </div>
            </a>`
                )
                .join('')
            )}
          </div>
        </div>`
          : ''}
      </div>
    </section>
  `
}

// ============================================================
// 비포·애프터 (DB cases) — 의료광고법: After는 내원 확인 안내
// ============================================================
export function DbCasesPage(rows: DbCase[], activeCat?: string, isMember = false) {
  const cats = Object.keys(CAT_TO_TX).filter((k, i, a) => a.findIndex((x) => CAT_TO_TX[x] === CAT_TO_TX[k]) === i)
  const listPath = activeCat ? `/cases?cat=${encodeURIComponent(activeCat)}` : '/cases'
  return html`
    <section class="page-hero" data-ghost="CASES">
      <div class="container">
        <nav class="breadcrumb"><a href="/">홈</a><span class="sep">/</span><span>진료사례</span></nav>
        <span class="eyebrow">진료 사례</span>
        <h1>비포 · <span class="grad">애프터</span></h1>
        <p class="ph-sub">실제 진료 사례를 통해 마곡베스트치과의 진료를 확인하실 수 있습니다.</p>
      </div>
    </section>

    <section class="pad">
      <div class="container">
        ${isMember
          ? html`<div class="notice-box reveal" style="margin-bottom:24px">
          <i class="fa-solid fa-circle-check" style="color:var(--brand)"></i>
          <div>회원님은 치료 전·후 사진을 모두 확인하실 수 있습니다. 치료 결과는 환자 개인의 상태에 따라 차이가 있을 수 있습니다.</div>
        </div>`
          : html`<div class="notice-box reveal" style="margin-bottom:24px">
          <i class="fa-solid fa-circle-info"></i>
          <div>의료법에 따라 치료 후(After) 사진은 <a href="/login?redirect=${encodeURIComponent(listPath)}" style="color:var(--acc);font-weight:700">로그인</a> 후 확인하실 수 있습니다. 치료 결과는 환자 개인의 상태에 따라 차이가 있을 수 있습니다. <a href="/signup?redirect=${encodeURIComponent(listPath)}" style="color:var(--acc);font-weight:700">회원가입 →</a></div>
        </div>`}

        <nav class="case-filter reveal" aria-label="진료 과목별 사례 필터" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:32px">
          <a href="/cases" class="t-area-chip${!activeCat ? ' is-active' : ''}" style="${!activeCat ? 'background:var(--brand);color:#fff;border-color:var(--brand)' : ''}">전체</a>
          ${raw(cats.map((cat) => `<a href="/cases?cat=${encodeURIComponent(cat)}" class="t-area-chip${activeCat === cat ? ' is-active' : ''}" style="${activeCat === cat ? 'background:var(--brand);color:#fff;border-color:var(--brand)' : ''}">${esc(cat)}</a>`).join(''))}
        </nav>

        ${rows.length === 0
          ? html`
        <div class="ba-grid" aria-label="준비 중인 진료 사례">
          ${raw(
            [
              { cat: '임플란트', desc: '자연치아 보존을 먼저 살핀 뒤 진행한 임플란트 사례가 준비 중입니다.' },
              { cat: '충치치료', desc: '치아 삭제를 최소화한 단계별 충치치료 사례가 준비 중입니다.' },
              { cat: '심미치료', desc: '자연스러운 색과 형태를 살린 심미치료 사례가 준비 중입니다.' }
            ]
              .map(
                (c, i) => `
            <div class="ba-card ba-coming reveal reveal-d${i + 1}">
              <div class="ba-images">
                <div class="ba-img"><span class="ba-tag">Before</span><span class="ba-soon"><i class="fa-regular fa-clock"></i>준비 중</span></div>
                <div class="ba-img locked"><div class="lock-ui"><i class="fa-solid fa-lock"></i><span>회원가입 시<br />확인 가능</span></div></div>
              </div>
              <div class="ba-body">
                <h2 class="h4">${c.cat} 사례</h2>
                <div class="ba-meta"><span>${c.cat}</span><span>순차 공개 예정</span></div>
                <p style="margin-top:10px;font-size:0.88rem;color:var(--ink-2);line-height:1.7">${c.desc}</p>
              </div>
            </div>`
              )
              .join('')
          )}
        </div>
        <p style="text-align:center;color:var(--ink-3);margin-top:36px;font-size:0.9rem">실제 진료 사례는 환자분 동의 절차를 거쳐 순차적으로 공개됩니다. 치료 후(After) 사진은 회원가입 후 확인하실 수 있으며, 자세한 상담이 필요하시다면 <a href="/reservation" style="color:var(--acc);font-weight:700">내원 예약</a>을 이용해 주세요.</p>`
          : html`
        <div class="ba-grid">
          ${raw(
            rows
              .map(
                (c) => `
            <a href="/cases/${c.id}" class="ba-card reveal" aria-label="${esc(c.title)} 사례 자세히 보기">
              <div class="ba-images">
                <div class="ba-img">
                  <span class="ba-tag">Before</span>
                  ${c.before_img ? `<img src="/media/${esc(c.before_img)}" alt="${esc(c.title)} 치료 전" loading="lazy" />` : `<i class="fa-solid fa-image" style="font-size:1.6rem;color:var(--ink-3);opacity:0.4"></i>`}
                </div>
                <div class="ba-img${isMember ? '' : ' locked'}">
                  ${isMember ? `<span class="ba-tag" style="background:var(--brand)">After</span>` : ''}
                  ${afterImgHtml(c.after_img, c.title, isMember, listPath)}
                </div>
              </div>
              <div class="ba-body">
                <h2 class="h4">${esc(c.title)}</h2>
                <div class="ba-meta">
                  <span>${esc(c.category)}</span>
                  ${c.age_group ? `<span>${esc(c.age_group)}</span>` : ''}
                  ${c.gender ? `<span>${esc(c.gender)}</span>` : ''}
                  ${c.area ? `<span><i class="fa-solid fa-location-dot"></i> ${esc(c.area)}</span>` : ''}
                </div>
                ${c.description ? `<p style="margin-top:10px;font-size:0.88rem;color:var(--ink-2);line-height:1.7">${esc(c.description)}</p>` : ''}
                <span class="ba-more">자세히 보기 <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
              </div>
            </a>`
              )
              .join('')
          )}
        </div>`}
      </div>
    </section>
  `
}
