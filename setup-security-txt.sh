#!/bin/bash

# setup-security-txt.sh
# ---------------------
# Security Standards: RFC 9116 compliance.
# Standardized security researcher contact.

echo "🔒 Setting up security.txt (RFC 9116)..."

mkdir -p public/.well-known

# Calculate expiry date (1 year from now)
EXPIRY_DATE=$(date -d "+1 year" -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -v+1y +"%Y-%m-%dT%H:%M:%SZ")

cat > public/.well-known/security.txt << EOF
# Our security address
Contact: mailto:security@cekkirim.com
Contact: https://cekkirim.com/security/report

# Security policy
Expires: $EXPIRY_DATE
Preferred-Languages: id, en
Policy: https://cekkirim.com/security/bug-bounty

# Acknowledgments
Acknowledgments: https://cekkirim.com/security/hall-of-fame

# Encryption key for secure disclosure
# Encryption: https://cekkirim.com/security/pgp-key.txt

# Canonical URL
Canonical: https://cekkirim.com/.well-known/security.txt
EOF

echo "✅ security.txt created at public/.well-known/security.txt"
echo "📄 Expires: $EXPIRY_DATE"
echo "👉 Accessible at: https://cekkirim.com/.well-known/security.txt"
