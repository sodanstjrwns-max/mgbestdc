import { html, raw } from 'hono/html'
import { CLINIC, CORE_TREATMENTS, GENERAL_TREATMENTS, TREATMENTS, GENERAL_FAQS, AREAS, AREA_TREATMENTS, getTreatment, DOCTORS } from '../data/clinic'
import { srcset, SIZES } from '../components/img'

// ============================================================
// 병원소개 / 미션
// ============================================================
export function MissionPage() {
  const d = DOCTORS[0]
  return html`
    <section class="page-hero" style="text-align:center">
      <div class="container">
        <nav class="breadcrumb" style="justify-content:center"><a href="/">홈</a><span class="sep">/</span><span>병원소개</span></nav>
        <span class="eyebrow" style="display:inline-flex">우리의 약속</span>
        <h1 style="font-size:clamp(2.2rem,6vw,3.6rem);max-width:900px;margin:0 auto 18px">${CLINIC.mission}</h1>
        <p class="ph-sub" style="margin:0 auto">${CLINIC.vision}를 향해, 마곡베스트치과의원이 환자 한 분 한 분과 함께합니다.</p>
      </div>
    </section>

    <section class="pad">
      <div class="container">
        <div class="feature-split">
          <div class="reveal">
            <span class="eyebrow">개원 이야기</span>
            <h2 class="section-title">고향에서 시작한 치과</h2>
            <p class="section-lead">${d.philosophy}</p>
            <p style="margin-top:18px;color:var(--ink-2)">단순히 치료만 하는 곳이 아니라, 환자분이 진료를 마치고 문을 나설 때 어떠한 불편도 최소화할 수 있도록. 그것이 마곡베스트치과가 가장 중요하게 생각하는 가치입니다.</p>
          </div>
          <div class="equip-visual reveal reveal-d1">
            <h3><i class="fa-solid fa-heart"></i> 우리가 지키는 가치</h3>
            <div class="equip-grid">
              <div class="equip-row"><i class="fa-solid fa-circle-check"></i><div><span class="en">정직한 진료</span><br /><span class="ed">필요한 치료를 정확하게, 과하지 않게 안내합니다.</span></div></div>
              <div class="equip-row"><i class="fa-solid fa-circle-check"></i><div><span class="en">맞춤 치료</span><br /><span class="ed">환자 개개인의 상태에 맞춘 계획을 세웁니다.</span></div></div>
              <div class="equip-row"><i class="fa-solid fa-circle-check"></i><div><span class="en">끝까지 함께</span><br /><span class="ed">치료 후 관리까지, 삶의 동반자가 되겠습니다.</span></div></div>
              <div class="equip-row"><i class="fa-solid fa-circle-check"></i><div><span class="en">환자 중심</span><br /><span class="ed">불편을 최소화하는 진료 환경을 만듭니다.</span></div></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="pad-sm">
      <div class="container"><div class="fact-strip reveal">
        <div class="fact"><strong>${CLINIC.openedYear}년 마곡 개원</strong><span>지역에서 꾸준히 진료합니다</span></div>
        <div class="fact"><strong>정밀 디지털 장비</strong><span>CT·구강스캐너 상시 운용</span></div>
        <div class="fact"><strong>임플란트 자문위원</strong><span>국내 임플란트사 3곳</span></div>
        <div class="fact"><strong>전 과목 진료</strong><span>보존·보철·교정·임플란트</span></div>
      </div></div>
    </section>

    <section class="pad-sm"><div class="cta-band"><div class="cta-inner"><div class="reveal" style="text-align:center">
      <h2 style="color:#fff">마곡베스트치과와 함께 시작하세요</h2><p style="color:rgba(255,255,255,0.9);max-width:560px;margin:14px auto 28px">정직한 진료와 맞춤 치료로 환자분의 삶을 끝까지 함께하겠습니다.</p>
      <div class="cta-actions"><a href="/reservation" class="btn btn-white btn-lg">예약 문의</a><a href="/doctors" class="btn btn-glass btn-lg" style="border-color:rgba(255,255,255,0.4)">의료진 보기</a></div>
    </div></div></div></section>
  `
}

