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
