import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export function usePermission(requiredPermission: string) {
    const [hasPermission, setHasPermission] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function check() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            // Efficient query using the View created in SQL
            // or perform a join query if view access is restricted.
            // For safety/RLS reasons, usually better to perform an RPC or just query the tables.
            
            // Query: Does this user have a role that has this permission?
            const { data, error } = await supabase
                .from('user_permissions_view')
                .select('code')
                .eq('user_id', user.id)
                .eq('code', requiredPermission)
                .single();

            if (data && !error) {
                setHasPermission(true);
            }
            setLoading(false);
        }

        check();
    }, [requiredPermission]);

    return { hasPermission, loading };
}
