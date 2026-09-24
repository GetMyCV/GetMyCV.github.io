-- D1 schema for GetMyCv orders.
-- Already applied to the `getmycv-orders` database
-- (id e76e95c9-bb53-42ba-8852-a0ea32ebf056, APAC region).
-- Kept here so the schema is reviewable in the repo and reproducible elsewhere:
--   npx wrangler d1 execute getmycv-orders --remote --file=schema.sql
--
-- A database created before card payments needs the two Stripe columns added
-- (already done on getmycv-orders):
--   npx wrangler d1 execute getmycv-orders --remote --file=migrations/0002_stripe_payments.sql

CREATE TABLE IF NOT EXISTS orders (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  ref_code     TEXT    NOT NULL UNIQUE,
  package      TEXT    NOT NULL CHECK (package IN ('starter','professional','premium')),
  add_ons      TEXT    NOT NULL DEFAULT '[]',   -- JSON array of add-on ids
  total_lkr    INTEGER NOT NULL CHECK (total_lkr >= 0),  -- whole US dollars (name predates the switch from LKR)
  name         TEXT    NOT NULL,
  email        TEXT    NOT NULL,
  phone        TEXT    NOT NULL,
  location     TEXT    NOT NULL,
  role         TEXT    NOT NULL,
  experience   TEXT    NOT NULL,
  industry     TEXT    NOT NULL,
  notes        TEXT    NOT NULL DEFAULT '',
  file_keys    TEXT    NOT NULL DEFAULT '[]',   -- JSON array of R2 object keys
  consent_at   TEXT    NOT NULL,                -- ISO timestamp, for PDPA records
  status       TEXT    NOT NULL DEFAULT 'New'
               CHECK (status IN ('New','Paid','In progress','Review','Delivered')),
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  stripe_session_id TEXT,                       -- last Checkout Session for this order
  paid_at      TEXT                             -- set by the Stripe webhook
);

CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);
