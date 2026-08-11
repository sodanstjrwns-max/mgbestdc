import { html, raw } from 'hono/html'
import { CLINIC, CORE_TREATMENTS, GENERAL_TREATMENTS, DOCTORS, CARE_CREED, CARE_PRINCIPLES } from '../data/clinic'
import { srcset, SIZES } from '../components/img'
import { baSliderHtml, esc, type DbCase } from './cms'

const FUNNEL = [
  { n: '01', t: '예약', d: '전화·온라인으로 편하게 예약하세요. 뭐부터 해야 할지 모르셔도 괜찮습니다.' },
  { n: '02', t: '첫날 — 검진과 설명', d: '현재 상태와 가능한 선택지를 충분히 설명드립니다. 당일 치료를 강요하지 않습니다.' },
  { n: '03', t: '계획과 비용 확정', d: '구강 스캔과 검진 데이터를 토대로, 치료 계획과 확정 비용을 함께 정합니다.' },
  { n: '04', t: '처음 그 원장이 끝까지', d: '상담한 대표원장이 치료의 시작부터 마무리까지 직접 진행합니다. 담당이 바뀌지 않습니다.' },
  { n: '05', t: '치료 후 관리', d: '정기 검진과 전문 클리닝으로 치료 결과를 오래 유지하도록 함께합니다.' },
]

const CORE_IMG: Record<string, string> = {
  implant: '/static/img/core-implant.webp',
  cavity: '/static/img/core-cavity.webp',
  cosmetic: '/static/img/core-cosmetic.webp'
}

// tx-index 호버 시 커서 옆에 뜨는 프리뷰 이미지
const TX_PREVIEW: Record<string, string> = {
  ortho: '/static/img/tx-ortho.webp',
  tmj: '/static/img/doctor-care.webp',
  gum: '/static/img/consult.webp',
  prosthesis: '/static/img/tx-cosmetic.webp',
  extraction: '/static/img/facility-room.webp',
  preventive: '/static/img/life-smile.webp'
}