// ============================================================
// 오시는 길
// ============================================================
export function DirectionsPage() {
  return html`
    <section class="page-hero">
      <div class="container">
        <nav class="breadcrumb"><a href="/">홈</a><span class="sep">/</span><span>오시는 길</span></nav>
        <span class="eyebrow">오시는 길</span>
        <h1>오시는 <span class="grad">길</span></h1>
        <p class="ph-sub">${CLINIC.directions}. 편하게 찾아오실 수 있도록 안내드립니다.</p>
      </div>
    </section>

    <section class="pad">
      <div class="container">
        <div class="feature-split">
          <div class="reveal">
            <table class="info-table">
              <tr><th>주소</th><td>${CLINIC.addressFull}</td></tr>
              <tr><th>지하철</th><td>${CLINIC.station} 1번 출구에서 도보 3분</td></tr>
              <tr><th>대표전화</th><td><a href="tel:${CLINIC.phoneRaw}" style="color:var(--brand);font-weight:700">${CLINIC.phone}</a></td></tr>
              <tr><th>주차</th><td>건물 내 주차 가능 (자세한 사항은 전화 문의)</td></tr>
            </table>

            <h2 style="margin:32px 0 16px;font-size:1.2rem">진료 시간</h2>
            <table class="info-table">
              ${raw(CLINIC.hours.map((h) => `<tr><th>${h.day}</th><td>${h.time}${h.note ? ` <span style="color:var(--brand);font-weight:600">(${h.note})</span>` : ''}</td></tr>`).join(''))}
            </table>
          </div>

          <div class="reveal reveal-d1">
            <a href="https://map.naver.com/v5/search/${encodeURIComponent(CLINIC.addressFull)}" target="_blank" rel="noopener"
               style="display:block;border-radius:var(--radius-lg);overflow:hidden;box-shadow:var(--sh-md);position:relative;text-decoration:none">
              <img src="/static/img/hero-clinic.webp" srcset="${srcset('/static/img/hero-clinic.webp', 1920)}" sizes="${SIZES.half}" alt="${CLINIC.name} 진료 공간" loading="lazy" decoding="async" style="width:100%;aspect-ratio:4/3;object-fit:cover;display:block" />
              <div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 30%,rgba(23,32,28,0.82));display:flex;align-items:flex-end;padding:26px">
                <div>
                  <div style="font-weight:800;color:#fff;font-size:1.2rem">${CLINIC.name}</div>
                  <div style="color:rgba(255,255,255,0.8);margin-top:4px;font-size:0.9rem">${CLINIC.addressShort}</div>
                  <span class="btn btn-primary" style="margin-top:14px"><i class="fa-solid fa-map"></i> 네이버 지도에서 보기</span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  `
}

