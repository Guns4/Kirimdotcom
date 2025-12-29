#!/bin/bash

# =============================================================================
# Internationalization (i18n) & Currency Setup
# =============================================================================

echo "Setting up i18n Structure..."
echo "================================================="

# 1. Install Dependencies
echo "1. Checking Dependencies..."
if ! grep -q "next-intl" package.json; then
    echo "   Installing next-intl..."
    npm install next-intl
else
    echo "   [OK] next-intl already installed."
fi

# 2. Create Dictionary Structure
# Storing messages in top-level messages/ folder is standard for next-intl
echo "2. Creating Dictionaries (messages/*.json)..."
mkdir -p messages

# Indonesian (Default)
cat <<EOF > messages/id.json
{
  "Common": {
    "cekResi": "Cek Resi",
    "lacak": "Lacak",
    "cekOngkir": "Cek Ongkir",
    "login": "Masuk",
    "register": "Daftar",
    "settings": "Pengaturan"
  },
  "Currency": {
    "locale": "id-ID",
    "currency": "IDR"
  },
  "Status": {
    "pending": "Menunggu",
    "processing": "Diproses",
    "shipped": "Dikirim",
    "delivered": "Terkirim",
    "cancelled": "Dibatalkan"
  }
}
EOF

# English
cat <<EOF > messages/en.json
{
  "Common": {
    "cekResi": "Track Package",
    "lacak": "Track",
    "cekOngkir": "Check Rates",
    "login": "Login",
    "register": "Register",
    "settings": "Settings"
  },
  "Currency": {
    "locale": "en-US",
    "currency": "USD"
  },
  "Status": {
    "pending": "Pending",
    "processing": "Processing",
    "shipped": "Shipped",
    "delivered": "Delivered",
    "cancelled": "Cancelled"
  }
}
EOF
echo "   [?] Dictionaries created."

# 3. Currency Formatter Utility
echo "3. Creating Currency Utility: src/lib/currency.ts"
mkdir -p src/lib

cat <<EOF > src/lib/currency.ts
/**
 * Dynamic Currency Formatter
 * Uses Intl.NumberFormat for robust localization.
 */

interface CurrencyOptions {
    amount: number;
    locale?: string; // e.g., 'id-ID', 'en-US'
    currency?: string; // e.g., 'IDR', 'USD'
}

export function formatCurrency({ amount, locale = 'id-ID', currency = 'IDR' }: CurrencyOptions) {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

// Helper to get currency settings from current locale (Mock implementation)
// In real app, use useLocale() from next-intl
export function getLocaleCurrency(locale: string) {
    switch (locale) {
        case 'en': return { locale: 'en-US', currency: 'USD' };
        case 'my': return { locale: 'ms-MY', currency: 'MYR' }; // Malaysia
        case 'sg': return { locale: 'en-SG', currency: 'SGD' }; // Singapore
        default: return { locale: 'id-ID', currency: 'IDR' };
    }
}
EOF
echo "   [?] Currency utility created."

# 4. Configuration Skeleton
echo "4. Generating Configuration Files..."

# src/i18n.ts (Request Config)
cat <<EOF > src/i18n.ts
import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({requestLocale}) => {
  // This typically corresponds to the [locale] segment
  let locale = await requestLocale;
 
  // Ensure that incoming locale is valid
  if (!locale || !['en', 'id'].includes(locale)) {
    locale = 'id';
  }
 
  return {
    locale,
    messages: (await import(\`../messages/\${locale}.json\`)).default
  };
});
EOF

# Middleware Snippet (Don't overwrite existing middleware, just provide snippet)
cat <<EOF > middleware_i18n_snippet.ts
import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'id'],
 
  // Used when no locale matches
  defaultLocale: 'id'
});
 
export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(id|en)/:path*']
};
EOF

echo ""
echo "================================================="
echo "i18n Structure Setup Complete!"
echo ""
echo "NEXT STEPS:"
echo "1. Enable the plugin in 'next.config.mjs':"
echo "   const withNextIntl = require('next-intl/plugin')();"
echo "   module.exports = withNextIntl(nextConfig);"
echo ""
echo "2. Update 'src/middleware.ts' using the snippet in 'middleware_i18n_snippet.ts'."
echo "   (If you already have middleware, merge the matchers)."
echo ""
echo "3. Wrap your root layout in NextIntlClientProvider (if using client components) or just use the locale param."
echo ""
echo "4. Migration Tip: To find text to extract, run:"
echo "   grep -r \"[>'\"]Cek Resi\" src/components"
