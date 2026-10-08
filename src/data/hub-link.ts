// ============================================================
// "마곡 치과" 허브(/area/magok) 내부 링크 (2026-10-08)
// 관련 페이지가 대표 키워드 허브로 앵커 "마곡 치과" 링크를 보낸다.
// 페이지당 허브 링크 최대 2개(전역 푸터 1 + 본문 1), nofollow 금지, 허브 자신에는 넣지 않음.
// ============================================================

export const MAGOK_HUB = '/area/magok'
export const MAGOK_ANCHOR = '마곡 치과'

const esc = (t: string) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function hubA(style = 'color:var(--brand,inherit);font-weight:700;text-decoration:underline'): string {
  return `<a href="${MAGOK_HUB}" style="${style}">${MAGOK_ANCHOR}</a>`
}

function slugHash(s: string, n: number): number {
  let h = 0
  for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h % n
}

/** 칼럼 상세 본문 끝(작성자 박스 위) 지역 안내 1문장 — 문형 4개 중 slug 해시로 고정 */
export function columnHubNote(slug: string, topic?: string | null): string {
  const a = hubA()
  const t = topic ? esc(topic) : ''
  const forms = [
    `마곡베스트치과는 ${a}를 찾는 마곡동·발산동·가양동 주민분들께 ${t ? `${t} 진료와 ` : ''}내원 방법을 안내하고 있습니다.`,
    `마곡나루역 근처에서 ${t ? `${t} ` : '치과 '}상담할 곳을 찾고 계신다면 ${a} 안내에서 위치·진료시간·의료진을 한 번에 확인하실 수 있습니다.`,
    `보타닉비즈타워 310~312호에 있는 마곡베스트치과의 진료시간·주차·찾아오는 길은 ${a} 페이지에 정리해 두었습니다.`,
    `이 칼럼의 내용을 직접 상담받고 싶은 강서구 주민분은 ${a} 안내에서 야간·토요일 진료 일정과 오시는 길을 먼저 확인해 보세요.`,
  ]
  return `<p class="post-hub-note" style="margin:28px 0 0;padding:16px 20px;border-radius:14px;background:rgba(0,0,0,0.03);border:1px solid rgba(0,0,0,0.06);line-height:1.8;color:var(--ink-2,#444)"><i class="fa-solid fa-location-dot" aria-hidden="true" style="margin-right:8px;opacity:.6"></i>${forms[slugHash(slug, forms.length)]}</p>`
}
