'use client';

export default function PlanSwitcher({
  currentPlanId,
}: {
  currentPlanId?: string;
}) {
  return (
    <div className="flex gap-3">
      {currentPlanId !== 'business' && (
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
          Upgrade Plan
        </button>
      )}
      {currentPlanId !== 'free' && (
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
          Downgrade
        </button>
      )}
    </div>
  );
}
