import { createClient } from '@/utils/supabase/server';
import { WithdrawForm } from '@/components/finance/WithdrawForm';

export default async function WithdrawPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return (
            <div className="container mx-auto p-6 max-w-md text-center">
                <p className="text-muted-foreground">Silakan login untuk melakukan penarikan.</p>
            </div>
        );
    }

    const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();

    const balance = wallet?.balance ? Number(wallet.balance) : 0;

    return (
        <div className="container mx-auto p-6 max-w-md">
            <h1 className="text-2xl font-bold mb-6">Tarik Dana</h1>
            <div className="mb-4 p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Saldo Tersedia</p>
                <p className="text-2xl font-bold text-green-600">Rp {balance.toLocaleString('id-ID')}</p>
            </div>
            <WithdrawForm maxBalance={balance} />
        </div>
    );
}
