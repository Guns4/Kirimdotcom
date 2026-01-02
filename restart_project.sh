#!/bin/bash

echo "🏗️ MEMULAI PEMBUATAN KERANGKA PROJECT..."

# 1. Buat Folder-folder Penting (Jika belum ada)
mkdir -p src/app/admin
mkdir -p src/app/dashboard
mkdir -p src/app/auth/login
mkdir -p src/components/ui

# 2. Buat Halaman Admin (Obat Anti-Error 404)
echo "📄 Membuat Halaman Admin..."
cat << 'EOF' > src/app/admin/page.tsx
import React from 'react';

export default function AdminPage() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold text-red-600">Admin Dashboard (Ready)</h1>
      <p className="mt-2 text-gray-600">Jika halaman ini muncul, berarti struktur Admin sudah benar.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
          <h3 className="font-bold text-blue-800">Status System</h3>
          <p className="text-2xl mt-2">Active 🟢</p>
        </div>
        <div className="p-6 bg-green-50 border border-green-200 rounded-lg shadow-sm">
          <h3 className="font-bold text-green-800">Total Revenue</h3>
          <p className="text-2xl mt-2">Rp 0</p>
        </div>
        <div className="p-6 bg-purple-50 border border-purple-200 rounded-lg shadow-sm">
          <h3 className="font-bold text-purple-800">Total User</h3>
          <p className="text-2xl mt-2">0 Users</p>
        </div>
      </div>
    </div>
  );
}
EOF

# 3. Buat Layout Admin (Agar rapi)
echo "📄 Membuat Layout Admin..."
cat << 'EOF' > src/app/admin/layout.tsx
import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Sederhana */}
      <aside className="w-64 bg-slate-900 text-white hidden md:block">
        <div className="p-6">
          <h2 className="text-xl font-bold">KirimDotCom</h2>
          <span className="text-xs text-slate-400">Admin Panel v1.0</span>
        </div>
        <nav className="mt-6 px-4">
          <a href="/admin" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-slate-800 bg-slate-800">Dashboard</a>
          <a href="#" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-slate-800 text-slate-400">Transactions</a>
          <a href="#" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-slate-800 text-slate-400">Settings</a>
        </nav>
      </aside>
      
      {/* Konten Utama */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Dashboard Overview</h2>
          <button className="px-4 py-2 bg-slate-900 text-white rounded text-sm">Logout</button>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
EOF

# 4. Buat Halaman Depan (Landing Page)
echo "📄 Membuat Landing Page..."
cat << 'EOF' > src/app/page.tsx
import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center">
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
          Kirim<span className="text-blue-600">DotCom</span>
        </h1>
        <p className="mt-4 text-xl text-gray-500">
          Platform Logistik & PPOB Terintegrasi No. #1
        </p>
        
        <div className="mt-10 flex gap-4 justify-center">
          <a href="/admin" className="px-8 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition">
            Login Admin
          </a>
          <a href="/dashboard" className="px-8 py-3 bg-white text-slate-900 border border-slate-300 font-medium rounded-lg hover:bg-gray-50 transition">
            Member Area
          </a>
        </div>
      </div>
      
      <footer className="absolute bottom-10 text-gray-400 text-sm">
        &copy; 2024 KirimDotCom Ecosystem
      </footer>
    </div>
  );
}
EOF

# 5. Buat Dummy Dashboard User (Member Area)
echo "📄 Membuat Member Area..."
cat << 'EOF' > src/app/dashboard/page.tsx
import React from 'react';

export default function DashboardPage() {
  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold">Member Area</h1>
      <p>Selamat datang di dashboard member. Fitur akan segera diaktifkan.</p>
    </div>
  );
}
EOF

echo "✅ KERANGKA SELESAI DIBANGUN!"
echo "👉 Silakan jalankan 'npm run dev' untuk melihat hasilnya."
