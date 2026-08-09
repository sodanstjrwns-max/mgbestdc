-- 회원 테이블 — After 사진 열람용 회원가입/로그인
CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,        -- PBKDF2-SHA256 hex
  salt TEXT NOT NULL,                 -- 16바이트 hex
  name TEXT NOT NULL DEFAULT '',
  consented_at DATETIME,              -- 개인정보 수집·이용 동의 시각 (필수)
  created_at DATETIME DEFAULT (datetime('now', '+9 hours')),
  last_login_at DATETIME
);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
