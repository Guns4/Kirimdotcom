# CekKirim.com - Deployment Checklist

## ✅ Environment Variables for Vercel

Pastikan environment variables berikut sudah diset di Vercel Dashboard:

### Supabase (Required)
```
NEXT_PUBLIC_SUPABASE_URL=https://onkmywglrpjqulhephkf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Optional (Untuk fitur lanjutan)
```
RAJAONGKIR_API_KEY=your-api-key (jika menggunakan RajaOngkir)
OPENAI_API_KEY=your-api-key (jika menggunakan OpenAI untuk AI Insights)
```

---

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add Environment Variables (lihat di atas)
6. Click **Deploy**

---

## ⚙️ Vercel Configuration

File `vercel.json` (opsional, untuk custom config):

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["sin1"]
}
```

---

## 🔍 Post-Deployment Checks

1. ✅ Check build logs untuk errors
2. ✅ Test homepage dapat diakses
3. ✅ Test Cek Ongkir form
4. ✅ Test Cek Resi form
5. ✅ Verify Supabase connection works
6. ✅ Check console untuk errors

---

## 🐛 Common Issues & Solutions

### Issue: Build fails dengan error "Module not found"
**Solution:** Pastikan semua dependencies terinstall
```bash
npm install
npm run build
```

### Issue: Environment variables tidak terbaca
**Solution:** Pastikan prefix `NEXT_PUBLIC_` untuk client-side vars

### Issue: Supabase connection error
**Solution:** Cek `.env.local.example` dan pastikan keys benar

---

## 📊 Expected Build Output

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (X/X)
✓ Finalizing page optimization

Route (app)                                Size
┌ ○ /                                      X kB
├ ○ /api/site-settings                     X kB
└ ...

○ (Static)  automatically rendered as static HTML
```

---

**Status:** Ready to deploy! 🚀
