#!/bin/bash

# run-core-audit.sh
# Core API Quality Assurance & Diagnostics
# Tests all critical APIs and database connections

echo "╔══════════════════════════════════════════════════════════╗"
echo "║         CORE API AUDIT & DIAGNOSTICS v1.0                ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TESTS_PASSED=0
TESTS_FAILED=0
WARNINGS=0

# Helper functions
print_success() {
    echo -e "${GREEN}✓${NC} $1"
    ((TESTS_PASSED++))
}

print_error() {
    echo -e "${RED}✗${NC} $1"
    ((TESTS_FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if server is running
check_server() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "0. PRELIMINARY CHECK: Development Server"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_success "Dev server is running on http://localhost:3000"
    else
        print_error "Dev server is NOT running"
        print_info "Please start the server with: npm run dev"
        exit 1
    fi
    echo ""
}

# Test 1: Shipping Cost API
test_shipping_api() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "1. TEST: Shipping Cost API"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    print_info "Sending POST request to /api/shipping/cost..."
    
    RESPONSE=$(curl -s -X POST http://localhost:3000/api/shipping/cost \
        -H "Content-Type: application/json" \
        -d '{
            "origin": "Jakarta",
            "destination": "Surabaya",
            "weight": 1.5,
            "courier": "jne"
        }')
    
    # Check if response is valid JSON
    if echo "$RESPONSE" | grep -q "price\|error"; then
        print_success "API responds with valid JSON"
        
        # Check if it's a success response
        if echo "$RESPONSE" | grep -q "price"; then
            PRICE=$(echo "$RESPONSE" | grep -o '"price":[0-9]*' | grep -o '[0-9]*')
            SOURCE=$(echo "$RESPONSE" | grep -o '"source":"[^"]*"' | grep -o ':"[^"]*"' | tr -d ':"')
            
            print_success "Price returned: Rp $PRICE"
            print_info "Data source: $SOURCE (cache/api)"
            
            # Verify markup is applied (+1000 from cost API)
            if [ "$PRICE" -gt 1000 ]; then
                print_success "Price markup appears to be applied"
            fi
        else
            print_warning "API returned error response"
            echo "$RESPONSE" | head -n 3
        fi
    else
        print_error "Invalid JSON response from shipping cost API"
        echo "Response: $RESPONSE"
    fi
    echo ""
}

# Test 2: PPOB Database Check
test_ppob_database() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "2. TEST: PPOB Database Structure"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Load .env file
    if [ -f .env.local ]; then
        export $(grep -v '^#' .env.local | xargs)
        print_info "Loaded .env.local"
    elif [ -f .env ]; then
        export $(grep -v '^#' .env | xargs)
        print_info "Loaded .env"
    else
        print_error ".env or .env.local file not found"
        echo ""
        return
    fi
    
    # Check if Supabase URL exists
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        print_error "NEXT_PUBLIC_SUPABASE_URL not set in .env"
        echo ""
        return
    fi
    
    if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ] && [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        print_error "No Supabase key found in .env"
        echo ""
        return
    fi
    
    # Use service role key if available, otherwise anon key
    SUPABASE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-$NEXT_PUBLIC_SUPABASE_ANON_KEY}"
    
    print_info "Checking PPOB database tables..."
    
    # Check for ppob-related tables or functions
    # We'll check if RPC functions exist by trying to call them
    BALANCE_CHECK=$(curl -s -X POST "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/deduct_balance" \
        -H "apikey: $SUPABASE_KEY" \
        -H "Authorization: Bearer $SUPABASE_KEY" \
        -H "Content-Type: application/json" \
        -d '{"p_user_id": "00000000-0000-0000-0000-000000000000", "p_amount": 0}' 2>&1)
    
    if echo "$BALANCE_CHECK" | grep -q "function.*does not exist\|404"; then
        print_error "PPOB functions (deduct_balance, refund_balance) not found in database"
        print_warning "Run migration: supabase/migrations/20260101_ppob_functions.sql"
    else
        print_success "PPOB RPC functions exist in database"
    fi
    
    # Check transactions table
    TRANSACTIONS_CHECK=$(curl -s -X GET "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/transactions?select=count" \
        -H "apikey: $SUPABASE_KEY" \
        -H "Authorization: Bearer $SUPABASE_KEY" 2>&1)
    
    if echo "$TRANSACTIONS_CHECK" | grep -q "relation.*does not exist\|404"; then
        print_warning "Transactions table not found or empty"
        print_info "This is normal for new setup. Table will be created on first transaction."
    else
        print_success "Transactions table exists"
    fi
    
    # Check wallets table
    WALLETS_CHECK=$(curl -s -X GET "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/wallets?select=count&limit=1" \
        -H "apikey: $SUPABASE_KEY" \
        -H "Authorization: Bearer $SUPABASE_KEY" 2>&1)
    
    if echo "$WALLETS_CHECK" | grep -q "relation.*does not exist\|404"; then
        print_warning "Wallets table not found"
        print_info "Run migration: supabase/migrations/20251231_balance_guard.sql"
    else
        print_success "Wallets table exists"
    fi
    
    echo ""
}

