import { NextRequest, NextResponse } from 'next/server';
import { getBestCourier, parseCSV } from '@/lib/route-optimizer';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const strategy = (formData.get('strategy') as 'CHEAPEST' | 'FASTEST' | 'BALANCED') || 'CHEAPEST';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const text = await file.text();
    const shipments = parseCSV(text);

    const results = shipments.map(s => getBestCourier(s, strategy));

    const totalPrice = results.reduce((sum, r) => sum + r.price, 0);
    const comparisonPrice = totalPrice * 1.25; // Creating a mock saving comparison

    return NextResponse.json({
      processed: shipments.length,
      totalPrice,
      savings: comparisonPrice - totalPrice,
      results
    });

  } catch (error) {
    console.error('Optimization error:', error);
    return NextResponse.json({ error: 'Failed to process optimization' }, { status: 500 });
  }
}
