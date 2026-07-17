-- 예약 문의 테이블
CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  treatment TEXT DEFAULT '',
  message TEXT DEFAULT '',
  status TEXT DEFAULT 'new',          -- new | contacted | done | canceled
  created_at DATETIME DEFAULT (datetime('now', '+9 hours'))  -- KST
);

CREATE INDEX IF NOT EXISTS idx_reservations_created ON reservations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
