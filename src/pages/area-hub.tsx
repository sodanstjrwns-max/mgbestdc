import { html, raw } from 'hono/html'
import { CLINIC, DOCTORS, getTreatment } from '../data/clinic'

// ============================================================
// /area/magok — "마곡 치과" 대표 키워드 허브 (2026-10-08, 지역 SEO 웨이브 §1)
// - 기존엔 홈의 "마곡 치과 안내" 버튼이 /area/magok-implant(임플란트 페이지)로 가서 키워드와 페이지가 어긋났다.
// - 본문은 레포에 이미 있는 사실만 사용: 주소·전화·진료시간·주차(CLINIC, 오시는 길), 의료진 이력(DOCTORS),
//   장비(CLINIC.equipment), 진료 목록(TREATMENTS). 지역×진료 페이지(area-local.ts)와 문장을 공유하지 않는다.
// - FAQ 는 화면과 FAQPage 스키마 1:1 (MAGOK_HUB_FAQS 한 곳에서 생성)
// ============================================================

export const MAGOK_HUB_PATH = '/area/magok'
export const MAGOK_HUB_DATE = '2026-10-08'
export const MAGOK_HUB_TITLE = `마곡 치과 | ${CLINIC.name}`
export const MAGOK_HUB_DESC =
  `마곡 치과를 찾는 분께 — 서울 강서구 마곡동 보타닉비즈타워 310~312호, ${CLINIC.directions}. 월·목 20:30 야간·토요일 오전 진료, ${CLINIC.directorCredential} 김민 대표원장의 1인 책임 진료와 진료별 안내를 정리했습니다.`

export const MAGOK_HUB_FAQS: { q: string; a: string }[] = [
  {
    q: '마곡에서 퇴근하고 들를 수 있는 치과 시간이 있나요?',
    a: '월요일과 목요일은 저녁 20:30까지 진료합니다. 화·금요일은 19:00까지, 수요일은 오후 13:00부터 19:00까지이니 요일별 시간을 확인하고 예약해 주세요.',
  },
  {
    q: '토요일이나 일요일에도 진료하나요?',
    a: '토요일은 09:30부터 14:30까지 오전 진료를 하고, 일요일과 공휴일은 휴진입니다.',
  },
  {
    q: '차를 가져가면 주차할 곳이 있나요?',
    a: '병원이 있는 보타닉비즈타워 건물 안에 주차할 수 있습니다. 주차 이용 방법은 방문 전에 02-2093-6545로 문의해 주시면 안내해 드립니다.',
  },
  {
    q: '국민건강보험 구강검진도 받을 수 있나요?',
    a: '국민건강보험공단 구강검진 지정 치과라 대상자라면 검진을 받으실 수 있습니다. 검진 결과에 따라 필요한 치료는 따로 상담합니다.',
  },
  {
    q: '진료 예약은 어떤 방법으로 하나요?',
    a: '전화(02-2093-6545), 홈페이지 예약 문의, 네이버 예약, 카카오톡 채널 상담 중 편한 방법을 이용하시면 됩니다. 원하는 요일과 시간대를 알려 주시면 조율해 드립니다.',
  },
]

const HUB_TX = ['implant', 'cavity', 'cosmetic', 'ortho', 'gum', 'prosthesis', 'tmj', 'extraction', 'preventive']
const HUB_TX_LINE: Record<string, string> = {
  implant: '자연치아를 살리기 어려울 때 검토하는 치료 — 진단부터 사후 관리까지',
  cavity: '충치 깊이에 따라 레진·인레이·신경치료로 이어지는 단계별 치료',
  cosmetic: '앞니 모양과 색을 다듬는 라미네이트·레진·미백',
  ortho: '투명교정을 포함한 치아 배열 교정 상담',
  gum: '잇몸 출혈·붓기·시림이 있을 때 받는 잇몸 치료',
  prosthesis: '크라운·브릿지·틀니 등 씹는 기능을 되살리는 보철',
  tmj: '턱 소리·통증·입 벌리기 불편을 살피는 턱관절 진료',
  extraction: '사랑니와 살리기 어려운 치아의 발치',
  preventive: '정기 검진·스케일링·불소로 문제를 미리 막는 관리',
}

