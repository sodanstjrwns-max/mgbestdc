import { html, raw } from 'hono/html'
import { CLINIC, CORE_TREATMENTS, GENERAL_TREATMENTS, TREATMENTS, type Treatment, DOCTORS, AREAS } from '../data/clinic'

// ============================================================
// 진료 전체 목록
// ============================================================
export function TreatmentsListPage() {
  return html`
    <section class="page-hero">
      <div class="container">
        <nav class="breadcrumb"><a href="/">홈</a><span class="sep">/</span><span>진료안내</span></nav>
        <h1>진료 안내</h1>
        <p class="ph-sub">마곡베스트치과의원은 일반 진료부터 임플란트·교정·심미치료까지, 정밀 진단을 바탕으로 환자분의 구강 건강을 종합적으로 돌봅니다.</p>
      </div>
    </section>

    <section class="pad">
      <div class="container">
        <span class="eyebrow reveal">CORE TREATMENTS</span>
        <h2 class="section-title reveal" style="margin-bottom:32px">핵심 진료</h2>
        <div class="grid-3">
          ${raw(
            CORE_TREATMENTS.map(
              (t, i) => `
            <a href="/treatments/${t.slug}" class="glass-card tilt reveal reveal-d${i + 1}">
              <span class="num-tag">0${i + 1}</span>
              <span class="tico"><i class="fa-solid ${t.icon}"></i></span>
              <h3>${t.name}</h3>
              <span class="tag">${t.tagline}</span>
              <p>${t.summary.slice(0, 100)}…</p>
              <span class="more">자세히 보기 <i class="fa-solid fa-arrow-right"></i></span>
            </a>`
            ).join('')
          )}
        </div>

        <span class="eyebrow reveal" style="margin-top:64px;display:inline-block">GENERAL CARE</span>
        <h2 class="section-title reveal" style="margin-bottom:32px">일반 진료</h2>
        <div class="grid-3">
          ${raw(
            GENERAL_TREATMENTS.map(
              (t) => `
            <a href="/treatments/${t.slug}" class="chip reveal" style="min-height:84px">
              <i class="fa-solid ${t.icon}"></i>
              <span><span class="tn">${t.name}</span><br /><span class="td">${t.tagline}</span></span>
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
export function TreatmentDetailPage(t: Treatment) {
  const related = TREATMENTS.filter((x) => x.slug !== t.slug).slice(0, 5)
  const doctor = DOCTORS[0]
  return html`
    <section class="page-hero">
      <div class="container">
        <nav class="breadcrumb">
          <a href="/">홈</a><span class="sep">/</span>
          <a href="/treatments">진료안내</a><span class="sep">/</span><span>${t.name}</span>
        </nav>
        <span class="eyebrow">${t.category === 'core' ? 'CORE TREATMENT' : 'GENERAL CARE'}</span>
        <h1>${t.name}</h1>
        <p class="ph-sub">${t.tagline} — ${t.summary}</p>
      </div>
    </section>

    <section class="pad">
      <div class="container">
        <div class="t-detail-grid">
          <article>
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
              t.procedures
                ? raw(`
              <div class="t-section reveal">
                <h2>${t.name} 세부 진료</h2>
                <div class="proc-grid">
                  ${t.procedures
                    .map(
                      (p) => `<div class="proc-card"><h4>${p.name}</h4><p>${p.desc}</p></div>`
                    )
                    .join('')}
                </div>
              </div>`)
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
          </article>

          <aside class="t-sidebar">
            <div class="side-card brand">
              <h4>예약 및 상담</h4>
              <p>${t.name}에 대해 더 궁금하신 점이 있으신가요? 정확한 진단을 통해 안내드립니다.</p>
              <a href="/reservation" class="btn btn-white" style="width:100%"><i class="fa-solid fa-calendar-check"></i> 예약 문의</a>
              <a href="tel:${CLINIC.phoneRaw}" class="btn" style="width:100%;margin-top:10px;background:rgba(255,255,255,0.12);color:#fff"><i class="fa-solid fa-phone"></i> ${CLINIC.phone}</a>
            </div>

            <div class="side-card">
              <h4>담당 의료진</h4>
              <a href="/doctors/${doctor.slug}" class="chip" style="border:none;padding:8px 0">
                <i class="fa-solid fa-user-doctor"></i>
                <span><span class="tn">${doctor.name} ${doctor.title}</span><br /><span class="td">${doctor.credential}</span></span>
              </a>
            </div>

            <div class="side-card">
              <h4>다른 진료 보기</h4>
              <div class="side-links">
                ${raw(related.map((r) => `<a href="/treatments/${r.slug}">${r.name} <i class="fa-solid fa-arrow-right"></i></a>`).join(''))}
              </div>
            </div>

            <div class="side-card">
              <h4>지역별 안내</h4>
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
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: t.name,
    description: t.summary,
    url: `${siteUrl}/treatments/${t.slug}`,
    procedureType: 'https://schema.org/TherapeuticProcedure',
    howPerformed: (t.sections || []).map((s) => s.h).join(', '),
    provider: { '@type': 'Dentist', name: CLINIC.name, url: siteUrl }
  }
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
