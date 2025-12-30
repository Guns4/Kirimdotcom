'use server';

import { validateGoods, ShippingMode } from '@/lib/goods-rules';

export async function checkGoodsAction(item: string, mode: ShippingMode) {
  // Simulate slight network delay for realism/loading state
  await new Promise((resolve) => setTimeout(resolve, 500));
  return validateGoods(item, mode);
}