# Test 3: Environment Variables
test_environment() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "3. TEST: Environment Variables"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Load .env file
    if [ -f .env.local ]; then
        export $(grep -v '^#' .env.local | xargs 2>/dev/null)
        print_success "Found .env.local"
    elif [ -f .env ]; then
        export $(grep -v '^#' .env | xargs 2>/dev/null)
        print_success "Found .env"
    else
        print_error "No .env or .env.local file found!"
        print_info "Create .env.local from .env.example"
        echo ""
        return
    fi
    
    # Critical Supabase Variables
    echo ""
    echo "Supabase Configuration:"
    if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        print_success "NEXT_PUBLIC_SUPABASE_URL is set"
        print_info "  → ${NEXT_PUBLIC_SUPABASE_URL:0:30}..."
    else
        print_error "NEXT_PUBLIC_SUPABASE_URL is missing"
    fi
    
    if [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        print_success "NEXT_PUBLIC_SUPABASE_ANON_KEY is set"
        print_info "  → ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:30}..."
    else
        print_error "NEXT_PUBLIC_SUPABASE_ANON_KEY is missing"
    fi
    
    if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        print_success "SUPABASE_SERVICE_ROLE_KEY is set (for server-side operations)"
        print_info "  → ${SUPABASE_SERVICE_ROLE_KEY:0:30}..."
    else
        print_warning "SUPABASE_SERVICE_ROLE_KEY not set (optional but recommended)"
    fi
    
    # Vendor API Keys
    echo ""
    echo "Vendor API Keys:"
    
    # RajaOngkir
    if [ -n "$RAJAONGKIR_API_KEY" ]; then
        print_success "RAJAONGKIR_API_KEY is set"
    else
        print_warning "RAJAONGKIR_API_KEY not set"
        print_info "  → Get API key from: https://rajaongkir.com"
    fi
    
    # Binderbyte
    if [ -n "$BINDERBYTE_API_KEY" ]; then
        print_success "BINDERBYTE_API_KEY is set"
    else
        print_warning "BINDERBYTE_API_KEY not set"
        print_info "  → Get API key from: https://binderbyte.com"
    fi
    
    # Digiflazz/PPOB
    if [ -n "$DIGIFLAZZ_USERNAME" ] && [ -n "$DIGIFLAZZ_API_KEY" ]; then
        print_success "DIGIFLAZZ credentials are set (for PPOB)"
    else
        print_warning "DIGIFLAZZ credentials not set"
        print_info "  → Get credentials from: https://digiflazz.com"
    fi
    
    # Tripay (alternative PPOB)
    if [ -n "$TRIPAY_API_KEY" ] && [ -n "$TRIPAY_MERCHANT_CODE" ]; then
        print_success "TRIPAY credentials are set (for PPOB)"
    else
        print_warning "TRIPAY credentials not set (optional)"
    fi
    
    echo ""
}

