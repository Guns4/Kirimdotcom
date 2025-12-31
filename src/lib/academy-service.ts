import { createClient } from '@/utils/supabase/server';

export interface Course {
    id: string;
    slug: string;
    title: string;
    description: string;
    thumbnail_url: string;
    instructor_name: string;
    price: number;
    is_published: boolean;
}

export interface Module {
    id: string;
    course_id: string;
    title: string;
    order_index: number;
}

export interface Lesson {
    id: string;
    module_id: string;
    title: string;
    video_url: string;
    duration_seconds: number;
    order_index: number;
    is_free: boolean;
}

export async function getCourses(): Promise<Course[]> {
    const supabase = await createClient();
    const { data, error } = await (supabase as any)
        .from('academy_courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
    const supabase = await createClient();
    const { data, error } = await (supabase as any)
        .from('academy_courses')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) return null;
    return data;
}

export async function getCourseModules(courseId: string): Promise<Module[]> {
    const supabase = await createClient();
    const { data, error } = await (supabase as any)
        .from('academy_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

    if (error) throw error;
    return data || [];
}

export async function getModuleLessons(moduleId: string): Promise<Lesson[]> {
    const supabase = await createClient();
    const { data, error } = await (supabase as any)
        .from('academy_lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index');

    if (error) throw error;
    return data || [];
}

export async function checkEnrollment(userId: string, courseId: string): Promise<boolean> {
    const supabase = await createClient();
    const { data, error } = await (supabase as any)
        .from('academy_enrollments')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

    return !!data && !error;
}

export async function enrollUser(userId: string, courseId: string): Promise<void> {
    const supabase = await createClient();
    await (supabase as any)
        .from('academy_enrollments')
        .insert({ user_id: userId, course_id: courseId });
}

export async function updateProgress(
    userId: string,
    lessonId: string,
    completed: boolean,
    lastPosition: number
): Promise<void> {
    const supabase = await createClient();
    await (supabase as any)
        .from('academy_progress')
        .upsert({
            user_id: userId,
            lesson_id: lessonId,
            completed,
            last_position_seconds: lastPosition,
            completed_at: completed ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
        });
}

export async function getUserProgress(userId: string, courseId: string) {
    const supabase = await createClient();

    // Get all lessons for the course
    const modules = await getCourseModules(courseId);
    const lessonIds: string[] = [];

    for (const module of modules) {
        const lessons = await getModuleLessons(module.id);
        lessonIds.push(...lessons.map(l => l.id));
    }

    // Get progress for those lessons
    const { data, error } = await (supabase as any)
        .from('academy_progress')
        .select('*')
        .eq('user_id', userId)
        .in('lesson_id', lessonIds);

    if (error) return [];
    return data || [];
}
