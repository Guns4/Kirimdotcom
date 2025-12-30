'use client';

import { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { validateInvestorAccess } from '@/lib/investor-metrics';

interface InvestorGateProps {
    onAuthenticated: () => void;
}

export default function InvestorGate({ onAuthenticated }: InvestorGateProps) {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        if (validateInvestorAccess(password)) {
            // Store in session
            sessionStorage.setItem('investor_authenticated', 'true');
            onAuthenticated();
        } else {
            setError('Invalid access code');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur-xl border-slate-700">
                <CardContent className="pt-8 pb-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-8 h-8 text-blue-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Investor Portal
                        </h1>
                        <p className="text-slate-400 text-sm">
                            Enter access code to view live metrics
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Access Code"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 pr-10"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {error && (
                            <p className="text-red-400 text-sm text-center">{error}</p>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={loading || !password}
                        >
                            {loading ? 'Verifying...' : (
                                <>
                                    Access Dashboard
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-slate-500 text-xs">
                            CekKirim Confidential • For Authorized Investors Only
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