// ============================================================
// 비용 안내 (비급여 진료비 고지)
// ============================================================
export function PricingPage() {
  return html`
    <section class="page-hero">
      <div class="container">
        <nav class="breadcrumb"><a href="/">홈</a><span class="sep">/</span><span>비용 안내</span></nav>
        <span class="eyebrow">비용 안내</span>
        <h1>비용 <span class="grad">안내</span></h1>
        <p class="ph-sub">의료법에 따라 비급여 진료비는 내원 시 정확하게 고지해 드립니다. 진료비는 환자분의 구강 상태와 치료 범위에 따라 달라집니다.</p>
      </div>
    </section>

    <section class="pad">
      <div class="container">
        <div class="notice-box reveal" style="margin-bottom:32px">
          <i class="fa-solid fa-circle-info"></i>
          <div>비급여 진료비는 환자분의 상태·치료 범위·재료에 따라 개별적으로 결정되며, 의료광고 관련 법령에 따라 본 웹사이트에서는 구체적인 금액·할인 이벤트를 표기하지 않습니다. 정확한 비용은 정밀 진단 후 내원 시 안내해 드립니다.</div>
        </div>

        <div class="grid-2">
          <div class="card reveal">
            <h2 style="margin-bottom:14px;font-size:1.25rem"><i class="fa-solid fa-shield-heart" style="color:var(--brand)"></i> 급여 진료</h2>
            <p style="color:var(--ink-3)">국민건강보험이 적용되는 진료(충치치료 일부, 신경치료, 스케일링, 발치 등)는 건강보험 기준에 따라 비용이 산정됩니다. 본원은 국민건강보험공단 구강검진 지정 치과입니다.</p>
          </div>
          <div class="card reveal reveal-d1">
            <h2 style="margin-bottom:14px;font-size:1.25rem"><i class="fa-solid fa-tooth" style="color:var(--brand)"></i> 비급여 진료</h2>
            <p style="color:var(--ink-3)">임플란트, 교정, 라미네이트, 미백 등 비급여 진료는 환자분의 상태에 따라 비용이 달라집니다. 진단 후 치료 계획과 함께 정확한 비용을 투명하게 안내드립니다.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="pad-sm"><div class="cta-band"><div class="cta-inner"><div class="reveal" style="text-align:center">
      <h2 style="color:#fff">정확한 비용이 궁금하시다면</h2><p style="color:rgba(255,255,255,0.9);max-width:560px;margin:14px auto 28px">진단 후 치료 계획과 함께 투명하게 안내드립니다.</p>
      <div class="cta-actions"><a href="/reservation" class="btn btn-white btn-lg">상담 예약하기</a></div>
    </div></div></div></section>
  `
}

// ============================================================
// 시설 둘러보기
// ============================================================
export function FacilityPage() {
  return html`
    <section class="page-hero">
      <div class="container">
        <nav class="breadcrumb"><a href="/">홈</a><span class="sep">/</span><span>시설 둘러보기</span></nav>
        <span class="eyebrow">시설 안내</span>
        <h1>시설 및 <span class="grad">장비</span></h1>
        <p class="ph-sub">집중도 높은 컴팩트한 진료 공간과 정기적으로 리뉴얼하는 정밀 디지털 장비로 정밀한 진료를 제공합니다.</p>
      </div>
    </section>

    <section class="pad">
      <div class="container">
        <span class="eyebrow reveal">보유 장비</span>
        <h2 class="section-title reveal" style="margin-bottom:32px">보유 장비</h2>
        <div class="grid-2">
          ${raw(
            CLINIC.equipment
              .map(
                (e, i) => `
            <div class="card reveal reveal-d${(i % 3) + 1}" style="display:flex;gap:20px;align-items:flex-start">
              <span class="tico" style="margin:0;flex:none"><i class="fa-solid fa-gear"></i></span>
              <div><h3 style="font-size:1.2rem;margin-bottom:8px">${e.name}</h3><p style="color:var(--ink-3)">${e.desc}</p></div>
            </div>`
              )
              .join('')
          )}
        </div>

        <div class="reveal" style="margin-top:64px">
          <span class="eyebrow">공간 안내</span>
          <h2 class="section-title" style="margin-bottom:32px">진료 공간</h2>
          <div class="grid-3">
            ${raw(
              [
                { src: '/static/img/facility-room.webp', label: '진료실', desc: '집중도 높은 컴팩트한 진료 공간' },
                { src: '/static/img/consult.webp', label: '상담실', desc: '충분한 설명을 위한 독립 상담 공간' },
                { src: '/static/img/hero-clinic.webp', label: '대기 공간', desc: '편안하게 기다리실 수 있는 공간' }
              ]
                .map(
                  (s) => `
              <figure style="margin:0">
                <div style="aspect-ratio:4/3;border-radius:var(--radius);overflow:hidden;box-shadow:var(--sh-md)">
                  <img src="${s.src}" srcset="${srcset(s.src)}" sizes="${SIZES.third}" alt="${CLINIC.name} ${s.label}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover" />
                </div>
                <figcaption style="margin-top:12px"><strong style="color:var(--text)">${s.label}</strong><span style="color:var(--ink-3);font-size:0.88rem;display:block;margin-top:2px">${s.desc}</span></figcaption>
              </figure>`
                )
                .join('')
            )}
          </div>
        </div>
      </div>
    </section>
  `
}

