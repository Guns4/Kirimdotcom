import {
  getUserDetails,
  topupUserWallet,
  banUser,
  resetUserPassword,
} from '@/app/actions/admin-users';
import { User, DollarSign, Ban, KeyRound, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function UserMobileProfile({
  params,
}: {
  params: { id: string };
}) {
  let data;
  try {
    data = await getUserDetails(params.id);
  } catch (e) {
    return (
      <div className="p-8 text-white min-h-screen bg-gray-900">
        User not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-blue-600 p-6 text-white rounded-b-3xl shadow-lg">
        <Link
          href="/admin/mobile/scan"
          className="flex items-center gap-2 mb-4 opacity-80"
        >
          <ArrowLeft className="w-5 h-5" /> Scan Again
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
            {data.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold">{data.email}</h1>
            <p className="text-blue-100 text-sm">
              User ID: {params.id.slice(0, 8)}...
            </p>
          </div>
        </div>
        <div className="mt-6 bg-white/10 p-4 rounded-xl flex justify-between items-center">
          <span className="text-sm text-blue-100">Wallet Balance</span>
          <span className="text-2xl font-bold">
            Rp {data.balance.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 grid grid-cols-2 gap-4">
        <form
          action={async () => {
            'use server';
            await topupUserWallet(params.id, 50000);
          }}
        >
          <button className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 active:scale-95 transition-transform hover:bg-gray-50">
            <DollarSign className="w-8 h-8 text-green-600" />
            <span className="text-sm font-bold text-gray-700">Topup 50k</span>
          </button>
        </form>

        <form
          action={async () => {
            'use server';
            await resetUserPassword(params.id);
          }}
        >
          <button className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 active:scale-95 transition-transform hover:bg-gray-50">
            <KeyRound className="w-8 h-8 text-orange-600" />
            <span className="text-sm font-bold text-gray-700">Reset Pass</span>
          </button>
        </form>

        <form
          action={async () => {
            'use server';
            await banUser(params.id);
          }}
          className="col-span-2"
        >
          <button className="w-full bg-red-50 p-4 rounded-xl shadow-sm border border-red-100 flex flex-col items-center gap-2 active:scale-95 transition-transform hover:bg-red-100">
            <Ban className="w-8 h-8 text-red-600" />
            <span className="text-sm font-bold text-red-700">BAN USER</span>
          </button>
        </form>
      </div>
    </div>
  );
}
