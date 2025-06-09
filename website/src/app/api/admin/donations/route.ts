// src/app/api/admin/donations/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Get query parameters for filtering
    const url = new URL(req.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const minAmount = url.searchParams.get('minAmount');
    const maxAmount = url.searchParams.get('maxAmount');
    const donorEmail = url.searchParams.get('donorEmail');
    const fundDesignation = url.searchParams.get('fundDesignation');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Get database connection
    const { serverSupabase } = await import('../../../../services/server/eventService.server');
    
    // Build query
    let query = serverSupabase
      .from('donations')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);
    if (minAmount) query = query.gte('amount', minAmount);
    if (maxAmount) query = query.lte('amount', maxAmount);
    if (donorEmail) query = query.ilike('donor_email', `%${donorEmail}%`);
    if (fundDesignation) query = query.eq('fund_designation', fundDesignation);
    
    // Apply pagination
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Database error fetching donations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch donations' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      donations: data,
      pagination: {
        page,
        limit,
        totalItems: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
