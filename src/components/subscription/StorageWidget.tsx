'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Cloud, ArrowUpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StorageService, PLANS } from '@/lib/storage-service';
import { useRouter } from 'next/navigation';

export function StorageWidget() {
  const [usage, setUsage] = useState(0);
  const [limit, setLimit] = useState(PLANS.FREE.limit);
  const [tier, setTier] = useState('FREE');
  const router = useRouter();

  useEffect(() => {
    const fetchUsage = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('storage_used, storage_limit, subscription_tier')
        .eq('id', user.id)
        .single();

      if (data) {
        setUsage(data.storage_used || 0);
        setLimit(data.storage_limit || PLANS.FREE.limit);
        setTier(data.subscription_tier || 'FREE');
      }
    };
    fetchUsage();
  }, []);

  const percentage = Math.min(100, (usage / limit) * 100);
  const isFull = percentage >= 90;

  const handleUpgrade = async () => {
    try {
      await StorageService.upgradeToPremium();
      alert('Upgrade Berhasil! Limit Anda sekarang 10GB.');
      window.location.reload();
    } catch (e) {
      alert('Upgrade Gagal. Pastikan saldo mencukupi.');
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-gray-700">
          <Cloud className="w-5 h-5" />
          <span className="font-semibold text-sm">Penyimpanan</span>
        </div>
        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full font-medium">{tier}</span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2 overflow-hidden">
        <div
          className={`h-2.5 rounded-full ${isFull ? 'bg-red-500' : 'bg-blue-600'}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
        <span>{(usage / 1024 / 1024).toFixed(1)} MB</span>
        <span>of {(limit / 1024 / 1024).toFixed(0)} MB</span>
      </div>

      {tier === 'FREE' && (
        <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
          <h4 className="font-semibold text-orange-800 text-sm mb-1">Penyimpanan Hampir Penuh?</h4>
          <p className="text-orange-600 text-[10px] mb-3">
            Upgrade ke <strong>Cloud+ (10GB)</strong> hanya <strong>Rp 10rb/thn</strong> untuk simpan ribuan foto garansi.
          </p>
          <Button onClick={handleUpgrade} size="sm" className="w-full bg-orange-500 hover:bg-orange-600 border-none text-white">
            <ArrowUpCircle className="w-4 h-4 mr-1" />
            Upgrade Sekarang
          </Button>
        </div>
      )}
    </div>
  );
}
