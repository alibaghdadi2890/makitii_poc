-- Makitii POC schema. Applied on every boot; all statements are idempotent.

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  full_name   TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  verified    INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL
);

-- Partial unique indexes: a user has an email or a phone, rarely both, and NULLs
-- must not collide the way a plain UNIQUE column would allow.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users (email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_phone_idx ON users (phone) WHERE phone IS NOT NULL;

CREATE TABLE IF NOT EXISTS otp_codes (
  id          TEXT PRIMARY KEY,
  identifier  TEXT NOT NULL,
  code        TEXT NOT NULL,
  purpose     TEXT NOT NULL CHECK (purpose IN ('register', 'login')),
  full_name   TEXT,
  created_at  TEXT NOT NULL,
  expires_at  TEXT NOT NULL,
  consumed_at TEXT
);

CREATE INDEX IF NOT EXISTS otp_identifier_idx ON otp_codes (identifier);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id       TEXT PRIMARY KEY,
  slug     TEXT NOT NULL UNIQUE,
  name_fr  TEXT NOT NULL,
  name_en  TEXT NOT NULL,
  icon     TEXT NOT NULL,
  hue      INTEGER NOT NULL,
  position INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS subcategories (
  id          TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories (id) ON DELETE CASCADE,
  slug        TEXT NOT NULL,
  name_fr     TEXT NOT NULL,
  name_en     TEXT NOT NULL,
  position    INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS subcategories_category_idx ON subcategories (category_id);

CREATE TABLE IF NOT EXISTS ads (
  id              TEXT PRIMARY KEY,
  slug            TEXT NOT NULL UNIQUE,
  user_id         TEXT REFERENCES users (id) ON DELETE SET NULL,
  category_id     TEXT NOT NULL REFERENCES categories (id),
  subcategory_id  TEXT REFERENCES subcategories (id),
  title_fr        TEXT NOT NULL,
  title_en        TEXT NOT NULL,
  description_fr  TEXT NOT NULL,
  description_en  TEXT NOT NULL,
  price_gnf       INTEGER NOT NULL DEFAULT 0,
  negotiable      INTEGER NOT NULL DEFAULT 1,
  condition       TEXT NOT NULL DEFAULT 'used',
  location        TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active',
  featured        INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS ads_category_idx ON ads (category_id);
CREATE INDEX IF NOT EXISTS ads_subcategory_idx ON ads (subcategory_id);
CREATE INDEX IF NOT EXISTS ads_created_idx ON ads (created_at DESC);
CREATE INDEX IF NOT EXISTS ads_user_idx ON ads (user_id);

CREATE TABLE IF NOT EXISTS ad_attributes (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  ad_id    TEXT NOT NULL REFERENCES ads (id) ON DELETE CASCADE,
  label_fr TEXT NOT NULL,
  label_en TEXT NOT NULL,
  value    TEXT NOT NULL,
  position INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS ad_attributes_ad_idx ON ad_attributes (ad_id);

CREATE TABLE IF NOT EXISTS photos (
  id             TEXT PRIMARY KEY,
  ad_id          TEXT NOT NULL REFERENCES ads (id) ON DELETE CASCADE,
  filename       TEXT NOT NULL,
  position       INTEGER NOT NULL,
  credit_title   TEXT,
  credit_creator TEXT,
  credit_license TEXT,
  credit_source  TEXT
);

CREATE INDEX IF NOT EXISTS photos_ad_idx ON photos (ad_id, position);
