# Uptime Monitoring Setup (UptimeRobot)

## 1. Create Endpoint
Ensure your website is deployed.
Your health check URL is: `https://your-domain.com/api/health`

## 2. Configure UptimeRobot (Free)
1. Register at [uptimerobot.com](https://uptimerobot.com/).
2. Click **Add New Monitor**.
3. Settings:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: CekKirim Prod
   - **URL (or IP)**: `https://cekkirim.com/api/health`
   - **Monitoring Interval**: 5 minutes (Standard Free Tier)
   - **Alert Contacts**: Select your email.
4. Click **Create Monitor**.

## 3. How it Works
- UptimeRobot will ping your API every 5 minutes.
- Your API tries to connect to Supabase.
- If Supabase is down or the API returns 500, UptimeRobot sends you an email immediately.
