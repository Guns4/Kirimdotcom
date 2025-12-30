import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { optimizeRoute, parseCSV } from '@/lib/route-optimizer';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const csvFile = formData.get('file') as File;
    const criteria = (formData.get('criteria') as string) || 'CHEAPEST';

    if (!csvFile) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read CSV content
    const csvText = await csvFile.text();

    // Parse and optimize
    const packages = parseCSV(csvText);

    if (packages.length === 0) {
      return NextResponse.json(
        { error: 'No valid packages found in CSV' },
        { status: 400 }
      );
    }

    const result = optimizeRoute(packages, criteria as any);

    // Save to database
    const { data: optimization, error } = await supabase
      .from('route_optimizations')
      .insert({
        user_id: user.id,
        filename: csvFile.name,
        total_packages: packages.length,
        optimization_data: result.packages,
        single_courier_cost: result.singleCourierCost,
        single_courier_name: result.singleCourierName,
        optimized_cost: result.optimizedCost,
        total_savings: result.totalSavings,
        savings_percentage: result.savingsPercentage,
        optimization_criteria: criteria,
        status: 'COMPLETED',
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save optimization' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      optimization: {
        id: optimization.id,
        ...result,
      },
    });
  } catch (error: any) {
    console.error('Optimization error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Optimization failed',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's optimization history
    const { data: optimizations, error } = await supabase
      .from('route_optimizations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch history' },
        { status: 500 }
      );
    }

    return NextResponse.json({ optimizations });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch history',
      },
      { status: 500 }
    );
  }
}
