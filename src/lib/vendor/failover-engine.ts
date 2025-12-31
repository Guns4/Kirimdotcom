import { createClient } from '@/utils/supabase/server';

interface VendorStatus {
    id: string;
    name: string;
    failureRate: number; // 0.0 to 1.0
    status: 'HEALTHY' | 'UNSTABLE' | 'DOWN';
    lastChecked: Date;
}

const VENDORS = [
    { id: 'DIGIFLAZZ', priority: 1 },
    { id: 'MEDANPEDIA', priority: 2 }, // Failover
];

/**
 * Checks recent transactions to determine vendor health.
 * If failure rate > 20% in last 5 mins, marks as UNSTABLE.
 */
export async function checkVendorHealth() {
    const supabase = createClient();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data: stats } = await supabase
        .from('transactions')
        .select('vendor_id, status')
        .gte('created_at', fiveMinutesAgo);

    if (!stats || stats.length === 0) return;

    const vendorMap = new Map<string, { total: number; failed: number }>();

    // Calculate Stats
    stats.forEach(tx => {
        const current = vendorMap.get(tx.vendor_id) || { total: 0, failed: 0 };
        current.total++;
        if (tx.status === 'FAILED') current.failed++;
        vendorMap.set(tx.vendor_id, current);
    });

    // Check Thresholds
    for (const [vendorId, stat] of vendorMap.entries()) {
        const failureRate = stat.failed / stat.total;

        console.log(`[FAILOVER CHECK] ${vendorId}: Rate ${failureRate.toFixed(2)} (${stat.failed}/${stat.total})`);

        if (failureRate > 0.20) { // 20% Threshold
            console.warn(`🚨 VENDOR ${vendorId} IS UNSTABLE! Initiating Failover...`);
            await triggerFailover(vendorId);
        } else {
            // Logic to RECOVER if previously unstable
            await recoverVendor(vendorId);
        }
    }
}

async function triggerFailover(badVendorId: string) {
    const supabase = createClient();
    // In real app: Update a config table 'vendor_routing'
    // For this example we just log
    console.log(`Routing switched from ${badVendorId} to Backup Vendor.`);
}

async function recoverVendor(vendorId: string) {
    // Logic to reset status to HEALTHY
}
