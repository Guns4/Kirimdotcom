'use client';

import { User2, Mail, Crown, Shield } from 'lucide-react';
import type { Profile } from '@/types/database.types';

interface UserSettingsProps {
  user: {
    email: string;
    id: string;
  };
  profile: Profile | null;
}

export function UserSettings({ user, profile }: UserSettingsProps) {
  const getRoleBadge = () => {
    if (profile?.role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold rounded-full">
          <Shield className="w-4 h-4" />
          ADMIN
        </span>
      );
    }

    if (profile?.subscription_status === 'active') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-bold rounded-full">
          <Crown className="w-4 h-4" />
          PREMIUM
        </span>
      );
    }

    return (
      <span className="px-3 py-1 bg-gray-700 text-gray-300 text-sm font-medium rounded-full">
        FREE
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Profile Info */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold text-white mb-6">Informasi Profil</h2>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-3xl">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white font-semibold text-lg">{user.email}</p>
              <div className="mt-2">{getRoleBadge()}</div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center gap-3 text-gray-300">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-300">
              <User2 className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">User ID</p>
                <p className="font-mono text-xs">{user.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Info */}
      {profile?.subscription_status === 'active' && (
        <div className="glass-card p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-bold text-white">Premium Benefits</h3>
          </div>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Tanpa iklan
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Riwayat unlimited
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Priority support
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
