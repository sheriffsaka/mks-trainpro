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
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'student',
  corporate_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  course_id UUID REFERENCES courses(id),
  package_type TEXT CHECK (package_type IN ('standard', 'platinum')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  progress INTEGER DEFAULT 0,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID REFERENCES enrollments(id),
  user_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'GBP',
  payment_method TEXT, -- 'stripe', 'paypal'
  payment_status TEXT CHECK (payment_status IN ('pending', 'succeeded', 'failed')),
  stripe_payment_intent_id TEXT,
  is_installment BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

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
  user_id UUID REFERENCES auth.users(id),
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. Certificates
CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID REFERENCES enrollments(id),
  user_id UUID REFERENCES auth.users(id),
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
  created_by UUID REFERENCES auth.users(id),
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
  admin_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Helper function to check if user is admin without recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  session_id TEXT,
  session_date DATE NOT NULL,
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Helper function to check if user is instructor
CREATE OR REPLACE FUNCTION is_instructor()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'instructor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS for attendance
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own attendance" ON attendance;
CREATE POLICY "Users can view own attendance" ON attendance FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Instructors can manage attendance" ON attendance;
CREATE POLICY "Instructors can manage attendance" ON attendance FOR ALL USING (is_instructor());

-- Row Level Security (RLS) Policies

-- Profiles: Users can read their own profile, admins can read all
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (is_admin());

-- Courses: Everyone can read published courses, admins can manage
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;
CREATE POLICY "Anyone can view published courses" ON courses FOR SELECT USING (is_published = true);
DROP POLICY IF EXISTS "Admins can manage courses" ON courses;
CREATE POLICY "Admins can manage courses" ON courses FOR ALL USING (is_admin());

-- Categories: Everyone can read
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (is_admin());

-- Enrollments: Users can view their own, admins can view all
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own enrollments" ON enrollments;
CREATE POLICY "Users can view own enrollments" ON enrollments FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own enrollments" ON enrollments;
CREATE POLICY "Users can insert own enrollments" ON enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can view all enrollments" ON enrollments;
CREATE POLICY "Admins can view all enrollments" ON enrollments FOR SELECT USING (is_admin());
DROP POLICY IF EXISTS "Admins can manage all enrollments" ON enrollments;
CREATE POLICY "Admins can manage all enrollments" ON enrollments FOR ALL USING (is_admin());

-- Payments: Users can view their own, admins can view all
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own payments" ON payments;
CREATE POLICY "Users can insert own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
CREATE POLICY "Admins can view all payments" ON payments FOR SELECT USING (is_admin());

-- FAQs: Everyone can read
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view faqs" ON faqs;
CREATE POLICY "Anyone can view faqs" ON faqs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage faqs" ON faqs;
CREATE POLICY "Admins can manage faqs" ON faqs FOR ALL USING (is_admin());

-- Announcements: Everyone can read
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view announcements" ON announcements;
CREATE POLICY "Anyone can view announcements" ON announcements FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage announcements" ON announcements;
CREATE POLICY "Admins can manage announcements" ON announcements FOR ALL USING (is_admin());

-- Site Settings: Everyone can read
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view site settings" ON site_settings;
CREATE POLICY "Anyone can view site settings" ON site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage site settings" ON site_settings;
CREATE POLICY "Admins can manage site settings" ON site_settings FOR ALL USING (is_admin());

-- Quizzes: Authenticated users can read
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view quizzes" ON quizzes;
CREATE POLICY "Authenticated users can view quizzes" ON quizzes FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Admins can manage quizzes" ON quizzes;
CREATE POLICY "Admins can manage quizzes" ON quizzes FOR ALL USING (is_admin());
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
DROP POLICY IF EXISTS "Admins can manage all installment_records" ON installment_records;
CREATE POLICY "Admins can manage all installment_records" ON installment_records FOR ALL USING (is_admin());

-- Quiz Attempts: Users can view their own, admins can view all
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own quiz_attempts" ON quiz_attempts;
CREATE POLICY "Users can view own quiz_attempts" ON quiz_attempts FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own quiz_attempts" ON quiz_attempts;
CREATE POLICY "Users can insert own quiz_attempts" ON quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can view all quiz_attempts" ON quiz_attempts;
CREATE POLICY "Admins can view all quiz_attempts" ON quiz_attempts FOR SELECT USING (is_admin());

-- Certificates: Users can view their own, admins can view all
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own certificates" ON certificates;
CREATE POLICY "Users can view own certificates" ON certificates FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can manage all certificates" ON certificates;
CREATE POLICY "Admins can manage all certificates" ON certificates FOR ALL USING (is_admin());
