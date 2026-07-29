// ============================================================
// 반응형 이미지 헬퍼
// 모든 원본 /static/img/X.webp 에 대응하는 X-720.webp (720w) 변형이 존재
// ============================================================

/** 원본 경로 → "X-720.webp 720w, X.webp {w}w" srcset 문자열 */
export function srcset(src: string, fullWidth = 1400): string {
  const mobile = src.replace(/\.webp$/, '-720.webp')
  return `${mobile} 720w, ${src} ${fullWidth}w`
}

/** 흔한 sizes 프리셋 */
export const SIZES = {
  full: '100vw',                                // 전체폭 (히어로, 밴드)
  half: '(max-width: 720px) 100vw, 50vw',      // 2단 그리드
  third: '(max-width: 720px) 100vw, 33vw',     // 3단 그리드
  card: '(max-width: 720px) 100vw, 640px'      // 카드/사이드 이미지
}
