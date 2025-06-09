// src/app/api/admin/donations/statistics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDonationStatistics } from '../../../../../services/server/donationService.server';

export async function GET(req: NextRequest) {
  try {
    // Get date range from query parameters
    const url = new URL(req.url);
    const startDate = url.searchParams.get('startDate') || undefined;
    const endDate = url.searchParams.get('endDate') || undefined;
    
    // Get statistics from service
    const statistics = await getDonationStatistics(startDate, endDate);
    
    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Error fetching donation statistics:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