// ============================================================
// 통합 FAQ
// ============================================================
export function FaqPage() {
  const sections = [
    { title: '병원 이용 안내', faqs: GENERAL_FAQS, icon: 'fa-hospital' },
    ...TREATMENTS.filter((t) => t.faqs).map((t) => ({ title: `${t.name} FAQ`, faqs: t.faqs!, icon: t.icon, slug: t.slug }))
  ]
  return html`
    <section class="page-hero">
      <div class="container">
        <nav class="breadcrumb"><a href="/">홈</a><span class="sep">/</span><span>자주 묻는 질문</span></nav>
        <span class="eyebrow">자주 묻는 질문</span>
        <h1>자주 묻는 <span class="grad">질문</span></h1>
        <p class="ph-sub">환자분들이 자주 궁금해하시는 내용을 진료별로 정리했습니다. 더 궁금한 점은 언제든 문의해 주세요.</p>
      </div>
    </section>

    <section class="pad">
      <div class="container" style="max-width:840px">
        ${raw(
          sections
            .map(
              (sec: any) => `
          <div class="reveal" style="margin-bottom:40px">
            <h2 class="section-title" style="font-size:1.5rem;margin-bottom:18px"><i class="fa-solid ${sec.icon}" style="color:var(--brand);margin-right:8px"></i>${sec.title}${sec.slug ? ` <a href="/treatments/${sec.slug}" style="font-size:0.9rem;color:var(--brand);font-weight:600;margin-left:8px">진료보기 →</a>` : ''}</h2>
            <div class="faq-list">
              ${sec.faqs
                .map(
                  (f: any) => `
                <details class="faq-item">
                  <summary><span style="display:flex;gap:12px;align-items:center"><span class="q-ico">Q</span>${f.q}</span></summary>
                  <div class="faq-a">${f.a}</div>
                </details>`
                )
                .join('')}
            </div>
          </div>`
            )
            .join('')
        )}
      </div>
    </section>
  `
}

export function faqPageSchema() {
  const all = [...GENERAL_FAQS, ...TREATMENTS.flatMap((t) => t.faqs || [])]
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.faq-item summary'] },
    mainEntity: all.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
  }
}

