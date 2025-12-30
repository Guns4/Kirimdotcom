'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateStock(itemId: string, delta: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Get current stock
  const { data: item } = await supabase
    .from('inventory_items')
    .select('stock')
    .eq('id', itemId)
    .eq('user_id', user.id)
    .single();

  if (!item) throw new Error('Item not found');

  const newStock = Math.max(0, item.stock + delta);

  const { error } = await supabase
    .from('inventory_items')
    .update({ stock: newStock })
    .eq('id', itemId);

  if (error) throw error;

  revalidatePath('/dashboard/inventory');
}

export async function addInventoryItem(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase.from('inventory_items').insert({
    user_id: user.id,
    name: formData.get('name'),
    sku: formData.get('sku'),
    stock: Number(formData.get('stock')) || 0,
    cost_price: Number(formData.get('cost_price')) || 0,
    sell_price: Number(formData.get('sell_price')) || null,
  });

  if (error) throw error;

  revalidatePath('/dashboard/inventory');
}
