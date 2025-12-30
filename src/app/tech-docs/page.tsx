'use client';

// Note: In a real app, use Server Components + Middleware for generic Auth protection.
// This is a client-side layout for demonstration.

import { useState, useEffect } from 'react';
import { Folder, FileText, Database, Lock } from 'lucide-react';
import docsData from './data.json';

export default function TechDocsPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState<'architecture' | 'database'>('database');
    const [mermaidLoaded, setMermaidLoaded] = useState(false);

    useEffect(() => {
        // Dynamically import mermaid
        if (isAuthenticated && !mermaidLoaded) {
            import('mermaid').then((mod) => {
                mod.default.initialize({ startOnLoad: true, theme: 'default' });
                setMermaidLoaded(true);
                setTimeout(() => {
                    mod.default.contentLoaded();
                }, 100);
            });
        }
    }, [isAuthenticated, mermaidLoaded]);

    useEffect(() => {
        if (mermaidLoaded && activeTab === 'database') {
            import('mermaid').then((mod) => {
                setTimeout(() => mod.default.contentLoaded(), 100);
            });
        }
    }, [mermaidLoaded, activeTab]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple Hardcoded Gate (Replace with your Admin Role check)
        if (password === 'admin123') {
            setIsAuthenticated(true);
        } else {
            alert('Access Denied');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold">Protected Documentation</h1>
                    </div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border p-3 rounded-lg mb-4"
                        placeholder="Enter Admin Password"
                    />
                    <button className="w-full bg-gray-900 text-white p-3 rounded-lg font-bold">Unlock</button>
                    <p className="text-xs text-center mt-4 text-gray-500">Hint: admin123</p>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b px-8 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Database className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900">System Architecture</h1>
                        <p className="text-xs text-gray-500">Last updated: {new Date(docsData.timestamp).toLocaleString()}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('database')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'database' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                        Database (ERD)
                    </button>
                    <button
                        onClick={() => setActiveTab('architecture')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'architecture' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                        Code Structure
                    </button>
                </div>
            </header>

            <main className="p-8 max-w-7xl mx-auto">
                {activeTab === 'database' && (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Database className="w-5 h-5 text-gray-400" />
                            Entity Relationship Diagram
                        </h2>
                        <div className="mermaid flex justify-center bg-gray-50 p-6 rounded-xl overflow-x-auto">
                            {docsData.erd}
                        </div>
                        <p className="text-center text-xs text-gray-400 mt-4">Generated automatically from SQL schemas</p>
                    </div>
                )}

                {activeTab === 'architecture' && (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Folder className="w-5 h-5 text-gray-400" />
                            Project Structure
                        </h2>
                        <div className="space-y-1 font-mono text-sm">
                            <FileTree nodes={docsData.structure} />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function FileTree({ nodes, depth = 0 }: { nodes: any[], depth?: number }) {
    if (!nodes) return null;
    return (
        <>
            {nodes.map((node, i) => (
                <div key={i} style={{ paddingLeft: `${depth * 20}px` }}>
                    <div className="flex items-center gap-2 py-1 text-gray-600 hover:bg-gray-50 rounded px-2">
                        {node.type === 'folder' ? (
                            <Folder className="w-4 h-4 text-blue-400 fill-current" />
                        ) : (
                            <FileText className="w-4 h-4 text-gray-400" />
                        )}
                        <span>{node.name}</span>
                        {node.type === 'file' && <span className="text-xs text-gray-300 ml-auto">{node.size}b</span>}
                    </div>
                    {node.children && <FileTree nodes={node.children} depth={depth + 1} />}
                </div>
            ))}
        </>
    );
}
