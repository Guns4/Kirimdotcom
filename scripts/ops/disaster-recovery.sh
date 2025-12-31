#!/bin/bash

# CONFIGURATION
DB_URL="postgres://user:pass@db.supabase.co:5432/postgres"
BACKUP_DIR="/tmp/db_backups"
GPG_RECIPIENT="admin@cekkirim.com"
S3_BUCKET="s3://cekkirim-bunker-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="backup_${TIMESTAMP}.sql"

mkdir -p $BACKUP_DIR

echo "[${TIMESTAMP}] 🚀 Starting Disaster Recovery Backup..."

# 1. Dump Database
echo "1️⃣  Dumping Database..."
pg_dump "$DB_URL" > "${BACKUP_DIR}/${FILENAME}"

if [ $? -ne 0 ]; then
  echo "❌ Dump Failed!"
  exit 1
fi

# 2. Encrypt (GPG)
echo "2️⃣  Encrypting..."
gpg --batch --yes --encrypt --recipient "$GPG_RECIPIENT" --output "${BACKUP_DIR}/${FILENAME}.gpg" "${BACKUP_DIR}/${FILENAME}"

# 3. Upload to Immutable Storage (AWS S3 Object Lock)
# Requires 'aws-cli' installed and configured
echo "3️⃣  Uploading to Bunker (WORM Storage)..."
aws s3 cp "${BACKUP_DIR}/${FILENAME}.gpg" "${S3_BUCKET}/${FILENAME}.gpg" --storage-class DEEP_ARCHIVE

# Verify Upload
if [ $? -eq 0 ]; then
  echo "✅ Backup Securely Stored in Bunker: ${FILENAME}.gpg"
  
  # 4. Local Cleanup (Shred for security)
  shred -u "${BACKUP_DIR}/${FILENAME}"
  rm "${BACKUP_DIR}/${FILENAME}.gpg"
else
  echo "❌ Upload Failed!"
fi
