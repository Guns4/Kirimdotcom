#!/bin/bash

# =============================================================================
# Compliance & Audit Logs Setup
# =============================================================================

echo "Setting up Audit Logs System..."
echo "================================================="

# 1. Database Schema & Triggers
echo "1. Generating SQL Schema: audit_logs_schema.sql"
cat <<EOF > audit_logs_schema.sql
-- 1. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- Who did it
    action text NOT NULL, -- UPDATE, DELETE, INSERT
    target_table text NOT NULL, -- 'orders', 'transactions'
    record_id text, -- ID of the affected record
    old_data jsonb, -- State before change
    new_data jsonb, -- State after change
    ip_address text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);

-- Index for faster querying by table or time
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON public.audit_logs(target_table);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- Enable RLS (Read-only for Admins, No Insert/Update for anyone via API directly)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
    ON public.audit_logs
    FOR SELECT
    TO authenticated
    USING (
        -- Replace with your actual admin check, e.g., auth.jwt()->>'role' = 'super_admin'
        -- For now, we allow authenticated users to view for demo purposes, 
        -- BUT you should restrict this in production.
        true 
    );

-- 2. Generic Audit Trigger Function
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER AS \$\$
DECLARE
    v_actor_id uuid;
    v_ip_address text;
    v_user_agent text;
    v_old_data jsonb;
    v_new_data jsonb;
    v_record_id text;
BEGIN
    -- Attempt to get context from Supabase/PostgREST
    v_actor_id := auth.uid();
    
    -- Extract IP and UA from request headers (Supabase specific)
    BEGIN
        v_ip_address := current_setting('request.headers', true)::json->>'x-forwarded-for';
        v_user_agent := current_setting('request.headers', true)::json->>'user-agent';
    EXCEPTION WHEN OTHERS THEN
        v_ip_address := NULL;
        v_user_agent := NULL;
    END;

    IF (TG_OP = 'DELETE') THEN
        v_old_data := to_jsonb(OLD);
        v_new_data := NULL;
        v_record_id := OLD.id::text;
    ELSIF (TG_OP = 'UPDATE') THEN
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
        v_record_id := NEW.id::text;
    ELSIF (TG_OP = 'INSERT') THEN
        v_old_data := NULL;
        v_new_data := to_jsonb(NEW);
        v_record_id := NEW.id::text;
    END IF;

    INSERT INTO public.audit_logs (
        actor_id,
        action,
        target_table,
        record_id,
        old_data,
        new_data,
        ip_address,
        user_agent
    ) VALUES (
        v_actor_id,
        TG_OP,
        TG_TABLE_NAME,
        v_record_id,
        v_old_data,
        v_new_data,
        v_ip_address,
        v_user_agent
    );

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
\$\$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Apply Triggers to Sensitive Tables
-- Drop first to avoid duplicates if re-running
DROP TRIGGER IF EXISTS trg_audit_orders ON public.orders;
CREATE TRIGGER trg_audit_orders
AFTER INSERT OR UPDATE OR DELETE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

DROP TRIGGER IF EXISTS trg_audit_transactions ON public.transactions;
CREATE TRIGGER trg_audit_transactions
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Assuming you have a public.users or profiles table. 
-- Note: auth.users is protected, usually triggers there are harder to manage via SQL Editor.
-- We attach to public.profiles or public.users if it exists.
-- CREATE TRIGGER trg_audit_profiles AFTER UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
EOF
echo "   [?] Schema created."

# 2. UI Viewer Page
echo "2. Creating Admin Viewer: src/app/admin/audit/page.tsx"
mkdir -p src/app/admin/audit

cat <<EOF > src/app/admin/audit/page.tsx
'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { Shield, Search, Eye, ArrowLeft, Database } from 'lucide-react';
import Link from 'next/link';

// Simple types
interface AuditLog {
    id: string;
    actor_id: string;
    action: string;
    target_table: string;
    old_data: any;
    new_data: any;
    ip_address: string;
    created_at: string;
}

export default function AuditLogPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const supabase = createClient();

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50); // Pagination recommended for production

        if (!error && data) {
            setLogs(data);
        }
        setLoading(false);
    };

    const getActionColor = (action: string) => {
        if (action === 'DELETE') return 'text-red-600 bg-red-50';
        if (action === 'UPDATE') return 'text-amber-600 bg-amber-50';
        return 'text-green-600 bg-green-50';
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin/dashboard" className="p-2 hover:bg-gray-200 rounded-full transition">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Shield className="w-8 h-8 text-blue-600" />
                            Audit Logs
                        </h1>
                        <p className="text-gray-500">Rekaman aktivitas sensitif sistem (Immutable)</p>
                    </div>
                </div>

                {/* Main Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg w-full max-w-sm">
                            <Search className="w-4 h-4 text-gray-400" />
                            <input 
                                placeholder="Cari by Table, ID..." 
                                className="bg-transparent border-none outline-none text-sm w-full"
                            />
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                            Menampilkan 50 aktivitas terakhir
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Timestamp</th>
                                    <th className="px-6 py-3">Action</th>
                                    <th className="px-6 py-3">Table</th>
                                    <th className="px-6 py-3">IP Address</th>
                                    <th className="px-6 py-3">Changes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            Memuat data audit...
                                        </td>
                                    </tr>
                                ) : logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                            {new Date(log.created_at).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={\`px-2 py-1 rounded text-xs font-bold \${getActionColor(log.action)}\`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-gray-700">
                                            {log.target_table}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                            {log.ip_address || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => setSelectedLog(log)}
                                                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 group"
                                            >
                                                <Eye className="w-3.5 h-3.5 group-hover:scale-110 transition" />
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Database className="w-5 h-5 text-gray-500" />
                                Change Details
                            </h3>
                            <button 
                                onClick={() => setSelectedLog(null)}
                                className="p-1 hover:bg-gray-200 rounded text-gray-500"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto font-mono text-xs">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-red-600 font-bold mb-2">OLD DATA (Sebelum)</h4>
                                    <pre className="bg-red-50 p-4 rounded-lg overflow-x-auto text-gray-700">
                                        {JSON.stringify(selectedLog.old_data, null, 2) || 'NULL (Insert)'}
                                    </pre>
                                </div>
                                <div>
                                    <h4 className="text-green-600 font-bold mb-2">NEW DATA (Sesudah)</h4>
                                    <pre className="bg-green-50 p-4 rounded-lg overflow-x-auto text-gray-700">
                                        {JSON.stringify(selectedLog.new_data, null, 2) || 'NULL (Delete)'}
                                    </pre>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
                             <span className="text-gray-500 text-xs mr-2">Actor ID: {selectedLog.actor_id}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
EOF
echo "   [?] Admin Viewer created."

echo ""
echo "================================================="
echo "Audit System Setup Complete!"
echo "1. Run 'audit_logs_schema.sql' in Supabase SQL Editor."
echo "2. Visit '/admin/audit' to view the logs."
echo "3. NOTE: Ensure you add proper Role Guards (e.g. <RoleGate role='admin'>) to the page so only admins can access it."