export function HomePage(cases: DbCase[] = [], isMember = false) {
  const d = DOCTORS[0]
  return html`
    <!-- ============ HERO — 풀블리드 포토 ============ -->
    <section class="hero" id="hero">
      <div class="hero-bg" aria-hidden="true">
        <img src="/static/img/hero-lobby.webp" srcset="${srcset('/static/img/hero-lobby.webp', 1920)}" sizes="100vw" alt="마곡베스트치과의원 로비 전경 — 마곡나루역 1번 출구 앞" fetchpriority="high" />
        <video class="hero-video" autoplay muted loop playsinline preload="metadata" poster="/static/img/hero-lobby.webp" onloadeddata="this.classList.add('on')">
          <source src="/media/video/branding-hero.mp4" type="video/mp4" />
        </video>
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
        <div class="fact-strip reveal">
          <div class="fact"><strong class="fact-num"><span data-countup="3">0</span><em>분</em></strong><span>마곡나루역 1번 출구 도보</span></div>
          <div class="fact"><strong class="fact-num"><span data-countup="1">0</span><em>인 책임진료</em></strong><span>상담부터 치료까지 대표원장 직접</span></div>
          <div class="fact"><strong class="fact-num">20<em>:30</em></strong><span>월·목 야간 진료</span></div>
          <a href="/pricing" class="fact" style="text-decoration:none;color:inherit"><strong class="fact-num"><span data-countup="17">0</span><em>항목</em></strong><span>비급여 비용 공개 — 보러가기 <i class="fa-solid fa-arrow-right" style="font-size:0.7em"></i></span></a>
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

        <div class="principle-flow">
          <div class="pf-photo reveal reveal-wipe">
            <video autoplay muted loop playsinline preload="metadata" poster="/static/img/video/clip-consult-poster.jpg" aria-label="치료 계획을 설명하는 상담 모습" style="width:100%;height:100%;object-fit:cover;display:block"><source src="/media/video/clip-consult.mp4" type="video/mp4" /></video>
          </div>
          <div class="pf-list reveal reveal-d1">
            ${raw(
              CARE_PRINCIPLES.map(
                (p) => `
              <div class="pf-item">
                <h3>${p.title}</h3>
                <p>${p.body}</p>
              </div>`
              ).join('')
            )}
          </div>
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
              <span class="cpc-img"><img src="${CORE_IMG[t.slug] || '/static/img/facility-room.webp'}" srcset="${srcset(CORE_IMG[t.slug] || '/static/img/facility-room.webp')}" sizes="${SIZES.third}" alt="${t.name}" loading="lazy" decoding="async" /></span>
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

        <div class="reveal" style="margin-top:36px;text-align:center">
          <p style="color:var(--ink-3);margin-bottom:14px">내 경우는 어떤 치료가 맞을까? — 진단 후 가능한 선택지를 함께 비교해 드립니다.</p>
          <a href="/reservation" class="btn btn-ghost">진단 예약하기 <i class="fa-solid fa-arrow-right"></i></a>
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
              ${raw(d.career.slice(0, 4).map((c) => `<li class="cred-item">${c}</li>`).join(''))}
            </ul>
            <div style="display:flex;gap:10px;flex-wrap:wrap">
              <a href="/story" class="btn btn-primary">원장의 스토리 보기 <i class="fa-solid fa-arrow-right"></i></a>
              <a href="/doctors/${d.slug}" class="btn btn-ghost">프로필 자세히</a>
            </div>
          </div>
          <div class="doctor-photo reveal reveal-wipe">
            <img src="/static/img/dr-kim-stool.webp" srcset="${srcset('/static/img/dr-kim-stool.webp', 1045)}" sizes="${SIZES.half}" alt="${d.name} 대표원장" loading="lazy" decoding="async" />
            <div class="ph-label">
              <div class="pn">${d.name} 대표원장</div>
              <div class="pc">${d.credential}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ CASES — 치료사례 (주장 뒤에 증거) ============ -->
    ${cases.length > 0
      ? html`
    <section class="pad" aria-label="치료사례" id="home-cases">
      <div class="container">
        <div class="sec-head">
          <div class="reveal">
            <span class="label">치료사례</span>
            <h2 class="section-title">말보다,<br /><span class="grad">결과로</span> 보여드립니다</h2>
          </div>
          <p class="section-lead reveal reveal-d2">환자분 동의를 거쳐 공개하는 실제 치료 기록입니다. 슬라이더를 움직여 치료 전·후를 직접 비교해 보세요.</p>
        </div>
        <div class="ba-grid">
          ${raw(
            cases
              .map(
                (cs, i) => `
            <a href="/cases/${cs.id}" class="ba-card reveal reveal-d${i + 1}" aria-label="${esc(cs.title)} 사례 자세히 보기">
              ${baSliderHtml(cs.before_img, cs.after_img, cs.title, isMember)}
              <div class="ba-body">
                <h3 class="h4">${esc(cs.title)}</h3>
                <div class="ba-meta">
                  <span>${esc(cs.category)}</span>
                  ${cs.age_group ? `<span>${esc(cs.age_group)}</span>` : ''}
                  ${cs.gender ? `<span>${esc(cs.gender)}</span>` : ''}
                </div>
                <span class="ba-more">자세히 보기 <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
              </div>
            </a>`
              )
              .join('')
          )}
        </div>
        <div class="reveal" style="margin-top:32px;text-align:center">
          <a href="/cases" class="btn btn-primary">치료사례 전체 보기 <i class="fa-solid fa-arrow-right"></i></a>
          <p style="color:var(--ink-3);font-size:0.85rem;margin-top:12px">치료 후(After) 사진은 의료광고법에 따라 회원가입 후 확인하실 수 있습니다.</p>
        </div>
      </div>
    </section>`
      : ''}

    <!-- ============ LIFE — 풀블리드 포토 밴드 (장비 안내는 /facility로 유도 — 홈 밀도 다이어트) ============ -->
    <section class="pad-sm" aria-label="치료 그 이후의 삶">
      <div class="container">
        <div class="life-band reveal">
          <span class="lb-img"><video autoplay muted loop playsinline preload="metadata" poster="/static/img/video/drone-a-poster.jpg" aria-hidden="true" style="width:100%;height:100%;object-fit:cover;display:block"><source src="/media/video/drone-a.mp4" type="video/mp4" /></video></span>
          <div class="lb-body">
            <span class="eyebrow" style="color:#BCD5FA">치료, 그 이후</span>
            <h2>치료의 완성은,<br /><em>다시 웃는 일상</em>입니다</h2>
            <p>임플란트 치료는 단순히 치아를 만드는 것이 아니라, 한 사람의 식생활과 건강, 삶의 질과 연결됩니다. 치료가 끝난 뒤에도 오래 건강하게 쓰실 수 있도록 끝까지 함께 관리해 드립니다.</p>
            <a href="/about" class="btn btn-glass">마곡베스트치과 이야기 <i class="fa-solid fa-arrow-right"></i></a>
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
        <div class="journey reveal">
          ${raw(
            FUNNEL.map(
              (f) => `
            <div class="journey-row">
              <span class="jt">${f.t}</span>
              <span class="jd">${f.d}</span>
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
          <p>증상이 가벼울 때 확인하는 것이 가장 좋은 치료의 시작입니다. 진단과 상담만 받고 결정하셔도 괜찮습니다 — 부담 없이 문의해 주세요.</p>
          <div class="cta-actions">
            <a href="/reservation" class="btn btn-primary">예약 문의하기 <i class="fa-solid fa-arrow-right"></i></a>
            <a href="tel:${CLINIC.phoneRaw}" class="btn btn-ghost"><i class="fa-solid fa-phone"></i> ${CLINIC.phone}</a>
          </div>
        </div>
      </div>
    </section>
  `
}
