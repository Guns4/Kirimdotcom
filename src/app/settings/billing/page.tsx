import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import InvoiceList from '@/components/billing/InvoiceList';
import PlanSwitcher from '@/components/billing/PlanSwitcher';
import { CreditCard, History, Package } from 'lucide-react';

export default async function BillingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch Current Subscription
    const { data: sub } = await (supabase
        .from('user_subscriptions') as any)
        .select('*, subscription_plans(*)')
        .eq('user_id', user.id)
        .single();

    const planName = sub?.subscription_plans?.name || 'Free Plan';
    const status = sub?.status || 'Active';

    return (
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Billing & Subscription</h1>

            <div className="grid gap-6">
                {/* Current Plan */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Package className="w-24 h-24" />
                    </div>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-indigo-600" />
                        Current Plan
                    </h2>
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-3xl font-bold text-gray-900">{planName}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                                    {status}
                                </span>
                                <span className="text-sm text-gray-500">Renews on {sub?.ends_at ? new Date(sub.ends_at).toLocaleDateString() : 'Never'}</span>
                            </div>
                        </div>
                        <PlanSwitcher currentPlanId={sub?.plan_id} />
                    </div>
                </div>

                {/* Payment Methods (Placeholder) */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-indigo-600" />
                        Payment Method
                    </h2>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-6 bg-gray-300 rounded overflow-hidden relative">
                                {/* Visa style */}
                                <div className="absolute top-1 right-1 w-2 h-2 bg-white/50 rounded-full"></div>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Visa ending in 4242</p>
                                <p className="text-xs text-gray-500">Expires 12/28</p>
                            </div>
                        </div>
                        <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Update</button>
                    </div>
                </div>

                {/* Invoice History */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <History className="w-5 h-5 text-indigo-600" />
                        Invoice History
                    </h2>
                    <InvoiceList userId={user.id} />
                </div>
            </div>
        </div>
    );
}
