import { html, raw } from 'hono/html'
import { CLINIC, DOCTORS, TREATMENTS, getTreatment } from '../data/clinic'

export function DoctorsListPage() {
  return html`
    <section class="page-hero">
      <div class="container">
        <nav class="breadcrumb"><a href="/">홈</a><span class="sep">/</span><span>의료진</span></nav>
        <h1>의료진 소개</h1>
        <p class="ph-sub">진단부터 치료, 사후 관리까지 한 분의 원장이 책임지는 1인 책임 진료. 마곡베스트치과의원을 이끄는 의료진을 소개합니다.</p>
      </div>
    </section>

    <section class="pad">
      <div class="container">
        ${raw(
          DOCTORS.map(
            (d) => `
          <div class="doc-card reveal">
            <div class="dc-photo"><i class="fa-solid fa-user-doctor"></i></div>
            <div>
              <h3>${d.name} <span style="font-size:1rem;color:var(--ink-3)">${d.title}</span></h3>
              <div class="dc-title">${d.credential}</div>
              <p style="color:var(--ink-2);margin-bottom:18px">${d.intro}</p>
              <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px">
                ${d.specialties
                  .map((s) => {
                    const t = getTreatment(s)
                    return t ? `<a href="/treatments/${t.slug}" style="font-size:0.82rem;padding:6px 14px;background:var(--brand-soft);color:var(--brand-dark);border-radius:999px;font-weight:600"><i class="fa-solid ${t.icon}"></i> ${t.name}</a>` : ''
                  })
                  .join('')}
              </div>
              <a href="/doctors/${d.slug}" class="btn btn-primary">프로필 자세히 보기 <i class="fa-solid fa-arrow-right"></i></a>
            </div>
          </div>`
          ).join('')
        )}
      </div>
    </section>
  `
}

export function DoctorDetailPage(slug: string) {
  const d = DOCTORS.find((x) => x.slug === slug)
  if (!d) return null
  const specialties = d.specialties.map((s) => getTreatment(s)).filter(Boolean)
  return html`
    <section class="page-hero">
      <div class="container">
        <nav class="breadcrumb"><a href="/">홈</a><span class="sep">/</span><a href="/doctors">의료진</a><span class="sep">/</span><span>${d.name} ${d.title}</span></nav>
        <span class="eyebrow">${d.title}</span>
        <h1>${d.name}</h1>
        <p class="ph-sub">${d.credential}</p>
      </div>
    </section>

    <section class="pad">
      <div class="container">
        <div class="doctor-feature">
          <div class="doctor-photo reveal">
            <i class="fa-solid fa-user-doctor ph-icon"></i>
            <div class="ph-label"><span class="pn">${d.name} ${d.title}</span><br /><span class="pc">${d.credential}</span></div>
          </div>
          <div class="reveal reveal-d1">
            <h2 class="section-title" style="font-size:1.8rem">진료 철학</h2>
            <p class="section-lead">${d.philosophy}</p>
            <p style="margin-top:16px;color:var(--ink-2)">${d.intro}</p>
            <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:24px">
              ${raw(specialties.map((t: any) => `<a href="/treatments/${t.slug}" class="btn btn-ghost"><i class="fa-solid ${t.icon}"></i> ${t.name}</a>`).join(''))}
            </div>
          </div>
        </div>

        <div class="reveal" style="margin-top:64px">
          <h2 class="section-title" style="font-size:1.8rem;margin-bottom:24px">학력 및 경력</h2>
          <div class="cred-list" style="grid-template-columns:1fr 1fr;gap:14px 40px;display:grid">
            ${raw(d.career.map((c) => `<div class="cred-item"><i class="fa-solid fa-circle-check" style="font-size:0.9rem;margin-top:3px"></i><span>${c}</span></div>`).join(''))}
          </div>
        </div>
      </div>
    </section>

    <section class="cta-band pad-sm">
      <div class="container"><div class="reveal" style="text-align:center">
        <h2>${d.name} 대표원장과 상담하기</h2>
        <p>정확한 진단과 충분한 설명으로 환자분께 맞는 치료를 안내드립니다.</p>
        <div class="cta-actions"><a href="/reservation" class="btn btn-white btn-lg">예약 문의</a><a href="tel:${CLINIC.phoneRaw}" class="btn btn-ghost btn-lg" style="background:transparent;color:#fff;border-color:rgba(255,255,255,0.4)"><i class="fa-solid fa-phone"></i> ${CLINIC.phone}</a></div>
      </div></div>
    </section>
  `
}

export function personSchema(slug: string, siteUrl: string) {
  const d = DOCTORS.find((x) => x.slug === slug)
  if (!d) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: d.name,
    jobTitle: d.title,
    url: `${siteUrl}/doctors/${d.slug}`,
    medicalSpecialty: 'Dentistry',
    worksFor: { '@type': 'Dentist', name: CLINIC.name, url: siteUrl },
    knowsAbout: d.specialties.map((s) => getTreatment(s)?.name).filter(Boolean),
    hasCredential: d.career.map((c) => ({ '@type': 'EducationalOccupationalCredential', name: c }))
  }
}
