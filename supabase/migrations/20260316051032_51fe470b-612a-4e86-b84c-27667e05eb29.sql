-- Create storage bucket for plant images
INSERT INTO storage.buckets (id, name, public)
VALUES ('plant-images', 'plant-images', true);

-- Allow authenticated users to upload their own plant images
CREATE POLICY "Users can upload plant images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'plant-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow anyone to view plant images (public bucket)
CREATE POLICY "Anyone can view plant images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'plant-images');

-- Allow users to delete their own plant images
CREATE POLICY "Users can delete own plant images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'plant-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to update their own plant images
CREATE POLICY "Users can update own plant images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'plant-images' AND (storage.foldername(name))[1] = auth.uid()::text);