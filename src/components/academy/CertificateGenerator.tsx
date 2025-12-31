'use client';

import React, { useRef } from 'react';

interface Props {
    candidateName: string;
    courseName: string;
    date: string;
    certificateId: string;
}

export default function CertificateGenerator({ candidateName, courseName, date, certificateId }: Props) {
    const certRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        // Simple print instruction, usually we'd use html2canvas or standard window.print with print CSS
        window.print();
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div
                ref={certRef}
                className="relative w-full max-w-4xl aspect-[1.414/1] bg-[#fff] text-black border-[20px] border-double border-zinc-200 p-10 shadow-2xl overflow-hidden print:shadow-none print:border-none print:absolute print:top-0 print:left-0 print:w-[297mm] print:h-[210mm] print:z-50"
            >
                {/* Certificate Border/Frame decorative */}
                <div className="absolute inset-4 border-4 border-zinc-900 opacity-10"></div>
                <div className="absolute inset-6 border border-zinc-900 opacity-20"></div>

                {/* Content */}
                <div className="h-full flex flex-col items-center justify-center text-center z-10 relative">

                    <div className="mb-8">
                        <h1 className="text-5xl font-serif font-bold text-zinc-900 mb-2 uppercase tracking-widest">Certificate</h1>
                        <p className="text-xl font-serif italic text-zinc-500">of Completion</p>
                    </div>

                    <p className="text-lg text-zinc-600 mb-4">This checks that</p>

                    <h2 className="text-4xl font-bold font-serif text-blue-900 mb-6 border-b-2 border-zinc-200 pb-2 px-10">
                        {candidateName}
                    </h2>

                    <p className="text-lg text-zinc-600 mb-2">Has successfully demonstrated proficiency in</p>
                    <h3 className="text-2xl font-bold text-zinc-800 mb-8">{courseName}</h3>

                    <div className="flex justify-between w-3/4 mt-auto pt-10 border-t border-zinc-100">
                        <div className="text-center">
                            <div className="w-32 h-10 border-b border-zinc-900 mb-2 mx-auto"></div>
                            <p className="text-sm font-bold uppercase text-zinc-500">Authorized Signature</p>
                        </div>

                        <div className="text-center">
                            <p className="font-mono text-sm mb-1">{date}</p>
                            <p className="text-xs text-zinc-400 font-mono">ID: {certificateId}</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-yellow-900 mx-auto mb-2 shadow-inner">
                                GOLD
                                SEAL
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <button
                onClick={handlePrint}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-colors print:hidden"
            >
                Download / Print Certificate
            </button>

            <p className="text-xs text-zinc-400 print:hidden text-center max-w-md">
                *To save as PDF, click print and choose "Save as PDF" as the destination.
            </p>
        </div>
    );
}
