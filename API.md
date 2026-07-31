# 마곡베스트치과 콘텐츠 API 문서

외부 툴·자동화(예: 콘텐츠 발행 자동화, 네이버 블로그 연동 스크립트)에서 글을 작성·관리할 수 있는 REST API입니다.
발행(published)된 글에는 서버가 **BlogPosting(칼럼) / NewsArticle(공지) JSON-LD를 자동 렌더링**하므로, API로 글만 올리면 구조화 데이터까지 자동 처리됩니다.

- **Base URL**: `https://mgbestdc.kr`
- **인증**: 쓰기 API는 `?key=ADMIN_KEY` 쿼리 파라미터 필요 (실제 키는 별도 전달)
- **읽기 API는 인증 불필요** (발행 글만 노출)

---

## 1. 공개 읽기 API (인증 불필요)

### 글 목록 조회
```bash
# 건강칼럼 목록 (기본)
curl "https://mgbestdc.kr/api/posts"

# 공지사항 목록
curl "https://mgbestdc.kr/api/posts?type=notice"

# 카테고리(진료 토픽) 필터 + 페이징
curl "https://mgbestdc.kr/api/posts?category=임플란트&limit=10&offset=0"
```

| 파라미터 | 값 | 기본 |
|---|---|---|
| `type` | `column` \| `notice` | `column` |
| `category` | 임플란트 / 충치·신경치료 / 심미치료 / 교정 / 턱관절 / 잇몸치료 / 보철치료 / 발치·사랑니 / 예방·검진 / 병원소식 | 전체 |
| `limit` | 1~100 | 20 |
| `offset` | 0~ | 0 |

응답:
```json
{
  "ok": true,
  "count": 1,
  "items": [
    {
      "id": 2, "type": "column", "slug": "implant-care-tips",
      "title": "...", "excerpt": "...", "category": "임플란트",
      "thumbnail": "", "pinned": 0, "views": 12,
      "published_at": "2026-07-31 13:37:13", "updated_at": "...",
      "url": "https://mgbestdc.kr/blog/implant-care-tips"
    }
  ]
}
```

### 글 단건 조회 (본문 HTML 포함)
```bash
curl "https://mgbestdc.kr/api/posts/implant-care-tips"
```

---

## 2. 글 작성·수정 API (인증 필요)

### 새 칼럼 발행
```bash
curl -X POST "https://mgbestdc.kr/api/admin/posts?key=ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "column",
    "title": "임플란트 후 첫 일주일, 이렇게 관리하세요",
    "excerpt": "식립 직후 관리 요령을 정리했습니다.",
    "content_html": "<h2>첫 24시간</h2><p>본문 HTML...</p>",
    "category": "임플란트",
    "status": "published"
  }'
```

응답에 **공개 URL이 바로 포함**됩니다:
```json
{ "ok": true, "id": 5, "slug": "임플란트-후-첫-일주일-이렇게-관리하세요", "status": "published", "url": "https://mgbestdc.kr/blog/..." }
```

### 공지사항 발행
```bash
curl -X POST "https://mgbestdc.kr/api/admin/posts?key=ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "type": "notice", "title": "추석 연휴 진료 안내", "content_html": "<p>...</p>", "status": "published", "pinned": true }'
```

### 글 수정 (id 포함하면 수정)
```bash
curl -X POST "https://mgbestdc.kr/api/admin/posts?key=ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "id": 5, "type": "column", "title": "수정된 제목", "content_html": "<p>...</p>", "category": "임플란트", "status": "published" }'
```

### 글 삭제
```bash
curl -X DELETE "https://mgbestdc.kr/api/admin/posts/5?key=ADMIN_KEY"
```

### 필드 정리

| 필드 | 필수 | 설명 |
|---|---|---|
| `type` | ✅ | `column`(건강칼럼) 또는 `notice`(공지사항) |
| `title` | ✅ | 제목 (200자) |
| `content_html` | ✅ | 본문 HTML (이미지 포함 시 아래 업로드 API로 먼저 업로드) |
| `excerpt` | | 요약 155자 내외 권장 (검색 결과·목록에 노출) |
| `category` | | 진료 토픽 카테고리 — **일치시키면 해당 진료 페이지 하단에 자동 노출** (토픽 허브 연결) |
| `status` | | `published` 또는 `draft` (기본 draft) |
| `pinned` | | `true`면 공지 상단 고정 |
| `slug` | | 미지정 시 제목에서 자동 생성 (한글 유지) |

---

## 3. 이미지 업로드 API (인증 필요)

```bash
curl -X POST "https://mgbestdc.kr/api/admin/upload?key=ADMIN_KEY" \
  -F "file=@photo.jpg"
# → { "ok": true, "key": "2026/07/1785...-abc.jpg", "url": "/media/2026/07/1785...-abc.jpg" }
```
- 8MB 제한, 이미지 형식만 (jpg/png/webp/gif)
- 반환된 `url`을 `content_html`의 `<img src>`에 사용

---

## 4. 자동 처리되는 것들 (작성자가 신경 쓸 필요 없음)

발행(`status: published`) 시 서버가 자동으로:
1. **JSON-LD 구조화 데이터** — 칼럼은 `BlogPosting`, 공지는 `NewsArticle` (작성자·발행일·조직 `@id` 앵커 포함)
2. **sitemap.xml 등재** — 발행 즉시 사이트맵에 포함
3. **토픽 허브 연결** — category가 진료 토픽과 일치하면 해당 `/treatments/{slug}` 하단 "관련 칼럼"에 자동 노출 + 칼럼 사이드바에 "관련 진료" 역링크
4. **블로그 목록·카테고리 필터 반영** — `/blog`, `/blog/category/{slug}`
5. **의료광고법 고지 문구** — 칼럼 하단에 개인차 고지 자동 삽입
