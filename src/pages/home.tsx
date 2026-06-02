import { html, raw } from 'hono/html'
import { CLINIC, CORE_TREATMENTS, GENERAL_TREATMENTS, DOCTORS } from '../data/clinic'

const PANEL_GLOW = ['rgba(46,125,255,0.5)', 'rgba(124,92,255,0.5)', 'rgba(34,224,224,0.45)']

const FUNNEL = [
  { n: '01', t: '인지', d: '마곡나루역 인근에서 치과를 찾는 순간, 정확한 정보로 첫 신뢰를 만듭니다.' },
  { n: '02', t: '내원·상담', d: '서두르지 않고, 현재 상태와 가능한 치료 선택지를 충분히 설명드립니다.' },
  { n: '03', t: '맞춤 계획', d: '구강 스캔과 검진 데이터를 토대로 환자에게 맞는 치료 계획을 함께 정합니다.' },
  { n: '04', t: '책임 진료', d: '처음 상담한 전문의가 치료의 시작부터 마무리까지 직접 책임집니다.' },
  { n: '05', t: '사후 관리', d: '치료 후에도 정기 검진과 전문 클리닝으로 건강을 오래 함께 지킵니다.' },
]

export function HomePage() {
  const d = DOCTORS[0]
  return html`
    <!-- ============ HERO (kinetic + canvas particles) ============ -->
    <section class="hero" id="hero">
      <canvas id="hero-canvas"></canvas>
      <div class="hero-glow g1"></div>
      <div class="hero-glow g2"></div>
      <div class="container">
        <div class="hero-inner">
          <div class="hero-text">
            <span class="hero-badge"><span class="pulse"></span> ${CLINIC.directorCredential}</span>
            <h1>
              <span class="lead-line">${CLINIC.heroLead}</span>
              <span class="line"><span data-split data-split-delay="0.25">${CLINIC.heroMain}</span></span>
            </h1>
            <p class="hero-sub">${CLINIC.heroSub}</p>
            <div class="hero-actions">
              <a href="/reservation" class="btn btn-primary"><i class="fa-solid fa-calendar-check"></i> 예약 문의하기</a>
              <a href="/treatments" class="btn btn-glass">진료안내 <i class="fa-solid fa-arrow-right"></i></a>
            </div>
          </div>

          <aside class="hero-card reveal reveal-d2">
            <h3><i class="fa-solid fa-clock"></i> 진료 시간</h3>
            ${raw(
              CLINIC.hours
                .map((h) => {
                  const cls = h.note === '휴진' ? ' closed' : h.note && h.note.includes('야간') ? ' night' : ''
                  return `<div class="hc-row${cls}"><span class="d">${h.day}</span><span class="t">${h.time}${h.note ? ' · ' + h.note : ''}</span></div>`
                })
                .join('')
            )}
            <div class="hc-foot"><i class="fa-solid fa-location-dot"></i> ${CLINIC.directions}</div>
            <div class="hc-foot"><i class="fa-solid fa-phone"></i> <a href="tel:${CLINIC.phoneRaw}">${CLINIC.phone}</a></div>
          </aside>
        </div>
      </div>
      <div class="scroll-ind"><span>SCROLL</span><span class="bar"></span></div>
    </section>

    <!-- ============ MARQUEE ============ -->
    <div class="marquee" aria-hidden="true">
      <div class="marquee-track">
        ${raw(
          [...Array(2)]
            .map(
              () => `
          <span class="marquee-item"><i class="fa-solid fa-tooth"></i> 임플란트</span>
          <span class="marquee-item"><i class="fa-solid fa-tooth"></i> 충치치료</span>
          <span class="marquee-item"><i class="fa-solid fa-tooth"></i> 심미치료</span>
          <span class="marquee-item"><i class="fa-solid fa-tooth"></i> 1인 책임 진료</span>
          <span class="marquee-item"><i class="fa-solid fa-tooth"></i> 마곡나루역 3분</span>
          <span class="marquee-item"><i class="fa-solid fa-tooth"></i> 통합치의학과 전문의</span>`
            )
            .join('')
        )}
      </div>
    </div>

    <!-- ============ STATS ============ -->
    <section class="pad-sm">
      <div class="container">
        <div class="stats-grid reveal">
          <div class="stat"><div class="num" data-count="3"></div><div class="label">마곡나루역 도보 (분)</div></div>
          <div class="stat"><div class="num"><span data-count="1"></span><span class="suf">인</span></div><div class="label">책임 진료 시스템</div></div>
          <div class="stat"><div class="num"><span data-count="4"></span><span class="suf">대</span></div><div class="label">핵심 진료 장비</div></div>
          <div class="stat"><div class="num">365<span class="suf">일</span></div><div class="label">사후 관리 동행</div></div>
        </div>
      </div>
    </section>

    <!-- ============ CORE TREATMENTS — HORIZONTAL SCROLL ============ -->
    <section class="h-scroll-wrap" aria-label="핵심 진료">
      <div class="h-scroll-pin">
        <div class="h-scroll-track">
          <div class="h-intro">
            <span class="eyebrow">CORE TREATMENTS</span>
            <h2 class="section-title">집중하는<br />세 가지 진료</h2>
            <p class="section-lead">우리가 가장 자신 있게, 그리고 가장 신중하게 다루는 진료입니다. 옆으로 스크롤해 둘러보세요.</p>
          </div>
          ${raw(
            CORE_TREATMENTS.map(
              (t, i) => `
            <article class="h-panel">
              <div class="h-panel-num">${String(i + 1).padStart(2, '0')}</div>
              <div class="h-panel-glow" style="background:radial-gradient(circle, ${PANEL_GLOW[i % PANEL_GLOW.length]}, transparent 70%)"></div>
              <span class="h-ico"><i class="fa-solid ${t.icon}"></i></span>
              <div class="h-panel-body">
                <span class="tag">${t.category}</span>
                <h3>${t.name}</h3>
                <p>${t.summary}</p>
                <a href="/treatments/${t.slug}" class="btn btn-glass">자세히 보기 <i class="fa-solid fa-arrow-right"></i></a>
              </div>
            </article>`
            ).join('')
          )}
        </div>
        <div class="h-progress"><div class="h-progress-bar"></div></div>
      </div>
    </section>

    <!-- ============ GENERAL TREATMENTS — GLASS GRID ============ -->
    <section class="pad">
      <div class="container">
        <div class="reveal" style="text-align:center;margin-bottom:54px">
          <span class="eyebrow" style="justify-content:center">ALL TREATMENTS</span>
          <h2 class="section-title">필요한 모든 진료를,<br />한 곳에서</h2>
        </div>
        <div class="card-grid">
          ${raw(
            GENERAL_TREATMENTS.map(
              (t, i) => `
            <a href="/treatments/${t.slug}" class="chip reveal reveal-d${(i % 4) + 1}">
              <i class="fa-solid ${t.icon}"></i>
              <span><span class="tn">${t.name}</span><span class="td">${t.tagline}</span></span>
            </a>`
            ).join('')
          )}
        </div>
      </div>
    </section>

    <!-- ============ DOCTOR FEATURE ============ -->
    <section class="pad-sm">
      <div class="container">
        <div class="doctor-feature">
          <div class="doctor-photo reveal tilt">
            <i class="ph-icon fa-solid fa-user-doctor"></i>
            <div class="ph-label">
              <div class="pn">${d.name} 대표원장</div>
              <div class="pc">${d.credential}</div>
            </div>
          </div>
          <div class="reveal reveal-d2">
            <span class="eyebrow">DIRECTOR</span>
            <h2 class="section-title">처음 만난 전문의가<br />끝까지 함께합니다</h2>
            <p class="section-lead">${CLINIC.mission}</p>
            <ul class="cred-list">
              ${raw(d.career.slice(0, 5).map((c) => `<li class="cred-item"><i class="fa-solid fa-circle"></i> ${c}</li>`).join(''))}
            </ul>
            <div style="margin-top:30px">
              <a href="/doctors/${d.slug}" class="btn btn-glass">의료진 소개 <i class="fa-solid fa-arrow-right"></i></a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ EQUIPMENT FEATURE SPLIT ============ -->
    <section class="pad">
      <div class="container">
        <div class="feature-split">
          <div class="reveal">
            <span class="eyebrow">TECHNOLOGY</span>
            <h2 class="section-title">정확한 진단을<br />돕는 장비들</h2>
            <p class="section-lead">진료의 시작은 정확한 데이터입니다. 구강 스캔부터 정밀 클리닝까지, 환자에게 맞는 판단을 돕는 장비를 갖췄습니다.</p>
            <div class="feature-list">
              <div class="feature-item"><span class="fi-ico"><i class="fa-solid fa-cube"></i></span><div><h4>디지털 구강 스캔</h4><p>본을 뜨지 않고 입안을 디지털로 스캔해 정밀하게 기록합니다.</p></div></div>
              <div class="feature-item"><span class="fi-ico"><i class="fa-solid fa-gauge-high"></i></span><div><h4>정밀 토크 제어</h4><p>임플란트 전용 엔진으로 식립의 정확도를 높입니다.</p></div></div>
              <div class="feature-item"><span class="fi-ico"><i class="fa-solid fa-spray-can-sparkles"></i></span><div><h4>전문 클리닝</h4><p>미세 분말로 치아 표면과 잇몸 라인을 부드럽게 관리합니다.</p></div></div>
            </div>
          </div>
          <div class="equip-visual reveal reveal-d2">
            <div class="eq-glow"></div>
            <h3><i class="fa-solid fa-microchip" style="color:var(--brand-glow);margin-right:10px"></i>보유 장비</h3>
            <div class="equip-grid">
              ${raw(
                CLINIC.equipment
                  .map(
                    (e) => `<div class="equip-row"><i class="fa-solid fa-check"></i><div><div class="en">${e.name}</div><div class="ed">${e.desc}</div></div></div>`
                  )
                  .join('')
              )}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ FUNNEL TIMELINE (환자 여정) ============ -->
    <section class="pad">
      <div class="container">
        <div class="reveal" style="text-align:center">
          <span class="eyebrow" style="justify-content:center">PATIENT JOURNEY</span>
          <h2 class="section-title">인지부터 사후관리까지,<br />전 과정을 설계합니다</h2>
        </div>
        <div class="funnel-timeline">
          ${raw(
            FUNNEL.map(
              (f) => `
            <div class="f-step">
              <div class="f-dot">${f.n}</div>
              <div><h4>${f.t}</h4><p>${f.d}</p></div>
            </div>`
            ).join('')
          )}
        </div>
      </div>
    </section>

    <!-- ============ CTA BAND ============ -->
    <section class="pad-sm">
      <div class="cta-band">
        <div class="cta-inner">
          <h2 data-split data-split-scroll style="font-size:clamp(2rem,5vw,3.4rem);color:#fff;margin-bottom:18px;font-weight:900">지금, 가장 편한 시간을 알려주세요</h2>
          <p style="color:rgba(255,255,255,0.9);font-size:1.1rem;max-width:560px;margin:0 auto 32px">증상이 가벼울 때 확인하는 것이 가장 좋은 치료의 시작입니다. 부담 없이 문의해 주세요.</p>
          <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap">
            <a href="/reservation" class="btn" style="background:#fff;color:var(--brand)"><i class="fa-solid fa-calendar-check"></i> 예약 문의하기</a>
            <a href="tel:${CLINIC.phoneRaw}" class="btn btn-glass" style="border-color:rgba(255,255,255,0.4)"><i class="fa-solid fa-phone"></i> ${CLINIC.phone}</a>
          </div>
        </div>
      </div>
    </section>
  `
}