// ============================================================
// 예약 문의
// ============================================================
export function ReservationPage() {
  return html`
    <section class="page-hero">
      <div class="container">
        <nav class="breadcrumb"><a href="/">홈</a><span class="sep">/</span><span>예약 문의</span></nav>
        <span class="eyebrow">예약 문의</span>
        <h1>예약 <span class="grad">문의</span></h1>
        <p class="ph-sub">아래 양식을 작성해 주시면 확인 후 연락드립니다. 빠른 예약은 전화로 문의해 주세요.</p>
      </div>
    </section>

    <section class="pad">
      <div class="container" style="max-width:680px">
        <div class="glass-card reveal" style="padding:36px">
          <form id="reservation-form">
            <div style="display:grid;gap:18px">
              <div>
                <label style="font-weight:700;display:block;margin-bottom:8px">이름 *</label>
                <input name="name" required placeholder="성함을 입력해 주세요" class="form-input" autocomplete="name" enterkeyhint="next" />
              </div>
              <div>
                <label style="font-weight:700;display:block;margin-bottom:8px">연락처 *</label>
                <input name="phone" required type="tel" inputmode="tel" autocomplete="tel" placeholder="010-0000-0000" class="form-input" enterkeyhint="next" />
              </div>
              <div>
                <label style="font-weight:700;display:block;margin-bottom:8px">희망 진료</label>
                <select name="treatment" class="form-input">
                  <option value="">선택해 주세요</option>
                  ${raw([...CORE_TREATMENTS, ...GENERAL_TREATMENTS].map((t) => `<option value="${t.name}">${t.name}</option>`).join(''))}
                  <option value="기타">기타 / 잘 모르겠어요</option>
                </select>
              </div>
              <div>
                <label style="font-weight:700;display:block;margin-bottom:8px">문의 내용</label>
                <textarea name="message" rows="4" placeholder="궁금하신 점이나 희망 방문 시간을 적어주세요" class="form-input" style="resize:vertical"></textarea>
              </div>
              <label style="display:flex;gap:10px;align-items:flex-start;font-size:0.88rem;color:var(--text-3)">
                <input type="checkbox" required style="margin-top:4px;width:20px;height:20px;flex-shrink:0;accent-color:var(--brand)" />
                <span>개인정보 수집 및 이용에 동의합니다. 수집된 정보는 예약 상담 목적으로만 사용되며, 목적 달성 후 파기됩니다.</span>
              </label>
              <button type="submit" class="btn btn-primary btn-lg" style="width:100%"><i class="fa-solid fa-paper-plane"></i> 예약 문의 보내기</button>
              <div id="form-result" style="display:none;text-align:center;padding:14px;border-radius:12px;font-weight:600"></div>
            </div>
          </form>
        </div>

        <div style="text-align:center;margin-top:24px;color:var(--text-3)">
          빠른 예약은 <a href="tel:${CLINIC.phoneRaw}" style="color:var(--brand-glow);font-weight:700">${CLINIC.phone}</a> 으로 전화 주세요.
        </div>
      </div>
    </section>

    <script>
      document.getElementById('reservation-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type=submit]');
        const result = document.getElementById('form-result');
        btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 전송 중...';
        const data = Object.fromEntries(new FormData(e.target));
        try {
          const res = await fetch('/api/reservation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          const json = await res.json();
          result.style.display = 'block';
          if (json.ok) {
            result.style.background = 'var(--brand-soft)'; result.style.color = 'var(--brand-dark)';
            result.innerHTML = '<i class="fa-solid fa-circle-check"></i> 예약 문의가 접수되었습니다. 확인 후 연락드리겠습니다.';
            e.target.reset();
          } else { throw new Error(); }
        } catch (err) {
          result.style.display = 'block'; result.style.background = '#FEF2F2'; result.style.color = '#B91C1C';
          result.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> 전송 중 오류가 발생했습니다. 전화로 문의해 주세요.';
        }
        btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> 예약 문의 보내기';
      });
    </script>
  `
}

// ============================================================
// 비포/애프터 (게이팅 골격)
// ============================================================
export function CasesPage(isLoggedIn = false) {
  const demo = [
    { title: '임플란트 식립 사례', cat: '임플란트', age: '50대', gender: '남성', area: '마곡동', slug: 'implant' },
    { title: '심미 보철 사례', cat: '심미치료', age: '30대', gender: '여성', area: '가양동', slug: 'cosmetic' },
    { title: '투명교정 사례', cat: '교정', age: '20대', gender: '여성', area: '발산동', slug: 'ortho' }
  ]
  return html`
    <section class="page-hero">
      <div class="container">
        <nav class="breadcrumb"><a href="/">홈</a><span class="sep">/</span><span>진료사례</span></nav>
        <span class="eyebrow">진료 사례</span>
        <h1>비포 · <span class="grad">애프터</span></h1>
        <p class="ph-sub">실제 진료 사례를 통해 마곡베스트치과의 진료를 확인하실 수 있습니다.</p>
      </div>
    </section>

    <section class="pad">
      <div class="container">
        <div class="notice-box reveal" style="margin-bottom:32px">
          <i class="fa-solid fa-lock"></i>
          <div>의료법에 따라 치료 후(After) 사진은 병원 방문 상담 시 직접 확인하실 수 있습니다. 치료 결과는 환자 개인의 상태에 따라 차이가 있을 수 있습니다.${raw(isLoggedIn ? '' : ` <a href="tel:${CLINIC.phoneRaw}" style="color:var(--acc);font-weight:700">전화로 상담 문의 →</a>`)}</div>
        </div>

        <div class="ba-grid">
          ${raw(
            demo
              .map(
                (c) => `
            <div class="ba-card reveal">
              <div class="ba-images">
                <div class="ba-img"><span class="ba-tag">Before</span><i class="fa-solid fa-image" style="font-size:1.6rem;color:var(--ink-3);opacity:0.4"></i></div>
                ${
                  isLoggedIn
                    ? `<div class="ba-img"><span class="ba-tag" style="background:var(--brand)">After</span><i class="fa-solid fa-image" style="font-size:1.6rem;color:var(--brand);opacity:0.4"></i></div>`
                    : `<div class="ba-img locked"><div class="lock-ui"><i class="fa-solid fa-lock"></i><span>로그인 후<br />열람 가능</span></div></div>`
                }
              </div>
              <div class="ba-body">
                <h2 class="h4">${c.title}</h2>
                <div class="ba-meta"><span>${c.cat}</span><span>${c.age}</span><span>${c.gender}</span><span><i class="fa-solid fa-location-dot"></i> ${c.area}</span></div>
              </div>
            </div>`
              )
              .join('')
          )}
        </div>

        <p style="text-align:center;color:var(--ink-3);margin-top:32px;font-size:0.9rem">실제 진료 사례 사진은 관리자 페이지를 통해 순차적으로 업로드될 예정입니다.</p>
      </div>
    </section>
  `
}

