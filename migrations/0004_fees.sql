-- 비급여 수가표 (비용 안내) — 원장 직접 편집 + 항목별 공개/비공개 토글
-- 의료법 제45조 비급여 진료비용 고지. is_published=1 항목만 사이트에 노출.
-- 섹션 아이콘·설명(note)은 코드측 메타(info.tsx SECTION_META)에서 유지 — 룩 보존.

CREATE TABLE IF NOT EXISTS fees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section TEXT NOT NULL DEFAULT '',       -- 섹션(그룹) 제목
  name TEXT NOT NULL DEFAULT '',          -- 진료 항목명
  detail TEXT NOT NULL DEFAULT '',        -- 부가 설명 (선택)
  price TEXT NOT NULL DEFAULT '',         -- 비용 (예: "300,000원", "1,000,000 ~ 1,500,000원")
  unit TEXT NOT NULL DEFAULT '',          -- 기준 (예: 치아당/면당/악당)
  sort INTEGER NOT NULL DEFAULT 0,        -- 정렬 순서 (섹션·항목 순서 보존)
  is_published INTEGER NOT NULL DEFAULT 1, -- 1=공개, 0=비공개
  updated_at DATETIME DEFAULT (datetime('now', '+9 hours'))
);
CREATE INDEX IF NOT EXISTS idx_fees_pub ON fees(is_published, sort);

-- 초기 시드 (기존 정적 수가표와 동일)
INSERT INTO fees (section, name, detail, price, unit, sort, is_published) VALUES ('인레이 · 크라운', '인레이', '치아 색과 유사한 세라믹 부분 수복', '300,000원', '치아당', 10, 1);
INSERT INTO fees (section, name, detail, price, unit, sort, is_published) VALUES ('인레이 · 크라운', '온레이', '교두를 덮는 넓은 범위 부분 수복', '350,000원', '치아당', 20, 1);
INSERT INTO fees (section, name, detail, price, unit, sort, is_published) VALUES ('인레이 · 크라운', '크라운', '지르코니아 등 전체 수복 (코어 필요 시 70,000원 별도)', '450,000원', '치아당', 30, 1);
INSERT INTO fees (section, name, detail, price, unit, sort, is_published) VALUES ('인레이 · 크라운', '치아 기둥 (파이버 포스트)', '신경치료 후 치아 보강 기둥', '100,000원', '치아당', 40, 1);
INSERT INTO fees (section, name, detail, price, unit, sort, is_published) VALUES ('레진 — 충치 치료', '어금니 씹는면 (좁은 부위)', '', '100,000원', '치아당', 50, 1);
INSERT INTO fees (section, name, detail, price, unit, sort, is_published) VALUES ('레진 — 충치 치료', '어금니 씹는면 (넓은 부위 · 레진 빌드업)', '', '200,000원', '치아당', 60, 1);
INSERT INTO fees (section, name, detail, price, unit, sort, is_published) VALUES ('레진 — 충치 치료', '앞니 레진', '', '200,000원', '치아당', 70, 1);
INSERT INTO fees (section, name, detail, price, unit, sort, is_published) VALUES ('레진 — 충치 치료', '치아 사이 충치', '', '150,000원', '면당', 80, 1);
INSERT INTO fees (section, name, detail, price, unit, sort, is_published) VALUES ('레진 — 충치 치료', '치아 목 부위 패임 (치경부 마모)', '', '70,000원', '치아당', 90, 1);
INSERT INTO fees (section, name, detail, price, unit, sort, is_published) VALUES ('레진 — 파절 · 심미', '앞니 파절 (협소한 파절)', '', '100,000원', '치아당', 100, 1);
INSERT INTO fees (section, name, detail, price, unit, sort, is_published) VALUES ('레진 — 파절 · 심미', '앞니 파절 (중간 파절)', '', '200,000원', '치아당', 110, 1);
INSERT INTO fees (section, name, detail, price, unit, sort, is_published) VALUES ('레진 — 파절 · 심미', '앞니 파절 (큰 파절)', '', '250,000원', '치아당', 120, 1);
INSERT INTO fees (section, name, detail, price, unit, sort, is_published) VALUES ('레진 — 파절 · 심미', '다이아스테마 (치아 사이 벌어짐)', '', '300,000원', '면당', 130, 1);
INSERT INTO fees (section, name, detail, price, unit, sort, is_published) VALUES ('레진 — 파절 · 심미', '블랙트라이앵글 (2면 기준)', '', '400,000원', '부위당', 140, 1);
INSERT INTO fees (section, name, detail, price, unit, sort, is_published) VALUES ('투명교정', '투명교정 (부분)', '앞니 등 일부 치아 교정', '1,000,000 ~ 1,500,000원', '', 150, 1);
INSERT INTO fees (section, name, detail, price, unit, sort, is_published) VALUES ('투명교정', '투명교정 (전체)', '전체 치열 교정', '3,500,000 ~ 4,000,000원', '', 160, 1);
INSERT INTO fees (section, name, detail, price, unit, sort, is_published) VALUES ('투명교정', '유지장치', '교정 후 치열 유지 장치', '200,000원', '악당', 170, 1);
