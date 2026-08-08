import { html, raw } from 'hono/html'
import { CLINIC, GOOD_HANDS, PATIENT_VOICES } from '../data/clinic'
import { srcset, SIZES } from '../components/img'

// ============================================================
// 스토리 페이지 — 김민 대표원장 인터뷰 원고(7문항) 기반 내러티브
// §의료광고법 필터: 효과 단정 금지, 치료 경험담은 '개인차' 고지,
// 원장 육성(1인칭)은 '생각·철학' 진술로 유지 (사실 진술 안전)
// ============================================================

const CHAPTERS = [
  {
    no: '01',
    label: '고향',
    title: '강서구에서 나고 자라,\n강서구에서 진료합니다.',
    lead: '공진초등학교, 공진중학교. 어린 시절과 학창 시절을 모두 이 지역에서 보냈습니다.',
    body: [
      '고향에서 치과를 열고 싶었던 이유는 단순히 익숙한 동네이기 때문만은 아닙니다. 제가 성장한 지역에서 제 전문성을 활용해 주민들께 도움을 드리고, 작게나마 지역 발전에 기여하고 싶다는 마음이 있었습니다.',
      '그 마음으로 지금도 모교인 공진초등학교에 꾸준히 기부하고 있습니다. 지역에서 얻은 것을 다시 지역에 돌려드리는 것이 제가 할 수 있는 역할 중 하나라고 생각합니다.',
      '마곡베스트치과가 치료만 받고 가는 치과가 아니라, 어린아이부터 부모님 세대까지 가족 모두가 편안하게 다닐 수 있고, 시간이 지나도 한자리에서 책임 있게 진료하는 치과가 되었으면 합니다.'
    ],
    quote: '강서구에서 가장 신뢰받는 치과가 되는 것. 그것이 저희의 비전입니다.',
    img: '/static/img/dr-kim-standing.webp',
    imgAlt: '김민 대표원장 프로필'
  },
  {
    no: '02',
    label: '책임 진료',
    title: '처음 상담한 원장이\n끝까지 책임집니다.',
    lead: '마곡베스트치과는 대표원장이 상담부터 치료, 사후 관리까지 직접 담당합니다.',
    body: [
      '처음 상담하고 치료 계획을 세운 의료진이 끝까지 치료를 담당하기 때문에, 진료 방향이 중간에 달라지지 않고 환자분의 작은 변화까지 직접 확인하며 치료를 이어갈 수 있습니다.',
      '한 명의 원장이 모든 환자를 직접 진료하다 보니 예약이 몰리는 시간에는 대기가 생길 수 있습니다. 그래서 무리하게 많은 환자를 받기보다, 예약을 조절해 한 분 한 분께 충분한 진료 시간을 확보하는 방향으로 운영하고 있습니다.',
      '앞으로 병원이 성장하며 더 좋은 의료진과 함께하게 되더라도 원칙은 변하지 않습니다. 대표원장이 만든 진료 기준과 시스템을 바탕으로, 누구에게 진료를 받더라도 동일한 수준의 설명과 진료를 받으실 수 있도록 하는 것입니다.'
    ],
    quote: '진료의 주체가 바뀌지 않는다는 것. 환자분께는 그것이 가장 큰 안심입니다.',
    img: '/static/img/dr-kim-crossed.webp',
    imgAlt: '김민 대표원장 — 1인 책임 진료'
  },
  {
    no: '03',
    label: '진료 철학',
    title: '살릴 수 있는 치아는\n끝까지 살립니다.',
    lead: '임플란트와 자연치아 보존. 반대처럼 보이지만, 제 진료 철학에서는 하나로 연결됩니다.',
    body: [
      '저는 처음부터 임플란트를 권하기보다, 자연치아를 유지할 가능성이 있는지 먼저 살핍니다. 신경치료, 보철치료, 잇몸치료 등으로 치아를 살릴 수 있다면 그 가능성과 한계부터 충분히 설명드립니다.',
      '반대로 치아를 무리하게 유지하는 것이 반복적인 통증이나 추가 비용으로 이어질 수 있다면, 발치와 임플란트가 필요한 이유를 명확하게 말씀드립니다.',
      '다른 치과에서 발치를 권유받고 내원하셨던 환자분을 정밀 검사 후 자연치아를 살리는 방향으로 치료해 드린 적이 있습니다. 치료를 마친 뒤 "빼야 하는 줄만 알았는데 제 치아를 살려주셔서 감사합니다"라고 말씀해 주셨던 것이 아직도 기억에 남습니다. 물론 모든 치아를 살릴 수 있는 것은 아니며, 보존 가능 여부는 치아 상태에 따라 다릅니다.'
    ],
    quote: '어느 한쪽만 강조하기보다, 환자에게 장기적으로 가장 유리한 치료가 무엇인지 정확하게 판단하는 치과가 되고 싶습니다.',
    img: '/static/img/dr-kim-loupe.webp',
    imgAlt: '확대경을 착용한 김민 대표원장'
  },
  {
    no: '04',
    label: '장비 투자',
    title: '보여주기 위한 장비가 아니라,\n정확한 진단을 위한 투자입니다.',
    lead: '치과 치료에서는 눈으로 보이는 것만으로 판단하기 어려운 경우가 많습니다.',
    body: [
      '작은 충치나 치아의 균열, 잇몸 속 염증처럼 정확한 진단이 치료 결과를 크게 좌우하는 부분이 있습니다. 진단이 정확하지 않으면 불필요한 치료가 이루어질 수도 있고, 반대로 꼭 필요한 치료 시기를 놓칠 수도 있습니다.',
      '그래서 진료의 정확도를 높여주는 장비, 환자분의 불편을 줄일 수 있는 장비라면 적극적으로 검토하고 도입하려고 합니다.',
      '좋은 장비가 의료진의 실력을 대신할 수는 없습니다. 하지만 책임감을 가진 의료진이 좋은 장비를 제대로 활용할 때, 더 좋은 치료 결과를 만들 수 있다고 믿습니다.'
    ],
    quote: '같은 치료를 하더라도 조금 더 정확하고 안전하게. 그것이 장비에 투자하는 이유의 전부입니다.',
    img: '/static/img/dr-kim-side.webp',
    imgAlt: '김민 대표원장 — 정밀 진단 철학'
  }
]

