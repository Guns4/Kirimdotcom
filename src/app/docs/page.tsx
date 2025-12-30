'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import spec from '@/lib/swagger/openapi.json';

// Dynamically import SwaggerUI to avoid SSR issues with window object
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { 
    ssr: false,
    loading: () => <div className="h-screen flex items-center justify-center">Loading API Docs...</div>
});

export default function ApiDocsPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-900">Developer Documentation</h1>
                    <a href="/dashboard/developer" className="text-sm text-blue-600 hover:underline">
                        Get API Key &rarr;
                    </a>
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto py-8">
                <SwaggerUI spec={spec} />
            </div>
        </div>
    );
}
