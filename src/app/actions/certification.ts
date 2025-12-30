'use server';

import { MOCK_EXAMS } from '@/lib/quiz-engine';
import { createClient } from '@/utils/supabase/server';

export interface ExamResult {
    passed: boolean;
    score: number;
    message: string;
    certificateId?: string;
}

export async function submitExam(courseSlug: string, userAnswers: Record<string, number>): Promise<ExamResult> {
    const supabase = await createClient();
    const exam = MOCK_EXAMS[courseSlug];

    if (!exam) {
        return { passed: false, score: 0, message: 'Exam not found' };
    }

    // 1. Calculate Score
    let correctCount = 0;
    let total = exam.questions.length;

    exam.questions.forEach(q => {
        if (userAnswers[q.id] === q.correctIndex) {
            correctCount++;
        }
    });

    const score = Math.round((correctCount / total) * 100);
    const passed = score >= exam.passingScore;

    // 2. Record Result (Mock DB)
    const { data: { user } } = await supabase.auth.getUser();

    if (passed && user) {
        // Save Certification
        const mockCertId = `CERT-${courseSlug.toUpperCase().substring(0, 3)}-${Date.now()}`;

        // Update user profile badges (Simulated)
        /* 
        await supabase.from('profiles').update({ 
           badges: supabase.raw(`array_append(badges, 'Certified: ${exam.title}')`) 
        }).eq('id', user.id);
        */

        return {
            passed: true,
            score,
            certificateId: mockCertId,
            message: 'Selamat! Anda lulus ujian ini.'
        };
    } else {
        return {
            passed: false,
            score,
            message: 'Maaf, nilai Anda belum memenuhi syarat kelulusan. Silakan coba lagi.'
        };
    }
}
