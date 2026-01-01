'use client';
import React, { useState, useEffect } from 'react';
import { FileText, Book, HelpCircle } from 'lucide-react';

export default function KnowledgeCenter({ adminKey }: { adminKey: string }) {
    const [legalDocs, setLegalDocs] = useState<any[]>([]);
    const [apiDocs, setApiDocs] = useState<any[]>([]);
    const [faqs, setFaqs] = useState<any[]>([]);

    useEffect(() => {
        if (adminKey) {
            fetch('/api/admin/knowledge/legal', { headers: { 'x-admin-secret': adminKey } })
                .then(res => res.json())
                .then(data => setLegalDocs(data.documents || []));

            fetch('/api/admin/knowledge/docs', { headers: { 'x-admin-secret': adminKey } })
                .then(res => res.json())
                .then(data => {
                    setApiDocs(data.api_docs || []);
                    setFaqs(data.faqs || []);
                });
        }
    }, [adminKey]);

    return (
        <div className="grid grid-cols-2 gap-6">
            {/* LEGAL VERSION CONTROL */}
            <div className="bg-white rounded-xl shadow border p-6">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                    <FileText size={20} className="text-blue-600" />
                    Legal Documents (Version Control)
                </h4>
                <div className="space-y-3">
                    {legalDocs.map((doc) => (
                        <div key={doc.id} className="p-3 border rounded">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="font-bold">{doc.title}</div>
                                    <div className="text-xs text-slate-500">v{doc.version_number}</div>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${doc.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {doc.is_active ? 'LIVE' : 'ARCHIVED'}
                                </span>
                            </div>
                            {doc.changelog_summary && (
                                <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
                                    📝 {doc.changelog_summary}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* API DOCS MANAGER */}
            <div className="bg-white rounded-xl shadow border p-6">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                    <Book size={20} className="text-purple-600" />
                    API Documentation Control
                </h4>
                <div className="space-y-2">
                    {apiDocs.slice(0, 8).map((api) => (
                        <div key={api.id} className="p-2 border rounded flex justify-between items-center">
                            <div>
                                <div className="font-bold text-sm">{api.title}</div>
                                <code className="text-xs text-slate-500">{api.method} {api.endpoint_path}</code>
                            </div>
                            <div className="flex gap-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${api.is_public ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {api.is_public ? 'PUBLIC' : 'PRIVATE'}
                                </span>
                                {api.is_deprecated && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold">
                                        DEPRECATED
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQ KNOWLEDGE BASE */}
            <div className="col-span-2 bg-white rounded-xl shadow border p-6">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                    <HelpCircle size={20} className="text-green-600" />
                    FAQ Knowledge Base
                </h4>
                <div className="grid grid-cols-2 gap-3">
                    {faqs.map((faq) => (
                        <div key={faq.id} className="p-3 border rounded">
                            <div className="font-bold text-sm mb-2">{faq.question}</div>
                            <div className="text-xs text-slate-600">{faq.answer.slice(0, 100)}...</div>
                            <div className="mt-2 flex gap-2">
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                    {faq.category}
                                </span>
                                <span className="text-xs text-slate-400">
                                    👍 {faq.helpful_count}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
