-- CMS: 공지사항·칼럼 (posts) + 비포애프터 (cases)

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL DEFAULT 'notice',      -- notice | column
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT DEFAULT '',
  content_html TEXT NOT NULL DEFAULT '',    -- Toast UI Editor HTML 출력
  category TEXT DEFAULT '',                 -- 칼럼 분류 라벨
  thumbnail TEXT DEFAULT '',                -- R2 이미지 키
  status TEXT NOT NULL DEFAULT 'draft',     -- draft | published
  pinned INTEGER NOT NULL DEFAULT 0,        -- 공지 상단 고정
  views INTEGER NOT NULL DEFAULT 0,
  published_at DATETIME,
  created_at DATETIME DEFAULT (datetime('now', '+9 hours')),
  updated_at DATETIME DEFAULT (datetime('now', '+9 hours'))
);
CREATE INDEX IF NOT EXISTS idx_posts_type_status ON posts(type, status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);

CREATE TABLE IF NOT EXISTS cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '임플란트', -- 진료 분류
  age_group TEXT DEFAULT '',                 -- 예: 50대
  gender TEXT DEFAULT '',                    -- 남성/여성
  area TEXT DEFAULT '',                      -- 예: 마곡동
  description TEXT DEFAULT '',               -- 치료 설명 (개인차 문구 포함)
  before_img TEXT DEFAULT '',                -- R2 키
  after_img TEXT DEFAULT '',                 -- R2 키
  status TEXT NOT NULL DEFAULT 'draft',      -- draft | published
  created_at DATETIME DEFAULT (datetime('now', '+9 hours')),
  updated_at DATETIME DEFAULT (datetime('now', '+9 hours'))
);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status, created_at DESC);
