'use client';

import { useState } from 'react';
import {
    Shield, Key, UserCog, Database, AlertTriangle,
    Check, Download, RefreshCw, ArrowRight, Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
    rotateSecrets,
    transferAdmin,
    exportData,
    getTransferChecklist
} from '@/lib/ownership-transfer';

export default function OwnershipTransferDashboard() {
    const [step, setStep] = useState(1);
    const [newOwnerEmail, setNewOwnerEmail] = useState('');
    const [transferPassword, setTransferPassword] = useState('');
    const [confirmText, setConfirmText] = useState('');
    const [processing, setProcessing] = useState(false);
    const [completed, setCompleted] = useState<string[]>([]);

    const checklist = getTransferChecklist();

    const handleRotateSecrets = async () => {
        setProcessing(true);
        try {
            const result = rotateSecrets();
            if (result.success) {
                setCompleted(prev => [...prev, 'secrets']);
                toast.success('Secrets rotated!', {
                    description: `${result.rotatedSecrets.length} keys regenerated`
                });
            }
        } catch (error) {
            toast.error('Failed to rotate secrets');
        } finally {
            setProcessing(false);
        }
    };

    const handleTransferAdmin = async () => {
        if (!newOwnerEmail || !transferPassword) {
            toast.error('Please fill all fields');
            return;
        }

        setProcessing(true);
        try {
            const result = await transferAdmin({
                newOwnerEmail,
                currentOwnerEmail: 'current@owner.com', // Get from session
                transferPassword
            });
            if (result.success) {
                setCompleted(prev => [...prev, 'admin']);
                toast.success('Admin transferred!', {
                    description: `New owner: ${newOwnerEmail}`
                });
            }
        } catch (error) {
            toast.error('Failed to transfer admin');
        } finally {
            setProcessing(false);
        }
    };

    const handleExportData = async () => {
        setProcessing(true);
        try {
            const result = await exportData();
            if (result.success) {
                setCompleted(prev => [...prev, 'export']);
                toast.success('Data exported!', {
                    description: `File: ${result.filename}`
                });
            }
        } catch (error) {
            toast.error('Failed to export data');
        } finally {
            setProcessing(false);
        }
    };

    const handleFinalTransfer = () => {
        if (confirmText !== 'TRANSFER OWNERSHIP') {
            toast.error('Please type the confirmation text exactly');
            return;
        }

        toast.success('Ownership Transfer Complete!', {
            description: 'All access has been transferred to the new owner.'
        });
        setStep(4);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                        <AlertTriangle className="w-4 h-4" />
                        Critical Operation
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Ownership Transfer Protocol
                    </h1>
                    <p className="text-slate-400">
                        Secure transfer of platform ownership and all access credentials
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    {[1, 2, 3].map(s => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step > s ? 'bg-green-500 text-white' :
                                    step === s ? 'bg-blue-500 text-white' :
                                        'bg-slate-700 text-slate-400'
                                }`}>
                                {step > s ? <Check className="w-5 h-5" /> : s}
                            </div>
                            {s < 3 && <ArrowRight className="w-5 h-5 text-slate-600" />}
                        </div>
                    ))}
                </div>

                {/* Step 1: Secret Rotation */}
                {step === 1 && (
                    <Card className="bg-slate-800/50 border-slate-700 text-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="w-5 h-5 text-yellow-400" />
                                Step 1: Secret Rotation
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Regenerate all API keys and secrets to revoke previous owner access
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-sm text-yellow-200">
                                <AlertTriangle className="w-4 h-4 inline mr-2" />
                                This will invalidate ALL existing API keys. Make sure to update them in all environments.
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                {['SUPABASE_ANON_KEY', 'NEXTAUTH_SECRET', 'JWT_SECRET', 'API_SECRET_KEY'].map(key => (
                                    <div key={key} className="flex items-center gap-2 bg-slate-700/50 rounded p-2">
                                        <Lock className="w-3 h-3 text-slate-400" />
                                        <span className="text-slate-300">{key}</span>
                                        {completed.includes('secrets') && <Check className="w-3 h-3 text-green-400 ml-auto" />}
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleRotateSecrets}
                                    disabled={processing || completed.includes('secrets')}
                                    className="bg-yellow-600 hover:bg-yellow-700"
                                >
                                    {processing ? 'Rotating...' : completed.includes('secrets') ? 'Rotated ✓' : (
                                        <><RefreshCw className="w-4 h-4 mr-2" /> Rotate All Secrets</>
                                    )}
                                </Button>
                                {completed.includes('secrets') && (
                                    <Button onClick={() => setStep(2)} className="bg-blue-600">
                                        Next Step <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 2: Admin Transfer */}
                {step === 2 && (
                    <Card className="bg-slate-800/50 border-slate-700 text-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserCog className="w-5 h-5 text-blue-400" />
                                Step 2: Admin Transfer
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Transfer SUPER_ADMIN privileges to the new owner
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm text-slate-300 mb-1 block">New Owner Email</label>
                                    <Input
                                        type="email"
                                        value={newOwnerEmail}
                                        onChange={(e) => setNewOwnerEmail(e.target.value)}
                                        placeholder="newowner@company.com"
                                        className="bg-slate-700 border-slate-600 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-300 mb-1 block">Transfer Password</label>
                                    <Input
                                        type="password"
                                        value={transferPassword}
                                        onChange={(e) => setTransferPassword(e.target.value)}
                                        placeholder="Pre-shared transfer password"
                                        className="bg-slate-700 border-slate-600 text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={handleTransferAdmin}
                                    disabled={processing || completed.includes('admin')}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {processing ? 'Transferring...' : completed.includes('admin') ? 'Transferred ✓' : (
                                        <><UserCog className="w-4 h-4 mr-2" /> Transfer Admin</>
                                    )}
                                </Button>
                                {completed.includes('admin') && (
                                    <Button onClick={() => setStep(3)} className="bg-green-600">
                                        Next Step <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 3: Data Export & Confirm */}
                {step === 3 && (
                    <Card className="bg-slate-800/50 border-slate-700 text-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="w-5 h-5 text-green-400" />
                                Step 3: Data Export & Confirm
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Export encrypted database backup and confirm transfer
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button
                                onClick={handleExportData}
                                disabled={processing || completed.includes('export')}
                                variant="outline"
                                className="w-full border-slate-600"
                            >
                                {processing ? 'Exporting...' : completed.includes('export') ? 'Exported ✓' : (
                                    <><Download className="w-4 h-4 mr-2" /> Export Encrypted Database</>
                                )}
                            </Button>

                            {completed.includes('export') && (
                                <div className="space-y-4 pt-4 border-t border-slate-700">
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-200">
                                        <AlertTriangle className="w-4 h-4 inline mr-2" />
                                        <strong>FINAL WARNING:</strong> This action cannot be undone. You will lose all admin access.
                                    </div>

                                    <div>
                                        <label className="text-sm text-slate-300 mb-1 block">
                                            Type <code className="bg-slate-700 px-1 rounded">TRANSFER OWNERSHIP</code> to confirm
                                        </label>
                                        <Input
                                            value={confirmText}
                                            onChange={(e) => setConfirmText(e.target.value)}
                                            placeholder="TRANSFER OWNERSHIP"
                                            className="bg-slate-700 border-slate-600 text-white"
                                        />
                                    </div>

                                    <Button
                                        onClick={handleFinalTransfer}
                                        disabled={confirmText !== 'TRANSFER OWNERSHIP'}
                                        className="w-full bg-red-600 hover:bg-red-700"
                                    >
                                        <Shield className="w-4 h-4 mr-2" />
                                        Complete Ownership Transfer
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Step 4: Complete */}
                {step === 4 && (
                    <Card className="bg-green-900/30 border-green-700 text-white text-center py-12">
                        <CardContent>
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Transfer Complete</h2>
                            <p className="text-green-200 mb-6">
                                Ownership has been successfully transferred to {newOwnerEmail}
                            </p>
                            <div className="text-sm text-green-300/70">
                                Your admin access has been revoked. This session will end shortly.
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Checklist */}
                <Card className="bg-slate-800/30 border-slate-700 mt-6">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-slate-400">Transfer Checklist</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                            {checklist.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-1">
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
