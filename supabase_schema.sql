-- Database Schema for MKS Consults Ltd
-- To be executed in Supabase SQL Editor

-- 1. Roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('student', 'admin', 'corporate', 'instructor');
    ELSE
        -- Add instructor if it doesn't exist in the enum
        BEGIN
            ALTER TYPE user_role ADD VALUE 'instructor';
        EXCEPTION
            WHEN duplicate_object THEN null;
        END;
    END IF;
END$$;

-- Add course_mode enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_mode') THEN
        CREATE TYPE course_mode AS ENUM ('virtual', 'vod', 'physical');
    END IF;
END$$;

-- 2. Profiles (Extends Supabase Auth Users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  role user_role DEFAULT 'student',
  package_type TEXT DEFAULT 'standard',
  corporate_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, 'student');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure profile columns exist (Fix for existing tables)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='email') THEN
        ALTER TABLE profiles ADD COLUMN email TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='phone') THEN
        ALTER TABLE profiles ADD COLUMN phone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='address') THEN
        ALTER TABLE profiles ADD COLUMN address TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='package_type') THEN
        ALTER TABLE profiles ADD COLUMN package_type TEXT DEFAULT 'standard';
    END IF;
END$$;

-- 3. Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT
);

-- 4. Courses
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  overview TEXT,
  learning_outcomes TEXT[],
  who_it_is_for TEXT[],
  duration TEXT,
  format TEXT,
  certification_details TEXT,
  price_standard DECIMAL(10,2) NOT NULL,
  price_platinum DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) DEFAULT 0,
  image_url TEXT,
  video_url TEXT,
  document_url TEXT,
  modules JSONB DEFAULT '[]'::jsonb,
  mode course_mode DEFAULT 'vod',
  is_published BOOLEAN DEFAULT false,
  instructor_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ensure mode column exists (Fix for existing tables)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='mode') THEN
        -- Ensure the type exists first
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_mode') THEN
            CREATE TYPE course_mode AS ENUM ('virtual', 'vod', 'physical');
        END IF;
        ALTER TABLE courses ADD COLUMN mode course_mode DEFAULT 'vod';
    END IF;
    
    -- Ensure other columns exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='duration') THEN
        ALTER TABLE courses ADD COLUMN duration TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='format') THEN
        ALTER TABLE courses ADD COLUMN format TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='certification_details') THEN
        ALTER TABLE courses ADD COLUMN certification_details TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='deposit_amount') THEN
        ALTER TABLE courses ADD COLUMN deposit_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='image_url') THEN
        ALTER TABLE courses ADD COLUMN image_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='video_url') THEN
        ALTER TABLE courses ADD COLUMN video_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='document_url') THEN
        ALTER TABLE courses ADD COLUMN document_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='modules') THEN
        ALTER TABLE courses ADD COLUMN modules JSONB DEFAULT '[]'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='instructor_id') THEN
        ALTER TABLE courses ADD COLUMN instructor_id UUID REFERENCES profiles(id);
    END IF;
END$$;

-- 5. Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  course_id UUID REFERENCES public.courses(id),
  package_type TEXT CHECK (package_type IN ('standard', 'platinum')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  progress INTEGER DEFAULT 0,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Explicitly add the foreign key if it's missing or incorrectly defined
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='enrollments_user_id_fkey') THEN
        ALTER TABLE public.enrollments 
        ADD CONSTRAINT enrollments_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='enrollments_course_id_fkey') THEN
        ALTER TABLE public.enrollments 
        ADD CONSTRAINT enrollments_course_id_fkey 
        FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
    END IF;
END$$;

-- 6. Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID REFERENCES public.enrollments(id),
  user_id UUID REFERENCES public.profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'GBP',
  payment_method TEXT, -- 'stripe', 'paypal'
  payment_status TEXT CHECK (payment_status IN ('pending', 'succeeded', 'failed')),
  stripe_payment_intent_id TEXT,
  receipt_url TEXT,
  is_installment BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Explicitly add the foreign key if it's missing or incorrectly defined
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='payments_enrollment_id_fkey') THEN
        ALTER TABLE public.payments 
        ADD CONSTRAINT payments_enrollment_id_fkey 
        FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='payments_user_id_fkey') THEN
        ALTER TABLE public.payments 
        ADD CONSTRAINT payments_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END$$;

-- 7. Installment Records
CREATE TABLE IF NOT EXISTS installment_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID REFERENCES enrollments(id),
  total_amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  next_payment_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'overdue'))
);

