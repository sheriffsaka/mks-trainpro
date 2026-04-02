-- 1. Create Storage Buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('training-assets', 'training-assets', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up RLS Policies for Storage Objects
-- Grant permissions to authenticated users for storage
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- Policies for 'training-assets' (Publicly readable)
DROP POLICY IF EXISTS "Public Access to training-assets" ON storage.objects;
CREATE POLICY "Public Access to training-assets" ON storage.objects
FOR SELECT USING (bucket_id = 'training-assets');

DROP POLICY IF EXISTS "Admins can manage training-assets" ON storage.objects;
CREATE POLICY "Admins can manage training-assets" ON storage.objects
FOR ALL USING (
  bucket_id = 'training-assets' AND 
  (SELECT (role = 'admin') FROM public.profiles WHERE id = auth.uid())
);

-- Policies for 'site-assets' (Publicly readable)
DROP POLICY IF EXISTS "Public Access to site-assets" ON storage.objects;
CREATE POLICY "Public Access to site-assets" ON storage.objects
FOR SELECT USING (bucket_id = 'site-assets');

DROP POLICY IF EXISTS "Admins can manage site-assets" ON storage.objects;
CREATE POLICY "Admins can manage site-assets" ON storage.objects
FOR ALL USING (
  bucket_id = 'site-assets' AND 
  (SELECT (role = 'admin') FROM public.profiles WHERE id = auth.uid())
);

-- Policies for 'payment-proofs' (Private, but admins can see all)
DROP POLICY IF EXISTS "Users can upload their own payment proofs" ON storage.objects;
CREATE POLICY "Users can upload their own payment proofs" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'payment-proofs' AND 
  auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Admins can view all payment proofs" ON storage.objects;
CREATE POLICY "Admins can view all payment proofs" ON storage.objects
FOR SELECT USING (
  bucket_id = 'payment-proofs' AND 
  (SELECT (role = 'admin') FROM public.profiles WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Users can view their own payment proofs" ON storage.objects;
CREATE POLICY "Users can view their own payment proofs" ON storage.objects
FOR SELECT USING (
  bucket_id = 'payment-proofs' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Admins can manage all payment proofs" ON storage.objects;
CREATE POLICY "Admins can manage all payment proofs" ON storage.objects
FOR ALL USING (
  bucket_id = 'payment-proofs' AND 
  (SELECT (role = 'admin') FROM public.profiles WHERE id = auth.uid())
);
