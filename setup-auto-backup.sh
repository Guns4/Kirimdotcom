#!/bin/bash

# =============================================================================
# Automated Database Backup Setup (GitHub Actions -> S3)
# =============================================================================

echo "Setting up Automated DB Backup Workflow..."
echo "================================================="

# 1. Ensure Directory Exists
mkdir -p .github/workflows

# 2. Create Workflow File
echo "1. Creating Workflow: .github/workflows/db-backup.yml"
cat <<EOF > .github/workflows/db-backup.yml
name: Database Backup

on:
  schedule:
    # Run at 03:00 AM UTC daily
    - cron: '0 3 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  backup:
    name: Dump and Upload
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Install PostgreSQL Tools
        run: |
          sudo apt-get update
          sudo apt-get install -y postgresql-client

      - name: Create Database Dump
        env:
          DATABASE_URL: \${{ secrets.DATABASE_URL }}
        run: |
          echo "Starting backup..."
          TIMESTAMP=\$(date +%Y%m%d_%H%M%S)
          FILENAME="backup_\$TIMESTAMP.sql.gz"
          
          # Run pg_dump, pipelined to gzip
          pg_dump "\$DATABASE_URL" | gzip > "\$FILENAME"
          
          echo "Backup created: \$FILENAME"
          echo "BACKUP_FILENAME=\$FILENAME" >> \$GITHUB_ENV

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: \${{ secrets.AWS_REGION }}

      - name: Upload to S3
        run: |
          echo "Uploading to S3..."
          aws s3 cp "\$BACKUP_FILENAME" "s3://\${{ secrets.AWS_BUCKET_NAME }}/db-backups/\$BACKUP_FILENAME"
          echo "Upload complete."

      - name: Backup Cleanup (Optional: Retention Policy)
        run: |
          # Example: Delete backups older than 30 days
          # aws s3 ls "s3://\${{ secrets.AWS_BUCKET_NAME }}/db-backups/" ... (requires complex logic)
          echo "Retention policy handled by S3 Lifecycle Rules recommended."
EOF

echo "   [?] Workflow created."

echo ""
echo "================================================="
echo "Backup Setup Complete!"
echo ""
echo "CRITICAL NEXT STEPS:"
echo "1. Go to your GitHub Repository Settings > Secrets and Variables > Actions."
echo "2. Add the following Repository Secrets:"
echo "   - DATABASE_URL          (Your Supabase Connection String)"
echo "   - AWS_ACCESS_KEY_ID     (IAM User with S3 Write access)"
echo "   - AWS_SECRET_ACCESS_KEY"
echo "   - AWS_REGION            (e.g., ap-southeast-1)"
echo "   - AWS_BUCKET_NAME       (Target Bucket)"
echo ""
echo "3. Push the new workflow file to main branch."
