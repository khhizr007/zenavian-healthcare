-- Backup store for form submissions + hashed-IP rate limiting.
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL CHECK (kind IN ('enquiry', 'contact', 'adverse')),
  payload TEXT NOT NULL,
  email_status TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions (created_at);

CREATE TABLE IF NOT EXISTS rate_limit (
  ip_hash TEXT NOT NULL,
  ts INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rate_limit ON rate_limit (ip_hash, ts);
