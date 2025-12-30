'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { safeAction } from '@/lib/safe-action';
import { z } from 'zod';

const ProductSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  stock: z.number().min(0),
  min_stock_alert: z.number().min(0),
  price: z.number().min(0),
  description: z.string().optional(),
});

export const getProducts = async () => {
  const supabase = await createClient();
  const { data } = await supabase.from('products').select('*').order('name');
  return data || [];
};

export const upsertProduct = async (
  data: z.infer<typeof ProductSchema> & { id?: string }
) => {
  return safeAction(async () => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const payload: any = { ...data, user_id: user.id };
    if (data.id) payload.id = data.id;

    const { error } = await supabase.from('products').upsert(payload);

    if (error) throw error;
    revalidatePath('/dashboard/inventory');
    return { success: true };
  });
};

export const deleteProduct = async (id: string) => {
  return safeAction(async () => {
    const supabase = await createClient();
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/dashboard/inventory');
    return { success: true };
  });
};

export const updateStock = async (id: string, adjustment: number) => {
  return safeAction(async () => {
    const supabase = await createClient();

    // Using RPC or raw SQL is safer for atomic updates, but for Lite version fetch-update is acceptable
    const { data: product } = await supabase
      .from('products')
      .select('stock')
      .eq('id', id)
      .single();
    if (!product) throw new Error('Product not found');

    const newStock = Math.max(0, product.stock + adjustment);

    const { error } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', id);
    if (error) throw error;

    revalidatePath('/dashboard/inventory');
    return { success: true, newStock };
  });
};