// 마지막 챕터 — 전악 임플란트 환자 이야기 (경험담 → 개인차 고지 필수)
const FINAL_STORY = {
  label: '가장 기억에 남는 환자',
  title: '"이제는 맛있는 음식을\n마음껏 먹고 있습니다."',
  body: [
    '가장 기억에 남는 환자분은 전악 임플란트 치료를 받으셨던 분입니다. 처음 내원하셨을 당시에는 치아가 거의 없어 제대로 식사를 하지 못하는 상태였습니다.',
    '치료를 마치고 약 한 달 뒤 정기 검진을 위해 다시 오셨을 때, 환자분께서 웃으시며 "이제는 맛있는 음식을 마음껏 먹고 있습니다"라고 말씀하셨습니다. 그 모습을 보며 임플란트 치료는 단순히 치아를 만드는 치료가 아니라, 한 사람의 식생활과 건강, 삶의 질과 연결되는 진료라는 것을 다시 한번 느꼈습니다.',
    '그 환자분은 지금도 꾸준히 정기검진을 받으러 내원하고 계십니다. 저희에게 치료가 끝나는 것은 진료의 끝이 아닙니다. 오랫동안 건강하게 사용하실 수 있도록 함께 관리해 드리는 것이 진료의 완성이라고 생각합니다.',
  ],
  disclaimer: '※ 위 내용은 특정 환자의 사례로, 치료 결과와 경과는 개인의 구강 상태에 따라 다를 수 있습니다.'
}

