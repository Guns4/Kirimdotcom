-- Academy LMS Schema
-- Knowledge Monetization Platform

-- Courses table
CREATE TABLE IF NOT EXISTS public.academy_courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    instructor_name TEXT,
    price INTEGER DEFAULT 0, -- in Rupiah
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course modules/sections
CREATE TABLE IF NOT EXISTS public.academy_modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES public.academy_courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video lessons
CREATE TABLE IF NOT EXISTS public.academy_lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID REFERENCES public.academy_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    video_url TEXT,
    duration_seconds INTEGER,
    order_index INTEGER NOT NULL,
    is_free BOOLEAN DEFAULT false, -- Free preview lessons
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User enrollments
CREATE TABLE IF NOT EXISTS public.academy_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.academy_courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS public.academy_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.academy_lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_position_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_academy_modules_course ON public.academy_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_academy_lessons_module ON public.academy_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_academy_enrollments_user ON public.academy_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_academy_progress_user ON public.academy_progress(user_id);

-- RLS Policies
ALTER TABLE public.academy_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_progress ENABLE ROW LEVEL SECURITY;

-- Public can view published courses
CREATE POLICY "Anyone can view published courses" ON public.academy_courses FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view modules of published courses" ON public.academy_modules FOR SELECT USING (
    course_id IN (SELECT id FROM public.academy_courses WHERE is_published = true)
);
CREATE POLICY "Anyone can view lessons of published courses" ON public.academy_lessons FOR SELECT USING (
    module_id IN (SELECT id FROM public.academy_modules WHERE course_id IN (SELECT id FROM public.academy_courses WHERE is_published = true))
);

-- Users can view their own enrollments and progress
CREATE POLICY "Users can view own enrollments" ON public.academy_enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own progress" ON public.academy_progress FOR ALL USING (auth.uid() = user_id);
