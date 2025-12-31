#!/bin/bash

# restore-drill.sh
# ----------------
# Weekly automated backup restore verification.
# Ensures backups are healthy and restorable.

set -e

BACKUP_DIR="/path/to/backups"
CONTAINER_NAME="restore_drill_test"
POSTGRES_IMAGE="postgres:15"
TEST_DB="test_restore"

echo "🔍 Starting Restore Drill..."
date

# Step 1: Find latest backup
LATEST_BACKUP=$(ls -t $BACKUP_DIR/*.sql 2>/dev/null | head -n1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ ERROR: No backup files found in $BACKUP_DIR"
    # TODO: Send Telegram alert
    exit 1
fi

echo "✅ Found backup: $LATEST_BACKUP"

# Step 2: Spin up temporary PostgreSQL container
echo "🐳 Starting temporary PostgreSQL container..."
docker run -d \
    --name $CONTAINER_NAME \
    -e POSTGRES_PASSWORD=testpass \
    -e POSTGRES_DB=$TEST_DB \
    $POSTGRES_IMAGE

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to initialize..."
sleep 10

# Step 3: Attempt restore
echo "📥 Attempting restore..."
if docker exec -i $CONTAINER_NAME psql -U postgres -d $TEST_DB < $LATEST_BACKUP; then
    echo "✅ Restore command executed successfully"
else
    echo "❌ CRITICAL: Restore failed!"
    docker rm -f $CONTAINER_NAME
    # TODO: Send Telegram alert: "BACKUP CORRUPT! FIX IMMEDIATELY!"
    exit 1
fi

# Step 4: Verify data integrity
echo "🔎 Verifying data integrity..."
USER_COUNT=$(docker exec $CONTAINER_NAME psql -U postgres -d $TEST_DB -t -c "SELECT count(*) FROM users;" 2>/dev/null | xargs)

if [ -z "$USER_COUNT" ] || [ "$USER_COUNT" -eq 0 ]; then
    echo "❌ CRITICAL: Data verification failed. User count: $USER_COUNT"
    docker rm -f $CONTAINER_NAME
    # TODO: Send alert
    exit 1
fi

echo "✅ Data verified: $USER_COUNT users found in restored database"

# Step 5: Cleanup
echo "🧹 Cleaning up..."
docker rm -f $CONTAINER_NAME

echo "✅ DRILL COMPLETE: Backup is HEALTHY and restorable"
echo "📊 Backup file: $LATEST_BACKUP"
echo "📊 Verified records: $USER_COUNT users"

exit 0
