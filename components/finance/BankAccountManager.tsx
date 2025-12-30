'use client';

import { useState } from 'react';
import { saveBankAccount } from '@/app/actions/bank-account';

export default function BankAccountManager({ existingAccounts }: { existingAccounts: any[] }) {
  const [bank, setBank] = useState('BCA');
  const [number, setNumber] = useState('');
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/finance/validate-bank', {
        method: 'POST',
        body: JSON.stringify({ bank_code: bank, account_number: number }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setVerifiedName(data.account_name);
      } else {
        alert('Account not found');
      }
    } catch (e) {
      alert('Error validating');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!verifiedName) return;
    try {
      await saveBankAccount(bank, number, verifiedName);
      alert('Bank Saved!');
      window.location.reload(); // Simple refresh to show new data
    } catch (e) {
      alert('Failed to save');
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-bold mb-4">Saved Accounts</h3>
      <div className="space-y-2 mb-6">
        {existingAccounts.map((acc: any) => (
          <div key={acc.id} className="flex justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-semibold">
                {acc.bank_code} - {acc.account_number}
              </p>
              <p className="text-sm text-gray-600">{acc.account_holder_name}</p>
            </div>
            <span className="text-green-600 text-xs px-2 py-1 bg-green-100 rounded-full h-fit">
              Verified
            </span>
          </div>
        ))}
      </div>

      <h3 className="text-lg font-bold mb-2">Add New Account</h3>
      <div className="grid gap-4">
        <select
          value={bank}
          onChange={(e) => setBank(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="BCA">BCA</option>
          <option value="MANDIRI">MANDIRI</option>
          <option value="BRI">BRI</option>
          <option value="BNI">BNI</option>
        </select>
        <input
          type="text"
          placeholder="Account Number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          className="p-2 border rounded"
        />

        {!verifiedName ? (
          <button
            onClick={handleCheck}
            disabled={loading}
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Account'}
          </button>
        ) : (
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-gray-600 mb-1">Found Account:</p>
            <p className="text-xl font-bold text-green-800">{verifiedName}</p>
            <p className="text-xs text-gray-500 mb-4">Is this correct?</p>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 bg-green-600 text-white p-2 rounded hover:bg-green-700"
              >
                Yes, Save Account
              </button>
              <button
                onClick={() => setVerifiedName(null)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
