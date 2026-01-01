'use client';
import { useState } from 'react';
import { Save, User, Lock, ShieldAlert } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Account Settings</h2>
                <p className="text-slate-500">Kelola profil, keamanan, dan preferensi akun Anda.</p>
            </div>

            {/* Profile Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-6">
                    <User size={20} className="text-blue-600" /> Profile Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Company Name</label>
                        <input type="text" defaultValue="PT Maju Mundur Tech" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Email Address</label>
                        <input type="email" defaultValue="dev@majumundur.com" disabled className="w-full px-4 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-500 cursor-not-allowed" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2">
                        <Save size={18} /> Save Changes
                    </button>
                </div>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-6">
                    <Lock size={20} className="text-purple-600" /> Security
                </h3>
                <div className="flex items-center justify-between py-4 border-b border-slate-100">
                    <div>
                        <p className="font-medium text-slate-900">Change Password</p>
                        <p className="text-sm text-slate-500">Update password akun Anda secara berkala.</p>
                    </div>
                    <button className="text-blue-600 font-medium hover:underline">Update</button>
                </div>
                <div className="flex items-center justify-between py-4">
                    <div>
                        <p className="font-medium text-slate-900">Two-Factor Authentication (2FA)</p>
                        <p className="text-sm text-slate-500">Amankan akun dengan Google Authenticator.</p>
                    </div>
                    <button className="px-4 py-1 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200">Enable</button>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 rounded-xl border border-red-100 p-6">
                <h3 className="font-bold text-red-700 flex items-center gap-2 mb-4">
                    <ShieldAlert size={20} /> Danger Zone
                </h3>
                <div className="flex items-center justify-between">
                    <p className="text-sm text-red-600">Menghapus akun akan menghilangkan semua data API Key dan Saldo.</p>
                    <button className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg font-bold hover:bg-red-100 text-sm">
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
}