// ============================================================
// 지역 SEO 페이지
// ============================================================
// 지역×진료 조합별 Q&A (AEO 핵심 — AI 검색엔진이 그대로 인용하는 문답)
export function areaFaqs(areaSlug: string, treatmentSlug: string) {
  const area = AREAS.find((a) => a.slug === areaSlug)
  const t = getTreatment(treatmentSlug)
  if (!area || !t) return []
  return [
    {
      q: `${area.name}에서 ${t.name} 잘하는 치과는 어디인가요?`,
      a: `${area.full} 인근이라면 마곡나루역 1번 출구 도보 3분 거리의 마곡베스트치과의원에서 ${t.name} 상담을 받아보실 수 있습니다. 보건복지부 인증 통합치의학과 전문의인 김민 대표원장이 상담부터 치료, 사후 관리까지 직접 진료합니다.`
    },
    {
      q: `${area.name}에서 마곡베스트치과의원까지 어떻게 가나요?`,
      a: `마곡베스트치과의원은 서울 강서구 마곡중앙5로 1길 20 보타닉비즈타워 310호에 있습니다. 지하철 9호선·공항철도 마곡나루역 1번 출구에서 도보 3분 거리이며, ${area.full}에서 대중교통과 자가용 모두 접근이 편리하고 건물 내 주차가 가능합니다.`
    },
    {
      q: `${t.name} 상담만 받아봐도 되나요?`,
      a: `네, 가능합니다. 정밀 검진과 구강 스캔 후 현재 상태와 치료가 필요한지 여부를 그대로 설명드리며, 치료를 서두르도록 권하지 않습니다. 상담 후 충분히 생각해 보고 결정하셔도 됩니다.`
    },
    {
      q: `평일 저녁이나 토요일에도 ${t.name} 진료가 가능한가요?`,
      a: `월요일과 목요일은 야간 20:30까지, 토요일은 09:30부터 14:30까지 진료하므로 ${area.name} 인근 직장인 분들도 퇴근 후나 주말에 내원하실 수 있습니다. 예약은 전화(02-2093-6545) 또는 홈페이지로 가능합니다.`
    }
  ]
}

