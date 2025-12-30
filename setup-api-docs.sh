#!/bin/bash

# =============================================================================
# API Documentation Setup (Swagger UI)
# =============================================================================

echo "Initializing API Documentation..."
echo "================================================="

# 1. Install Dependencies
echo "1. Installing swagger-ui-react..."
# Check if installed to avoid redundant installs in script runs (optional but good)
if ! grep -q "swagger-ui-react" package.json; then
    npm install swagger-ui-react
    npm install --save-dev @types/swagger-ui-react
else
    echo "   [OK] swagger-ui-react already installed."
fi

# 2. Create OpenAPI Specification
echo "2. Generating OpenAPI Spec: src/lib/swagger/openapi.json"
mkdir -p src/lib/swagger

cat <<EOF > src/lib/swagger/openapi.json
{
  "openapi": "3.0.0",
  "info": {
    "title": "CekKirim API",
    "version": "1.0.0",
    "description": "API Integration for Logistics Tracking and Cost Calculation. Use your Secret Key as Bearer Token."
  },
  "servers": [
    {
      "url": "https://cekkirim.com/api/v1",
      "description": "Production Server"
    },
    {
      "url": "http://localhost:3000/api/v1",
      "description": "Local Development"
    }
  ],
  "components": {
    "securitySchemes": {
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "API Key"
      }
    }
  },
  "security": [
    {
      "bearerAuth": []
    }
  ],
  "paths": {
    "/track": {
      "post": {
        "summary": "Track a Shipment",
        "tags": ["Tracking"],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "courier": {
                    "type": "string",
                    "example": "jne",
                    "description": "Courier code (jne, jnt, sicepat, etc)"
                  },
                  "waybill": {
                    "type": "string",
                    "example": "JP1234567890",
                    "description": "Receipt number (No. Resi)"
                  }
                },
                "required": ["courier", "waybill"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successful Response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "data": { 
                      "type": "object",
                      "properties": {
                        "status": { "type": "string", "example": "DELIVERED" },
                        "history": { "type": "array", "items": { "type": "object" } }
                      }
                    }
                  }
                }
              }
            }
          },
          "401": { "description": "Unauthorized (Invalid or Missing API Key)" }
        }
      }
    },
    "/cost": {
      "post": {
        "summary": "Check Shipping Cost",
        "tags": ["Cost"],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "origin": {
                    "type": "string",
                    "example": "CGK10000",
                    "description": "Origin District/City ID"
                  },
                  "destination": {
                    "type": "string",
                    "example": "SUB10000",
                    "description": "Destination District/City ID"
                  },
                  "weight": {
                    "type": "integer",
                    "example": 1000,
                    "description": "Weight in grams"
                  }
                },
                "required": ["origin", "destination", "weight"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "List of shipping costs",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "results": { 
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "code": { "type": "string", "example": "jne" },
                          "name": { "type": "string", "example": "JNE Express" },
                          "costs": { "type": "array" }
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
    }
  }
}
EOF

# 3. Create Documentation Page
echo "3. Creating Page: src/app/docs/page.tsx"
mkdir -p src/app/docs

cat <<EOF > src/app/docs/page.tsx
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
EOF
echo "   [?] Documentation Page created."

echo ""
echo "================================================="
echo "API Docs Setup Complete!"
echo "1. Run 'npm install' if you haven't recently."
echo "2. Visit '/docs' to view the interactive API playground."
echo "3. Edit 'src/lib/swagger/openapi.json' to add more endpoints."
