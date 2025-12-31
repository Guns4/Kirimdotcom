#!/bin/bash

# ==========================================
# DIVISI 2 MARKETPLACE - COMPREHENSIVE TEST
# Test all features end-to-end
# ==========================================

# Configuration
API_URL="${API_URL:-http://localhost:3000/api}"
ADMIN_SECRET="${ADMIN_SECRET:-rahasia_bos_besar_123}"
CRON_SECRET="${CRON_SECRET:-your-cron-secret}"
USER_ID="${USER_ID:-REPLACE_WITH_ACTUAL_UUID}"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "🚀 DIVISI 2 MARKETPLACE - STRESS TEST"
echo "========================================"
echo ""
echo "API URL: $API_URL"
echo "User ID: $USER_ID"
echo ""

# ==========================================
# TEST 1: Product Catalog API
# ==========================================
echo -e "${YELLOW}[TEST 1]${NC} Testing Product Catalog API..."
response=$(curl -s -w "%{http_code}" -o /tmp/test1.json "$API_URL/marketplace/products")
http_code="${response: -3}"

if [ "$http_code" == "200" ]; then
    product_count=$(cat /tmp/test1.json | grep -o '"id"' | wc -l)
    echo -e "${GREEN}✅ PASSED${NC} - Found $product_count products"
else
    echo -e "${RED}❌ FAILED${NC} - HTTP $http_code"
    cat /tmp/test1.json
fi
echo ""

# ==========================================
# TEST 2: Admin - Create Product
# ==========================================
echo -e "${YELLOW}[TEST 2]${NC} Testing Admin Product Creation..."
response=$(curl -s -w "%{http_code}" -o /tmp/test2.json -X POST "$API_URL/admin/product/manage" \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -d '{
    "sku": "TEST-LAKBAN-FINAL",
    "name": "Lakban Test Final (Automated Test)",
    "type": "PHYSICAL",
    "category": "PACKING",
    "category_name": "Packing Supplies",
    "price_base": 8000,
    "price_sell": 12000,
    "stock": 100,
    "description": "Product created by automated test script",
    "min_order": 1,
    "max_order": 100,
    "is_active": true,
    "is_featured": false
  }')
http_code="${response: -3}"

