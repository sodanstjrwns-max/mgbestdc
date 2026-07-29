import { html, raw } from 'hono/html'
import { CLINIC, getTreatment, DOCTORS } from '../data/clinic'
import { BLOG_POSTS, BLOG_CATEGORIES, sortedPosts, getPost, type BlogPost } from '../data/blog'

// 날짜 표기: 2026-05-28 → 2026.05.28
const fmtDate = (d: string) => d.replace(/-/g, '.')

// ============================================================
// 블로그 목록
// ============================================================
export function BlogListPage(activeCat?: string) {
  const posts = sortedPosts().filter((p) => !activeCat || p.category === activeCat)
  const [featured, ...rest] = posts

  return html`
    <section class="page-hero">
      <div class="container">
        <nav class="breadcrumb"><a href="/">홈</a><span class="sep">/</span><span>건강칼럼</span></nav>
        <span class="eyebrow">건강 칼럼</span>
        <h1>건강 <span class="grad">칼럼</span></h1>
        <p class="ph-sub">${DOCTORS[0].name} 대표원장이 전하는 치아 건강 이야기. 임플란트·충치치료·심미치료부터 일상 속 구강 관리까지, 정확하고 도움이 되는 정보를 꾸준히 업데이트합니다.</p>
      </div>
    </section>

    <section class="pad">
      <div class="container">
        <!-- 카테고리 필터 -->
        <nav class="blog-cats reveal" aria-label="칼럼 분류">
          <a href="/blog" class="${!activeCat ? 'on' : ''}">전체</a>
          ${raw(
            BLOG_CATEGORIES.map(
              (c) => `<a href="/blog/category/${c.slug}" class="${activeCat === c.name ? 'on' : ''}">${c.name}</a>`
            ).join('')
          )}
        </nav>

        ${
          featured
            ? raw(`
        <!-- 대표 글 -->
        <a href="/blog/${featured.slug}" class="blog-feature reveal">
          <div class="bf-visual"><i class="fa-solid ${featured.icon}"></i></div>
          <div class="bf-body">
            <span class="bf-cat">${featured.category}</span>
            <h2>${featured.title}</h2>
            <p>${featured.excerpt}</p>
            <div class="bf-meta">
              <span><i class="fa-regular fa-calendar"></i> ${fmtDate(featured.date)}</span>
              <span><i class="fa-regular fa-clock"></i> ${featured.readMin}분</span>
              <span class="bf-go">읽어보기 <i class="fa-solid fa-arrow-right"></i></span>
            </div>
          </div>
        </a>`)
            : ''
        }

        <!-- 나머지 글 그리드 -->
        <div class="blog-grid">
          ${raw(
            rest
              .map(
                (p, i) => `
            <a href="/blog/${p.slug}" class="blog-card reveal reveal-d${(i % 3) + 1}">
              <span class="bc-ico"><i class="fa-solid ${p.icon}"></i></span>
              <span class="bc-cat">${p.category}</span>
              <h3>${p.title}</h3>
              <p>${p.excerpt.slice(0, 92)}…</p>
              <div class="bc-meta">
                <span>${fmtDate(p.date)}</span>
                <span class="bc-read">${p.readMin}분 읽기</span>
              </div>
            </a>`
              )
              .join('')
          )}
        </div>

        ${
          posts.length === 0
            ? raw(`<p style="color:var(--fg-3);text-align:center;padding:60px 0">해당 분류의 칼럼이 아직 없습니다.</p>`)
            : ''
        }
      </div>
    </section>

    <section class="pad-sm"><div class="cta-band">
      <div class="reveal" style="text-align:center">
        <span class="label">궁금한 점이 있으신가요?</span>
        <h2>궁금한 점이 있으신가요?</h2>
        <p>칼럼에서 다루지 못한 궁금증은 진료실에서 직접 안내해 드립니다. 부담 없이 문의해 주세요.</p>
        <div class="cta-actions">
          <a href="/reservation" class="btn btn-primary btn-lg">예약 문의하기 <i class="fa-solid fa-arrow-right"></i></a>
          <a href="tel:${CLINIC.phoneRaw}" class="btn btn-ghost btn-lg">${CLINIC.phone}</a>
        </div>
      </div>
    </div></section>
  `
}

