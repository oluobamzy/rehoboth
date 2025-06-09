// src/app/api/donations/designations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDonationDesignations } from '../../../../services/server/donationService.server';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const includeInactive = url.searchParams.get('includeInactive') === 'true';
    
    // Fetch designations from the service
    const { designations } = await getDonationDesignations(!includeInactive);
    
    return NextResponse.json({ designations });
  } catch (error) {
    console.error('Error fetching donation designations:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
