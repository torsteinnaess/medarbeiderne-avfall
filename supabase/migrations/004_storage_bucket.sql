-- ============================================================
-- Storage: order-images bucket
-- ============================================================

-- Opprett bucket for ordrebilder
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'order-images',
  'order-images',
  false,
  10485760,  -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Autentiserte brukere kan laste opp til sin egen mappe: {user_id}/{order_id}/*
CREATE POLICY "Users can upload own order images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'order-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Brukere kan lese sine egne bilder
CREATE POLICY "Users can read own order images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'order-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Brukere kan slette sine egne bilder
CREATE POLICY "Users can delete own order images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'order-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

