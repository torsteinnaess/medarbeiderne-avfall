-- ============================================================
-- Seed: Pricing Model
-- ============================================================

-- Category pricing (NOK per kg)
INSERT INTO pricing_config (category, base_price_per_kg, minimum_price, description) VALUES
  ('general',      8.00,   299, 'Restavfall'),
  ('furniture',   12.00,   399, 'Møbler'),
  ('electronics', 15.00,   499, 'Elektronikk'),
  ('hazardous',   25.00,   699, 'Farlig avfall'),
  ('construction', 10.00,  449, 'Bygningsavfall'),
  ('garden',       6.00,   249, 'Hageavfall'),
  ('textiles',     5.00,   199, 'Tekstiler'),
  ('appliances',  14.00,   449, 'Hvitevarer');

-- Surcharges
INSERT INTO surcharge_config (surcharge_type, condition_description, amount, is_percentage) VALUES
  ('no_elevator_floor_2',   'Ingen heis, 2. etasje',          100, false),
  ('no_elevator_floor_3',   'Ingen heis, 3. etasje',          200, false),
  ('no_elevator_floor_4',   'Ingen heis, 4. etasje',          300, false),
  ('no_elevator_floor_5+',  'Ingen heis, 5. etasje eller høyere', 400, false),
  ('carry_10_25m',          'Bæredistanse 10-25m',            50, false),
  ('carry_25_50m',          'Bæredistanse 25-50m',            100, false),
  ('carry_50m_plus',        'Bæredistanse over 50m',          200, false),
  ('no_parking',            'Ingen parkering tilgjengelig',     150, false);

