#!/bin/bash

# =============================================================================
# Setup API Documentation (Phase 120)
# Developer Experience (DX) & Swagger UI
# =============================================================================

echo "Setting up API Documentation..."
echo "================================================="
echo ""

# 0. Install Dependencies
echo "0. Installing Swagger UI React..."
echo "   > npm install swagger-ui-react"
echo "   (Run this manually if script fails)"
echo ""

# 1. OpenAPI Spec
echo "1. Creating Spec: public/openapi.json"

cat <<EOF > public/openapi.json
{
  "openapi": "3.0.0",
  "info": {
    "title": "CekKirim API",
    "description": "Enterprise-grade Logistics API for tracking and shipping cost calculation.",
    "version": "1.0.0",
    "contact": {
      "email": "dev@cekkirim.com"
    }
  },
  "servers": [
    {
      "url": "https://cekkirim.com",
      "description": "Production Server"
    },
    {
      "url": "http://localhost:3000",
      "description": "Local Development"
    }
  ],
  "components": {
    "securitySchemes": {
      "InitialKey": {
        "type": "http",
        "scheme": "bearer",
        "description": "Enter your API Key (e.g. ck_live_...)"
      }
    }
  },
  "security": [
    {
      "InitialKey": []
    }
  ],
  "paths": {
    "/api/v1/track": {
      "get": {
        "summary": "Track Shipment",
        "description": "Get real-time tracking information for a waybill (resi).",
        "tags": ["Tracking"],
        "parameters": [
          {
            "name": "waybill",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string",
              "example": "JNE123456789"
            }
          },
          {
            "name": "courier",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string",
              "enum": ["jne", "jnt", "sicepat", "pos"],
              "example": "jne"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean" },
                    "data": {
                      "type": "object",
                      "properties": {
                        "summary": { "type": "object", "properties": { "status": { "type": "string" } } },
                        "history": { "type": "array", "items": { "type": "object" } }
                      }
                    }
                  }
                }
              }
            }
          },
          "401": { "description": "Unauthorized / Invalid API Key" },
          "402": { "description": "Insufficient Balance" }
        }
      }
    },
    "/api/v1/cost": {
      "post": {
        "summary": "Check Shipping Cost",
        "description": "Calculate shipping rates between two locations.",
        "tags": ["Cost"],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "origin": { "type": "string", "example": "Jakarta" },
                  "destination": { "type": "string", "example": "Bandung" },
                  "weight": { "type": "integer", "example": 1000 }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Rates found",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "results": { "type": "array", "items": { "type": "object" } }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
EOF
echo "   [✓] OpenAPI Spec created."
echo ""

# 2. Documentation Page
echo "2. Creating Page: src/app/docs/api/page.tsx"
mkdir -p src/app/docs/api

cat <<EOF > src/app/docs/api/page.tsx
'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Dynamic import to avoid SSR issues with Swagger UI
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
    // Force mount to prevent hydration mismatch
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return <div className="p-10 text-center">Loading Docs...</div>;

    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            <div className="border-b bg-gray-50 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/developer" className="text-gray-500 hover:text-indigo-600 transition flex items-center gap-2 text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                    <div className="h-6 w-px bg-gray-300 mx-2"></div>
                    <h1 className="font-bold text-gray-800">API Reference</h1>
                </div>
                <div className="text-sm text-gray-500">
                    v1.0.0
                </div>
            </div>

            {/* Swagger Container */}
            <div className="swagger-container max-w-7xl mx-auto py-8">
                <SwaggerUI url="/openapi.json" />
            </div>

            <style jsx global>{\`
                .swagger-ui .topbar { display: none }
                .swagger-ui .info { margin: 20px 0 }
                .swagger-ui .scheme-container { background: transparent; box-shadow: none; }
            \`}</style>
        </div>
    );
}
EOF
echo "   [✓] Docs Page created."
echo ""

# Instructions
echo "================================================="
echo "Setup Complete!"
echo ""
echo "Next Steps:"
echo "1. Run: npm install swagger-ui-react"
echo "2. Visit: /docs/api to see your new Developer Portal."
