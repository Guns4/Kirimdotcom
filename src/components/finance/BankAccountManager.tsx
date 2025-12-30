'use client';

import { useState } from 'react';
import { saveBankAccount } from '@/app/actions/bank-account';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle2, User, Landmark, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BankAccountManager({ existingAccounts }: { existingAccounts: any[] }) {
    const [bank, setBank] = useState('BCA');
    const [number, setNumber] = useState('');
    const [verifiedName, setVerifiedName] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleCheck = async () => {
        if (!number) return toast.error('Please enter account number');
        setLoading(true);
        try {
            const res = await fetch('/api/finance/validate-bank', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bank_code: bank, account_number: number })
            });
            const data = await res.json();
            if (data.status === 'success') {
                setVerifiedName(data.account_name);
                toast.success('Account Found');
            } else {
                toast.error('Account not found');
            }
        } catch (e) {
            toast.error('Error validating');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!verifiedName) return;
        setIsSaving(true);
        try {
            await saveBankAccount(bank, number, verifiedName);
            toast.success('Bank Account Saved Successfully');
            window.location.reload(); 
        } catch (e: any) {
            toast.error(e.message || 'Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 max-w-2xl">
            {/* Existing Accounts List */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Saved Bank Accounts</h3>
                        <p className="text-xs text-zinc-500">Manage your verified withdrawal accounts</p>
                    </div>
                </div>
                
                <div className="p-4 space-y-3">
                    {existingAccounts.length > 0 ? (
                        existingAccounts.map((acc: any) => (
                            <div key={acc.id} className="group relative flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-white dark:hover:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700/50 transition-all duration-200">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                        <Landmark className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-zinc-800 dark:text-zinc-100">{acc.bank_code}</p>
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Verified
                                            </span>
                                        </div>
                                        <p className="text-sm font-mono text-zinc-600 dark:text-zinc-400">{acc.account_number}</p>
                                        <p className="text-xs text-zinc-400 mt-1 uppercase">{acc.account_holder_name}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center">
                            <Landmark className="w-12 h-12 text-zinc-200 dark:text-zinc-800 mx-auto mb-3" />
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">No bank accounts saved yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add New Account Form */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <Plus className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">Add New Account</h3>
                        <p className="text-xs text-zinc-500">Validate and save a new bank account</p>
                    </div>
                </div>

                <div className="p-6 grid gap-6">
                    <div className="grid gap-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Select Bank</label>
                        <Select value={bank} onValueChange={setBank}>
                            <SelectTrigger className="h-12 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-primary">
                                <SelectValue placeholder="Select a bank" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                <SelectItem value="BCA">Bank Central Asia (BCA)</SelectItem>
                                <SelectItem value="MANDIRI">Bank Mandiri</SelectItem>
                                <SelectItem value="BRI">Bank Rakyat Indonesia (BRI)</SelectItem>
                                <SelectItem value="BNI">Bank Negara Indonesia (BNI)</SelectItem>
                                <SelectItem value="CIMB">CIMB Niaga</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Account Number</label>
                        <Input 
                            type="text" 
                            placeholder="e.g., 12345678" 
                            value={number} 
                            onChange={e => setNumber(e.target.value)}
                            className="h-12 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-primary text-lg font-mono"
                        />
                    </div>
                    
                    {!verifiedName ? (
                        <Button 
                            onClick={handleCheck} 
                            disabled={loading || !number}
                            className="w-full h-14 text-base font-bold rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                        >
                            {loading ? (
                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Validating...</>
                            ) : (
                                'Verify Bank Account'
                            )}
                        </Button>
                    ) : (
                        <div className="p-6 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-2xl animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 border border-green-200 dark:border-green-800">
                                    <User className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-green-600 dark:text-green-500 uppercase tracking-widest mb-1">Account Holder Name Found</p>
                                    <p className="text-2xl font-black text-green-900 dark:text-green-100 tracking-tight">{verifiedName}</p>
                                    <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1 italic italic">Real-time data from financial network</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <Button 
                                    onClick={handleSave} 
                                    disabled={isSaving}
                                    className="flex-1 h-12 font-bold rounded-xl bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
                                >
                                    {isSaving ? 'Saving...' : 'Save as Verified Account'}
                                </Button>
                                <Button 
                                    variant="outline"
                                    onClick={() => setVerifiedName(null)} 
                                    className="px-6 h-12 border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
