# Database Backup Setup Guide

This repository includes an automated database backup system using GitHub Actions.

## 🔄 Backup Schedule

- **Frequency**: Daily at 03:00 AM UTC (10:00 AM WIB)
- **Method**: PostgreSQL `pg_dump` → gzip compression → AWS S3
- **Retention**: Managed via S3 Lifecycle Rules

## 🔐 Required Secrets

Add these secrets in GitHub Repository Settings → Secrets and Variables → Actions:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `DATABASE_URL` | Supabase connection string | `postgresql://user:pass@host:5432/db` |
| `AWS_ACCESS_KEY_ID` | AWS IAM access key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_REGION` | S3 bucket region | `ap-southeast-1` |
| `AWS_BUCKET_NAME` | Target S3 bucket | `my-app-backups` |

## 📋 Setup Steps

### 1. Create S3 Bucket

```bash
aws s3 mb s3://my-app-backups --region ap-southeast-1
```

### 2. Create IAM User

Create an IAM user with this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::my-app-backups",
        "arn:aws:s3:::my-app-backups/*"
      ]
    }
  ]
}
```

### 3. Configure S3 Lifecycle Rules

In AWS Console → S3 → Bucket → Management → Lifecycle Rules:

**Rule 1: Archive Old Backups**
- Move to Glacier after 7 days
- Delete after 90 days

**Rule 2: Abort Incomplete Uploads**
- Delete incomplete multipart uploads after 1 day

### 4. Test Manual Trigger

1. Go to GitHub → Actions → Database Backup
2. Click "Run workflow"
3. Verify backup appears in S3

## 🚀 Workflow Features

- ✅ Automated daily backups
- ✅ Gzip compression (saves ~70% storage)
- ✅ Timestamped filenames
- ✅ Upload verification
- ✅ Automatic cleanup
- ✅ Failure notifications

## 📁 Backup File Naming

Format: `backup_YYYYMMDD_HHMMSS.sql.gz`

Example: `backup_20250130_030001.sql.gz`

## 🔧 Restore Instructions

```bash
# Download backup from S3
aws s3 cp s3://my-app-backups/db-backups/backup_20250130_030001.sql.gz .

# Decompress
gunzip backup_20250130_030001.sql.gz

# Restore to database
psql $DATABASE_URL < backup_20250130_030001.sql
```

## 📊 Monitoring

Check backup status:
- GitHub Actions → Database Backup workflow
- AWS S3 Console → my-app-backups/db-backups/

## 💰 Cost Estimation

- S3 Standard: ~$0.023/GB/month
- Glacier: ~$0.004/GB/month
- Transfer: Free (within AWS)

**Example**: 10GB database, 30 backups = ~$7/month (with Glacier transition)

## 🔒 Security Best Practices

1. ✅ Use dedicated IAM user (least privilege)
2. ✅ Enable S3 bucket encryption
3. ✅ Rotate AWS keys every 90 days
4. ✅ Enable S3 versioning
5. ✅ Use VPC endpoint (if possible)

## 🆘 Troubleshooting

**Backup fails with "permission denied"**
- Check IAM user has PutObject permission
- Verify bucket name is correct

**pg_dump: connection refused**
- Verify DATABASE_URL is correct
- Check Supabase firewall allows GitHub IPs

**Upload timeout**
- Database too large, consider incremental backups
- Use S3 multipart upload for >5GB files

## 📧 Support

For issues, check:
1. GitHub Actions logs
2. AWS CloudTrail events
3. Supabase database logs
