-- 1. Create Storage Buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('training-assets', 'training-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up RLS Policies for Storage
-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS "Admins can manage all payment proofs" ON storage.objects;
CREATE POLICY "Admins can manage all payment proofs" ON storage.objects
FOR ALL USING (
  bucket_id = 'payment-proofs' AND 
  (SELECT (role = 'admin') FROM public.profiles WHERE id = auth.uid())
);