export function StoryPage() {
  return html`
    <!-- ============ 히어로 — 브랜딩 영상 풀블리드 ============ -->
    <section class="story-hero" id="story-hero">
      <div class="sh-media" aria-hidden="true">
        <video autoplay muted loop playsinline preload="metadata" poster="/static/img/video/branding-poster.jpg">
          <source src="/media/video/branding-hero.mp4" type="video/mp4" />
        </video>
        <div class="sh-scrim"></div>
      </div>
      <div class="container sh-inner">
        <nav class="breadcrumb light"><a href="/">홈</a><span class="sep">/</span><span>스토리</span></nav>
        <span class="eyebrow light">MAGOK BEST DENTAL STORY</span>
        <h1>고향에서 진료하는<br /><span class="grad-light">한 치과의사의 이야기</span></h1>
        <p class="sh-sub">강서구에서 나고 자란 김민 대표원장이 마곡에 치과를 연 이유,<br class="pc-only" />그리고 진료실에서 지키고 있는 원칙들.</p>
        <a href="#chapter-1" class="sh-scroll" aria-label="스토리 읽기"><i class="fa-solid fa-chevron-down"></i></a>
      </div>
    </section>

    <!-- ============ 인트로 인용 ============ -->
    <section class="pad tone">
      <div class="container narrow">
        <div class="reveal" style="text-align:center">
          <span class="eyebrow">${GOOD_HANDS.label}</span>
          <h2 class="story-quote" style="margin-left:auto;margin-right:auto">‘손이 좋다’는 것은<br /><span class="grad">빠른 치료가 아닙니다.</span></h2>
          <p class="story-body" style="margin:0 auto">${GOOD_HANDS.body}</p>
          <div class="voice-chips" style="justify-content:center">
            ${raw(PATIENT_VOICES.map((v) => `<span class="voice-chip">${v}</span>`).join(''))}
          </div>
          <p class="story-attr" style="margin-top:20px">— ${GOOD_HANDS.attribution}</p>
        </div>
      </div>
    </section>

    <!-- ============ 챕터 1~4 ============ -->
    ${raw(
      CHAPTERS.map(
        (ch, i) => `
    <section class="pad story-chapter${i % 2 === 1 ? ' tone' : ''}" id="chapter-${i + 1}">
      <div class="container">
        <div class="sc-grid${i % 2 === 1 ? ' flip' : ''}">
          <div class="sc-photo reveal reveal-wipe">
            <img src="${ch.img}" srcset="${srcset(ch.img, 1045)}" sizes="${SIZES.half}" alt="${ch.imgAlt}" width="1045" height="1306" loading="lazy" decoding="async" />
            <span class="sc-no">${ch.no}</span>
          </div>
          <div class="sc-text reveal reveal-d1">
            <span class="si-label">${ch.label}</span>
            <h2>${ch.title.replace(/\n/g, '<br />')}</h2>
            <p class="sc-lead">${ch.lead}</p>
            ${ch.body.map((p) => `<p class="sc-p">${p}</p>`).join('')}
            <blockquote class="sc-quote">${ch.quote}</blockquote>
          </div>
        </div>
      </div>
    </section>`
      ).join('')
    )}

    <!-- ============ 병원 전경 — 드론 영상 밴드 ============ -->
    <section class="story-drone" aria-label="마곡베스트치과 전경">
      <div class="sd-media" aria-hidden="true">
        <video autoplay muted loop playsinline preload="metadata" poster="/static/img/video/drone-poster.jpg">
          <source src="/media/video/drone-main.mp4" type="video/mp4" />
        </video>
        <div class="sd-scrim"></div>
      </div>
      <div class="container sd-inner">
        <div class="reveal">
          <span class="eyebrow light">MAGOK, SEOUL</span>
          <h2>마곡나루역 1번 출구,<br />이 자리에서 계속 진료하겠습니다.</h2>
          <p>${CLINIC.addressShort} · 마곡나루역 도보 3분</p>
          <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:24px">
            <a href="/directions" class="btn btn-white">오시는 길 <i class="fa-solid fa-arrow-right"></i></a>
            <a href="/facility" class="btn btn-glass" style="border-color:rgba(255,255,255,0.4);color:#fff">시설·장비 둘러보기</a>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ 마지막 챕터 — 환자 이야기 ============ -->
    <section class="pad">
      <div class="container narrow">
        <div class="reveal" style="text-align:center;margin-bottom:36px">
          <span class="eyebrow">${FINAL_STORY.label}</span>
          <h2 class="story-quote" style="margin-left:auto;margin-right:auto">${raw(FINAL_STORY.title.replace(/\n/g, '<br />'))}</h2>
        </div>
        <div class="reveal reveal-d1">
          ${raw(FINAL_STORY.body.map((p) => `<p class="sc-p" style="max-width:680px;margin-left:auto;margin-right:auto">${p}</p>`).join(''))}
          <p class="sc-disclaimer">${FINAL_STORY.disclaimer}</p>
        </div>
      </div>
    </section>

    <!-- ============ 브랜딩 영상 풀버전 ============ -->
    <section class="pad-sm tone" aria-label="마곡베스트치과 소개 영상">
      <div class="container narrow">
        <div class="reveal" style="text-align:center;margin-bottom:24px">
          <span class="eyebrow">BRAND FILM</span>
          <h2 class="section-title">마곡베스트치과의원 소개 영상</h2>
        </div>
        <div class="sv-frame reveal reveal-d1">
          <video controls preload="none" poster="/static/img/video/branding-poster.jpg" style="width:100%;display:block;border-radius:16px">
            <source src="/media/video/branding-full.mp4" type="video/mp4" />
            브라우저가 영상 재생을 지원하지 않습니다.
          </video>
        </div>
      </div>
    </section>

    <!-- ============ CTA ============ -->
    <section class="pad-sm"><div class="cta-band">
      <div class="cta-inner"><div class="reveal" style="text-align:center">
        <h2 style="color:#fff">궁금한 점이 있으신가요?</h2>
        <p style="color:rgba(255,255,255,0.9);max-width:560px;margin:14px auto 28px">정확한 진단과 충분한 설명으로 환자분께 맞는 치료를 안내드립니다.</p>
        <div class="cta-actions"><a href="/reservation" class="btn btn-white btn-lg">예약 문의</a><a href="tel:${CLINIC.phoneRaw}" class="btn btn-glass btn-lg" style="border-color:rgba(255,255,255,0.4)"><i class="fa-solid fa-phone"></i> ${CLINIC.phone}</a></div>
      </div></div>
    </div></section>
  `
}

export function storySchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${siteUrl}/story#aboutpage`,
    name: '마곡베스트치과의원 스토리',
    description: '강서구에서 나고 자란 김민 대표원장이 고향 마곡에 치과를 연 이유와 진료 원칙을 소개합니다.',
    url: `${siteUrl}/story`,
    about: { '@id': `${siteUrl}/#organization` },
    mainEntity: { '@id': `${siteUrl}/doctors/kim-min/#physician` }
  }
}
