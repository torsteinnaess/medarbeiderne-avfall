CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','scheduled','in_progress','completed','cancelled')),
  pickup_address TEXT NOT NULL,
  pickup_lat DOUBLE PRECISION NOT NULL DEFAULT 0,
  pickup_lng DOUBLE PRECISION NOT NULL DEFAULT 0,
  floor INTEGER NOT NULL DEFAULT 0,
  has_elevator BOOLEAN NOT NULL DEFAULT false,
  has_parking BOOLEAN NOT NULL DEFAULT false,
  carry_distance TEXT NOT NULL DEFAULT '0-10m' CHECK (carry_distance IN ('0-10m','10-25m','25-50m','50m+')),
  pickup_date DATE NOT NULL,
  pickup_time_window TEXT NOT NULL DEFAULT '08:00-12:00' CHECK (pickup_time_window IN ('08:00-12:00','12:00-16:00','16:00-20:00')),
  notes TEXT DEFAULT '',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  surcharges NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','refunded')),
  payment_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('general','furniture','electronics','hazardous','construction','garden','textiles','appliances')),
  estimated_weight_kg NUMERIC(6,2) NOT NULL DEFAULT 0,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  item_total NUMERIC(10,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS order_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL UNIQUE,
  base_price_per_kg NUMERIC(10,2) NOT NULL,
  minimum_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  description TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS surcharge_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surcharge_type TEXT NOT NULL UNIQUE,
  condition_description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  is_percentage BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_images_order_id ON order_images(order_id);

CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, phone) VALUES (
    NEW.id, COALESCE(NEW.email, ''), COALESCE(NEW.raw_user_meta_data->>'name', ''), COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE surcharge_config ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can update own orders" ON orders FOR UPDATE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can delete own orders" ON orders FOR DELETE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can create order items" ON order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can view own order images" ON order_images FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_images.order_id AND orders.user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users can create order images" ON order_images FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_images.order_id AND orders.user_id = auth.uid())); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Anyone can read pricing" ON pricing_config FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Anyone can read surcharges" ON surcharge_config FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

INSERT INTO pricing_config (category, base_price_per_kg, minimum_price, description) VALUES
  ('general',8.00,299,'Restavfall'),('furniture',12.00,399,'Mobler'),('electronics',15.00,499,'Elektronikk'),
  ('hazardous',25.00,699,'Farlig avfall'),('construction',10.00,449,'Bygningsavfall'),('garden',6.00,249,'Hageavfall'),
  ('textiles',5.00,199,'Tekstiler'),('appliances',14.00,449,'Hvitevarer')
ON CONFLICT (category) DO NOTHING;

INSERT INTO surcharge_config (surcharge_type, condition_description, amount, is_percentage) VALUES
  ('no_elevator_floor_2','Ingen heis, 2. etasje',100,false),('no_elevator_floor_3','Ingen heis, 3. etasje',200,false),
  ('no_elevator_floor_4','Ingen heis, 4. etasje',300,false),('no_elevator_floor_5+','Ingen heis, 5+ etasje',400,false),
  ('carry_10_25m','Baredistanse 10-25m',50,false),('carry_25_50m','Baredistanse 25-50m',100,false),
  ('carry_50m_plus','Baredistanse over 50m',200,false),('no_parking','Ingen parkering',150,false)
ON CONFLICT (surcharge_type) DO NOTHING;