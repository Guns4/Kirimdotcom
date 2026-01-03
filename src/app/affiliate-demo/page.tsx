import React from 'react';

export default function AffiliateDemo() {
  return (
    <div className="p-10 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Affiliate Program</h1>
      <p className="mb-4">
        {/* FIX: Menggunakan &apos; pengganti tanda kutip tunggal */}
        Welcome to our affiliate program. It&apos;s the best way to earn passive income.
      </p>
      <div className="p-4 bg-blue-50 rounded border border-blue-200">
        <h3 className="font-bold">Your Referral Link:</h3>
        <code className="bg-white px-2 py-1 rounded">https://kirim.com/ref/MEMBER001</code>
      </div>
    </div>
  );
}
