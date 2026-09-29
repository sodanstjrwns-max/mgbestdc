// ============================================================
// 콘텐츠 실제 수정일 (사이트맵 lastmod)
// - 정적 페이지·의료진·지역: 본문 줄을 마지막으로 바꾼 커밋 날짜(KST). scripts/content-dates.mjs 가 git blame 으로
//   산출해 vite.config.ts 가 빌드 시 __CONTENT_DATES__ 로 주입. 얕은 클론·git 없음 → content-dates.fallback.json
// - 진료는 화면 '최종 검토'와 같은 TX_LAST_REVIEWED(src/pages/treatments.tsx) 를 쓴다.
// ※ 예전엔 사이트맵이 날짜 없는 URL 에 오늘 날짜를 찍었다 (2026-09-29 교정). 날짜를 모르면 lastmod 생략.
// ============================================================
import FALLBACK from './content-dates.fallback.json'

export type ContentDates = {
  pages: Record<
    'home' | 'about' | 'mission' | 'story' | 'directions' | 'pricing' | 'facility' | 'faq' | 'reservation' | 'doctorsList' | 'doctorTemplate' | 'areaTemplate',
    string
  >
  doctors: Record<string, string>
  areas: Record<string, string>
  combos: Record<string, string>
}
declare const __CONTENT_DATES__: ContentDates | null
export const CONTENT_DATES: ContentDates =
  (typeof __CONTENT_DATES__ !== 'undefined' && __CONTENT_DATES__ && __CONTENT_DATES__.pages ? __CONTENT_DATES__ : null) ||
  (FALLBACK as ContentDates)

const YMD = /^\d{4}-\d{2}-\d{2}$/
/** 'YYYY-MM-DD…'(D1 은 KST 저장) 문자열 → 앞 10자, 없음·무효 → '' (오늘로 대체하지 않음) */
export function toYmd(v: unknown): string {
  const d = typeof v === 'string' ? v.trim().slice(0, 10) : ''
  return YMD.test(d) && !Number.isNaN(Date.parse(d)) ? d : ''
}
/** 날짜 목록 중 가장 최근 YYYY-MM-DD (없으면 '') */
export function latestDate(...ds: unknown[]): string {
  return (ds as any[]).flat(2).map(toYmd).filter(Boolean).sort().pop() || ''
}
