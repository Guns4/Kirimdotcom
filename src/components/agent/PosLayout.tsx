import { ReactNode } from 'react';
import Link from 'next/link';
import { Package, Receipt, History, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PosLayoutProps {
  children: ReactNode;
}

export function PosLayout({ children }: PosLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="font-bold text-lg flex items-center gap-2">
          <Package className="text-blue-600" />
          Agent POS
        </div>
        <Button variant="ghost" size="icon">
          <User size={20} />
        </Button>
      </header>

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r h-screen sticky top-0">
        <div className="p-6 border-b">
          <div className="font-bold text-xl flex items-center gap-2">
            <Package className="text-blue-600" />
            Agent POS
          </div>
          <div className="text-xs text-slate-500 mt-1">v1.0.0 (Beta)</div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Button variant="secondary" className="w-full justify-start">
            <Receipt className="mr-2 h-4 w-4" />
            New Transaction
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <History className="mr-2 h-4 w-4" />
            History
          </Button>
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
              <User size={16} />
            </div>
            <div>
              <div className="text-sm font-medium">Agent User</div>
              <div className="text-xs text-slate-500">ID: AGT-001</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">{children}</div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-2 z-10">
        <Link href="#" className="flex flex-col items-center p-2 text-blue-600">
          <Receipt size={20} />
          <span className="text-[10px] mt-1">New Trx</span>
        </Link>
        <Link
          href="#"
          className="flex flex-col items-center p-2 text-slate-500"
        >
          <History size={20} />
          <span className="text-[10px] mt-1">History</span>
        </Link>
      </nav>
    </div>
  );
}
