import { html, raw } from 'hono/html'
import { CLINIC, CORE_TREATMENTS, GENERAL_TREATMENTS, TREATMENTS, type Treatment, DOCTORS, AREAS } from '../data/clinic'
import { BLOG_POSTS } from '../data/blog'
import { srcset, SIZES } from '../components/img'

// ============================================================
// 진료 전체 목록
// ============================================================
const TX_PREVIEW: Record<string, string> = {
  ortho: '/static/img/tx-ortho.webp',
  tmj: '/static/img/tx-tmj.webp',
  gum: '/static/img/tx-gum.webp',
  prosthesis: '/static/img/tx-prosthesis.webp',
  extraction: '/static/img/tx-extraction.webp',
  preventive: '/static/img/life-smile.webp'
}

const LIST_IMG: Record<string, string> = {
  implant: '/static/img/tx-implant.webp',
  cavity: '/static/img/consult.webp',
  cosmetic: '/static/img/tx-cosmetic.webp'
}

export function TreatmentsListPage() {
  return html`
    <section class="page-hero">
      <div class="container">
        <nav class="breadcrumb"><a href="/">홈</a><span class="sep">/</span><span>진료안내</span></nav>
        <span class="eyebrow">진료 안내</span>
        <h1>진료 <span class="grad">안내</span></h1>
        <p class="ph-sub">마곡베스트치과의원은 일반 진료부터 임플란트·교정·심미치료까지, 정밀 진단을 바탕으로 환자분의 구강 건강을 종합적으로 돌봅니다.</p>
      </div>
    </section>

    <section class="pad">
      <div class="container">
        <span class="eyebrow reveal">중점 진료</span>
        <h2 class="section-title reveal" style="margin-bottom:32px">핵심 진료</h2>
        <div class="core-photo-grid">
          ${raw(
            CORE_TREATMENTS.map(
              (t, i) => `
            <a href="/treatments/${t.slug}" class="core-photo-card reveal reveal-d${i + 1}">
              <span class="cpc-img"><img src="${LIST_IMG[t.slug] || '/static/img/facility-room.webp'}" srcset="${srcset(LIST_IMG[t.slug] || '/static/img/facility-room.webp')}" sizes="${SIZES.third}" alt="${t.name}" loading="lazy" decoding="async" /></span>
              <span class="cpc-arrow"><i class="fa-solid fa-arrow-right"></i></span>
              <span class="cpc-body">
                
                <span class="cpc-title" style="display:block">${t.name}</span>
                <span class="cpc-tag">${t.tagline}</span>
                <span class="cpc-desc" style="display:block">${t.summary.slice(0, 92)}…</span>
              </span>
            </a>`
            ).join('')
          )}
        </div>

        <span class="eyebrow reveal" style="margin-top:64px;display:inline-block">일반 진료</span>
        <h2 class="section-title reveal" style="margin-bottom:32px">일반 진료</h2>
        <div class="tx-index reveal" data-tx-index>
          ${raw(
            GENERAL_TREATMENTS.map(
              (t) => `
            <a href="/treatments/${t.slug}" class="tx-row" data-preview="${TX_PREVIEW[t.slug] || '/static/img/consult.webp'}">
              <span class="tx-name">${t.name}</span>
              <span class="tx-desc">${t.tagline}</span>
              <span class="tx-go" aria-hidden="true">자세히 보기</span>
            </a>`
            ).join('')
          )}
        </div>
      </div>
    </section>

    <section class="pad-sm"><div class="cta-band">
      <div class="cta-inner">
        <div class="reveal" style="text-align:center">
          <h2 style="color:#fff">어떤 진료가 필요한지 모르시겠다면</h2>
          <p style="color:rgba(255,255,255,0.9);max-width:560px;margin:14px auto 28px">정확한 진단으로 환자분께 맞는 치료를 안내드립니다. 부담 없이 문의해 주세요.</p>
          <div class="cta-actions"><a href="/reservation" class="btn btn-white btn-lg">예약 문의하기</a></div>
        </div>
      </div>
    </div></section>
  `
}

