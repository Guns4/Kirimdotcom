'use server';

import { MOCK_EXAM } from '@/lib/quiz-engine';

export async function submitExam(examId: string, answers: number[]) {
    // In a real app, fetch exam from DB to prevent cheating
    const exam = MOCK_EXAM;

    if (exam.id !== examId) {
        return { success: false, message: 'Invalid Exam ID' };
    }

    let score = 0;
    let correctCount = 0;

    exam.questions.forEach((q, index) => {
        if (answers[index] === q.correctIndex) {
            correctCount++;
        }
    });

    score = (correctCount / exam.questions.length) * 100;
    const passed = score >= exam.passingScore;

    // Save result to DB here (omitted for mock)

    return {
        success: true,
        passed,
        score,
        totalQuestions: exam.questions.length,
        correctCount,
        certificateId: passed ? `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}` : null
    };
}