export function AreaPage(areaSlug: string, treatmentSlug: string) {
  const area = AREAS.find((a) => a.slug === areaSlug)
  const t = getTreatment(treatmentSlug)
  if (!area || !t) return null
  const faqs = areaFaqs(areaSlug, treatmentSlug)
  return html`
    <section class="page-hero">
      <div class="container">
        <nav class="breadcrumb"><a href="/">홈</a><span class="sep">/</span><a href="/treatments/${t.slug}">${t.name}</a><span class="sep">/</span><span>${area.name}</span></nav>
        <span class="eyebrow">${area.full}</span>
        <h1>${area.name} <span class="grad">${t.name}</span></h1>
        <p class="ph-sub">${area.full} 인근에서 ${t.name}를 찾고 계신가요? 마곡나루역 도보 3분, 마곡베스트치과의원에서 정밀 진단 후 안내드립니다.</p>
      </div>
    </section>

    <section class="pad">
      <div class="container">
        <div class="t-detail-grid">
          <article>
            <div class="t-section reveal">
              <h2>${area.name}에서 가까운 ${t.name} 치과</h2>
              <p>마곡베스트치과의원은 ${CLINIC.addressFull}에 위치하여 ${area.full}에서 접근이 편리합니다. ${CLINIC.directions}로, ${area.name} 인근 거주자와 직장인 분들이 편하게 내원하실 수 있습니다. ${CLINIC.directorCredential} ${DOCTORS[0].name} 대표원장이 ${t.name}를 직접 진료합니다.</p>
            </div>
            <div class="t-section reveal">
              <h2>${t.name}란?</h2>
              <p>${t.summary}</p>
            </div>
            ${raw((t.sections || []).slice(0, 2).map((s) => `<div class="t-section reveal"><h2>${s.h}</h2><p>${s.p}</p></div>`).join(''))}
            <div class="t-section reveal">
              <h2>${area.name} ${t.name}, 자주 묻는 질문</h2>
              ${raw(faqs.map((f) => `
              <details class="faq-item" style="margin-bottom:10px">
                <summary style="cursor:pointer;font-weight:700;color:var(--text);padding:14px 0">${f.q}</summary>
                <p style="padding:0 0 14px;color:var(--ink-2);line-height:1.9">${f.a}</p>
              </details>`).join(''))}
            </div>
          </article>
          <aside class="t-sidebar">
            <div class="side-card brand">
              <h3 class="h4">${area.name} 인근 예약 문의</h3>
              <p>${area.full}에서 ${t.name}가 필요하시다면 부담 없이 문의해 주세요.</p>
              <a href="/reservation" class="btn btn-white" style="width:100%">예약 문의</a>
              <a href="tel:${CLINIC.phoneRaw}" class="btn" style="width:100%;margin-top:10px;background:rgba(255,255,255,0.12);color:#fff"><i class="fa-solid fa-phone"></i> ${CLINIC.phone}</a>
            </div>
            <div class="side-card">
              <h3 class="h4">${t.name} 자세히 보기</h3>
              <div class="side-links"><a href="/treatments/${t.slug}">${t.name} 진료 안내 <i class="fa-solid fa-arrow-right"></i></a></div>
            </div>
            <div class="side-card">
              <h3 class="h4">인근 지역</h3>
              <div class="side-links">${raw(AREAS.filter((a) => a.slug !== areaSlug).slice(0, 4).map((a) => `<a href="/area/${a.slug}-${t.slug}">${a.name} ${t.name} <i class="fa-solid fa-arrow-right"></i></a>`).join(''))}</div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  `
}

export function areaSchema(areaSlug: string, treatmentSlug: string, siteUrl: string) {
  const area = AREAS.find((a) => a.slug === areaSlug)
  const t = getTreatment(treatmentSlug)
  if (!area || !t) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    '@id': `${siteUrl}/area/${areaSlug}-${treatmentSlug}/#clinic`,
    name: `${CLINIC.name} - ${area.name} ${t.name}`,
    url: `${siteUrl}/area/${areaSlug}-${treatmentSlug}`,
    parentOrganization: { '@id': `${siteUrl}/#organization` },
    areaServed: { '@type': 'AdministrativeArea', name: area.full },
    availableService: { '@type': 'MedicalProcedure', name: t.name, url: `${siteUrl}/treatments/${t.slug}` },
    address: { '@type': 'PostalAddress', streetAddress: CLINIC.addressShort, addressLocality: '강서구', addressRegion: '서울특별시', postalCode: CLINIC.postalCode, addressCountry: 'KR' },
    geo: { '@type': 'GeoCoordinates', latitude: CLINIC.geo.lat, longitude: CLINIC.geo.lng },
    telephone: CLINIC.phone
  }
}

// 지역 페이지 FAQPage 스키마 (AEO)
export function areaFaqSchema(areaSlug: string, treatmentSlug: string, siteUrl: string) {
  const faqs = areaFaqs(areaSlug, treatmentSlug)
  if (!faqs.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  }
}