-- 8. Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id),
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL, -- Array of objects: {question, options, correct_option}
  passing_score INTEGER DEFAULT 70,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. Quiz Attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id),
  user_id UUID REFERENCES profiles(id),
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. Certificates
CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID REFERENCES enrollments(id),
  user_id UUID REFERENCES profiles(id),
  certificate_url TEXT NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 11. Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  target_role user_role, -- NULL for everyone
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 12. FAQs
CREATE TABLE IF NOT EXISTS faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 13. Site Settings (CMS)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 14. Corporate Accounts
CREATE TABLE IF NOT EXISTS corporate_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  admin_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  -- Use a direct check against the JWT email first to break recursion
  IF (LOWER(auth.jwt() ->> 'email') IN ('sheriffdeenalade@gmail.com', 'sheriff.saka@cloudcraves.com')) THEN
    RETURN true;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Helper function to check if user is instructor
CREATE OR REPLACE FUNCTION is_instructor()
RETURNS boolean AS $$
BEGIN
  -- Use a direct check against the JWT email first to break recursion
  IF (is_admin()) THEN
    RETURN true;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'instructor'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 15. Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  session_id TEXT,
  session_date DATE NOT NULL,
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 16. Assessments
CREATE TABLE IF NOT EXISTS assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  assessment_name TEXT NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  max_score DECIMAL(5,2) NOT NULL,
  date_recorded TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, course_id, assessment_name)
);

-- 17. Assignments
CREATE TABLE IF NOT EXISTS assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  assignment_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('submitted', 'pending', 'approved', 'rejected')),
  instructor_note TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, course_id, assignment_name)
);

-- 18. Class Schedules (For Live/Virtual Classes)
CREATE TABLE IF NOT EXISTS class_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  meeting_link TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  instructor_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 19. Certificate Templates
CREATE TABLE IF NOT EXISTS certificate_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}'::jsonb, -- Store coordinates for text placement
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 20. Course Materials
CREATE TABLE IF NOT EXISTS course_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  type TEXT NOT NULL, -- 'pdf', 'video', 'document', 'link'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Row Level Security (RLS) Policies

-- course_materials
ALTER TABLE course_materials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view course materials" ON course_materials;
CREATE POLICY "Anyone can view course materials" ON course_materials FOR SELECT USING (true);
DROP POLICY IF EXISTS "Instructors can manage course materials" ON course_materials;
CREATE POLICY "Instructors can manage course materials" ON course_materials FOR ALL USING (is_instructor());

-- attendance
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own attendance" ON attendance;
CREATE POLICY "Users can view own attendance" ON attendance FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Instructors can manage attendance" ON attendance;
CREATE POLICY "Instructors can manage attendance" ON attendance FOR ALL USING (is_instructor());

-- assessments
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own assessments" ON assessments;
CREATE POLICY "Users can view own assessments" ON assessments FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Instructors can manage assessments" ON assessments;
CREATE POLICY "Instructors can manage assessments" ON assessments FOR ALL USING (is_instructor());

-- assignments
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own assignments" ON assignments;
CREATE POLICY "Users can view own assignments" ON assignments FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Instructors can manage assignments" ON assignments;
CREATE POLICY "Instructors can manage assignments" ON assignments FOR ALL USING (is_instructor());

-- Class Schedules
ALTER TABLE class_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view class schedules" ON class_schedules;
CREATE POLICY "Anyone can view class schedules" ON class_schedules FOR SELECT USING (true);
DROP POLICY IF EXISTS "Instructors can manage class schedules" ON class_schedules;
CREATE POLICY "Instructors can manage class schedules" ON class_schedules FOR ALL USING (is_instructor());

-- Certificate Templates
ALTER TABLE certificate_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active templates" ON certificate_templates;
CREATE POLICY "Anyone can view active templates" ON certificate_templates FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage templates" ON certificate_templates;
CREATE POLICY "Admins can manage templates" ON certificate_templates FOR ALL USING (is_admin());

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Admins and instructors can manage all profiles" ON profiles;
CREATE POLICY "Admins and instructors can manage all profiles" ON profiles FOR ALL USING (is_instructor());

-- Courses
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;
CREATE POLICY "Anyone can view published courses" ON courses FOR SELECT USING (is_published = true);
DROP POLICY IF EXISTS "Instructors can manage courses" ON courses;
CREATE POLICY "Instructors can manage courses" ON courses FOR ALL USING (is_instructor());
DROP POLICY IF EXISTS "Admins and instructors can manage courses" ON courses;
CREATE POLICY "Admins and instructors can manage courses" ON courses FOR ALL USING (is_instructor());

-- Categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins and instructors can manage categories" ON categories;
CREATE POLICY "Admins and instructors can manage categories" ON categories FOR ALL USING (is_instructor());

