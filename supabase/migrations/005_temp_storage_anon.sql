-- ============================================================
-- Storage: Allow anonymous uploads to temp/ prefix
-- Used for image analysis before user is authenticated.
-- Images are moved to the user's folder at checkout.
-- ============================================================

-- Anonymous users can upload to temp/{uuid}/*
CREATE POLICY "Anon can upload to temp folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'order-images'
    AND (storage.foldername(name))[1] = 'temp'
  );

-- Anonymous users can read from temp/ (needed to create signed URLs)
CREATE POLICY "Anon can read temp folder"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'order-images'
    AND (storage.foldername(name))[1] = 'temp'
  );

-- Service role handles deletion of temp files (no anon DELETE needed)

