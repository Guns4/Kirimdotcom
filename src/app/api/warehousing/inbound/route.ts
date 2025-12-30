import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Ideally, this endpoint is used by Warehouse Staff (Admin) scanning User's item
    // For demo, we assume User/Staff calls it with authorized session
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { targetUserId, sku, itemName, quantity } = body;

    if (!targetUserId || !sku || !quantity) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 1. Upsert Inventory
    const { data: inventory, error } = await supabase
        .from('warehouse_inventory')
        .select('id, quantity')
        .eq('user_id', targetUserId)
        .eq('sku', sku)
        .single();

    let inventoryId = inventory?.id;
    let newQuantity = (inventory?.quantity || 0) + quantity;

    if (!inventory) {
        // Create new
        const { data: newInv, error: insertError } = await supabase
            .from('warehouse_inventory')
            .insert({
                user_id: targetUserId,
                sku,
                item_name: itemName || sku,
                quantity: quantity,
                last_inbound_at: new Date().toISOString()
            })
            .select()
            .single();

        if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
        inventoryId = newInv.id;
    } else {
        // Update existing
        const { error: updateError } = await supabase
            .from('warehouse_inventory')
            .update({
                quantity: newQuantity,
                last_inbound_at: new Date().toISOString()
            })
            .eq('id', inventoryId);

        if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 2. Log Transaction
    await supabase.from('warehouse_logs').insert({
        inventory_id: inventoryId,
        type: 'INBOUND',
        amount: quantity,
        notes: `Received by Staff ${user.email}`
    });

    return NextResponse.json({ success: true, currentStock: newQuantity });
}
