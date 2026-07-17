import { html, raw } from 'hono/html'
import { CLINIC, CORE_TREATMENTS, GENERAL_TREATMENTS, DOCTORS, CARE_CREED, CARE_PRINCIPLES } from '../data/clinic'

const FUNNEL = [
  { n: '01', t: '인지', d: '마곡나루역 인근에서 치과를 찾는 순간, 정확한 정보로 첫 신뢰를 만듭니다.' },
  { n: '02', t: '내원·상담', d: '서두르지 않고, 현재 상태와 가능한 치료 선택지를 충분히 설명드립니다.' },
  { n: '03', t: '맞춤 계획', d: '구강 스캔과 검진 데이터를 토대로 환자에게 맞는 치료 계획을 함께 정합니다.' },
  { n: '04', t: '책임 진료', d: '처음 상담한 전문의가 치료의 시작부터 마무리까지 직접 책임집니다.' },
  { n: '05', t: '사후 관리', d: '치료 후에도 정기 검진과 전문 클리닝으로 건강을 오래 함께 지킵니다.' },
]

const CORE_IMG: Record<string, string> = {
  implant: '/static/img/tx-implant.webp',
  cavity: '/static/img/consult.webp',
  cosmetic: '/static/img/tx-cosmetic.webp'
}

export function HomePage() {
  const d = DOCTORS[0]
  return html`
    <!-- ============ HERO — 풀블리드 포토 ============ -->
    <section class="hero" id="hero">
      <div class="hero-bg" aria-hidden="true">
        <img src="/static/img/hero-clinic.webp" alt="" fetchpriority="high" />
      </div>
      <div class="container">
        <div class="hero-meta">
          <span class="badge"><span class="dot"></span> ${CLINIC.directorCredential}</span>
          <span class="coord meta">${CLINIC.station} 1번 출구 도보 3분</span>
        </div>

        <h1>
          <span class="l"><span>살릴 수 있는 치아는</span></span>
          <span class="l l-grad"><span>끝까지 살립니다.</span></span>
        </h1>

        <div class="hero-foot">
          <div>
            <p class="hero-sub">${CLINIC.heroSub}</p>
            <div class="hero-actions">
              <a href="/reservation" class="btn btn-primary">예약 문의하기 <i class="fa-solid fa-arrow-right"></i></a>
              <a href="/treatments" class="btn btn-ghost">진료안내</a>
            </div>
          </div>
          <div class="hero-info">
            <div class="row"><span class="k">진료 시간</span><span class="v">월·목 야간 20:30까지</span></div>
            <div class="row"><span class="k">토요일</span><span class="v">09:30 ~ 14:30 진료</span></div>
            <div class="row"><span class="k">중점 진료</span><span class="v acc">임플란트 · 충치 · 심미</span></div>
            <div class="row"><span class="k">전화 예약</span><span class="v"><a href="tel:${CLINIC.phoneRaw}">${CLINIC.phone}</a></span></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ STATS ============ -->
    <section class="pad-sm" aria-label="핵심 지표">
      <div class="container">
        <div class="stats-grid reveal">
          <div class="stat"><div class="num"><span data-count="3"></span><span class="suf">분</span></div><div class="label">마곡나루역 1번 출구 도보</div></div>
          <div class="stat"><div class="num"><span data-count="1"></span><span class="suf">인</span></div><div class="label">대표원장 책임 진료</div></div>
          <div class="stat"><div class="num"><span data-count="4"></span><span class="suf">대</span></div><div class="label">정밀 진단·치료 장비</div></div>
          <div class="stat"><div class="num">365<span class="suf">일</span></div><div class="label">치료 후 정기 관리</div></div>
        </div>
      </div>
    </section>

    <!-- ============ CARE PHILOSOPHY ============ -->
    <section class="pad" aria-label="진료 철학" id="philosophy-section">
      <div class="container">
        <div class="creed">
          <div class="creed-head reveal">
            <span class="label">진료 철학</span>
          </div>
          <div class="creed-body">
            <h2 class="creed-headline reveal">무리한 치료를<br /><span class="grad">권하지 않습니다.</span></h2>
            <p class="creed-lead reveal reveal-d1">${CARE_CREED.body}</p>
          </div>
        </div>

        <div class="principle-grid">
          ${raw(
            CARE_PRINCIPLES.map(
              (p, i) => `
            <article class="principle reveal reveal-d${(i % 3) + 1}">
              <span class="pr-no">${p.no}</span>
              <h3 class="pr-title">${p.title}</h3>
              <p class="pr-body">${p.body}</p>
            </article>`
            ).join('')
          )}
        </div>
      </div>
    </section>

    <!-- ============ CORE — 포토 카드 ============ -->
    <section class="pad tone" aria-label="핵심 진료" id="core-section">
      <div class="container">
        <div class="sec-head">
          <div class="reveal">
            <span class="label">중점 진료</span>
            <h2 class="section-title">가장 <span class="grad">신중하게</span><br />다루는 진료</h2>
          </div>
          <p class="section-lead reveal reveal-d2">정밀 진단을 바탕으로, 환자분 한 분 한 분께 맞는 치료 계획을 세웁니다. 임플란트·충치·심미, 세 가지를 가장 깊게 다룹니다.</p>
        </div>

        <div class="core-photo-grid">
          ${raw(
            CORE_TREATMENTS.map(
              (t, i) => `
            <a href="/treatments/${t.slug}" class="core-photo-card reveal reveal-d${i + 1}" id="core-${t.slug}">
              <span class="cpc-img"><img src="${CORE_IMG[t.slug] || '/static/img/facility-room.webp'}" alt="${t.name}" loading="lazy" /></span>
              <span class="cpc-arrow"><i class="fa-solid fa-arrow-right"></i></span>
              <span class="cpc-body">
                <span class="cpc-idx">중점 진료 ${String(i + 1).padStart(2, '0')}</span>
                <span class="cpc-title" style="display:block">${t.name}</span>
                <span class="cpc-tag">${t.tagline}</span>
                <span class="cpc-desc" style="display:block">${t.summary.slice(0, 92)}…</span>
              </span>
            </a>`
            ).join('')
          )}
        </div>
      </div>
    </section>

    <!-- ============ GENERAL ============ -->
    <section class="pad" aria-label="일반 진료">
      <div class="container">
        <div class="sec-head">
          <div class="reveal">
            <span class="label">전체 진료 안내</span>
            <h2 class="section-title">필요한 모든 진료를,<br /><span class="thin">한 곳에서</span></h2>
          </div>
          <p class="section-lead reveal reveal-d2">교정·턱관절·잇몸·보철·발치·예방까지. 마곡베스트치과 한 곳에서 이어집니다.</p>
        </div>
        <div class="chip-grid">
          ${raw(
            GENERAL_TREATMENTS.map(
              (t) => `
            <a href="/treatments/${t.slug}" class="chip reveal">
              <i class="fa-solid ${t.icon}"></i>
              <span><span class="tn">${t.name}</span><span class="td">${t.tagline}</span></span>
              <i class="chip-arrow fa-solid fa-arrow-right"></i>
            </a>`
            ).join('')
          )}
        </div>
      </div>
    </section>

    <!-- ============ DOCTOR ============ -->
    <section class="pad tone" aria-label="대표원장" id="doctor-section">
      <div class="container">
        <div class="sec-head reveal" style="margin-bottom:clamp(36px,5vw,60px)">
          <span class="label">대표원장 인사</span>
        </div>
        <div class="doctor-feature">
          <div class="reveal">
            <blockquote class="doctor-quote">저에게 <em>‘손이 좋다’</em>는 것은 빠른 치료가 아니라, 정확한 진단으로 <em>통증은 줄이고 꼼꼼하게</em> 치료하는 것입니다.</blockquote>
            <p class="doctor-note reveal reveal-d1">처음 상담하고 치료 계획을 세운 대표원장이 사후 관리까지 직접 책임집니다. 담당 원장이 바뀌지 않아 진료 방향이 중간에 달라지지 않습니다.</p>
            <div class="doctor-sign">
              <div>
                <div class="nm">${d.name} 대표원장</div>
                <div class="cr">${d.credential}</div>
              </div>
            </div>
            <ul class="cred-list">
              ${raw(d.career.slice(0, 4).map((c, i) => `<li class="cred-item"><span class="n">0${i + 1}</span> ${c}</li>`).join(''))}
            </ul>
            <a href="/doctors/${d.slug}" class="btn btn-ghost">대표원장 진료 이야기 <i class="fa-solid fa-arrow-right"></i></a>
          </div>
          <div class="doctor-photo reveal reveal-d2">
            <img src="/static/img/doctor-care.webp" alt="${d.name} 대표원장 진료 모습" loading="lazy" />
            <div class="ph-label">
              <div class="pn">${d.name} 대표원장</div>
              <div class="pc">${d.credential}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ EQUIPMENT ============ -->
    <section class="pad" aria-label="보유 장비">
      <div class="container">
        <div class="feature-split">
          <div class="reveal">
            <span class="label">진단 장비</span>
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

    <!-- ============ LIFE — 풀블리드 포토 밴드 ============ -->
    <section class="pad-sm" aria-label="치료 그 이후의 삶">
      <div class="container">
        <div class="life-band reveal">
          <span class="lb-img"><img src="/static/img/life-smile.webp" alt="" loading="lazy" /></span>
          <div class="lb-body">
            <span class="eyebrow" style="color:#BCD5FA">치료, 그 이후</span>
            <h2>치료의 완성은,<br /><em>다시 웃는 일상</em>입니다</h2>
            <p>임플란트 치료는 단순히 치아를 만드는 것이 아니라, 한 사람의 식생활과 건강, 삶의 질과 연결됩니다. 치료가 끝난 뒤에도 오래 건강하게 쓰실 수 있도록 끝까지 함께 관리해 드립니다.</p>
            <a href="/mission" class="btn btn-glass">마곡베스트치과 이야기 <i class="fa-solid fa-arrow-right"></i></a>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ FUNNEL ============ -->
    <section class="pad tone" aria-label="환자 여정" id="journey-section">
      <div class="container">
        <div class="sec-head">
          <div class="reveal">
            <span class="label">진료 과정</span>
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

    <!-- ============ CTA ============ -->
    <section class="pad-sm" aria-label="예약 안내">
      <div class="container">
        <div class="cta-band reveal">
          <span class="label" style="justify-content:center">예약 안내</span>
          <h2>지금, 가장 편한<br /><em>시간</em>을 알려주세요</h2>
          <p>증상이 가벼울 때 확인하는 것이 가장 좋은 치료의 시작입니다. 부담 없이 문의해 주세요.</p>
          <div class="cta-actions">
            <a href="/reservation" class="btn btn-primary">예약 문의하기 <i class="fa-solid fa-arrow-right"></i></a>
            <a href="tel:${CLINIC.phoneRaw}" class="btn btn-ghost"><i class="fa-solid fa-phone"></i> ${CLINIC.phone}</a>
          </div>
        </div>
      </div>
    </section>
  `
}
