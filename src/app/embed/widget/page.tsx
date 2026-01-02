import React from 'react';

export default function WidgetPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
         <h1 className="font-bold text-lg text-gray-800">CekKirim Quick Access</h1>
         <p className="text-xs text-gray-500">Cek Ongkir & Resi Instan</p>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
            {/* Simple Tab Switcher Placeholder */}
            <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                <button className="flex-1 py-1 px-3 text-sm font-medium bg-white shadow-sm rounded-md text-gray-900">Cek Ongkir</button>
                <button className="flex-1 py-1 px-3 text-sm font-medium text-gray-500 hover:text-gray-700">Cek Resi</button>
            </div>

            {/* Content Placeholder */}
            <div className="border-2 border-dashed border-gray-200 rounded-lg h-64 flex items-center justify-center text-gray-400 text-sm p-4 text-center">
                Embed your existing CheckCostForm or TrackingForm here, simplified for 350px width.
            </div>

            <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                Cek Sekarang
            </button>
        </div>
      </div>
    </div>
  );
}
