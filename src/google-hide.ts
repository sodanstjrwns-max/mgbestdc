// ============================================================
// 구글 전용 검색 제외 (2026-11-10)
//
// 배경: 구글이 이 사이트를 사이트 단위로 판정해 홈 한 장만 색인하고 있다(직접 조치·기술 오류 없음).
//       방문 대부분은 네이버에서 온다. 그래서 대량 생성 구역만 "구글에만" 검색 제외해
//       구글이 보는 사이트를 병원 핵심 페이지(약 60쪽)로 줄여 재평가를 받는다.
//
// 방식: 요청 User-Agent 가 구글 크롤러(Googlebot·Google-InspectionTool)이고, 경로가 아래 대상이고,
//       응답이 200 HTML 일 때만 응답 헤더 `X-Robots-Tag: googlebot: noindex` 를 붙인다.
//       (src/index.tsx 맨 바깥 미들웨어 한 곳)
//       네이버(Yeti)·Bing·일반 방문자·AI 봇 응답은 헤더·본문 모두 그대로다.
//       HTML 메타, robots.txt, sitemap, canonical, 스키마는 건드리지 않는다. 301·404 에는 붙이지 않는다.
//
// 가리는 구역 (구글에만):
//   - 지역×진료 조합  /area/{지역}-{진료}  (주 지역 허브 /area/magok 은 남긴다)
//   - 칼럼 분류 목록  /blog/category/{분류}
//   - 일괄 생성 칼럼  /blog/{slug} 중
//       · 코드로 넣은 정적 칼럼(src/data/blog.ts BLOG_POSTS — 제작 대행사 작성)
//       · D1 일괄 시드 예시 글 3편(posts id 1·2·3, 2026-08-09 18:40:57 같은 시각 등록 — src/data/authorship.ts 참고)
// 남기는 구역: 홈, 진료 목록·상세, 의료진, 비용, 병원 소개·이야기·원칙, 오시는 길, 시설, 예약, FAQ,
//   공지(/notice), 진료사례(/cases, /cases/:id), 칼럼 목록(/blog),
//   병원이 관리자 화면에서 직접 올린 칼럼(D1 posts id 7 이상), 주 지역 허브(/area/magok)
//
// 되돌리기: isGoogleHiddenPath 가 항상 false 를 돌려주게 하면 끝 (또는 index.tsx 의 미들웨어 삭제).
// ============================================================
import { BLOG_POSTS } from './data/blog'
import { MAGOK_HUB } from './data/hub-link'

export const GOOGLE_HIDE_HEADER = 'googlebot: noindex'

/** 구글 검색 크롤러인가 — Google-Extended·GoogleOther·AdsBot·Mediapartners 는 대상이 아니다 */
export function isGoogleCrawler(userAgent: string | null | undefined): boolean {
  return /googlebot|google-inspectiontool/i.test(String(userAgent || ''))
}

// 남기는 지역 페이지(주 허브) — '/area/' 뒤 한 토막
const KEEP_AREA_SLUGS = new Set([MAGOK_HUB.replace(/^\/area\//, '')])
// 코드로 넣은 정적 칼럼
const STATIC_COLUMN_SLUGS = new Set(BLOG_POSTS.map((p) => p.slug))
// D1 일괄 시드 예시 칼럼 (posts id 1·2·3)
const SEED_COLUMN_SLUGS = new Set(['implant-longevity-habits', 'tooth-sensitivity-causes', 'scaling-insurance-guide'])

/** 구글에만 검색 제외할 경로인가 (경로 판정은 이 함수 하나) */
export function isGoogleHiddenPath(pathname: string): boolean {
  let p = pathname
  try { p = decodeURIComponent(pathname) } catch { /* 깨진 인코딩은 원문 그대로 판정 */ }

  // 지역: 주 허브만 남기고 /area/{지역}-{진료} 전부
  const area = /^\/area\/([^/]+)$/.exec(p)
  if (area) return !KEEP_AREA_SLUGS.has(area[1])

  // 칼럼 분류 목록
  if (/^\/blog\/category\/[^/]+$/.test(p)) return true

  // 칼럼 상세: 일괄 생성분(정적·시드)만. 관리자 발행 칼럼은 남긴다
  const post = /^\/blog\/([^/]+)$/.exec(p)
  if (post) return STATIC_COLUMN_SLUGS.has(post[1]) || SEED_COLUMN_SLUGS.has(post[1])

  return false
}
