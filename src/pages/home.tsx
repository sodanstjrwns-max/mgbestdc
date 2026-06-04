import { html, raw } from 'hono/html'
import { CLINIC, CORE_TREATMENTS, GENERAL_TREATMENTS, DOCTORS } from '../data/clinic'

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
    <!-- ============ HERO — 에디토리얼 ============ -->
    <section class="hero" id="hero">
      <canvas id="fx-canvas" class="fx-canvas" aria-hidden="true"></canvas>
      <div class="container">
        <div class="hero-inner">
          <div class="hero-meta">
            <span class="badge"><span class="dot"></span> ${CLINIC.directorCredential}</span>
            <span class="coord meta">37.5670°N&nbsp;&nbsp;126.8295°E<br />MAGOK · SEOUL · EST.${CLINIC.openedYear}</span>
          </div>

          <h1>
            <span class="l reveal-line"><span>치료가 끝나고도</span></span>
            <span class="l l-grad"><span data-split>아무 걱정 없이.</span></span>
          </h1>

          <div class="hero-foot">
            <div class="reveal reveal-d2">
              <p class="hero-sub">${CLINIC.heroSub}</p>
              <div class="hero-actions">
                <a href="/reservation" class="btn btn-primary" data-magnetic>예약 문의하기 <i class="fa-solid fa-arrow-right"></i></a>
                <a href="/treatments" class="btn btn-ghost" data-magnetic>진료안내</a>
              </div>
            </div>
            <div class="hero-info reveal reveal-d3">
              <div class="row"><span class="k">DIRECTOR</span><span class="v">${d.name} 대표원장</span></div>
              <div class="row"><span class="k">LOCATION</span><span class="v">${CLINIC.station} · 도보 3분</span></div>
              <div class="row"><span class="k">FOCUS</span><span class="v acc">임플란트 · 충치 · 심미</span></div>
              <div class="row"><span class="k">CALL</span><span class="v"><a href="tel:${CLINIC.phoneRaw}">${CLINIC.phone}</a></span></div>
            </div>
          </div>
        </div>
      </div>
      <div class="scroll-hint"><span class="bar"></span> SCROLL</div>
    </section>

    <!-- ============ MARQUEE ============ -->
    <div class="marquee" aria-hidden="true">
      <div class="marquee-track">
        ${raw(
          [...Array(2)]
            .map(
              () => `
          <span class="marquee-item"><i class="fa-solid fa-circle"></i> IMPLANT 임플란트</span>
          <span class="marquee-item"><i class="fa-solid fa-circle"></i> CAVITY 충치치료</span>
          <span class="marquee-item"><i class="fa-solid fa-circle"></i> COSMETIC 심미치료</span>
          <span class="marquee-item"><i class="fa-solid fa-circle"></i> 1인 책임 진료</span>
          <span class="marquee-item"><i class="fa-solid fa-circle"></i> 마곡나루역 3분</span>
          <span class="marquee-item"><i class="fa-solid fa-circle"></i> 통합치의학과 전문의</span>`
            )
            .join('')
        )}
      </div>
    </div>

    <!-- ============ STATS ============ -->
    <section class="pad-sm">
      <div class="container">
        <div class="stats-grid reveal">
          <div class="stat" data-spotlight><div class="num"><span data-count="3"></span></div><div class="label" data-scramble="MAGOKNARU · MIN"></div></div>
          <div class="stat" data-spotlight><div class="num"><span data-count="1"></span><span class="suf">인</span></div><div class="label" data-scramble="RESPONSIBLE CARE"></div></div>
          <div class="stat" data-spotlight><div class="num"><span data-count="4"></span><span class="suf">대</span></div><div class="label" data-scramble="CORE EQUIPMENT"></div></div>
          <div class="stat" data-spotlight><div class="num">365<span class="suf">일</span></div><div class="label" data-scramble="AFTERCARE"></div></div>
        </div>
      </div>
    </section>

    <!-- ============ CORE — 에디토리얼 인덱스 리스트 ============ -->
    <section class="pad tone" aria-label="핵심 진료">
      <div class="container">
        <div class="sec-head">
          <div class="reveal">
            <span class="label label--line"><span class="idx">[01]</span> CORE TREATMENTS</span>
            <h2 class="section-title">가장 <span class="thin">신중하게</span><br />다루는 진료</h2>
          </div>
          <p class="section-lead reveal reveal-d2">정밀 진단을 바탕으로, 환자분 한 분 한 분께 맞는 치료 계획을 세웁니다. 임플란트·충치·심미, 세 가지를 가장 깊게 다룹니다.</p>
        </div>

        <div class="core-list">
          ${raw(
            CORE_TREATMENTS.map(
              (t, i) => `
            <a href="/treatments/${t.slug}" class="core-row reveal reveal-d${i + 1}">
              <span class="cr-idx">/ ${String(i + 1).padStart(2, '0')}</span>
              <span class="cr-main">
                <i class="cr-ico fa-solid ${t.icon}"></i>
                <span class="cr-title">${t.name}</span>
              </span>
              <span class="cr-desc-wrap">
                <span class="cr-tag">${t.tagline}</span>
                <span class="cr-desc">${t.summary}</span>
              </span>
              <span class="cr-arrow"><i class="fa-solid fa-arrow-right"></i></span>
            </a>`
            ).join('')
          )}
        </div>
      </div>
    </section>

    <!-- ============ GENERAL — 라인 그리드 ============ -->
    <section class="pad">
      <div class="container">
        <div class="sec-head">
          <div class="reveal">
            <span class="label label--line"><span class="idx">[02]</span> ALL TREATMENTS</span>
            <h2 class="section-title">필요한 모든 진료를,<br /><span class="thin">한 곳에서</span></h2>
          </div>
          <p class="section-lead reveal reveal-d2">교정·턱관절·잇몸·보철·발치·예방까지. 마곡베스트치과 한 곳에서 이어집니다.</p>
        </div>
        <div class="chip-grid">
          ${raw(
            GENERAL_TREATMENTS.map(
              (t) => `
            <a href="/treatments/${t.slug}" class="chip reveal" data-spotlight>
              <i class="fa-solid ${t.icon}"></i>
              <span><span class="tn">${t.name}</span><span class="td">${t.tagline}</span></span>
              <i class="chip-arrow fa-solid fa-arrow-right"></i>
            </a>`
            ).join('')
          )}
        </div>
      </div>
    </section>

    <!-- ============ DOCTOR — 인용형 ============ -->
    <section class="pad tone">
      <div class="container">
        <div class="sec-head reveal" style="margin-bottom:clamp(36px,5vw,60px)">
          <span class="label label--line"><span class="idx">[03]</span> DIRECTOR</span>
        </div>
        <div class="doctor-feature">
          <div class="reveal">
            <blockquote class="doctor-quote">처음 만난 전문의가 <em>치료의 시작부터 마무리까지</em>, 그리고 그 이후의 관리까지 직접 책임집니다.</blockquote>
            <div class="doctor-sign">
              <div>
                <div class="nm">${d.name} 대표원장</div>
                <div class="cr">${d.credential}</div>
              </div>
            </div>
            <ul class="cred-list">
              ${raw(d.career.slice(0, 4).map((c, i) => `<li class="cred-item"><span class="n">0${i + 1}</span> ${c}</li>`).join(''))}
            </ul>
            <a href="/doctors/${d.slug}" class="btn btn-ghost" data-magnetic>의료진 전체 소개 <i class="fa-solid fa-arrow-right"></i></a>
          </div>
          <div class="doctor-photo is-placeholder reveal reveal-d2" data-tilt>
            <span class="ph-corner meta">[ FIG.01 — DIRECTOR ]</span>
            <div class="ph-center" data-parallax="0.05">
              <i class="ph-icon fa-solid fa-user-doctor"></i>
              <span class="ph-note">IMAGE&nbsp;PENDING</span>
              <span class="ph-dim">1080 × 1350</span>
            </div>
            <div class="ph-label">
              <div class="pn">${d.name} 대표원장</div>
              <div class="pc">${d.credential}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ EQUIPMENT — 데이터 테이블 ============ -->
    <section class="pad">
      <div class="container">
        <div class="feature-split">
          <div class="reveal">
            <span class="label label--line"><span class="idx">[04]</span> TECHNOLOGY</span>
            <h2 class="section-title" style="margin-top:20px">정확한 진단을<br /><span class="thin">돕는 장비</span></h2>
            <p class="section-lead" style="margin-top:20px">진료의 시작은 정확한 데이터입니다. 구강 스캔부터 정밀 클리닝까지, 환자에게 맞는 판단을 돕는 장비를 갖췄습니다.</p>
            <div class="feature-list">
              <div class="feature-item"><i class="fi-ico fa-solid fa-cube"></i><div><h4>디지털 구강 스캔</h4><p>본을 뜨지 않고 입안을 디지털로 스캔해 정밀하게 기록합니다.</p></div></div>
              <div class="feature-item"><i class="fi-ico fa-solid fa-gauge-high"></i><div><h4>정밀 토크 제어</h4><p>임플란트 전용 엔진으로 식립의 정확도를 높입니다.</p></div></div>
              <div class="feature-item"><i class="fi-ico fa-solid fa-spray-can-sparkles"></i><div><h4>전문 클리닝</h4><p>미세 분말로 치아 표면과 잇몸 라인을 부드럽게 관리합니다.</p></div></div>
            </div>
          </div>
          <div class="reveal reveal-d2">
            <div class="equip-table">
              ${raw(
                CLINIC.equipment
                  .map(
                    (e, i) => `<div class="equip-row"><span class="en-idx">0${i + 1}</span><div><div class="en">${e.name}</div><div class="ed">${e.desc}</div></div></div>`
                  )
                  .join('')
              )}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ FUNNEL — 스크롤 드로우 ============ -->
    <section class="pad tone">
      <div class="container">
        <div class="sec-head">
          <div class="reveal">
            <span class="label label--line"><span class="idx">[05]</span> PATIENT JOURNEY</span>
            <h2 class="section-title">인지부터 사후관리까지<br /><span class="thin">전 과정을 설계</span></h2>
          </div>
          <p class="section-lead reveal reveal-d2">치과를 알게 된 순간부터 치료 후 관리까지. 환자의 여정 전체를 책임지고 동행합니다.</p>
        </div>
        <div class="funnel-timeline">
          ${raw(
            FUNNEL.map(
              (f) => `
            <div class="f-step">
              <div class="f-num">${f.n}</div>
              <div><h4>${f.t}</h4><p>${f.d}</p></div>
            </div>`
            ).join('')
          )}
        </div>
      </div>
    </section>

    <!-- ============ CTA — 반전 종이 ============ -->
    <section class="pad-sm">
      <div class="container">
        <div class="cta-band reveal">
          <span class="label"><span class="idx">[06]</span> CONTACT</span>
          <h2>지금, 가장 편한<br /><em>시간</em>을 알려주세요</h2>
          <p>증상이 가벼울 때 확인하는 것이 가장 좋은 치료의 시작입니다. 부담 없이 문의해 주세요.</p>
          <div class="cta-actions">
            <a href="/reservation" class="btn btn-primary" data-magnetic>예약 문의하기 <i class="fa-solid fa-arrow-right"></i></a>
            <a href="tel:${CLINIC.phoneRaw}" class="btn btn-ghost" data-magnetic>${CLINIC.phone}</a>
          </div>
        </div>
      </div>
    </section>
  `
}
