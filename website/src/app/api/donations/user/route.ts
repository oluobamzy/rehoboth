// src/app/api/donations/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/services/server/authService.server';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user || !session.user.email) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
    
    const userEmail = session.user.email;
    const { serverSupabase } = await import('../../../../services/server/eventService.server');
    
    // Get one-time donations
    const { data: donations, error: donationsError } = await serverSupabase
      .from('donations')
      .select('*')
      .eq('donor_email', userEmail)
      .order('created_at', { ascending: false });
    
    if (donationsError) {
      console.error('Error fetching user donations:', donationsError);
      return NextResponse.json(
        { error: 'Failed to fetch donation data' },
        { status: 500 }
      );
    }
    
    // Get recurring donations
    const { data: subscriptions, error: subscriptionsError } = await serverSupabase
      .from('recurring_donations')
      .select('*')
      .eq('donor_email', userEmail)
      .order('created_at', { ascending: false });
    
    if (subscriptionsError) {
      console.error('Error fetching user subscriptions:', subscriptionsError);
      return NextResponse.json(
        { error: 'Failed to fetch subscription data' },
        { status: 500 }
      );
    }
    
    // Return combined data
    return NextResponse.json({
      donations,
      subscriptions
    });
  } catch (error) {
    console.error('Error fetching user donation data:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
