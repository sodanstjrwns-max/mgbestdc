import { Hono } from 'hono'
import { html } from 'hono/html'
import { Layout, organizationSchema, breadcrumbSchema, SITE_URL } from './components/layout'
import { CLINIC, TREATMENTS, getTreatment, DOCTORS, AREAS, AREA_TREATMENTS, CORE_TREATMENTS, GENERAL_TREATMENTS, GENERAL_FAQS } from './data/clinic'
import { HomePage } from './pages/home'
import { TreatmentsListPage, TreatmentDetailPage, procedureSchema, treatmentFaqSchema } from './pages/treatments'
import { DoctorsListPage, DoctorDetailPage, personSchema } from './pages/doctors'
import {
  MissionPage, DirectionsPage, PricingPage, FacilityPage, FaqPage, faqPageSchema,
  ReservationPage, CasesPage, AreaPage, areaSchema, areaFaqSchema
} from './pages/info'
import { BlogListPage, BlogDetailPage, blogPostingSchema, blogFaqSchema, blogListSchema } from './pages/blog'
import { BLOG_POSTS, BLOG_CATEGORIES, getPost } from './data/blog'

type Bindings = {
  DB: D1Database
  ADMIN_KEY?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// 보안 헤더 (동적 HTML 응답 — 정적 자산은 public/_headers)
app.use('*', async (c, next) => {
  await next()
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'SAMEORIGIN')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
})

// ============================================================
// 메인
// ============================================================
app.get('/', (c) =>
  c.html(
    Layout(
      {
        title: `${CLINIC.name} | 마곡 치과, ${CLINIC.directions} — 임플란트·교정·심미치료`,
        description: `마곡·마곡나루 치과를 찾으신다면 — ${CLINIC.directions}, ${CLINIC.directorCredential}가 상담부터 치료까지 책임지는 1인 책임 진료. 임플란트·충치치료·심미치료·투명교정. 월·목 야간 20:30, 토요일 진료.`,
        path: '/',
        jsonLd: [
          organizationSchema(),
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: CLINIC.name,
            url: SITE_URL,
            potentialAction: { '@type': 'SearchAction', target: `${SITE_URL}/treatments?q={query}`, 'query-input': 'required name=query' }
          }
        ]
      },
      HomePage()
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
        jsonLd: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '병원소개', path: '/mission' }])]
      },
      MissionPage()
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
        jsonLd: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '의료진', path: '/doctors' }])]
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
        jsonLd: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '진료안내', path: '/treatments' }])]
      },
      TreatmentsListPage()
    )
  )
)

app.get('/treatments/:slug', (c) => {
  const slug = c.req.param('slug')
  const t = getTreatment(slug)
  if (!t) return c.notFound()
  const faqSchema = treatmentFaqSchema(t)
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
      TreatmentDetailPage(t)
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
        jsonLd: [organizationSchema(), breadcrumbSchema([{ name: '홈', path: '/' }, { name: '오시는 길', path: '/directions' }])]
      },
      DirectionsPage()
    )
  )
)

app.get('/pricing', (c) =>
  c.html(
    Layout(
      {
        title: `비용 안내 | ${CLINIC.name}`,
        description: `비급여 진료비 고지 안내. 정확한 진료비는 정밀 진단 후 투명하게 안내드립니다.`,
        path: '/pricing',
        jsonLd: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '비용 안내', path: '/pricing' }])]
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
        jsonLd: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '시설 둘러보기', path: '/facility' }])]
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
        jsonLd: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '예약 문의', path: '/reservation' }])]
      },
      ReservationPage()
    )
  )
)

app.get('/cases', (c) =>
  c.html(
    Layout(
      {
        title: `비포·애프터 진료사례 | ${CLINIC.name}`,
        description: `마곡베스트치과의원의 실제 진료 사례. 치료 후 사진은 회원 로그인 후 열람 가능합니다.`,
        path: '/cases',
        jsonLd: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '진료사례', path: '/cases' }])]
      },
      CasesPage(false)
    )
  )
)

// ============================================================
// 건강칼럼 (블로그) — AI·검색 노출용 콘텐츠
// ============================================================
app.get('/blog', (c) =>
  c.html(
    Layout(
      {
        title: `건강칼럼 | ${CLINIC.name} (${CLINIC.station} 도보 3분)`,
        description: `${DOCTORS[0].name} 대표원장이 전하는 치아 건강 칼럼. 임플란트·충치치료·심미치료·구강관리 정보를 꾸준히 업데이트합니다. ${CLINIC.directions}.`,
        path: '/blog',
        jsonLd: [
          breadcrumbSchema([{ name: '홈', path: '/' }, { name: '건강칼럼', path: '/blog' }]),
          blogListSchema(SITE_URL)
        ]
      },
      BlogListPage()
    )
  )
)

