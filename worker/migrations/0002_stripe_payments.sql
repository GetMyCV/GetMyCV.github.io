-- Adds Stripe card payments to an existing orders table.
-- Already applied to getmycv-orders (id e76e95c9-bb53-42ba-8852-a0ea32ebf056).
ALTER TABLE orders ADD COLUMN stripe_session_id TEXT;
ALTER TABLE orders ADD COLUMN paid_at TEXT;
