import { html, raw } from 'hono/html'
import { CLINIC, CORE_TREATMENTS, GENERAL_TREATMENTS, TREATMENTS, type Treatment, DOCTORS, AREAS } from '../data/clinic'
import { BLOG_POSTS, catByName } from '../data/blog'
import { TX_DETAIL } from '../data/tx-detail'
import { srcset, SIZES } from '../components/img'
import { esc, type DbPost, type DbCase } from './cms'

const fmtD = (d: string) => (d || '').slice(0, 10).replace(/-/g, '.')

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

export function TreatmentDetailPage(t: Treatment, topicCases: DbCase[] = [], topicColumns: DbPost[] = []) {
  const related = TREATMENTS.filter((x) => x.slug !== t.slug).slice(0, 5)
  const doctor = DOCTORS[0]
  const heroImg = TX_IMG[t.slug]
  const relatedPosts = BLOG_POSTS.filter((p) => p.related.includes(t.slug) || catByName(p.category)?.slug === t.slug).slice(0, 3)
  const detail = TX_DETAIL[t.slug]
  // 목차 (TOC) — 본문 순서와 동일하게 구성
  const tocItems: { id: string; label: string }[] = []
  if (t.checklist) tocItems.push({ id: 'sec-check', label: '증상 자가 체크' })
  ;(t.sections || []).forEach((s, i) => tocItems.push({ id: `sec-${i}`, label: s.h }))
  ;(detail?.deepDive || []).forEach((s, i) => tocItems.push({ id: `sec-deep-${i}`, label: s.h }))
  if (t.steps) tocItems.push({ id: 'sec-steps', label: '진행 과정' })
  if (detail?.aftercare) tocItems.push({ id: 'sec-care', label: '치료 전후 관리 수칙' })
  if (t.compare) tocItems.push({ id: 'sec-compare', label: t.compare.title })
  if (t.equipmentUse) tocItems.push({ id: 'sec-equip', label: '활용 장비' })
  if (detail?.mythFact) tocItems.push({ id: 'sec-myth', label: '오해와 사실' })
  if (t.procedures) tocItems.push({ id: 'sec-proc', label: '세부 진료' })
  if (t.faqs) tocItems.push({ id: 'sec-faq', label: '자주 묻는 질문' })
  if (detail?.glossary) tocItems.push({ id: 'sec-gloss', label: '알아두면 좋은 용어' })
  if (topicCases.length) tocItems.push({ id: 'sec-cases', label: `${t.name} 치료사례` })
  if (relatedPosts.length || topicColumns.length) tocItems.push({ id: 'sec-posts', label: '관련 칼럼' })
  // 지역 칩 — 해당 과목이 지역페이지 대상(implant/ortho/cavity/cosmetic)이면 자기 slug, 아니면 implant로 연결
  const areaSlug = ['implant', 'ortho', 'cavity', 'cosmetic'].includes(t.slug) ? t.slug : 'implant'
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
              <section class="t-check reveal" id="sec-check" aria-label="증상 자가 체크">
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
                  (s, i) => `
              <div class="t-section reveal" id="sec-${i}">
                <h2>${s.h}</h2>
                <p>${s.p}</p>
              </div>`
                )
                .join('')
            )}

            ${raw(
              (detail?.deepDive || [])
                .map(
                  (s, i) => `
              <div class="t-section reveal" id="sec-deep-${i}">
                <h2>${s.h}</h2>
                <p>${s.p}</p>
              </div>`
                )
                .join('')
            )}

            ${
              t.steps
                ? raw(`
              <div class="t-section reveal" id="sec-steps">
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
              detail?.aftercare
                ? raw(`
              <div class="t-section reveal" id="sec-care">
                <h2>치료 전후 관리 수칙</h2>
                <div class="t-care-grid">
                  ${detail.aftercare
                    .map(
                      (c) => `
                  <div class="t-care-item">
                    <strong><i class="fa-regular fa-circle-check" aria-hidden="true"></i>${c.name}</strong>
                    <p>${c.desc}</p>
                  </div>`
                    )
                    .join('')}
                </div>
                <p class="t-check-note">관리 방법과 회복 경과는 구강 상태에 따라 개인차가 있으며, 치료 후 개별적으로 상세히 안내드립니다.</p>
              </div>`)
                : ''
            }

            ${
              t.compare
                ? raw(`
              <div class="t-section reveal" id="sec-compare">
                <h2>${t.compare.title}</h2>
                <div class="t-compare-wrap">
                  <table class="t-compare">
                    <thead><tr>${t.compare.cols.map((c, i) => `<th scope="col"${i === 0 ? ' class="t-compare-key"' : ''}>${c}</th>`).join('')}</tr></thead>
                    <tbody>
                      ${t.compare.rows
                        .map(
                          (r) => `<tr>${r.map((cell, i) => (i === 0 ? `<th scope="row" class="t-compare-key">${cell}</th>` : `<td>${cell}</td>`)).join('')}</tr>`
                        )
                        .join('')}
                    </tbody>
                  </table>
                </div>
                <p class="t-check-note">${t.compare.note}</p>
              </div>`)
                : ''
            }

            ${
              t.equipmentUse
                ? raw(`
              <div class="t-section reveal" id="sec-equip">
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
              detail?.mythFact
                ? raw(`
              <div class="t-section reveal" id="sec-myth">
                <h2>${t.name}, 오해와 사실</h2>
                <div class="t-myth-list">
                  ${detail.mythFact
                    .map(
                      (m) => `
                  <div class="t-myth-item">
                    <p class="t-myth-q"><span class="t-myth-tag">오해</span>${m.myth}</p>
                    <p class="t-myth-a"><span class="t-myth-tag is-fact">사실</span>${m.fact}</p>
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
              <div class="t-section reveal" id="sec-proc">
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
              <div class="t-section reveal" id="sec-faq">
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
              detail?.glossary
                ? raw(`
              <div class="t-section reveal" id="sec-gloss">
                <h2>알아두면 좋은 용어</h2>
                <dl class="t-gloss">
                  ${detail.glossary
                    .map(
                      (g) => `
                  <div class="t-gloss-item">
                    <dt>${g.term}</dt>
                    <dd>${g.def}</dd>
                  </div>`
                    )
                    .join('')}
                </dl>
              </div>`)
                : ''
            }

            ${
              topicCases.length > 0
                ? raw(`
              <div class="t-section reveal" id="sec-cases">
                <h2>${t.name} 치료사례</h2>
                <div class="t-posts">
                  ${topicCases
                    .slice(0, 3)
                    .map(
                      (cs) => `
                  <a href="/cases?cat=${encodeURIComponent(cs.category || t.name)}" class="t-post-link">
                    <strong>${esc(cs.title)}</strong>
                    <span>${[cs.age_group, cs.gender].filter(Boolean).map((v) => esc(String(v))).join(' · ') || '진료 사례'} — 사례 보기 <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
                  </a>`
                    )
                    .join('')}
                </div>
                <p style="margin-top:12px"><a href="/cases?cat=${encodeURIComponent(topicCases[0]?.category || t.name)}" style="font-size:0.88rem;font-weight:700;color:var(--acc)">${t.name} 사례 전체 보기 <i class="fa-solid fa-arrow-right"></i></a></p>
              </div>`)
                : ''
            }

            ${
              relatedPosts.length > 0 || topicColumns.length > 0
                ? raw(`
              <div class="t-section reveal" id="sec-posts">
                <h2>${t.name} 관련 칼럼</h2>
                <div class="t-posts">
                  ${topicColumns
                    .slice(0, 3)
                    .map(
                      (p) => `
                  <a href="/blog/${esc(p.slug)}" class="t-post-link">
                    <strong>${esc(p.title)}</strong>
                    <span>${fmtD(p.published_at || p.created_at)} — 칼럼 읽기 <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
                  </a>`
                    )
                    .join('')}
                  ${relatedPosts
                    .slice(0, Math.max(0, 3 - topicColumns.length))
                    .map(
                      (p) => `
                  <a href="/blog/${p.slug}" class="t-post-link">
                    <strong>${p.title}</strong>
                    <span>칼럼 읽기 <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
                  </a>`
                    )
                    .join('')}
                </div>
                <p style="margin-top:12px"><a href="/blog" style="font-size:0.88rem;font-weight:700;color:var(--acc)">전체 칼럼 보기 <i class="fa-solid fa-arrow-right"></i></a></p>
              </div>`)
                : ''
            }
          </article>

          <aside class="t-sidebar">
            <nav class="side-card t-toc" aria-label="본문 목차" data-toc>
              <h3 class="h4">목차</h3>
              <div class="t-toc-progress" aria-hidden="true"><span data-toc-bar></span></div>
              <ol class="t-toc-list">
                ${raw(tocItems.map((it) => `<li><a href="#${it.id}" data-toc-link="${it.id}">${it.label}</a></li>`).join(''))}
              </ol>
            </nav>

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
              <div class="t-area-chips">
                ${raw(AREAS.map((a) => `<a href="/area/${a.slug}-${areaSlug}" class="t-area-chip">${a.name}</a>`).join(''))}
              </div>
              <p style="font-size:0.78rem;color:var(--ink-4);margin:10px 0 0">마곡나루역 1번 출구 도보 3분 — 인근 지역 어디서든 편하게 찾으실 수 있습니다.</p>
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