// ============================================================
// 블로그 상세
// ============================================================
export function BlogDetailPage(post: BlogPost) {
  const related = post.related.map((s) => getTreatment(s)).filter(Boolean)
  const others = sortedPosts().filter((p) => p.slug !== post.slug).slice(0, 3)
  const doctor = DOCTORS[0]

  return html`
    <article>
      <section class="page-hero">
        <div class="container">
          <nav class="breadcrumb"><a href="/">홈</a><span class="sep">/</span><a href="/blog">건강칼럼</a><span class="sep">/</span><span>${post.category}</span></nav>
          <span class="eyebrow">${post.category}</span>
          <h1 style="max-width:880px">${post.title}</h1>
          <div class="post-meta">
            <span><i class="fa-solid fa-user-doctor"></i> ${doctor.name} ${doctor.title}</span>
            <span><i class="fa-regular fa-calendar"></i> ${fmtDate(post.date)}</span>
            <span><i class="fa-regular fa-clock"></i> 약 ${post.readMin}분</span>
          </div>
        </div>
      </section>

      <section class="pad">
        <div class="container">
          <div class="t-detail-grid">
            <div class="post-body">
              <p class="post-lead">${post.lead}</p>

              ${raw(
                post.sections
                  .map(
                    (s) => `
                <div class="t-section reveal">
                  <h2>${s.h}</h2>
                  <p>${s.p}</p>
                </div>`
                  )
                  .join('')
              )}

              <!-- 핵심 요약 (AEO 친화 박스) -->
              <div class="post-takeaway reveal">
                <span class="pt-label"><i class="fa-solid fa-lightbulb"></i> 핵심 요약</span>
                <p>${post.takeaway}</p>
              </div>

              ${
                post.faqs
                  ? raw(`
              <div class="t-section reveal">
                <h2>자주 묻는 질문</h2>
                <div class="faq-list">
                  ${post.faqs
                    .map(
                      (f) => `
                    <details class="faq-item">
                      <summary><span style="display:flex;gap:12px;align-items:center"><span class="q-ico">Q</span>${f.q}</span></summary>
                      <div class="faq-a">${f.a}</div>
                    </details>`
                    )
                    .join('')}
                </div>
              </div>`)
                  : ''
              }

              <!-- 태그 -->
              <div class="post-tags reveal">
                ${raw(post.tags.map((t) => `<span class="ptag">#${t}</span>`).join(''))}
              </div>

              <!-- 의료광고법 안내 -->
              <p class="post-disclaimer">본 칼럼은 일반적인 정보 제공을 위한 것으로, 진단·치료 효과는 환자 개인의 상태에 따라 차이가 있을 수 있습니다. 정확한 진단과 치료 계획은 반드시 내원하여 전문의와 상담하시기 바랍니다.</p>
            </div>

            <aside class="t-sidebar">
              <div class="side-card brand">
                <h4>상담 예약</h4>
                <p>칼럼 내용에 대해 더 궁금한 점이 있으신가요? 정확한 진단을 통해 안내드립니다.</p>
                <a href="/reservation" class="btn btn-white" style="width:100%"><i class="fa-solid fa-calendar-check"></i> 예약 문의</a>
                <a href="tel:${CLINIC.phoneRaw}" class="btn" style="width:100%;margin-top:10px;background:rgba(255,255,255,0.12);color:#fff"><i class="fa-solid fa-phone"></i> ${CLINIC.phone}</a>
              </div>

              ${
                related.length
                  ? raw(`
              <div class="side-card">
                <h4>관련 진료</h4>
                <div class="side-links">
                  ${related.map((r: any) => `<a href="/treatments/${r.slug}"><i class="fa-solid ${r.icon}"></i> ${r.name} <i class="fa-solid fa-arrow-right" style="margin-left:auto"></i></a>`).join('')}
                </div>
              </div>`)
                  : ''
              }

              <div class="side-card">
                <h4>다른 칼럼</h4>
                <div class="side-links">
                  ${raw(others.map((o) => `<a href="/blog/${o.slug}">${o.title} <i class="fa-solid fa-arrow-right"></i></a>`).join(''))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </article>
  `
}

// ============================================================
// JSON-LD: BlogPosting / Article (AI·검색 노출 핵심)
// ============================================================
export function blogPostingSchema(post: BlogPost, siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    '@id': `${siteUrl}/blog/${post.slug}/#article`,
    headline: post.title,
    description: post.excerpt,
    url: `${siteUrl}/blog/${post.slug}`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/blog/${post.slug}` },
    image: `${siteUrl}/static/img/og.png`,
    datePublished: post.date,
    dateModified: post.updated || post.date,
    inLanguage: 'ko',
    keywords: post.tags.join(', '),
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.post-lead'] },
    author: {
      '@type': 'Physician',
      '@id': `${siteUrl}/doctors/${DOCTORS[0].slug}/#physician`,
      name: `${DOCTORS[0].name} ${DOCTORS[0].title}`,
      jobTitle: CLINIC.directorCredential,
      url: `${siteUrl}/doctors/${DOCTORS[0].slug}`,
      worksFor: { '@type': 'Dentist', name: CLINIC.name, '@id': `${siteUrl}/#organization` }
    },
    publisher: {
      '@type': 'Dentist',
      name: CLINIC.name,
      url: siteUrl
    },
    about: { '@type': 'MedicalCondition', name: post.category },
    isPartOf: { '@type': 'Blog', name: `${CLINIC.shortName} 건강칼럼`, url: `${siteUrl}/blog` }
  }
}

// JSON-LD: 글 하단 FAQ (AEO)
export function blogFaqSchema(post: BlogPost) {
  if (!post.faqs || !post.faqs.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  }
}

// JSON-LD: 블로그 목록 (Blog)
export function blogListSchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${CLINIC.shortName} 건강칼럼`,
    description: `${DOCTORS[0].name} 대표원장이 전하는 치아 건강 칼럼`,
    url: `${siteUrl}/blog`,
    publisher: { '@type': 'Dentist', name: CLINIC.name, url: siteUrl },
    blogPost: sortedPosts().map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: `${siteUrl}/blog/${p.slug}`,
      datePublished: p.date,
      description: p.excerpt
    }))
  }
}
