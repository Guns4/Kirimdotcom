# 🏥 Setup UptimeRobot - Free Website Monitoring

## Why Uptime Monitoring?
- Get alerted INSTANTLY when your website goes down
- Database connection issues detected automatically
- Free plan: Check every 5 minutes (more than enough!)
- Email/SMS/Slack alerts

---

## ✅ Quick Setup (5 Minutes)

### Step 1: Deploy Health Endpoint
Your health endpoint is already created at:
```
https://your-domain.com/api/health
```

**Test it now:**
```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "db": "connected",
  "responseTime": "145ms",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

### Step 2: Register at UptimeRobot

1. Go to: **https://uptimerobot.com/**
2. Click **"Sign Up Free"**
3. Verify your email

---

### Step 3: Add Monitor

1. **Dashboard** → **Add New Monitor**
2. Fill in:
   - **Monitor Type**: `HTTP(s)`
   - **Friendly Name**: `CekKirim Production`
   - **URL**: `https://cekkirim.com/api/health` (⚠️ Replace with your actual domain)
   - **Monitoring Interval**: `5 minutes`
3. **Alert Contacts** → Add your email
4. Click **Create Monitor**

---

## 📊 What Gets Monitored?

### ✅ Checks Performed:
- [x] Website is reachable
- [x] Database connection working
- [x] Response time < 30s
- [x] HTTP status 200 (healthy)

### ⚠️ Alerts Triggered When:
- Website returns HTTP 500/503
- Database connection fails
- Response time > 30 seconds
- Website completely unreachable

---

## 🔔 Alert Configuration

### Email Alerts (Free)
✅ Already included in free plan

### SMS Alerts (Paid)
1. Dashboard → Settings → Alert Contacts
2. Add phone number
3. Requires paid plan ($7/month)

### Slack Alerts (Free)
1. Create Slack webhook
2. Add as Alert Contact
3. Get notifications in Slack channel

---

## 📈 Advanced Setup (Optional)

### Multi-Region Monitoring
Monitor from multiple locations:
```
Monitor 1: https://cekkirim.com/api/health (US)
Monitor 2: https://cekkirim.com/api/health (EU)
Monitor 3: https://cekkirim.com/api/health (Asia)
```

### Custom Keywords
Check if response contains specific text:
- Keyword Type: `exists`
- Keyword Value: `"status":"healthy"`

### Response Time Alerts
Get notified if response time > threshold:
- Settings → Advanced → Response Time Alert
- Threshold: `2000ms` (2 seconds)

---

## 🎯 Recommended Configuration

```
Monitor Name: CekKirim Health Check
URL: https://cekkirim.com/api/health
Interval: 5 minutes
Alert When: Down for 1 check
Notifications: Email + Slack
```

---

## 🐛 Troubleshooting

### Monitor shows "Down"
1. Check if website is accessible
2. Visit `/api/health` manually in browser
3. Check database connection
4. Review Vercel logs

### "Keyword not found"
- Response might be returning error message
- Check actual response in browser
- Ensure database is running

### False positives
- Increase "Down for X checks" to 2-3
- This prevents alerts during brief network hiccups

---

## 🚀 Other Free Alternatives

### 1. **Better Uptime** (betteruptime.com)
- More beautiful dashboard
- Incident management
- Status page included

### 2. **Pingdom** (pingdom.com)
- Industry standard
- Free plan: 1 monitor
- Advanced analytics

### 3. **Freshping** (freshping.io)
- Clean interface
- 50 monitors free
- Global checks

---

## 📝 Next Steps

1. ✅ Deploy to production
2. ✅ Test `/api/health` endpoint
3. ✅ Setup UptimeRobot monitor
4. ✅ Add email alert
5. ✅ (Optional) Connect Slack
6. 😴 Sleep peacefully knowing you'll get alerts!

---

**Last Updated**: 2025-12-30  
**Endpoint**: `/api/health`  
**Status**: Production Ready ✅
