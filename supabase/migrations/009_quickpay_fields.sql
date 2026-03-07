-- Legg til Quickpay-felter på orders-tabellen

-- Quickpay payment ID (heltall fra Quickpay API)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS quickpay_payment_id BIGINT;

-- Quickpay payment link URL
ALTER TABLE orders ADD COLUMN IF NOT EXISTS quickpay_payment_link TEXT;

-- Utvid payment_status med 'authorized' status
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN ('pending', 'authorized', 'paid', 'refunded'));

-- Indeks for oppslag på quickpay_payment_id (brukes av callback)
CREATE INDEX IF NOT EXISTS idx_orders_quickpay_payment_id ON orders(quickpay_payment_id);