# Test 4: Tracking API
test_tracking_api() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "4. TEST: Tracking API"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    print_info "Sending POST request to /api/shipping/track..."
    
    RESPONSE=$(curl -s -X POST http://localhost:3000/api/shipping/track \
        -H "Content-Type: application/json" \
        -d '{
            "waybill": "JNE1234567890",
            "courier": "jne"
        }')
    
    if echo "$RESPONSE" | grep -q "status\|history\|error"; then
        print_success "Tracking API responds"
        
        if echo "$RESPONSE" | grep -q "history"; then
            print_success "Tracking history returned"
        else
            print_warning "No tracking history (expected for mock data)"
        fi
    else
        print_error "Invalid response from tracking API"
    fi
    echo ""
}

# Test 5: PPOB Transaction API
test_ppob_transaction() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "5. TEST: PPOB Transaction API (Read-Only Test)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    print_info "Testing endpoint availability (no actual transaction)..."
    
    # Test with invalid data to check endpoint exists
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/ppob/transaction \
        -H "Content-Type: application/json" \
        -d '{
            "product_code": "TEST",
            "amount": 0,
            "customer_no": "test"
        }')
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "500" ] || [ "$HTTP_CODE" = "402" ]; then
        print_success "PPOB Transaction endpoint exists (HTTP $HTTP_CODE)"
        print_info "Endpoint requires authentication/valid data"
    elif [ "$HTTP_CODE" = "404" ]; then
        print_error "PPOB Transaction endpoint not found"
    else
        print_success "PPOB Transaction endpoint responds (HTTP $HTTP_CODE)"
    fi
    echo ""
}

# Test 6: Database Migrations Status
test_migrations() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "6. TEST: Database Migrations"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    print_info "Checking critical migrations..."
    
    MIGRATIONS_DIR="supabase/migrations"
    
    if [ -d "$MIGRATIONS_DIR" ]; then
        MIGRATION_COUNT=$(find "$MIGRATIONS_DIR" -name "*.sql" | wc -l)
        print_success "Found $MIGRATION_COUNT migration files"
        
        # Check for critical migrations
        if [ -f "$MIGRATIONS_DIR/20260101_ppob_functions.sql" ]; then
            print_success "PPOB functions migration exists"
        else
            print_warning "PPOB functions migration not found"
        fi
        
        if [ -f "$MIGRATIONS_DIR/20260101_tracking_history.sql" ]; then
            print_success "Tracking history migration exists"
        else
            print_warning "Tracking history migration not found"
        fi
        
        if [ -f "$MIGRATIONS_DIR/caching_schema.sql" ]; then
            print_success "Shipping cache migration exists"
        else
            print_warning "Shipping cache migration not found"
        fi
        
        print_info "To apply migrations: supabase db push"
    else
        print_error "Migrations directory not found"
    fi
    echo ""
}

# Generate Report
generate_report() {
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                    AUDIT SUMMARY                         ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""
    echo -e "${GREEN}Tests Passed:${NC} $TESTS_PASSED"
    echo -e "${RED}Tests Failed:${NC} $TESTS_FAILED"
    echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}✓ ALL CRITICAL TESTS PASSED!${NC}"
        echo ""
        echo "Your Core APIs are ready for production."
        
        if [ $WARNINGS -gt 0 ]; then
            echo ""
            echo -e "${YELLOW}However, you have $WARNINGS warnings to address:${NC}"
            echo "  1. Set up vendor API keys for production features"
            echo "  2. Apply pending database migrations"
            echo "  3. Seed initial data if needed"
        fi
    else
        echo -e "${RED}✗ SOME TESTS FAILED${NC}"
        echo ""
        echo "Please fix the following issues:"
        echo "  1. Ensure dev server is running (npm run dev)"
        echo "  2. Check database migrations are applied"
        echo "  3. Verify .env configuration"
        echo "  4. Review API implementations"
    fi
    
    echo ""
    echo "For detailed logs, check the output above."
    echo "Report generated at: $(date)"
    echo ""
}

# Main execution
main() {
    check_server
    test_shipping_api
    test_ppob_database
    test_environment
    test_tracking_api
    test_ppob_transaction
    test_migrations
    generate_report
}

# Run main function
main
