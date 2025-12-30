'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import { ArrowLeft, BookOpen, Code, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Dynamic import to avoid SSR issues with Swagger UI
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API Documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/developer"
                className="text-gray-600 hover:text-indigo-600 transition flex items-center gap-2 text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h1 className="text-2xl font-bold text-gray-900">
                  API Reference
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                v1.0.0
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-indigo-600 mb-1">
                <Code className="w-4 h-4" />
                <span className="text-xs font-medium">Endpoints</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-medium">Uptime</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">99.9%</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <span className="text-xs font-medium">Format</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">REST</p>
            </div>
          </div>
        </div>
      </div>

      {/* Swagger Container */}
      <div className="swagger-container max-w-7xl mx-auto py-8 px-6">
        <SwaggerUI
          url="/openapi.json"
          docExpansion="list"
          defaultModelsExpandDepth={1}
          defaultModelExpandDepth={1}
        />
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .swagger-ui .topbar {
          display: none;
        }
        .swagger-ui .info {
          margin: 30px 0;
        }
        .swagger-ui .info .title {
          font-size: 2rem;
          color: #1f2937;
        }
        .swagger-ui .scheme-container {
          background: transparent;
          box-shadow: none;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
        }
        .swagger-ui .opblock.opblock-get {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
        }
        .swagger-ui .opblock.opblock-post {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.05);
        }
        .swagger-ui .opblock-tag {
          font-size: 1.5rem;
          color: #1f2937;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        .swagger-ui .opblock-summary {
          border-radius: 8px;
        }
        .swagger-ui .btn.authorize {
          background: #4f46e5;
          border-color: #4f46e5;
        }
        .swagger-ui .btn.execute {
          background: #10b981;
          border-color: #10b981;
        }
      `}</style>
    </div>
  );
}
