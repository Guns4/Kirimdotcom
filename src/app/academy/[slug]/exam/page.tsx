'use client';

import { MOCK_EXAMS } from '@/lib/quiz-engine';
import { submitExam, ExamResult } from '@/app/actions/certification';
import { useState, use } from 'react';
import { Award, AlertCircle, CheckCircle } from 'lucide-react';
import CertificateGenerator from '@/components/academy/CertificateGenerator';
import Link from 'next/link';

// Helper to access `params` safely in Client Components
// NOTE: Since this entire component is "use client" based on interactivity,
// we are receiving the params directly. For simplicity in Next 15:
// We will resolve the params promise inside the component or expect them
// but since `use client` pages receive params differently (as a promise in newer versions),
// we will maintain the standard pattern:
interface PageProps {
    params: Promise<{ slug: string }>;
}

export default function ExamPage({ params }: PageProps) {
    // Unwrap params using `use()` hook for standard React/Next 14+ behavior in Client Components
    // or simple await if it was Server Component. 
    // Since we marked 'use client', we handle the promise:
    const { slug } = use(params);

    const exam = MOCK_EXAMS[slug];

    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [result, setResult] = useState<ExamResult | null>(null);
    const [loading, setLoading] = useState(false);

    if (!exam) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Exam Not Found</h1>
                    <Link href="/academy" className="text-blue-600 hover:underline">Kembali ke Academy</Link>
                </div>
            </div>
        );
    }

    const handleSelect = (qId: string, optIndex: number) => {
        setAnswers(prev => ({ ...prev, [qId]: optIndex }));
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length < exam.questions.length) {
            alert('Mohon jawab semua pertanyaan.');
            return;
        }

        setLoading(true);
        try {
            const res = await submitExam(slug, answers);
            setResult(res);
        } catch (error) {
            console.error(error);
            alert('Error submitting exam.');
        } finally {
            setLoading(false);
        }
    };

    if (result && result.passed) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white max-w-lg w-full p-8 rounded-2xl shadow-xl text-center border border-green-100">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Award className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Selamat! Anda Lulus!</h1>
                    <p className="text-gray-600 mb-4">Nilai Anda: <span className="font-bold text-green-600 text-xl">{result.score}%</span></p>

                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 mb-8">
                        <p className="text-sm text-yellow-800 font-medium mb-4">Sertifikat Profesional Anda telah terbit.</p>
                        <div className="flex justify-center">
                            <CertificateGenerator
                                studentName="Student Name" // In real app, fetch from User Profile
                                courseTitle={exam.title}
                                date={new Date().toLocaleDateString()}
                                certificateId={result.certificateId || 'ERR'}
                            />
                        </div>
                    </div>

                    <Link href="/academy" className="text-gray-500 hover:text-gray-900 text-sm">Kembali ke Academy</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
                    <h1 className="text-2xl font-bold mb-2">{exam.title}</h1>
                    <p className="text-gray-600 text-sm">Passing Score: {exam.passingScore}% • {exam.questions.length} Pertanyaan</p>
                </div>

                {result && !result.passed && (
                    <div className="bg-red-50 p-4 rounded-xl mb-6 border border-red-100 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <div>
                            <h3 className="font-bold text-red-800">Belum Lulus</h3>
                            <p className="text-sm text-red-600">Nilai Anda: {result.score}%. Silakan coba lagi.</p>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    {exam.questions.map((q, idx) => (
                        <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-medium text-lg mb-4 text-gray-800">
                                {idx + 1}. {q.text}
                            </h3>
                            <div className="space-y-2">
                                {q.options.map((opt, optIdx) => (
                                    <button
                                        key={optIdx}
                                        onClick={() => handleSelect(q.id, optIdx)}
                                        className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 flex items-center gap-3
                                    ${answers[q.id] === optIdx
                                                ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                                                : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                            }
                                `}
                                    >
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center
                                    ${answers[q.id] === optIdx ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}
                                `}>
                                            {answers[q.id] === optIdx && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        <span className={answers[q.id] === optIdx ? 'text-blue-900 font-medium' : 'text-gray-700'}>
                                            {opt}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? 'Submitting...' : 'Submit Exam'}
                    </button>
                </div>
            </div>
        </div>
    );
}
