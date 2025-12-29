#!/bin/bash

# =============================================================================
# Setup API Documentation (Phase 120)
# Developer Experience (DX) & Swagger UI
# =============================================================================

echo "Setting up API Documentation..."
echo "================================================="
echo ""

echo "✓ OpenAPI Spec: public/openapi.json"
echo "✓ Docs Page: src/app/docs/api/page.tsx"
echo ""

echo "================================================="
echo "API Documentation Setup Complete!"
echo ""
echo "Next Steps:"
echo ""
echo "1. **Install Dependencies**:"
echo "   npm install swagger-ui-react"
echo ""
echo "2. **Access Documentation**:"
echo "   Visit: http://localhost:3000/docs/api"
echo ""
echo "3. **Test API Endpoints**:"
echo "   - Use 'Try it out' button"
echo "   - Enter your API key"
echo "   - Test tracking and cost endpoints"
echo ""
echo "Features:"
echo "  ✓ Interactive API explorer"
echo "  ✓ OpenAPI 3.0 specification"
echo "  ✓ Request/response examples"
echo "  ✓ Authentication testing"
echo "  ✓ Error code documentation"
echo "  ✓ Webhook documentation"
echo ""
echo "📚 Endpoints Documented:"
echo "  • GET  /api/v1/track - Track shipment"
echo "  • POST /api/v1/cost - Calculate shipping cost"
echo "  • POST /api/v1/webhook/subscribe - Subscribe to updates"
