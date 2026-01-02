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
