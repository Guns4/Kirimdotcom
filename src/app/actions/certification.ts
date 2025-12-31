'use server';

import { MOCK_EXAMS } from '@/lib/quiz-engine';
import { createClient } from '@/utils/supabase/server';

export interface GradingResult {
    passed: boolean;
    score: number;
    certificateId?: string;
    message: string;
}

export async function submitExam(examId: string, answers: number[]): Promise<GradingResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // In a real app, strictly check authentication
    // if (!user) throw new Error('Unauthorized');
    const userName = user?.user_metadata?.full_name || 'Student';

    const exam = MOCK_EXAMS[examId];
    if (!exam) {
        return { passed: false, score: 0, message: 'Exam not found' };
    }

    if (answers.length !== exam.questions.length) {
        return { passed: false, score: 0, message: 'Incomplete answers' };
    }

    // Grade Exam
    let correctCount = 0;
    exam.questions.forEach((q, idx) => {
        if (answers[idx] === q.correctIndex) {
            correctCount++;
        }
    });

    const score = (correctCount / exam.questions.length) * 100;
    const passed = score >= exam.passingScore;

    if (passed) {
        // Generate Certificate Record
        // In real app: Insert into 'certificates' table
        const certificateId = `CERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Mock DB Insertion
        console.log(`Certificate generated for ${userName}: ${certificateId}`);

        return {
            passed: true,
            score,
            certificateId,
            message: 'Congratulations! You passed.'
        };
    } else {
        return {
            passed: false,
            score,
            message: 'You did not pass. Please try again.'
        };
    }
}
