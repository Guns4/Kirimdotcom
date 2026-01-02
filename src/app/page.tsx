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
