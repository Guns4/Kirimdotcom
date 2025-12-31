'use client';

import { useState } from 'react';
import { MOCK_EXAMS } from '@/lib/quiz-engine';
import { submitExam, GradingResult } from '@/app/actions/certification';
import CertificateGenerator from '@/components/academy/CertificateGenerator';
import { Loader2, AlertCircle } from 'lucide-react';

export default function ExamPage({ params }: { params: { slug: string } }) {
    const exam = MOCK_EXAMS[params.slug];

    // State
    const [answers, setAnswers] = useState<number[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState<GradingResult | null>(null);
    const [loading, setLoading] = useState(false);

    if (!exam) {
        return <div className="p-12 text-center">Exam not found</div>;
    }

    const handleOptionSelect = (qIdx: number, optionIdx: number) => {
        if (submitted) return;
        const newAnswers = [...answers];
        newAnswers[qIdx] = optionIdx;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        if (answers.length < exam.questions.length) {
            alert('Please answer all questions before submitting.');
            return;
        }

        if (!confirm('Are you sure you want to submit? This cannot be undone.')) return;

        setLoading(true);
        try {
            const res = await submitExam(exam.id, answers);
            setResult(res);
            setSubmitted(true);
        } catch (error) {
            console.error(error);
            alert('Error submitting exam.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">{exam.title}</h1>
                    <p className="text-gray-600">Passing Score: {exam.passingScore}%</p>
                </div>

                {!result || !result.passed ? (
                    <div className="space-y-6">
                        {exam.questions.map((q, idx) => (
                            <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="font-semibold text-lg mb-4">{idx + 1}. {q.text}</h3>
                                <div className="space-y-3">
                                    {q.options.map((opt, optIdx) => (
                                        <div
                                            key={optIdx}
                                            onClick={() => handleOptionSelect(idx, optIdx)}
                                            className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center gap-3 ${answers[idx] === optIdx
                                                    ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                                                    : 'border-gray-200 hover:bg-gray-50'
                                                } ${submitted ? 'cursor-default' : ''}`}
                                        >
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${answers[idx] === optIdx ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
                                                }`}>
                                                {answers[idx] === optIdx && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                            </div>
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {result && !result.passed && (
                            <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 border border-red-200">
                                <AlertCircle />
                                <div>
                                    <p className="font-bold">Exam Failed</p>
                                    <p>Score: {result.score.toFixed(0)}% (Required: {exam.passingScore}%)</p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="text-sm underline mt-1"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        )}

                        {!submitted && (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.01] flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Submit Final Exam'}
                            </button>
                        )}
                    </div>
                ) : (
                    <CertificateGenerator data={{
                        studentName: 'Student Name', // Should be from Auth context
                        courseName: exam.title,
                        date: new Date().toLocaleDateString(),
                        certificateId: result.certificateId || 'Unknown'
                    }} />
                )}
            </div>
        </div>
    );
}
