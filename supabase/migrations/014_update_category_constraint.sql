-- ============================================================
-- Update category CHECK constraint on order_items to match
-- the new Norwegian waste category keys used by the app.
-- Also update pricing_config categories.
-- ============================================================

-- 1. Drop old CHECK constraint and add new one with all valid categories
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_category_check;
ALTER TABLE order_items ADD CONSTRAINT order_items_category_check
  CHECK (category IN (
    'fett_vegetabilske_oljer',
    'hageavfall',
    'treverk_ubehandlet',
    'impregnert_treverk_cu',
    'papp_papir',
    'glass_metallemballasje',
    'isolerglassruter',
    'jern_metall',
    'ee_avfall',
    'gips',
    'tunge_masser',
    'blyholdig_avfall',
    'blaasesand',
    'impregnert_treverk_cca',
    'isocyanat',
    'uorg_syrer',
    'rengjoringsmidler',
    'klorparafin_isolerglassruter',
    'gassbeholdere',
    'gassflasker_propanflasker',
    'brannslukkingsapparater',
    'usortert_avfall'
  ));

-- 2. Update pricing_config to use new category keys
UPDATE pricing_config SET category = 'usortert_avfall'           WHERE category = 'general';
UPDATE pricing_config SET category = 'treverk_ubehandlet'        WHERE category = 'furniture';
UPDATE pricing_config SET category = 'ee_avfall'                 WHERE category = 'electronics';
UPDATE pricing_config SET category = 'blyholdig_avfall'          WHERE category = 'hazardous';
UPDATE pricing_config SET category = 'tunge_masser'              WHERE category = 'construction';
UPDATE pricing_config SET category = 'hageavfall'                WHERE category = 'garden';
UPDATE pricing_config SET category = 'papp_papir'                WHERE category = 'textiles';
UPDATE pricing_config SET category = 'jern_metall'               WHERE category = 'appliances';

-- 3. Insert any missing categories with sensible defaults
INSERT INTO pricing_config (category, base_price_per_kg, minimum_price, description) VALUES
  ('fett_vegetabilske_oljer',        10.00, 299, 'Fett og vegetabilske oljer'),
  ('impregnert_treverk_cu',          15.00, 499, 'Impregnert treverk CU'),
  ('glass_metallemballasje',          5.00, 199, 'Glass og metallemballasje'),
  ('isolerglassruter',               20.00, 599, 'Isolerglassruter'),
  ('gips',                            8.00, 299, 'Gips'),
  ('blaasesand',                     12.00, 399, 'Blåsesand'),
  ('impregnert_treverk_cca',         20.00, 599, 'Impregnert treverk CCA'),
  ('isocyanat',                      25.00, 699, 'Isocyanat'),
  ('uorg_syrer',                     25.00, 699, 'Uorganiske syrer'),
  ('rengjoringsmidler',              15.00, 499, 'Rengjøringsmidler'),
  ('klorparafin_isolerglassruter',   25.00, 699, 'Klorparafin isolerglassruter'),
  ('gassbeholdere',                  20.00, 599, 'Gassbeholdere'),
  ('gassflasker_propanflasker',      20.00, 599, 'Gassflasker/propanflasker'),
  ('brannslukkingsapparater',        20.00, 599, 'Brannslukkingsapparater')
ON CONFLICT (category) DO NOTHING;

