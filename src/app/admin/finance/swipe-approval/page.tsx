import { SwipeApprovalStack } from '@/components/admin/finance/SwipeApprovalStack';
import { getPendingWithdrawalsForSwipe } from '@/app/actions/swipe-approval';

export default async function SwipeApprovalPage() {
  const items = await getPendingWithdrawalsForSwipe();

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Flash Approval</h1>
        <p className="text-gray-500">Swipe to process withdrawals instantly.</p>
      </div>

      <SwipeApprovalStack initialItems={items} />
    </div>
  );
}
