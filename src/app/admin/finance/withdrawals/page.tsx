import { createClient } from '@/utils/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { WithdrawalActions } from './AdminWithdrawalClient';

interface WithdrawalRequest {
    id: string;
    bank_name: string;
    account_number: string;
    account_holder: string;
    amount: number;
    status: string;
    profiles?: {
        full_name: string;
        email: string;
    };
}

export default async function AdminWithdrawalsPage() {
    const supabase = await createClient();
    const { data: list } = await supabase
        .from('withdrawal_requests')
        .select('*, profiles:user_id(full_name, email)')
        .order('created_at', { ascending: false });

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Withdrawal Requests</h1>

            <div className="border rounded-xl bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Bank Info</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(list as WithdrawalRequest[] | null)?.map((req) => (
                            <TableRow key={req.id}>
                                <TableCell>
                                    <div className="font-bold">{req.profiles?.full_name}</div>
                                    <div className="text-xs text-muted-foreground">{req.profiles?.email}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-bold">{req.bank_name}</div>
                                    <div>{req.account_number}</div>
                                    <div className="text-xs uppercase">{req.account_holder}</div>
                                </TableCell>
                                <TableCell className="font-mono text-red-500 font-bold">
                                    -Rp {req.amount.toLocaleString('id-ID')}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={req.status === 'PENDING' ? 'outline' : req.status === 'PROCESSED' ? 'default' : 'destructive'}>
                                        {req.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {req.status === 'PENDING' ? (
                                        <WithdrawalActions id={req.id} />
                                    ) : (
                                        <span className="text-xs text-muted-foreground">-</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {!list?.length && <TableRow><TableCell colSpan={5} className="text-center p-4">No data</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
