# 마곡베스트치과의원 (Magok Best Dental Clinic)

## 프로젝트 개요
- **병원명**: 마곡베스트치과의원
- **대표원장**: 김민 (보건복지부 인증 통합치의학과 전문의)
- **위치**: 서울 강서구 마곡중앙5로 1길 20 보타닉비즈타워 310호 (마곡나루역 1번 출구 도보 3분)
- **목표**: bdbddc.com(비디치과)급을 뛰어넘는 하이엔드 인터랙티브 풀스택 치과 홈페이지. SEO·AEO·퍼널 골격은 벤치마크하되, 디자인은 **2026 다크 시네마틱**(글래스모피즘 + 일렉트릭 블루 + 키네틱 타이포)으로 차별화 — "병원 홈페이지 같지 않은" 하이엔드 테크 브랜드 무드.

## 디자인 시스템 (2026 Cinematic)
- **테마**: 다크 잉크(#05070F) 베이스 + 일렉트릭 블루(#2E7DFF) + 글래스모피즘
- **인터랙션 엔진**: Lenis 스무스 스크롤 · GSAP ScrollTrigger · 커스텀 커서 · 캔버스 파티클 히어로(마우스 인터랙티브) · 키네틱 타이포그래피(글자 단위 등장) · sticky 가로 스크롤(핵심진료) · 마그네틱 버튼 · 3D 틸트 카드 · 퍼널 타임라인 점등
- **접근성**: `prefers-reduced-motion` 대응, 모든 인터랙션 폴백 처리, 터치 기기 커서/마그네틱 비활성
- **핵심 철학**: "정직한 진료와 맞춤 치료로 환자의 삶을 끝까지 함께하겠습니다" — 1인 책임 진료

## 라이브 URL (Sandbox)
- 개발 서버: PM2로 포트 3000 구동 중 (`wrangler pages dev dist`)
- 배포 예정 도메인: `magok-best-dental.pages.dev` (Cloudflare Pages)

## 완성된 기능 (1차)
| 구분 | 경로 | 설명 |
|---|---|---|
| 메인 | `/` | 풀스크린 히어로 + 스크롤 reveal + 카운트업 통계 + 핵심진료 + 환자여정 퍼널 + 강점/장비 + 의료진 + CTA |
| 병원소개 | `/mission` | 미션/비전 히어로, 가치, 통계 카운트업 |
| 의료진 목록 | `/doctors` | 의료진 카드 + 전문 진료 인링크 |
| 의료진 상세 | `/doctors/:slug` | 학력·경력 전체, Physician 스키마, 진료 인링크 (예: `/doctors/kim-min`) |
| 진료 목록 | `/treatments` | 핵심 TOP3 + 일반진료 전체 |
| 진료 상세 | `/treatments/:slug` | 1,500자+ 상세(임플란트 약 3,000자), 세부진료, 진료별 FAQ, MedicalProcedure+FAQPage 스키마, sticky 사이드바 인링크 |
| 통합 FAQ | `/faq` | 병원이용 + 진료별 FAQ 통합, FAQPage 스키마 |
| 진료사례 | `/cases` | 비포·애프터 게이팅 골격 (After 사진 로그인 게이팅 UI) |
| 오시는 길 | `/directions` | 주소·교통·진료시간·주차, 네이버 지도 링크 |
| 비용 안내 | `/pricing` | 비급여 진료비 고지 (금액·이벤트 미표기, 의료법 준수) |
| 시설 둘러보기 | `/facility` | 보유 장비 4종 + 공간 갤러리 골격 |
| 예약 문의 | `/reservation` | 예약 폼 + `/api/reservation` POST 처리 (개인정보 동의 포함) |
| 지역 SEO | `/area/:area-:treatment` | 8개 지역 × 4개 핵심진료 = 32개 조합 (예: `/area/magok-implant`) |
| 약관 | `/privacy`, `/terms` | 개인정보처리방침, 이용약관 |
| SEO 파일 | `/sitemap.xml`, `/robots.txt`, `/llms.txt` | 전 페이지 사이트맵, AI 크롤러 허용, LLM 최적화 |
| 404 | (custom) | 커스텀 404 페이지 |

## §B 의료광고법 자동 필터 적용 내역
- "불편 요소도 없게" → "불편을 최소화하는 진료 환경"
- "손이 좋다" 자랑 → 프로필 미사용, "정밀하고 꼼꼼한 진료"
- Q29 약점(1인진료 한계) → 강점 리프레이밍("1인 책임 진료")
- Q31 약점(병원 작음) → "컴팩트하고 동선이 짧은 진료 공간"
- 비급여 금액·이벤트 → 전면 미표기
- 사실관계(전문의·자문위원·연수) → 신청서 원문 그대로 (창작 금지)

## 데이터 아키텍처
- **데이터 모델**: `src/data/clinic.ts` 단일 소스 (병원정보/진료/의료진/지역/FAQ)
- **현재 저장**: 정적 데이터 (SSR). 예약은 `/api/reservation`에서 수신
- **예정 저장 서비스**: Cloudflare R2(케이스/회원/예약/칼럼), D1(조회수)
- **데이터 흐름**: clinic.ts → 페이지 컴포넌트(Hono JSX) → SSR HTML + JSON-LD

## 적용된 구조화 데이터 (JSON-LD)
- Dentist / LocalBusiness (병원·주소·영업시간·좌표)
- Physician (대표원장 학력·경력)
- MedicalProcedure (진료별)
- FAQPage (FAQ·진료 상세)
- BreadcrumbList (전 페이지)
- MedicalClinic + AdministrativeArea (지역 SEO)
- WebSite (검색 액션)

## 기술 스택
- **프레임워크**: Hono v4 (TypeScript, SSR)
- **호스팅**: Cloudflare Pages + Workers
- **빌드**: Vite + @hono/vite-build
- **프론트**: Vanilla JS + Pretendard + Font Awesome (CDN), 자체 2026 시네마틱 디자인 시스템 CSS
- **인터랙션 라이브러리**: Lenis(스무스 스크롤) + GSAP/ScrollTrigger (CDN)
- **인터랙션**: 캔버스 파티클 히어로, 커스텀 커서, 키네틱 타이포(글자 split), sticky 가로 스크롤, 마그네틱 버튼, 3D 틸트, 퍼널 타임라인 점등, Intersection Observer(reveal/카운트업), 비포애프터 슬라이더
- **디자인 토큰**: `--brand: #2E7DFF` (일렉트릭 블루) · `--bg: #05070F` (다크 잉크) · 글래스모피즘

## 사용자 가이드
1. 상단 GNB로 병원소개·의료진·진료안내(메가드롭다운)·진료사례·안내 탐색
2. 진료안내 메뉴에서 핵심진료(임플란트·충치치료·심미치료) 및 일반진료 확인
3. 예약 문의는 우측 상단 버튼 또는 `/reservation`에서 폼 작성
4. 모바일은 햄버거 메뉴 → 아코디언 네비게이션

## 아직 구현되지 않은 기능 (후속 단계)
- 회원가입/로그인 (Google OAuth + HMAC 세션)
- 관리자 패널 (회원/케이스/예약/공지/원장칼럼 CRUD, 조회수)
- 비포애프터 실제 업로드 (R2, 4장, 지역 자동완성, 로그인 게이팅 3중 보호)
- 원장 칼럼 (SEO 에디터, 인링크)
- 백과사전 500+ 용어 + 자동 인링크
- 공지사항
- Resend 이메일 알림 연동
- IndexNow / Google Ping 자동 제출

## 권장 다음 단계
1. Cloudflare Pages 배포 + 커스텀 도메인 연결
2. R2 버킷 + D1 DB 생성 → 예약/케이스 영속화
3. 회원 인증 → 비포애프터 게이팅 실동작
4. 관리자 패널 → 원장님이 직접 콘텐츠 관리
5. 원장 칼럼 + 백과사전으로 SEO 콘텐츠 축적

## 배포
- **플랫폼**: Cloudflare Pages
- **상태**: 🔧 로컬 개발 완료 (배포 대기)
- **최종 업데이트**: 2026-06-02
