-- ============================================================
-- Avfall Henting — Initial Database Schema
-- ============================================================

-- Profiles (extends Supabase Auth users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  pickup_address TEXT NOT NULL,
  pickup_lat DOUBLE PRECISION NOT NULL DEFAULT 0,
  pickup_lng DOUBLE PRECISION NOT NULL DEFAULT 0,
  floor INTEGER NOT NULL DEFAULT 0,
  has_elevator BOOLEAN NOT NULL DEFAULT false,
  has_parking BOOLEAN NOT NULL DEFAULT false,
  carry_distance TEXT NOT NULL DEFAULT '0-10m'
    CHECK (carry_distance IN ('0-10m', '10-25m', '25-50m', '50m+')),
  pickup_date DATE NOT NULL,
  pickup_time_window TEXT NOT NULL DEFAULT '08:00-12:00'
    CHECK (pickup_time_window IN ('08:00-12:00', '12:00-16:00', '16:00-20:00')),
  notes TEXT DEFAULT '',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  surcharges NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL
    CHECK (category IN ('general', 'furniture', 'electronics', 'hazardous', 'construction', 'garden', 'textiles', 'appliances')),
  estimated_weight_kg NUMERIC(6,2) NOT NULL DEFAULT 0,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  item_total NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- Order Images
CREATE TABLE order_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pricing config (seed data managed separately)
CREATE TABLE pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL UNIQUE,
  base_price_per_kg NUMERIC(10,2) NOT NULL,
  minimum_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  description TEXT DEFAULT ''
);

CREATE TABLE surcharge_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surcharge_type TEXT NOT NULL UNIQUE,
  condition_description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  is_percentage BOOLEAN NOT NULL DEFAULT false
);

-- Indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_images_order_id ON order_images(order_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

