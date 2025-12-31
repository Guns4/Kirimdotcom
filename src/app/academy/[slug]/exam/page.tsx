'use client';

import React, { useState, use } from 'react';
import { notFound } from 'next/navigation';
import { MOCK_EXAM, Exam } from '@/lib/quiz-engine';
import { submitExam } from '@/app/actions/certification';
import CertificateGenerator from '@/components/academy/CertificateGenerator';

// Mock getExam for client comp (or pass from server)
// For simplicity in this structure, we use the mock data directly or props.
// Ideally fetches from server component.

export default function ExamPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = use(params);
    // Simulating fetch
    const exam = MOCK_EXAM;

    const [answers, setAnswers] = useState<number[]>(new Array(exam.questions.length).fill(-1));
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    if (resolvedParams.slug !== 'business-online-101') {
        // Very authentic mock check
        return notFound();
    }

    const handleOptionSelect = (qIndex: number, optionIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[qIndex] = optionIndex;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        if (answers.includes(-1)) {
            alert("Please answer all questions");
            return;
        }
        setLoading(true);
        try {
            const res = await submitExam(exam.id, answers);
            setResult(res);
        } catch (e) {
            alert("Error submitting exam");
        } finally {
            setLoading(false);
        }
    };

    if (result && result.passed) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-black p-8 flex flex-col items-center justify-center">
                <div className="bg-green-100 text-green-800 px-6 py-3 rounded-full mb-8 font-bold">
                    🎉 Congratulations! You Passed! Score: {result.score}%
                </div>
                <CertificateGenerator
                    candidateName="Student Name" // In real app, get from Auth Context
                    courseName={exam.title}
                    date={new Date().toLocaleDateString()}
                    certificateId={result.certificateId}
                />
                <button
                    onClick={() => window.location.reload()}
                    className="mt-8 text-zinc-500 hover:underline"
                >
                    Back to Academy
                </button>
            </div>
        );
    }

    if (result && !result.passed) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12 text-center">
                <div className="text-6xl mb-4">😢</div>
                <h1 className="text-3xl font-bold mb-4">Exam Failed</h1>
                <p className="text-zinc-600 mb-8">
                    Your score: <span className="font-bold text-red-600">{result.score}%</span>.
                    Minimum passing score is {exam.passingScore}%.
                </p>
                <button
                    onClick={() => { setResult(null); setAnswers(new Array(exam.questions.length).fill(-1)); }}
                    className="px-6 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <h1 className="text-2xl font-bold">{exam.title}</h1>
                <p className="text-zinc-500">Passing Score: {exam.passingScore}% • {exam.questions.length} Questions</p>
            </div>

            <div className="space-y-8">
                {exam.questions.map((q, qIndex) => (
                    <div key={q.id} className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <p className="font-medium text-lg mb-4">{qIndex + 1}. {q.text}</p>
                        <div className="space-y-2">
                            {q.options.map((opt, optIndex) => (
                                <label
                                    key={optIndex}
                                    className={`flex items-center p-3 rounded-md border cursor-pointer transition-colors ${answers[qIndex] === optIndex
                                            ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/20 dark:border-blue-500'
                                            : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name={`q-${q.id}`}
                                        className="mr-3"
                                        checked={answers[qIndex] === optIndex}
                                        onChange={() => handleOptionSelect(qIndex, optIndex)}
                                    />
                                    <span className="text-zinc-700 dark:text-zinc-300">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Submitting...' : 'Submit Exam'}
                </button>
            </div>
        </div>
    );
}
