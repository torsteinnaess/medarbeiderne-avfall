-- ============================================================
-- Storage: Allow authenticated users to move objects FROM temp/
-- The move() operation requires SELECT + UPDATE on the source
-- and INSERT on the destination (already granted by 004).
-- ============================================================

-- Drop policies if they exist from a previous run
DROP POLICY IF EXISTS "Authenticated can read temp folder" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update temp folder" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete temp folder" ON storage.objects;

-- Authenticated users can read temp/ objects (needed for move source)
CREATE POLICY "Authenticated can read temp folder"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'order-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'temp'
  );

-- Authenticated users can update temp/ objects (move changes the path)
-- USING matches the source row (temp/), WITH CHECK allows the new path ({uid}/)
CREATE POLICY "Authenticated can update temp folder"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'order-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'temp'
  )
  WITH CHECK (
    bucket_id = 'order-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can delete temp/ objects (move deletes the source)
CREATE POLICY "Authenticated can delete temp folder"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'order-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'temp'
  );

