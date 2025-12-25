# 📋 Supabase Setup Order

Jalankan SQL scripts dalam urutan berikut:

## 1️⃣ Database Schema (PERTAMA)

**File:** `supabase-schema.sql`

Jalankan script ini untuk membuat:
- ✅ Tabel `profiles`
- ✅ Tabel `site_settings`
- ✅ Tabel `search_history`
- ✅ RLS policies
- ✅ Triggers
- ✅ Auto-create profile function

```sql
-- Copy & paste supabase-schema.sql ke SQL Editor
-- Click RUN
```

## 2️⃣ Storage Setup (KEDUA)

**File:** `supabase-storage-setup.sql`

Jalankan SETELAH schema created untuk membuat:
- ✅ Storage bucket `assets`
- ✅ Storage policies

```sql
-- Copy & paste supabase-storage-setup.sql ke SQL Editor
-- Click RUN
```

---

## ⚠️ Troubleshooting

### Error: "column profiles.role does not exist"

**Penyebab:** Storage setup dijalankan sebelum database schema

**Solusi:** 
1. Jalankan `supabase-schema.sql` terlebih dahulu
2. Tunggu sampai selesai
3. Baru jalankan `supabase-storage-setup.sql`

### Error: "bucket already exists"

**Penyebab:** Bucket sudah pernah dibuat sebelumnya

**Solusi:** Sudah aman, script menggunakan `ON CONFLICT DO NOTHING`

---

## ✅ Verification

Setelah setup selesai, cek:

1. **Tables created:**
   - Go to Table Editor
   - Check `profiles`, `site_settings`, `search_history` exist

2. **Storage bucket created:**
   - Go to Storage
   - Check bucket `assets` exist
   - Try upload test file

3. **Policies working:**
   - Try login ke aplikasi
   - Try upload logo di Admin Panel

---

**Order:** Schema → Storage → Test ✅
