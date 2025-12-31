'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DeleteAccountZone({ userId }: { userId: string }) {
    const [isConfirming, setIsConfirming] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (confirmText !== 'DELETE') return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/user/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId }),
            });

            if (res.ok) {
                // Logout & Redirect
                alert('Akun berhasil dihapus. Sampai jumpa!');
                // window.location.href = '/logout'; // or NextAuth signout
                router.push('/login');
            } else {
                alert('Gagal menghapus akun. Silakan hubungi support.');
            }
        } catch (e) {
            console.error(e);
            alert('Terjadi kesalahan sistem.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isConfirming) {
        return (
            <div className="mt-10 p-6 border border-red-200 rounded-xl bg-red-50 dark:bg-red-900/10">
                <h3 className="text-lg font-bold text-red-600">Danger Zone</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    Menghapus akun bersifat permanen. Data profil Anda akan dihapus dan transaksi dianonymize.
                </p>
                <button
                    onClick={() => setIsConfirming(true)}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
                >
                    Hapus Akun Saya
                </button>
            </div>
        );
    }

    return (
        <div className="mt-10 p-6 border border-red-500 rounded-xl bg-white dark:bg-zinc-900 shadow-lg">
            <h3 className="text-lg font-bold text-red-600 mb-2">Konfirmasi Penghapusan</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                Ketik <strong>DELETE</strong> di bawah ini untuk mengonfirmasi. Tindakan ini TIDAK BISA DIBATALKAN.
            </p>

            <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="w-full p-2 border border-zinc-300 rounded mb-4"
            />

            <div className="flex gap-3">
                <button
                    onClick={handleDelete}
                    disabled={confirmText !== 'DELETE' || isLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium text-sm"
                >
                    {isLoading ? 'Processing...' : 'Konfirmasi Hapus'}
                </button>
                <button
                    onClick={() => { setIsConfirming(false); setConfirmText(''); }}
                    className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg text-sm"
                >
                    Batal
                </button>
            </div>
        </div>
    );
}