// 카테고리 필터
app.get('/blog/category/:cat', (c) => {
  const catSlug = c.req.param('cat')
  const cat = BLOG_CATEGORIES.find((x) => x.slug === catSlug)
  if (!cat) return c.notFound()
  return c.html(
    Layout(
      {
        title: `${cat.name} 칼럼 | ${CLINIC.name}`,
        description: `${cat.name} 관련 건강 칼럼 모음. ${CLINIC.name}이 전하는 ${cat.name} 정보입니다.`,
        path: `/blog/category/${catSlug}`,
        jsonLd: [breadcrumbSchema([{ name: '홈', path: '/' }, { name: '건강칼럼', path: '/blog' }, { name: cat.name, path: `/blog/category/${catSlug}` }])]
      },
      BlogListPage(cat.name)
    )
  )
})

// 칼럼 상세
app.get('/blog/:slug', (c) => {
  const slug = c.req.param('slug')
  const post = getPost(slug)
  if (!post) return c.notFound()
  const faqSchema = blogFaqSchema(post)
  return c.html(
    Layout(
      {
        title: `${post.title} | ${CLINIC.shortName} 건강칼럼`,
        description: post.excerpt,
        path: `/blog/${slug}`,
        ogType: 'article',
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

  const key = c.req.query('key')
  let rows: any[] = []
  let dbError = ''
  try {
    if (c.env?.DB) {
      const res = await c.env.DB.prepare('SELECT * FROM reservations ORDER BY created_at DESC LIMIT 200').all()
      rows = res.results || []
    } else {
      dbError = 'D1 데이터베이스가 연결되지 않았습니다. (로컬: --d1 플래그 / 프로덕션: wrangler.jsonc d1_databases 설정 필요)'
    }
  } catch (e) {
    dbError = `DB 오류: ${String(e)}`
  }

  const STATUS_LABEL: Record<string, string> = { new: '신규', contacted: '연락완료', done: '예약확정', canceled: '취소' }
  const STATUS_COLOR: Record<string, string> = { new: '#1656C8', contacted: '#3E8EF0', done: '#16A34A', canceled: '#9CA3AF' }

  return c.html(
    Layout(
      { title: `예약 관리 | ${CLINIC.name}`, description: '예약 문의 관리', path: '/admin', noindex: true },
      html`
        <section class="pad">
          <div class="container">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:28px">
              <div>
                <span class="eyebrow">ADMIN</span>
                <h1 style="font-size:1.8rem">예약 문의 관리</h1>
              </div>
              <div style="color:var(--ink-3);font-size:0.9rem">총 <strong style="color:var(--brand)">${rows.length}</strong>건 (최근 200건)</div>
            </div>
            ${dbError ? html`<div class="notice-box" style="margin-bottom:24px"><i class="fa-solid fa-triangle-exclamation"></i><div>${dbError}</div></div>` : ''}
            <div style="overflow-x:auto;border-radius:var(--radius);border:1px solid var(--glass-border);background:#fff">
              <table style="width:100%;border-collapse:collapse;font-size:0.9rem;min-width:760px">
                <thead>
                  <tr style="background:var(--bg-2);text-align:left">
                    <th style="padding:12px 16px">#</th>
                    <th style="padding:12px 16px">접수일시</th>
                    <th style="padding:12px 16px">이름</th>
                    <th style="padding:12px 16px">연락처</th>
                    <th style="padding:12px 16px">희망 진료</th>
                    <th style="padding:12px 16px">문의 내용</th>
                    <th style="padding:12px 16px">상태</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows.length === 0 && !dbError
                    ? html`<tr><td colspan="7" style="padding:40px;text-align:center;color:var(--ink-3)">아직 접수된 예약 문의가 없습니다.</td></tr>`
                    : ''}
                  ${rows.map(
                    (r: any) => html`
                      <tr style="border-top:1px solid var(--glass-border)">
                        <td style="padding:12px 16px;color:var(--ink-3)">${r.id}</td>
                        <td style="padding:12px 16px;white-space:nowrap">${r.created_at}</td>
                        <td style="padding:12px 16px;font-weight:700">${r.name}</td>
                        <td style="padding:12px 16px"><a href="tel:${r.phone}" style="color:var(--brand);font-weight:600">${r.phone}</a></td>
                        <td style="padding:12px 16px">${r.treatment || '-'}</td>
                        <td style="padding:12px 16px;max-width:280px">${r.message || '-'}</td>
                        <td style="padding:12px 16px">
                          <select onchange="updateStatus(${r.id}, this.value)" style="padding:6px 10px;border-radius:8px;border:1px solid var(--glass-border);font-weight:600;color:${STATUS_COLOR[r.status] || '#333'}">
                            ${['new', 'contacted', 'done', 'canceled'].map(
                              (s) => html`<option value="${s}" ${r.status === s ? 'selected' : ''}>${STATUS_LABEL[s]}</option>`
                            )}
                          </select>
                        </td>
                      </tr>
                    `
                  )}
                </tbody>
              </table>
            </div>
            <script>
              const ADMIN_KEY = ${JSON.stringify(key)};
              async function updateStatus(id, status) {
                try {
                  const res = await fetch('/api/admin/reservation/' + id + '/status?key=' + encodeURIComponent(ADMIN_KEY), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status })
                  });
                  const j = await res.json();
                  if (!j.ok) alert('상태 변경 실패: ' + (j.error || ''));
                } catch (e) { alert('상태 변경 중 오류가 발생했습니다.'); }
              }
            </script>
          </div>
        </section>
      `
    )
  )
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
// SEO 기술 파일
// ============================================================
app.get('/sitemap.xml', (c) => {
  const urls: { loc: string; pri: string; mod?: string }[] = [
    { loc: '/', pri: '1.0' },
    { loc: '/mission', pri: '0.8' },
    { loc: '/doctors', pri: '0.8' },
    { loc: '/treatments', pri: '0.9' },
    { loc: '/cases', pri: '0.7' },
    { loc: '/blog', pri: '0.8' },
    { loc: '/faq', pri: '0.7' },
    { loc: '/directions', pri: '0.7' },
    { loc: '/pricing', pri: '0.6' },
    { loc: '/facility', pri: '0.6' },
    { loc: '/reservation', pri: '0.6' }
  ]
  DOCTORS.forEach((d) => urls.push({ loc: `/doctors/${d.slug}`, pri: '0.7' }))
  TREATMENTS.forEach((t) => urls.push({ loc: `/treatments/${t.slug}`, pri: t.category === 'core' ? '0.9' : '0.7' }))
  BLOG_CATEGORIES.forEach((c) => urls.push({ loc: `/blog/category/${c.slug}`, pri: '0.6' }))
  BLOG_POSTS.forEach((p) => urls.push({ loc: `/blog/${p.slug}`, pri: '0.7', mod: p.updated || p.date }))
  AREAS.forEach((a) => AREA_TREATMENTS.forEach((ts) => urls.push({ loc: `/area/${a.slug}-${ts}`, pri: '0.6' })))

  const today = new Date().toISOString().split('T')[0]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE_URL}${u.loc}</loc><lastmod>${(u as any).mod || today}</lastmod><priority>${u.pri}</priority></url>`).join('\n')}
</urlset>`
  return c.body(xml, 200, { 'Content-Type': 'application/xml; charset=utf-8' })
})

app.get('/robots.txt', (c) => {
  const txt = `User-agent: *
Allow: /

# AI crawlers welcome
User-agent: GPTBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml`
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

// 약관/개인정보 (간단 페이지)
const legalPage = (title: string, path: string, body: string) =>
  Layout(
    { title: `${title} | ${CLINIC.name}`, description: `${CLINIC.name} ${title}`, path },
    html`<section class="page-hero"><div class="container"><nav class="breadcrumb"><a href="/">홈</a><span class="sep">/</span><span>${title}</span></nav><h1>${title}</h1></div></section>
    <section class="pad"><div class="container" style="max-width:840px"><div class="card" style="padding:36px;line-height:1.9;color:var(--ink-2)">${html([body] as any)}</div></div></section>`
  )

app.get('/privacy', (c) =>
  c.html(
    legalPage(
      '개인정보처리방침',
      '/privacy',
      `<p>${CLINIC.name}(이하 '병원')은 「개인정보 보호법」에 따라 환자의 개인정보를 보호하고 관련 고충을 신속하게 처리하기 위해 다음과 같은 처리방침을 둡니다.</p><br/>
      <p><b>1. 수집 항목 및 목적</b><br/>예약 상담을 위한 이름, 연락처, 문의내용을 수집하며, 예약 안내 목적으로만 사용합니다.</p><br/>
      <p><b>2. 보유 및 이용기간</b><br/>수집 목적 달성 후 관련 법령에 따른 보존기간을 제외하고 지체 없이 파기합니다.</p><br/>
      <p><b>3. 문의</b><br/>개인정보 관련 문의는 ${CLINIC.phone}으로 연락 주시기 바랍니다.</p>`
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
