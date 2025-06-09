// src/app/api/admin/donations/recurring/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Get query parameters for filtering
    const url = new URL(req.url);
    const donorEmail = url.searchParams.get('donorEmail');
    const status = url.searchParams.get('status');
    const fundDesignation = url.searchParams.get('fundDesignation');
    const frequency = url.searchParams.get('frequency');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Get database connection
    const { serverSupabase } = await import('../../../../../services/server/eventService.server');
    
    // Build query
    let query = serverSupabase
      .from('recurring_donations')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (donorEmail) query = query.ilike('donor_email', `%${donorEmail}%`);
    if (status) query = query.eq('status', status);
    if (fundDesignation) query = query.eq('fund_designation', fundDesignation);
    if (frequency) query = query.eq('frequency', frequency);
    
    // Apply pagination
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Database error fetching recurring donations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch recurring donations' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      recurringDonations: data,
      pagination: {
        page,
        limit,
        totalItems: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching recurring donations:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
