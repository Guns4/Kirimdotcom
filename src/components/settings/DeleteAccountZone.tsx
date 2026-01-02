'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function DeleteAccountZone({ userId }: { userId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (confirmText !== 'DELETE') return;
        setLoading(true);

        try {
            const res = await fetch('/api/user/delete', { method: 'DELETE' });
            if (res.ok) {
                toast.success('Account deleted. Goodbye!');
                router.push('/');
                router.refresh();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to delete account');
            }
        } catch (e) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border border-red-200 bg-red-50 rounded-lg p-6 mt-8">
            <h3 className="text-red-700 font-bold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
            </h3>
            <p className="text-sm text-red-600 mb-4">
                Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button
                variant="destructive"
                onClick={() => setIsOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
            >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
            </Button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h4 className="font-bold text-lg mb-2">Delete Account?</h4>
                        <p className="text-sm text-gray-500 mb-4">
                            This action cannot be undone. All your data will be permanently removed.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Type "DELETE" to confirm
                                </label>
                                <input
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    className="w-full border p-2 rounded-md text-sm"
                                    placeholder="DELETE"
                                />
                            </div>

                            <Button
                                onClick={handleDelete}
                                disabled={confirmText !== 'DELETE' || loading}
                                className="w-full bg-red-600 hover:bg-red-700 text-white"
                            >
                                {loading ? 'Deleting...' : 'Confirm Delete'}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                className="w-full"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
