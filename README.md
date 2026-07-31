# 마곡베스트치과의원 (Magok Best Dental Clinic)

## 프로젝트 개요
- **병원명**: 마곡베스트치과의원
- **대표원장**: 김민 (보건복지부 인증 통합치의학과 전문의)
- **위치**: 서울 강서구 마곡중앙5로 1길 20 보타닉비즈타워 310호 (마곡나루역 1번 출구 도보 3분)
- **목표**: 하이엔드 풀스택 치과 홈페이지 — SEO·AEO·퍼널 설계 + 프리미엄 포토 중심 디자인 + D1 예약 시스템

## 디자인 시스템 — PORCELAIN & SAPPHIRE (v2.1 — 신청서 Q25 컬러 반영)
- **테마**: 쿨 포슬린 화이트(#F7F9FC) 라이트 베이스 + 로고 블루/사파이어(#1656C8) 프라이머리 + 스카이 블루(#3E8EF0) 디테일 + 딥 네이비(#0E1B2E) 인버트 섹션
- **컬러 근거**: 제작 신청서 Q25 "치과 로고색인 파란색" — 김민 원장님 명시 요청
- **타이포**: Pretendard 단일 서체 (세리프/모노 혼용 폐기 — AI 티 제거, `text-wrap: balance/pretty`)
- **레이아웃 원칙(AI 패턴 배제)**: 번호 카드 그리드·아이콘 알약 카드·카운트업 stat 금지 → 에디토리얼 목록(principle-flow, story-flow), 팩트 스트립, 디렉토리형 진료 색인(tx-index)
- **포토 퍼스트**: 다큐멘터리풍 클리닉 이미지 8종(webp 최적화) — 히어로/진료/의료진/시설/라이프 전 영역
- **인터랙션(최신 기술)**: 커서 팔로우 이미지 프리뷰(lerp), 크로스 도큐먼트 View Transitions, CSS scroll() 타임라인 진행바, 히어로 패럴랙스, 마그네틱 CTA, 사진 클립패스 와이프 리빌 — 전부 reduced-motion·터치 가드
- **접근성**: `prefers-reduced-motion` 대응, 시맨틱 마크업, IntersectionObserver reveal

## 라이브 URL
- **✅ 프로덕션**: https://mgbestdc.kr (Cloudflare Pages, BYOK)
- **Sandbox 개발 서버**: https://3000-i50w91je75opr4ah1l78s-5634da27.sandbox.novita.ai

## 배포 정보
- **플랫폼**: Cloudflare Pages (사용자 계정 BYOK) — 프로젝트명 `magok-best-dental`, 프로덕션 브랜치 `main`
- **D1**: `magok-best-dental-production` (id: fbcb5d25-f1a5-4d98-8f21-060299aa12a3), 마이그레이션 0001 적용 완료, 예약 API 실동작 검증 완료
- **ADMIN_KEY**: Pages Secret으로 설정 완료 (기본키 `magok2026`는 프로덕션에서 차단 확인) — 실제 키는 별도 전달
- **재배포**: `npm run build && npx wrangler pages deploy dist --project-name magok-best-dental --branch main`
- **SEO 후속(수동)**: 네이버 서치어드바이저·구글 서치콘솔에 `https://mgbestdc.kr/sitemap.xml` 제출, 네이버 스마트플레이스·구글 비즈니스 프로필 등록

## 사이트 구조 (2026-07 구조화 재편 — 블랑쉬식 단순 위계 + 서울비디식 토픽 허브)
- **상단 메뉴 5개**: 소개(/about) / 진료(/treatments) / 치료사례(/cases) / 칼럼(/blog) / 상담·안내(/reservation)
- **토픽 허브**: 진료 slug가 공통 토픽 키 — 진료 상세 하단에 같은 토픽의 치료사례·칼럼 자동 노출, 사례·칼럼에서 진료 페이지 역링크
- **블로그 카테고리 = 진료 토픽 9개 + 병원소식** (구 care/guide slug는 301 리다이렉트)
- **지역 SEO 페이지(/area/*)는 메뉴 비노출** — sitemap·내부링크로만 유지 (검색 유입용)
- **스키마 앵커**: 전 페이지에 `Dentist` + `@id: https://mgbestdc.kr/#organization` 자동 출력, 개별 스키마는 @id 참조

## 완성된 기능
| 구분 | 경로 | 설명 |
|---|---|---|
| 메인 | `/` | 포토 히어로 + 철학 + 핵심진료 포토카드 + 의료진 실사진 + LIFE 밴드 + 환자여정 퍼널 + CTA (밀도 다이어트: 장비 테이블 → /facility 이관) |
| 소개 허브 | `/about` | 신설 — 병원소개/의료진/시설/오시는길 진입점 |
| 병원소개 | `/mission` | 미션/비전, 가치, 통계 카운트업 |
| 의료진 | `/doctors`, `/doctors/kim-min` | 실사진 프로필, 학력·경력, '손이 좋다' 육성 스토리 3편, Physician 스키마 |
| 진료 목록 | `/treatments` | 핵심 TOP3 포토카드 + 일반진료 6종 |
| 진료 상세 | `/treatments/:slug` | 히어로 이미지 + 확장 상세 + **토픽 허브 섹션**(같은 토픽 치료사례 3건 + 칼럼 3건 D1 자동 조회), MedicalProcedure+FAQPage 스키마 |
| 통합 FAQ | `/faq` | 병원이용 + 진료별 FAQ, FAQPage 스키마 |
| 진료사례 | `/cases` | **D1 연동** 비포·애프터 — 관리자 등록 사례 노출, After 블러+내원 안내 (의료법 준수) |
| 공지사항 | `/notice`, `/notice/:slug` | **D1 연동** 공지 목록(고정 배지)·상세, 조회수, 사이트맵 자동 포함 |
| 오시는 길 | `/directions` | 주소·교통·진료시간, 포토 지도 카드 |
| 비용 안내 | `/pricing` | 비급여 고지 (금액·이벤트 미표기, 의료법 준수) |
| 시설 | `/facility` | 장비 4종 + 실사진 공간 갤러리 |
| 예약 문의 | `/reservation` | 폼 → `POST /api/reservation` → **D1 저장** |
| **관리자 CMS** | `/admin?key=…` | 4탭 대시보드: 예약문의 / 공지사항 / 건강칼럼 / 비포애프터 — **Toast UI 에디터**(WYSIWYG·한국어·이미지 붙여넣기 업로드), 임시저장/발행, Ctrl+S 저장, noindex |
| 관리자 글쓰기 | `/admin/posts/new?type=notice\|column` | 제목·슬러그(한글 지원)·요약·본문·고정/분류 |
| 관리자 사례 | `/admin/cases` | Before/After 사진 업로드(R2)·환자정보·발행 관리 |
| 이미지 | `POST /api/admin/upload`, `GET /media/*` | R2 저장 (JPG/PNG/WebP/GIF, 8MB 제한, 캐시 1년) |
| 건강칼럼 | `/blog`, `/blog/:slug` | 정적 9편 + DB 칼럼 병합, 카테고리=진료 토픽, **DB 칼럼도 BlogPosting JSON-LD 자동 생성**, 공지는 NewsArticle |
| 공개 읽기 API | `GET /api/posts`, `GET /api/posts/:slug` | 외부 툴 연동용 (인증 불필요, 발행 글만, url 포함) — `API.md` 참조 |
| 지역 SEO | `/area/:area-:treatment` | 8지역 × 4진료 = 32페이지 |
| 퍼널 장치 | 전 페이지 | 데스크톱 플로팅 CTA(카톡/예약/탑) + 모바일 스티키바(전화/카톡/예약) |
| SEO 파일 | `/sitemap.xml`, `/robots.txt`, `/llms.txt` | 전 페이지 + 블로그 자동 포함 |

## 데이터 아키텍처
- **데이터 모델**: `src/data/clinic.ts`(병원/진료/의료진/지역/FAQ/스토리), `src/data/blog.ts`(칼럼 9편)
- **저장 서비스**:
  - **Cloudflare D1** — `reservations`(0001) + `posts`(공지·칼럼)·`cases`(비포애프터) (0002_cms.sql) — 로컬·프로덕션 모두 적용 완료
  - **Cloudflare R2** — `magok-best-dental-media` 버킷 (칼럼 본문·사례 이미지, `/media/*` 서빙)
  - posts: type(notice/column), slug(한글 허용), title, excerpt, content_html(Toast UI), category, pinned, status(draft/published), views, published_at
  - cases: title, category, age_group, gender, area, description, before_img, after_img(R2 키), status
- **관리자 인증**: `?key=` 쿼리 (기본 `magok2026`, 프로덕션은 `ADMIN_KEY` 환경변수로 교체 완료)
- **콘텐츠 API**: 쓰기 `POST/DELETE /api/admin/posts` (응답에 공개 URL 포함), 읽기 `GET /api/posts` — 발행 시 JSON-LD·sitemap·토픽허브 자동 처리. 상세: `API.md`
- **카카오톡 채널**: `CLINIC.social.kakao`에 URL 입력 시 전 CTA 연동 (현재 미입력 → 전화 폴백)

## §B 의료광고법 자동 필터 적용 내역
- 효과 단정·보장 표현 금지 → "도움이 될 수 있습니다" 순화
- 비급여 금액·이벤트 → 전면 미표기
- 사실관계(전문의·자문위원·연수) → 신청서 원문 그대로 (창작 금지)
- 비포·애프터 After 사진 → 내원 상담 게이팅
- 약점 리프레이밍: 1인진료 → "1인 책임 진료", 소규모 → "컴팩트한 진료 공간"

## 개발 명령어
```bash
npm run build                # Vite 빌드
pm2 start ecosystem.config.cjs  # 개발 서버 (D1 --local 포함)
npm run db:migrate:local     # D1 로컬 마이그레이션
npm run db:migrate:prod      # D1 프로덕션 마이그레이션 (배포 시)
npm run db:console:local     # 로컬 DB 콘솔
```

## 배포 (Cloudflare Pages)
1. `npx wrangler d1 create magok-best-dental-production` → `wrangler.jsonc`의 `database_id` 교체
2. `npm run db:migrate:prod`
3. `npm run build && npx wrangler pages deploy dist --project-name magok-best-dental`
4. (권장) `ADMIN_KEY` 환경변수 설정으로 관리자 키 교체

## 미구현 / 다음 단계
- 실제 병원 사진 교체 (현재 AI 생성 이미지)
- 카카오톡 채널 URL 연동 (`CLINIC.social.kakao`)
- 예약 접수 알림 (이메일/카카오 알림톡)
- 진료사례 실사진 업로드 관리

## 기술 스택
- Hono + TypeScript + Vite + Cloudflare Pages + D1 (SQLite)
- TailwindCSS 미사용 — 커스텀 디자인 시스템 CSS (PORCELAIN & SAPPHIRE)
- **최종 업데이트**: 2026-07-17
