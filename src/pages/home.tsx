import { html, raw } from 'hono/html'
import { CLINIC, CORE_TREATMENTS, GENERAL_TREATMENTS, DOCTORS } from '../data/clinic'

export function HomePage() {
  const d = DOCTORS[0]
  return html`
    <!-- ============ HERO ============ -->
    <section class="hero">
      <div class="hero-bg-grid"></div>
      <div class="hero-orb o1"></div>
      <div class="hero-orb o2"></div>
      <div class="container">
        <div class="hero-inner">
          <div class="hero-text">
            <span class="hero-badge reveal"><i class="fa-solid fa-circle-check"></i> 보건복지부 인증 통합치의학과 전문의</span>
            <h1 class="reveal reveal-d1">
              <span class="lead-line">${CLINIC.heroLead}</span>
              <span class="accent">아무 걱정도</span><br />남지 않도록.
            </h1>
            <p class="hero-sub reveal reveal-d2">${CLINIC.heroSub}</p>
            <div class="hero-actions reveal reveal-d3">
              <a href="/reservation" class="btn btn-primary btn-lg"><i class="fa-solid fa-calendar-check"></i> 예약 문의하기</a>
              <a href="/treatments" class="btn btn-ghost btn-lg">진료 안내 <i class="fa-solid fa-arrow-right"></i></a>
            </div>
          </div>

          <aside class="hero-card reveal reveal-d2" aria-label="진료시간 안내">
            <h3><i class="fa-solid fa-clock"></i> 진료 시간</h3>
            <div class="hc-hours">
              ${raw(
                CLINIC.hours
                  .map(
                    (h) => `
                <div class="hc-row ${h.note === '야간진료' ? 'night' : ''} ${h.closed ? 'closed' : ''}">
                  <span class="d">${h.day}</span>
                  <span class="t">${h.time}${h.note ? ` <small>(${h.note})</small>` : ''}</span>
                </div>`
                  )
                  .join('')
              )}
            </div>
            <div class="hc-foot"><i class="fa-solid fa-location-dot"></i> ${CLINIC.directions}</div>
            <a href="tel:${CLINIC.phoneRaw}" class="btn btn-primary" style="width:100%;margin-top:16px"><i class="fa-solid fa-phone"></i> ${CLINIC.phone}</a>
          </aside>
        </div>
      </div>
      <div class="scroll-ind"><div class="mouse"></div>SCROLL</div>
    </section>

    <!-- ============ STATS ============ -->
    <section class="stats pad-sm">
      <div class="container">
        <div class="stats-grid">
          <div class="stat reveal"><div class="num"><span data-count="3">0</span>분</div><div class="label">마곡나루역 1번 출구에서</div></div>
          <div class="stat reveal reveal-d1"><div class="num"><span data-count="3">0</span><span class="suf">개사</span></div><div class="label">임플란트 자문위원 (오스템·덴티스·메가젠)</div></div>
          <div class="stat reveal reveal-d2"><div class="num"><span data-count="1">0</span><span class="suf">인</span></div><div class="label">대표원장 책임 진료</div></div>
          <div class="stat reveal reveal-d3"><div class="num">20:30</div><div class="label">월·목 야간진료 운영</div></div>
        </div>
      </div>
    </section>

    <!-- ============ CORE TREATMENTS ============ -->
    <section class="pad">
      <div class="container">
        <div style="text-align:center;max-width:640px;margin:0 auto 50px" class="reveal">
          <span class="eyebrow">CORE TREATMENTS</span>
          <h2 class="section-title">마곡베스트치과의 핵심 진료</h2>
          <p class="section-lead" style="margin:0 auto">가장 자신 있는 세 가지 진료를 중심으로, 정밀 진단과 1인 책임 진료 원칙으로 환자분을 돌봅니다.</p>
        </div>
        <div class="grid-3">
          ${raw(
            CORE_TREATMENTS.map(
              (t, i) => `
            <a href="/treatments/${t.slug}" class="card tcard reveal reveal-d${i + 1}">
              <span class="num-tag">0${i + 1}</span>
              <span class="tico"><i class="fa-solid ${t.icon}"></i></span>
              <h3>${t.name}</h3>
              <span class="tag">${t.tagline}</span>
              <p>${t.summary.slice(0, 95)}…</p>
              <span class="more">자세히 보기 <i class="fa-solid fa-arrow-right"></i></span>
            </a>`
            ).join('')
          )}
        </div>

        <div style="margin-top:24px" class="grid-3">
          ${raw(
            GENERAL_TREATMENTS.map(
              (t) => `
            <a href="/treatments/${t.slug}" class="tchip reveal">
              <i class="fa-solid ${t.icon}"></i>
              <span><span class="tn">${t.name}</span><br /><span class="td">${t.tagline}</span></span>
            </a>`
            ).join('')
          )}
        </div>
      </div>
    </section>

    <!-- ============ FUNNEL (환자 여정) ============ -->
    <section class="funnel pad">
      <div class="container">
        <div style="text-align:center;max-width:680px;margin:0 auto" class="reveal">
          <span class="eyebrow">PATIENT JOURNEY</span>
          <h2 class="section-title">처음 오신 순간부터, 끝까지</h2>
          <p class="section-lead" style="margin:0 auto">진단부터 치료, 사후 관리까지 한 분의 원장이 일관되게 책임지는 마곡베스트치과의 진료 여정입니다.</p>
        </div>
        <div class="funnel-steps reveal reveal-d1">
          ${raw(
            [
              { t: '상담·진단', d: '디지털 스캔으로 정밀하게 현재 상태 파악' },
              { t: '치료 계획', d: '환자분께 설명드리고 함께 방향 결정' },
              { t: '책임 진료', d: '대표원장이 직접 처음부터 끝까지' },
              { t: '사후 관리', d: '전문 클리닝·정기 검진으로 유지' },
              { t: '동행', d: '이웃으로서 오래 함께하는 치과' }
            ]
              .map(
                (s, i) => `
            <div class="funnel-step">
              <div class="fs-num">${i + 1}</div>
              <div class="fs-title">${s.t}</div>
              <div class="fs-desc">${s.d}</div>
            </div>`
              )
              .join('')
          )}
        </div>
      </div>
    </section>

    <!-- ============ WHY (강점 + 장비) ============ -->
    <section class="pad">
      <div class="container">
        <div class="feature-split">
          <div class="reveal">
            <span class="eyebrow">WHY MAGOK BEST</span>
            <h2 class="section-title">왜 마곡베스트치과일까요?</h2>
            <p class="section-lead">강점은 솔직하게, 진료는 정밀하게. 마곡베스트치과가 환자분께 약속드리는 것들입니다.</p>
            <div class="feature-list">
              <div class="feature-item">
                <span class="fi-ico"><i class="fa-solid fa-user-doctor"></i></span>
                <div><h4>1인 책임 진료</h4><p>진단을 맡은 대표원장이 치료와 사후 관리까지 직접 담당하여, 매 단계가 일관되고 책임 있게 이어집니다.</p></div>
              </div>
              <div class="feature-item">
                <span class="fi-ico"><i class="fa-solid fa-microchip"></i></span>
                <div><h4>최신 디지털 장비, 꾸준한 리뉴얼</h4><p>프라임스캐너·임플란트 카보 엔진 등 디지털 장비를 갖추고 정기적으로 점검·리뉴얼하여 정밀도를 유지합니다.</p></div>
              </div>
              <div class="feature-item">
                <span class="fi-ico"><i class="fa-solid fa-magnifying-glass"></i></span>
                <div><h4>정밀하고 꼼꼼한 진료</h4><p>충치의 깊이부터 임플란트 식립 위치까지, 정확한 진단을 바탕으로 치아를 최대한 보존하는 방향으로 계획합니다.</p></div>
              </div>
              <div class="feature-item">
                <span class="fi-ico"><i class="fa-solid fa-location-dot"></i></span>
                <div><h4>마곡나루역 3분, 동네 주치의</h4><p>강서구에서 나고 자란 대표원장이 이웃으로서 마곡 주민과 오래 함께하는 치과를 지향합니다.</p></div>
              </div>
            </div>
          </div>

          <div class="equip-visual reveal reveal-d1">
            <h3><i class="fa-solid fa-gears"></i> 보유 장비</h3>
            <div class="equip-grid">
              ${raw(
                CLINIC.equipment
                  .map(
                    (e) => `
                <div class="equip-row">
                  <i class="fa-solid fa-circle-check"></i>
                  <div><span class="en">${e.name}</span><br /><span class="ed">${e.desc}</span></div>
                </div>`
                  )
                  .join('')
              )}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ DOCTOR ============ -->
    <section class="funnel pad">
      <div class="container">
        <div class="doctor-feature">
          <div class="doctor-photo reveal">
            <i class="fa-solid fa-user-doctor ph-icon"></i>
            <div class="ph-label"><span class="pn">${d.name} ${d.title}</span><br /><span class="pc">${d.credential}</span></div>
          </div>
          <div class="reveal reveal-d1">
            <span class="eyebrow">DIRECTOR</span>
            <h2 class="section-title">${d.name} 대표원장</h2>
            <p class="section-lead">${d.intro}</p>
            <div class="cred-list">
              ${raw(d.career.slice(0, 7).map((c) => `<div class="cred-item"><i class="fa-solid fa-circle"></i><span>${c}</span></div>`).join(''))}
            </div>
            <a href="/doctors/${d.slug}" class="btn btn-ghost" style="margin-top:24px">의료진 자세히 보기 <i class="fa-solid fa-arrow-right"></i></a>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ CTA ============ -->
    <section class="cta-band pad">
      <div class="container">
        <div class="reveal">
          <h2>치료가 망설여지셨다면, 먼저 상담부터</h2>
          <p>정확한 진단과 충분한 설명을 통해 환자분께 맞는 치료 방향을 함께 찾아드립니다.</p>
          <div class="cta-actions">
            <a href="/reservation" class="btn btn-white btn-lg"><i class="fa-solid fa-calendar-check"></i> 예약 문의하기</a>
            <a href="tel:${CLINIC.phoneRaw}" class="btn btn-ghost btn-lg" style="background:transparent;color:#fff;border-color:rgba(255,255,255,0.4)"><i class="fa-solid fa-phone"></i> ${CLINIC.phone}</a>
          </div>
        </div>
      </div>
    </section>
  `
}