if [ "$http_code" == "200" ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Product created successfully"
    PRODUCT_ID=$(cat /tmp/test2.json | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    echo "   Product ID: $PRODUCT_ID"
else
    echo -e "${RED}❌ FAILED${NC} - HTTP $http_code"
    cat /tmp/test2.json
fi
echo ""

# ==========================================
# TEST 3: Admin - Unauthorized Access
# ==========================================
echo -e "${YELLOW}[TEST 3]${NC} Testing Admin Security (should fail)..."
response=$(curl -s -w "%{http_code}" -o /tmp/test3.json -X POST "$API_URL/admin/product/manage" \
  -H "Content-Type: application/json" \
  -d '{"sku":"HACK-ATTEMPT","name":"Test"}')
http_code="${response: -3}"

if [ "$http_code" == "403" ] || [ "$http_code" == "401" ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Unauthorized request blocked"
else
    echo -e "${RED}❌ FAILED${NC} - Security bypass detected! HTTP $http_code"
fi
echo ""

# ==========================================
# TEST 4: Checkout Validation (Invalid Input)
# ==========================================
echo -e "${YELLOW}[TEST 4]${NC} Testing Checkout Validation (negative qty)..."
response=$(curl -s -w "%{http_code}" -o /tmp/test4.json -X POST "$API_URL/marketplace/checkout" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "invalid-uuid",
    "items": [{"product_id": "test", "qty": -100}],
    "payment_method": "WALLET"
  }')
http_code="${response: -3}"

if [ "$http_code" == "400" ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Invalid input rejected"
else
    echo -e "${RED}❌ FAILED${NC} - Validation not working! HTTP $http_code"
fi
echo ""

# ==========================================
# TEST 5: Admin - Get Products
# ==========================================
echo -e "${YELLOW}[TEST 5]${NC} Testing Admin Product List..."
response=$(curl -s -w "%{http_code}" -o /tmp/test5.json "$API_URL/admin/product/manage?include_inactive=true" \
  -H "x-admin-secret: $ADMIN_SECRET")
http_code="${response: -3}"

if [ "$http_code" == "200" ]; then
    total_products=$(cat /tmp/test5.json | grep -o '"id"' | wc -l)
    echo -e "${GREEN}✅ PASSED${NC} - Retrieved $total_products products"
else
    echo -e "${RED}❌ FAILED${NC} - HTTP $http_code"
fi
echo ""

# ==========================================
# TEST 6: SMM Sync Status (Admin)
# ==========================================
echo -e "${YELLOW}[TEST 6]${NC} Testing SMM Sync Status..."
response=$(curl -s -w "%{http_code}" -o /tmp/test6.json "$API_URL/admin/smm/sync-services" \
  -H "x-admin-secret: $ADMIN_SECRET")
http_code="${response: -3}"

if [ "$http_code" == "200" ]; then
    echo -e "${GREEN}✅ PASSED${NC} - SMM sync status retrieved"
    cat /tmp/test6.json | grep -o '"total_smm_services":[0-9]*'
else
    echo -e "${RED}❌ FAILED${NC} - HTTP $http_code"
fi
echo ""

# ==========================================
# TEST 7: Cron Job - SMM Monitor (Security)
# ==========================================
echo -e "${YELLOW}[TEST 7]${NC} Testing Cron Job Security..."
response=$(curl -s -w "%{http_code}" -o /tmp/test7.json -X POST "$API_URL/cron/smm-monitor")
http_code="${response: -3}"

if [ "$http_code" == "401" ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Unauthorized cron access blocked"
else
    echo -e "${RED}❌ FAILED${NC} - Cron job not secured! HTTP $http_code"
fi
echo ""

# ==========================================
# TEST 8: Cron Job - With Auth
# ==========================================
echo -e "${YELLOW}[TEST 8]${NC} Testing Cron Job with Authorization..."
response=$(curl -s -w "%{http_code}" -o /tmp/test8.json -X POST "$API_URL/cron/smm-monitor" \
  -H "Authorization: Bearer $CRON_SECRET")
http_code="${response: -3}"

if [ "$http_code" == "200" ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Cron job executed"
    cat /tmp/test8.json | grep -o '"total_checked":[0-9]*'
else
    echo -e "${RED}❌ FAILED${NC} - HTTP $http_code"
    cat /tmp/test8.json
fi
echo ""

# ==========================================
# TEST 9: Admin - Update Product
# ==========================================
echo -e "${YELLOW}[TEST 9]${NC} Testing Product Update..."
response=$(curl -s -w "%{http_code}" -o /tmp/test9.json -X PATCH "$API_URL/admin/product/manage" \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -d '{
    "sku": "TEST-LAKBAN-FINAL",
    "updates": {
      "price_sell": 15000,
      "stock": 50,
      "is_featured": true
    }
  }')
http_code="${response: -3}"

if [ "$http_code" == "200" ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Product updated successfully"
else
    echo -e "${RED}❌ FAILED${NC} - HTTP $http_code"
    cat /tmp/test9.json
fi
echo ""

# ==========================================
# TEST 10: Admin - Delete Product (Soft)
# ==========================================
echo -e "${YELLOW}[TEST 10]${NC} Testing Product Soft Delete..."
response=$(curl -s -w "%{http_code}" -o /tmp/test10.json -X DELETE "$API_URL/admin/product/manage?sku=TEST-LAKBAN-FINAL" \
  -H "x-admin-secret: $ADMIN_SECRET")
http_code="${response: -3}"

if [ "$http_code" == "200" ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Product deactivated (soft delete)"
else
    echo -e "${RED}❌ FAILED${NC} - HTTP $http_code"
fi
echo ""

# ==========================================
# SUMMARY
# ==========================================
echo "========================================"
echo "📊 TEST SUMMARY"
echo "========================================"
echo ""
echo "✅ All core features tested"
echo ""
echo "Next Steps:"
echo "1. Create a wallet for testing checkout:"
echo "   INSERT INTO wallets (user_id, balance) VALUES ('$USER_ID', 100000);"
echo ""
echo "2. Test full checkout flow with real product ID"
echo ""
echo "3. Set up cron jobs in Vercel or external service"
echo ""
echo "4. Deploy to production!"
echo ""
echo "========================================"
echo "✅ DIVISI 2 MARKETPLACE - TESTS COMPLETE"
echo "========================================"

# Cleanup
rm -f /tmp/test*.json
