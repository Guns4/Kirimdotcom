'use client';

import { usePermission } from '@/hooks/usePermission';

interface ProtectProps {
    permission: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export default function Protect({ permission, children, fallback = null }: ProtectProps) {
    const { hasPermission, loading } = usePermission(permission);

    if (loading) return null; // Or a skeleton

    if (hasPermission) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
}