-- Enrollments
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own enrollments" ON enrollments;
CREATE POLICY "Users can view own enrollments" ON enrollments FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own enrollments" ON enrollments;
CREATE POLICY "Users can insert own enrollments" ON enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins and instructors can view all enrollments" ON enrollments;
CREATE POLICY "Admins and instructors can view all enrollments" ON enrollments FOR SELECT USING (is_instructor());
DROP POLICY IF EXISTS "Admins and instructors can manage all enrollments" ON enrollments;
CREATE POLICY "Admins and instructors can manage all enrollments" ON enrollments FOR ALL USING (is_instructor());

-- Payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own payments" ON payments;
CREATE POLICY "Users can insert own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins and instructors can manage all payments" ON payments;
CREATE POLICY "Admins and instructors can manage all payments" ON payments FOR ALL USING (is_instructor());

-- FAQs
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view faqs" ON faqs;
CREATE POLICY "Anyone can view faqs" ON faqs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage faqs" ON faqs;
CREATE POLICY "Admins can manage faqs" ON faqs FOR ALL USING (is_admin());

-- Announcements
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view announcements" ON announcements;
CREATE POLICY "Anyone can view announcements" ON announcements FOR SELECT USING (true);
DROP POLICY IF EXISTS "Instructors can manage announcements" ON announcements;
CREATE POLICY "Instructors can manage announcements" ON announcements FOR ALL USING (is_instructor());
DROP POLICY IF EXISTS "Admins can manage announcements" ON announcements;
CREATE POLICY "Admins can manage announcements" ON announcements FOR ALL USING (is_admin());

-- Site Settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view site settings" ON site_settings;
CREATE POLICY "Anyone can view site settings" ON site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage site settings" ON site_settings;
CREATE POLICY "Admins can manage site settings" ON site_settings FOR ALL USING (is_admin());

-- Quizzes
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view quizzes" ON quizzes;
CREATE POLICY "Authenticated users can view quizzes" ON quizzes FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Admins and instructors can manage quizzes" ON quizzes;
CREATE POLICY "Admins and instructors can manage quizzes" ON quizzes FOR ALL USING (is_instructor());

-- Installment Records
ALTER TABLE installment_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own installment_records" ON installment_records;
CREATE POLICY "Users can view own installment_records" ON installment_records FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM enrollments
    WHERE enrollments.id = installment_records.enrollment_id
    AND enrollments.user_id = auth.uid()
  )
);
DROP POLICY IF EXISTS "Users can insert own installment_records" ON installment_records;
CREATE POLICY "Users can insert own installment_records" ON installment_records FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM enrollments
    WHERE enrollments.id = enrollment_id
    AND enrollments.user_id = auth.uid()
  )
);
DROP POLICY IF EXISTS "Admins and instructors can manage all installment_records" ON installment_records;
CREATE POLICY "Admins and instructors can manage all installment_records" ON installment_records FOR ALL USING (is_instructor());

-- Quiz Attempts
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own quiz_attempts" ON quiz_attempts;
CREATE POLICY "Users can view own quiz_attempts" ON quiz_attempts FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own quiz_attempts" ON quiz_attempts;
CREATE POLICY "Users can insert own quiz_attempts" ON quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can manage all quiz_attempts" ON quiz_attempts;
CREATE POLICY "Admins can manage all quiz_attempts" ON quiz_attempts FOR ALL USING (is_admin());

-- Certificates
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own certificates" ON certificates;
CREATE POLICY "Users can view own certificates" ON certificates FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can manage all certificates" ON certificates;
CREATE POLICY "Admins can manage all certificates" ON certificates FOR ALL USING (is_admin());

-- Enable Realtime
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
ALTER PUBLICATION supabase_realtime ADD TABLE courses;
ALTER PUBLICATION supabase_realtime ADD TABLE enrollments;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
ALTER PUBLICATION supabase_realtime ADD TABLE installment_records;
ALTER PUBLICATION supabase_realtime ADD TABLE quizzes;
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_attempts;
ALTER PUBLICATION supabase_realtime ADD TABLE certificates;
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE faqs;
ALTER PUBLICATION supabase_realtime ADD TABLE site_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE class_schedules;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE assessments;
ALTER PUBLICATION supabase_realtime ADD TABLE assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE course_materials;

-- 20. Storage Setup
-- Create Storage Buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('training-assets', 'training-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 21. Set up RLS Policies for Storage Objects
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

DROP POLICY IF EXISTS "Users can view their own payment proofs" ON storage.objects;
CREATE POLICY "Users can view their own payment proofs" ON storage.objects
FOR SELECT USING (
  bucket_id = 'payment-proofs' AND 
  (storage.foldername(name))[1] = auth.uid()
);

DROP POLICY IF EXISTS "Admins can manage all payment proofs" ON storage.objects;
CREATE POLICY "Admins can manage all payment proofs" ON storage.objects
FOR ALL USING (
  bucket_id = 'payment-proofs' AND 
  (SELECT (role = 'admin') FROM public.profiles WHERE id = auth.uid())
);