// ============================================================
// 진료 상세 (1,500자+ / MedicalProcedure 스키마 / 인링크)
// ============================================================
const TX_IMG: Record<string, { src: string; alt: string }> = {
  implant: { src: '/static/img/tx-implant.webp', alt: '임플란트 정밀 진료 모습' },
  cavity: { src: '/static/img/consult.webp', alt: '충치치료 상담 모습' },
  cosmetic: { src: '/static/img/tx-cosmetic.webp', alt: '심미치료 결과 미소' },
  ortho: { src: '/static/img/tx-ortho.webp', alt: '교정 치료 모습' },
  tmj: { src: '/static/img/tx-tmj.webp', alt: '턱관절 불편을 살피는 모습' },
  gum: { src: '/static/img/tx-gum.webp', alt: '잇몸 상태를 점검하는 진료 모습' },
  prosthesis: { src: '/static/img/tx-prosthesis.webp', alt: '디지털 보철 제작 과정' },
  extraction: { src: '/static/img/tx-extraction.webp', alt: '파노라마 영상으로 사랑니 위치를 설명하는 모습' },
  preventive: { src: '/static/img/facility-room.webp', alt: '예방 진료 공간' }
}

export function TreatmentDetailPage(t: Treatment) {
  const related = TREATMENTS.filter((x) => x.slug !== t.slug).slice(0, 5)
  const doctor = DOCTORS[0]
  const heroImg = TX_IMG[t.slug]
  const relatedPosts = BLOG_POSTS.filter((p) => p.related.includes(t.slug)).slice(0, 3)
  return html`
    <section class="page-hero">
      <div class="container">
        <nav class="breadcrumb">
          <a href="/">홈</a><span class="sep">/</span>
          <a href="/treatments">진료안내</a><span class="sep">/</span><span>${t.name}</span>
        </nav>
        <span class="eyebrow">${t.category === 'core' ? '중점 진료' : '일반 진료'}</span>
        <h1><span class="grad">${t.name}</span></h1>
        <p class="ph-sub">${t.tagline} — ${t.summary}</p>
      </div>
    </section>

    <section class="pad">
      <div class="container">
        ${heroImg ? html`<div class="t-hero-img reveal"><img src="${heroImg.src}" srcset="${srcset(heroImg.src)}" sizes="${SIZES.card}" alt="${heroImg.alt}" loading="lazy" decoding="async" /></div>` : ''}
        <div class="t-detail-grid">
          <article>
            ${
              t.checklist
                ? raw(`
              <section class="t-check reveal" aria-label="증상 자가 체크">
                <div class="t-check-head">
                  <span class="t-check-label">SELF CHECK</span>
                  <h2>이런 증상이 있다면, 검진을 권합니다</h2>
                </div>
                <ul class="t-check-list">
                  ${t.checklist.map((c) => `<li><i class="fa-regular fa-square-check" aria-hidden="true"></i>${c}</li>`).join('')}
                </ul>
                <p class="t-check-note">해당 항목이 있다고 해서 반드시 치료가 필요한 것은 아닙니다. 정확한 상태는 검진을 통해 확인하고 개별적으로 안내드립니다.</p>
              </section>`)
                : ''
            }

            ${raw(
              (t.sections || [])
                .map(
                  (s) => `
              <div class="t-section reveal">
                <h2>${s.h}</h2>
                <p>${s.p}</p>
              </div>`
                )
                .join('')
            )}

            ${
              t.steps
                ? raw(`
              <div class="t-section reveal">
                <h2>${t.name} 진행 과정</h2>
                <ol class="t-steps">
                  ${t.steps
                    .map(
                      (s, i) => `
                  <li class="t-step">
                    <span class="t-step-no" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
                    <div class="t-step-body"><strong>${s.name}</strong><p>${s.desc}</p></div>
                  </li>`
                    )
                    .join('')}
                </ol>
                <p class="t-check-note">치료 기간과 내원 횟수는 구강 상태에 따라 개인차가 있으며, 진단 후 개별적으로 안내드립니다.</p>
              </div>`)
                : ''
            }

            ${
              t.equipmentUse
                ? raw(`
              <div class="t-section reveal">
                <h2>${t.name}에 활용하는 장비</h2>
                <div class="t-equip">
                  ${t.equipmentUse
                    .map(
                      (e) => `
                  <div class="t-equip-item">
                    <strong>${e.name}</strong>
                    <p>${e.why}</p>
                  </div>`
                    )
                    .join('')}
                </div>
              </div>`)
                : ''
            }

            ${
              t.procedures
                ? raw(`
              <div class="t-section reveal">
                <h2>${t.name} 세부 진료</h2>
                <div class="proc-grid">
                  ${t.procedures
                    .map(
                      (p) => `<div class="proc-card"><h3 class="h4">${p.name}</h3><p>${p.desc}</p></div>`
                    )
                    .join('')}
                </div>
              </div>`)
                : ''
            }

            ${
              t.directorNote
                ? raw(`
              <aside class="t-note reveal">
                <span class="t-note-label">김민 대표원장의 한마디</span>
                <blockquote>“${t.directorNote}”</blockquote>
                <a href="/doctors/${doctor.slug}" class="t-note-link">의료진 소개 보기 <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
              </aside>`)
                : ''
            }

            ${
              t.faqs
                ? raw(`
              <div class="t-section reveal">
                <h2>${t.name} 자주 묻는 질문</h2>
                <div class="faq-list">
                  ${t.faqs
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

            ${
              relatedPosts.length > 0
                ? raw(`
              <div class="t-section reveal">
                <h2>함께 읽으면 좋은 글</h2>
                <div class="t-posts">
                  ${relatedPosts
                    .map(
                      (p) => `
                  <a href="/blog/${p.slug}" class="t-post-link">
                    <strong>${p.title}</strong>
                    <span>칼럼 읽기 <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
                  </a>`
                    )
                    .join('')}
                </div>
              </div>`)
                : ''
            }
          </article>

          <aside class="t-sidebar">
            <div class="side-card brand">
              <h3 class="h4">예약 및 상담</h3>
              <p>${t.name}에 대해 더 궁금하신 점이 있으신가요? 정확한 진단을 통해 안내드립니다.</p>
              <a href="/reservation" class="btn btn-white" style="width:100%"><i class="fa-solid fa-calendar-check"></i> 예약 문의</a>
              <a href="tel:${CLINIC.phoneRaw}" class="btn" style="width:100%;margin-top:10px;background:rgba(255,255,255,0.12);color:#fff"><i class="fa-solid fa-phone"></i> ${CLINIC.phone}</a>
            </div>

            <div class="side-card">
              <h3 class="h4">담당 의료진</h3>
              <a href="/doctors/${doctor.slug}" style="display:block;padding:6px 0">
                <strong style="display:block;color:var(--text);font-size:0.98rem">${doctor.name} ${doctor.title}</strong>
                <span style="display:block;color:var(--ink-3);font-size:0.82rem;margin-top:2px">${doctor.credential}</span>
              </a>
            </div>

            <div class="side-card">
              <h3 class="h4">비용 안내</h3>
              <p style="font-size:0.86rem;color:var(--ink-3);line-height:1.7;margin-bottom:10px">비급여 진료비는 구강 상태와 치료 범위에 따라 달라집니다. 진단 후 투명하게 안내드립니다.</p>
              <div class="side-links"><a href="/pricing">비용 안내 자세히 보기 <i class="fa-solid fa-arrow-right"></i></a></div>
            </div>

            <div class="side-card">
              <h3 class="h4">다른 진료 보기</h3>
              <div class="side-links">
                ${raw(related.map((r) => `<a href="/treatments/${r.slug}">${r.name} <i class="fa-solid fa-arrow-right"></i></a>`).join(''))}
              </div>
            </div>

            <div class="side-card">
              <h3 class="h4">지역별 안내</h3>
              <div class="side-links">
                ${raw(AREAS.slice(0, 4).map((a) => `<a href="/area/${a.slug}-${t.slug === 'cavity' || t.slug === 'cosmetic' ? 'implant' : t.slug}">${a.name} ${t.name} <i class="fa-solid fa-arrow-right"></i></a>`).join(''))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  `
}

// MedicalProcedure 스키마
export function procedureSchema(t: Treatment, siteUrl: string) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    '@id': `${siteUrl}/treatments/${t.slug}#procedure`,
    name: t.name,
    description: t.summary,
    url: `${siteUrl}/treatments/${t.slug}`,
    procedureType: 'https://schema.org/TherapeuticProcedure',
    howPerformed: (t.steps || t.sections || []).map((s) => ('name' in s ? s.name : s.h)).join(' → '),
    provider: { '@id': `${siteUrl}/#organization` }
  }
  if (t.bodyLocation) schema.bodyLocation = t.bodyLocation
  if (t.procedures) {
    schema.subProcedure = t.procedures.map((p) => ({
      '@type': 'MedicalProcedure',
      name: p.name,
      description: p.desc
    }))
  }
  return schema
}

// FAQPage 스키마 (진료별)
export function treatmentFaqSchema(t: Treatment) {
  if (!t.faqs) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: t.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  }
}
