'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Get user's products with HPP
 */
export async function getProducts() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('name');

    return { data, error };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { data: null, error: 'Failed to fetch products' };
  }
}

/**
 * Add or update product with HPP
 */
export async function upsertProduct(product: {
  id?: string;
  sku?: string;
  name: string;
  sellingPrice: number;
  costPrice: number;
  category?: string;
  stockQuantity?: number;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const productData = {
      user_id: user.id,
      sku: product.sku,
      name: product.name,
      selling_price: product.sellingPrice,
      cost_price: product.costPrice,
      category: product.category,
      stock_quantity: product.stockQuantity || 0,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (product.id) {
      result = await supabase
        .from('products')
        .update(productData)
        .eq('id', product.id)
        .eq('user_id', user.id);
    } else {
      result = await supabase.from('products').insert(productData);
    }

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    revalidatePath('/dashboard/products');
    return { success: true, message: 'Product saved' };
  } catch (error) {
    console.error('Error saving product:', error);
    return { success: false, error: 'System error' };
  }
}

/**
 * Get marketplace fee settings
 */
export async function getMarketplaceFees() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get user's custom fees + defaults
    const { data, error } = await supabase
      .from('marketplace_fees')
      .select('*')
      .or(`user_id.is.null,user_id.eq.${user?.id || 'none'}`)
      .eq('is_active', true)
      .order('marketplace');

    return { data, error };
  } catch (error) {
    console.error('Error fetching fees:', error);
    return { data: null, error: 'Failed to fetch fees' };
  }
}

/**
 * Update marketplace fee setting
 */
export async function updateMarketplaceFee(
  marketplace: string,
  adminFeePercent: number,
  paymentFeePercent?: number,
  notes?: string
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase.from('marketplace_fees').upsert({
      user_id: user.id,
      marketplace,
      admin_fee_percent: adminFeePercent,
      payment_fee_percent: paymentFeePercent || 0,
      notes,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Fee settings saved' };
  } catch (error) {
    console.error('Error updating fee:', error);
    return { success: false, error: 'System error' };
  }
}

/**
 * Calculate profit for an order
 */
export async function calculateOrderProfit(orderId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('calculate_order_profit', {
      p_order_id: orderId,
    });

    if (error || !data || data.length === 0) {
      return { data: null, error: 'Failed to calculate profit' };
    }

    return { data: data[0], error: null };
  } catch (error) {
    console.error('Error calculating profit:', error);
    return { data: null, error: 'System error' };
  }
}

/**
 * Get profit summary for dashboard
 */
export async function getProfitSummary(fromDate?: string, toDate?: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: 'Not authenticated' };
    }

    const { data, error } = await supabase.rpc('get_profit_summary', {
      p_user_id: user.id,
      p_from_date: fromDate || null,
      p_to_date: toDate || null,
    });

    if (error || !data || data.length === 0) {
      // Return empty summary
      return {
        data: {
          total_orders: 0,
          gross_sales: 0,
          total_hpp: 0,
          total_shipping: 0,
          total_admin_fees: 0,
          total_payment_fees: 0,
          net_profit: 0,
          avg_margin: 0,
          loss_count: 0,
          loss_amount: 0,
        },
        error: null,
      };
    }

    return { data: data[0], error: null };
  } catch (error) {
    console.error('Error fetching profit summary:', error);
    return { data: null, error: 'System error' };
  }
}

/**
 * Get orders with loss (for warning display)
 */
export async function getLossOrders(limit: number = 20) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('order_profits')
      .select(
        `
        *,
        orders (
          order_number,
          source,
          customer_name,
          order_date
        )
      `
      )
      .eq('user_id', user.id)
      .eq('is_loss', true)
      .order('calculated_at', { ascending: false })
      .limit(limit);

    return { data, error };
  } catch (error) {
    console.error('Error fetching loss orders:', error);
    return { data: null, error: 'Failed to fetch' };
  }
}

/**
 * Get profit by marketplace
 */
export async function getProfitByMarketplace() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('order_profits')
      .select(
        `
        gross_sales,
        net_profit,
        is_loss,
        orders!inner (
          source
        )
      `
      )
      .eq('user_id', user.id);

    if (error) {
      return { data: null, error: error.message };
    }

    // Aggregate by marketplace
    const byMarketplace: Record<
      string,
      {
        grossSales: number;
        netProfit: number;
        orderCount: number;
        lossCount: number;
      }
    > = {};

    data?.forEach((row: any) => {
      const source = row.orders?.source || 'unknown';
      if (!byMarketplace[source]) {
        byMarketplace[source] = {
          grossSales: 0,
          netProfit: 0,
          orderCount: 0,
          lossCount: 0,
        };
      }
      byMarketplace[source].grossSales += row.gross_sales || 0;
      byMarketplace[source].netProfit += row.net_profit || 0;
      byMarketplace[source].orderCount += 1;
      if (row.is_loss) byMarketplace[source].lossCount += 1;
    });

    return { data: byMarketplace, error: null };
  } catch (error) {
    console.error('Error fetching profit by marketplace:', error);
    return { data: null, error: 'System error' };
  }
}
