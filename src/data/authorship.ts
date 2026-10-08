// ============================================================
// 칼럼 작성 주체 판별 (2026-10-08, 사용자 승인)
// 원장을 저자/감수자로 표시하는 건 원장이 쓰거나 검토했다는 근거가 있을 때만.
//
// 근거 없음 → 병원 발행(Organization) + 일반 건강정보 안내, reviewedBy·Person author 없음
//  - 정적 칼럼 9편(src/data/blog.ts BLOG_POSTS): 제작 대행사가 작성해 코드로 넣은 글
//    (2d0d1b5 2026-06-04 '건강칼럼 블로그 시스템 구축' 이후 대행사 커밋으로만 추가·수정)
//  - D1 posts id 1·2·3 (implant-longevity-habits / tooth-sensitivity-causes / scaling-insurance-guide):
//    2026-08-09 18:40:57 공지 3건(id 4~6)과 같은 시각에 일괄 시드된 예시 글, 본문에 글쓴이 표기 없음
//  - 그 밖에 관리자 글이라도 본문에 원장 글쓴이 표기가 없는 글 (예: id 22, 2026-10-08 기준)
// 근거 있음 → 원장 저자 표시 유지
//  - 병원이 관리자 에디터로 올리면서 본문에 '글쓴이 김민 …대표원장' 바이라인을 직접 넣은 글
//    (2026-10-08 기준 id 7·8·10~18·20·21·23·24·25·27·29·30·31)
// 상세·목록·RSS·llms 모두 이 모듈의 함수만 사용한다.
// ============================================================
import { CLINIC, DOCTORS } from './clinic'

export const AGENCY_SEED_POST_IDS = new Set([1, 2, 3])
export const CLINIC_GENERAL_INFO_NOTE = '일반 건강정보입니다. 진료 판단은 내원 상담에서 원장이 직접 합니다.'

/** 본문에 병원이 직접 넣은 원장 바이라인(이름 + 글쓴이/대표원장/전문의)이 있는가 */
export function hasDoctorByline(contentHtml: string | null | undefined): boolean {
  const text = String(contentHtml || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ')
  const name = DOCTORS[0].name
  const nameRe = new RegExp(`${name}(?![가-힣])`)
  return nameRe.test(text) && /(글쓴이|대표원장|전문의)/.test(text)
}

/** DB 칼럼이 병원 발행(원장 저자 근거 없음)인가 */
export function isClinicPublishedDbPost(p: { id: number | string; content_html?: string | null }): boolean {
  return AGENCY_SEED_POST_IDS.has(Number(p.id)) || !hasDoctorByline(p.content_html)
}

/** 정적 칼럼(BLOG_POSTS)은 모두 대행사 작성 → 항상 병원 발행 */
export const isClinicPublishedStaticPost = (_slug?: string) => true

export const CLINIC_AUTHOR_NAME = CLINIC.shortName
