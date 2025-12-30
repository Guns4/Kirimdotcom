#!/bin/bash

# =============================================================================
# Workflow: Admin Command Palette Setup (Task 92)
# =============================================================================

echo "Initializing Admin Command Palette..."
echo "================================================="

# 1. Install Dependency
echo "1. Installing cmdk..."
npm install cmdk
# If using shadcn/ui, it might recommend a wrapper, but we'll build a custom one using base cmdk for now or assume existing UI libs.

# 2. Create Component
echo "2. Creating Component: src/components/admin/AdminCommandPalette.tsx"
mkdir -p src/components/admin

cat <<EOF > src/components/admin/AdminCommandPalette.tsx
'use client';

import * as React from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { 
    Calculator, 
    Calendar, 
    CreditCard, 
    Settings, 
    Smile, 
    User, 
    Search,
    Package,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminCommandPalette() {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);

    // Toggle with Cmd+K or Ctrl+K
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    // Quick Actions
    const runAction = (action: () => void) => {
        setOpen(false);
        action();
    };

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="Global Command Menu"
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[640px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-[9999]"
        >
            <div className="flex items-center border-b px-4" cmdk-input-wrapper="">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <Command.Input 
                    placeholder="Type a command or search..."
                    className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>
            
            <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
                <Command.Empty className="py-6 text-center text-sm text-gray-500">
                    No results found.
                </Command.Empty>

                <Command.Group heading="Suggestions" className="text-xs font-semibold text-gray-500 px-2 py-1.5">
                    <Command.Item 
                        onSelect={() => runAction(() => router.push('/admin/users'))}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-100 text-sm font-normal text-gray-900"
                    >
                        <User className="w-4 h-4 mr-2" />
                        <span>Cari User (Database)</span>
                    </Command.Item>
                    <Command.Item 
                        onSelect={() => runAction(() => router.push('/admin/finance/withdrawals'))}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-100 text-sm font-normal text-gray-900"
                    >
                        <CreditCard className="w-4 h-4 mr-2" />
                        <span>Approve Withdraw Teratas</span>
                    </Command.Item>
                    <Command.Item 
                        onSelect={() => runAction(() => router.push('/admin/inventory'))}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-100 text-sm font-normal text-gray-900"
                    >
                        <Package className="w-4 h-4 mr-2" />
                        <span>Restock Lakban / Supply</span>
                    </Command.Item>
                </Command.Group>

                <Command.Separator className="my-1 h-px bg-gray-200" />

                <Command.Group heading="Critical Actions" className="text-xs font-semibold text-red-500 px-2 py-1.5">
                    <Command.Item 
                        onSelect={() => runAction(() => toast.error('Redirecting to Block User...'))}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-red-50 text-sm font-normal text-red-700"
                    >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        <span>Blokir User (Fraud)</span>
                    </Command.Item>
                </Command.Group>

                <Command.Group heading="System" className="text-xs font-semibold text-gray-500 px-2 py-1.5">
                     <Command.Item 
                        onSelect={() => runAction(() => router.push('/admin/settings'))}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-100 text-sm font-normal text-gray-900"
                    >
                        <Settings className="w-4 h-4 mr-2" />
                        <span>Settings</span>
                    </Command.Item>
                </Command.Group>
            </Command.List>

            <div className="border-t px-4 py-2 text-xs text-gray-400 flex justify-between">
                 <span>ProTip: Use arrows to navigate</span>
                 <span><kbd className="bg-gray-100 px-1 rounded">ESC</kbd> to close</span>
            </div>
        </Command.Dialog>
    );
}
EOF

echo ""
echo "================================================="
echo "Admin Command Palette Setup Complete!"
echo "1. Run 'npm install cmdk' manually if the script failed."
echo "2. Add <AdminCommandPalette /> to your Admin Layout (layout.tsx)."
echo "3. Press Cmd+K or Ctrl+K to test."