export function MagokHubPage() {
  const d = DOCTORS[0]
  const tx = HUB_TX.map((s) => getTreatment(s)).filter(Boolean) as any[]
  return html`
    <section class="page-hero" data-ghost="MAGOK">
      <div class="container">
        <nav class="breadcrumb"><a href="/">홈</a><span class="sep">/</span><span>마곡 치과</span></nav>
        <span class="eyebrow">서울 강서구 마곡동 · ${CLINIC.station}</span>
        <h1>마곡 <span class="grad">치과</span></h1>
        <p class="ph-sub">${CLINIC.name}은 마곡중앙5로1길 20, 보타닉비즈타워 310~312호에 있는 동네 치과입니다. 마곡에서 치과를 고를 때 많이 물어보시는 위치·시간·의료진·진료 범위를 이 페이지에 모았습니다.</p>
      </div>
    </section>

    <section class="pad">
      <div class="container">
        <div class="t-detail-grid">
          <article>
            <div class="t-section reveal" id="quick-answer" style="background:var(--pine-soft);border-left:3px solid var(--pine);border-radius:12px;padding:20px 22px">
              <p style="margin:0"><strong>한눈에 보기</strong> — 지하철 9호선·공항철도 ${CLINIC.station} 1번 출구에서 걸어서 3분, 월·목 20:30까지 야간 진료와 토요일 오전 진료를 하는 마곡동 치과입니다. ${CLINIC.directorCredential}인 김민 대표원장이 상담부터 치료 후 관리까지 직접 맡습니다.</p>
            </div>

            <div class="t-section reveal">
              <h2>위치와 오시는 방법</h2>
              <p>주소는 <strong>${CLINIC.addressFull}</strong>입니다. 지하철을 이용하시면 ${CLINIC.station} 1번 출구로 나와 도보 3분 거리이고, 자가용은 건물 안 주차장을 이용하실 수 있습니다. 처음 오실 때는 네이버 지도에서 병원 이름을 검색하면 건물 입구까지 길 안내를 받을 수 있습니다.</p>
              <p style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap">
                <a href="${CLINIC.social.naverPlace}" target="_blank" rel="noopener" class="btn btn-ghost" style="font-size:0.85rem;padding:9px 16px"><i class="fa-solid fa-map"></i> 네이버 지도</a>
                <a href="/directions" class="btn btn-ghost" style="font-size:0.85rem;padding:9px 16px">오시는 길 자세히 <i class="fa-solid fa-arrow-right"></i></a>
              </p>
            </div>

            <div class="t-section reveal">
              <h2>진료시간</h2>
              <p>평일 낮에 시간을 내기 어려운 마곡지구 직장인을 고려해 월·목요일은 저녁까지 진료합니다. 수요일은 오후부터 시작하니 오전 방문은 다른 요일로 잡아 주세요.</p>
              <table class="info-table" style="margin-top:12px">
                ${raw(CLINIC.hours.map((h: any) => `<tr><th>${h.day}</th><td>${h.time}${h.note ? ` <span style="color:var(--brand);font-weight:600">(${h.note})</span>` : ''}</td></tr>`).join(''))}
              </table>
            </div>

            <div class="t-section reveal">
              <h2>진료하는 의료진</h2>
              <p>${d.name} ${d.title}은 ${d.credential}로, 한 명의 원장이 진단·치료·정기 관리를 이어서 보는 1인 책임 진료를 원칙으로 합니다. 오스템·덴티스·메가젠 임플란트 자문위원으로 활동하고 있으며, 대한통합치의학회·대한예방치과학회·대한치과보철학회 정회원입니다.</p>
              <p style="margin-top:12px"><a href="/doctors/${d.slug}" style="color:var(--brand);font-weight:700">${d.name} ${d.title} 소개 보기 <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a></p>
            </div>

            <div class="t-section reveal">
              <h2>주요 진료 안내</h2>
              <p>임플란트·충치치료·심미치료를 중점으로, 잇몸·보철·턱관절·사랑니·예방 검진까지 진료합니다. 진료마다 진행 순서와 자주 묻는 질문을 정리한 페이지가 있습니다.</p>
              <ul style="list-style:none;padding:0;margin:14px 0 0;display:grid;gap:10px">
                ${raw(tx.map((t) => `<li><a href="/treatments/${t.slug}" style="display:block;padding:14px 16px;border:1px solid var(--line);border-radius:12px;text-decoration:none"><strong style="color:var(--text)">${t.name}</strong><span style="display:block;color:var(--ink-2);font-size:0.9rem;margin-top:4px">${HUB_TX_LINE[t.slug] || ''}</span></a></li>`).join(''))}
              </ul>
            </div>

            <div class="t-section reveal">
              <h2>진료에 쓰는 장비</h2>
              <p>본을 뜨지 않고 입안을 디지털로 기록하는 ${CLINIC.equipment[3].name}, 임플란트 식립 토크를 제어하는 ${CLINIC.equipment[2].name}, 치아 표면과 잇몸 라인을 관리하는 ${CLINIC.equipment[0].name}, 턱관절 물리치료용 ${CLINIC.equipment[1].name}를 갖추고 있습니다. <a href="/facility" style="color:var(--brand);font-weight:700">시설·장비 보기</a></p>
            </div>

            <div class="t-section reveal">
              <h2>마곡 주민이 자주 묻는 질문</h2>
              ${raw(MAGOK_HUB_FAQS.map((f) => `
              <details class="faq-item" style="margin-bottom:10px">
                <summary style="cursor:pointer;font-weight:700;color:var(--text);padding:14px 0">${f.q}</summary>
                <p style="padding:0 0 14px;color:var(--ink-2);line-height:1.9">${f.a}</p>
              </details>`).join(''))}
            </div>
            <p style="color:var(--ink-3);font-size:0.85rem;line-height:1.7">치료 방법·기간·결과는 구강 상태에 따라 개인차가 있으며, 정밀 진단 후 개별적으로 안내드립니다.</p>
          </article>
          <aside class="t-sidebar">
            <div class="side-card brand">
              <h3 class="h4">마곡에서 진료 예약</h3>
              <p>전화·홈페이지·네이버 예약으로 예약하실 수 있습니다.</p>
              <a href="/reservation" class="btn btn-white" style="width:100%">예약 문의</a>
              <a href="tel:${CLINIC.phoneRaw}" class="btn" style="width:100%;margin-top:10px;background:rgba(255,255,255,0.12);color:#fff"><i class="fa-solid fa-phone"></i> ${CLINIC.phone}</a>
              <a href="${CLINIC.social.naverBooking}" target="_blank" rel="noopener" class="btn" style="width:100%;margin-top:10px;background:rgba(255,255,255,0.12);color:#fff">네이버 예약</a>
            </div>
            <div class="side-card">
              <h3 class="h4">마곡 진료별 안내</h3>
              <div class="side-links">
                <a href="/area/magok-implant">마곡 임플란트 <i class="fa-solid fa-arrow-right"></i></a>
                <a href="/area/magok-cavity">마곡 충치치료 <i class="fa-solid fa-arrow-right"></i></a>
                <a href="/area/magok-cosmetic">마곡 심미치료 <i class="fa-solid fa-arrow-right"></i></a>
                <a href="/area/magok-ortho">마곡 교정치료 <i class="fa-solid fa-arrow-right"></i></a>
              </div>
            </div>
            <div class="side-card">
              <h3 class="h4">인근 지역 안내</h3>
              <div class="side-links">
                <a href="/area/magoknaru-implant">마곡나루 임플란트 <i class="fa-solid fa-arrow-right"></i></a>
                <a href="/area/balsan-implant">발산 임플란트 <i class="fa-solid fa-arrow-right"></i></a>
                <a href="/area/gayang-implant">가양 임플란트 <i class="fa-solid fa-arrow-right"></i></a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  `
}

export function magokHubSchemas(siteUrl: string) {
  const url = siteUrl + MAGOK_HUB_PATH
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      '@id': url + '#webpage',
      url,
      name: MAGOK_HUB_TITLE,
      description: MAGOK_HUB_DESC,
      inLanguage: 'ko',
      isPartOf: { '@id': siteUrl + '/#website' },
      about: { '@id': siteUrl + '/#organization' },
      mainEntity: { '@id': siteUrl + '/#organization' },
      specialty: 'Dentistry',
      areaServed: [
        { '@type': 'AdministrativeArea', name: '서울 강서구 마곡동' },
        { '@type': 'AdministrativeArea', name: '서울 강서구' },
      ],
      dateModified: MAGOK_HUB_DATE,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': url + '#faq',
      mainEntity: MAGOK_HUB_FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ]
}
