import { StorageWidget } from '@/components/subscription/StorageWidget';

export default function StoragePage() {
  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <h1 className="text-xl font-bold">Kelola Penyimpanan</h1>
      <StorageWidget />
    </div>
  );
}
