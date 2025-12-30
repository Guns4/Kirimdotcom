#!/bin/bash

# =============================================================================
# Accountability: Staff Activity Logs Setup (Task 95)
# =============================================================================

echo "Initializing Staff Logging System..."
echo "================================================="

# 1. SQL Schema
echo "1. Generating SQL: admin_logs_schema.sql"
cat <<EOF > admin_logs_schema.sql
-- Ensure Admin Profiles exists (Defensive)
DO \$\$ BEGIN
    CREATE TYPE public.admin_role_enum AS ENUM ('SUPER_ADMIN', 'FINANCE', 'SUPPORT', 'CONTENT', 'LOGISTICS');
EXCEPTION
    WHEN duplicate_object THEN null;
END \$\$;

CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    role admin_role_enum NOT NULL DEFAULT 'SUPPORT',
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: Admin Activity Logs
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES auth.users(id) NOT NULL,
    action TEXT NOT NULL,         -- e.g., 'APPROVE_WITHDRAW', 'BLOCK_USER'
    target TEXT,                  -- e.g., 'User: Budi', 'Order: #123'
    details JSONB DEFAULT '{}',   -- Extra metadata
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster filtering
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_activity_logs(admin_id);

-- RLS: Only admins can view, only system can insert (via function or server action)
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all logs" ON admin_activity_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles WHERE id = auth.uid()
        )
    );

-- Insert policy is usually handled by Service Role in Server Actions, 
-- but we allow authenticated admins to insert their own logs if needed.
CREATE POLICY "Admins can insert logs" ON admin_activity_logs
    FOR INSERT
    TO authenticated
    WITH CHECK ( admin_id = auth.uid() );
EOF

# 2. Logger Logic
echo "2. Creating Logic: src/lib/admin-logger.ts"
mkdir -p src/lib

cat <<EOF > src/lib/admin-logger.ts
import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';

export async function logAdminAction(
    action: string, 
    target: string, 
    details: Record<string, any> = {}
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.error('Failed to log admin action: No authenticated user');
            return;
        }

        const headerList = headers();
        const ip = headerList.get('x-forwarded-for') || 'unknown';

        await supabase.from('admin_activity_logs').insert({
            admin_id: user.id,
            action,
            target,
            details,
            ip_address: ip
        });

    } catch (error) {
        // Fail silently to not block the main action, just log to console
        console.error('Admin Logger Error:', error);
    }
}
EOF

# 3. Log Viewer UI
echo "3. Creating Page: src/app/admin/logs/page.tsx"
mkdir -p src/app/admin/logs

cat <<EOF > src/app/admin/logs/page.tsx
import { createClient } from '@/utils/supabase/server';
import { format } from 'date-fns';
import { Shield, Search } from 'lucide-react';

export default async function AdminLogsPage() {
    const supabase = await createClient();

    // Fetch Logs with Admin Names
    const { data: logs, error } = await supabase
        .from('admin_activity_logs')
        .select(\`
            *,
            admin:admin_profiles(full_name, role, email:id) 
        \`)
        // Note: Joining with admin_profiles assuming relation exists or using auth.users via view.
        // If foreign key is to auth.users, we might need a view or just admin_profiles join if synced.
        // For this implementation, we assume admin_id links to auth.users and admin_profiles matches id.
        .order('created_at', { ascending: false })
        .limit(50);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Staff Activity Logs</h1>
                    <p className="text-gray-500">Monitor all administrative actions for accountability.</p>
                </div>
                <div className="bg-white p-2 border rounded-lg flex items-center gap-2 text-sm text-gray-500 shadow-sm">
                    <Search className="w-4 h-4" />
                    <span>Search logs...</span>
                </div>
            </div>

            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b text-gray-500 font-medium">
                        <tr>
                            <th className="px-4 py-3">Time</th>
                            <th className="px-4 py-3">Admin</th>
                            <th className="px-4 py-3">Action</th>
                            <th className="px-4 py-3">Target</th>
                            <th className="px-4 py-3">Details</th>
                            <th className="px-4 py-3">IP Address</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {logs?.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 whitespace-nowrap text-gray-500 font-mono text-xs">
                                    {format(new Date(log.created_at), 'dd MMM yyyy HH:mm:ss')}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <Shield className="w-3 h-3" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {/* @ts-ignore - Supabase join typing can be tricky */}
                                                {log.admin?.full_name || 'Unknown Admin'}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {/* @ts-ignore */}
                                                {log.admin?.role || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 font-medium text-xs border">
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-900">
                                    {log.target || '-'}
                                </td>
                                <td className="px-4 py-3 max-w-xs truncate text-gray-500" title={JSON.stringify(log.details, null, 2)}>
                                    {JSON.stringify(log.details)}
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                                    {log.ip_address}
                                </td>
                            </tr>
                        ))}

                        {(!logs || logs.length === 0) && (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                                    No activity logs found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
EOF

echo ""
echo "================================================="
echo "Staff Logging Setup Complete!"
echo "1. Run 'admin_logs_schema.sql'."
echo "2. Import 'logAdminAction' in your Server Actions."
echo "3. Visit '/admin/logs' to view history."
