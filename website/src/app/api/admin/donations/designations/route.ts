// src/app/api/admin/donations/designations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DonationDesignationInput } from '../../../../../types/donations';

export async function GET(req: NextRequest) {
  try {
    // Get database connection
    const { serverSupabase } = await import('../../../../../services/server/eventService.server');
    
    // Get designations including inactive ones
    const { data, error } = await serverSupabase
      .from('donation_designations')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) {
      console.error('Database error fetching designations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch designations' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ designations: data });
  } catch (error) {
    console.error('Error fetching donation designations:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: DonationDesignationInput = await req.json();
    
    // Validate request
    if (!body.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    // Get database connection
    const { serverSupabase } = await import('../../../../../services/server/eventService.server');
    
    // Insert new designation
    const { data, error } = await serverSupabase
      .from('donation_designations')
      .insert([{
        name: body.name,
        description: body.description,
        target_amount_cents: body.target_amount_cents,
        is_active: body.is_active !== undefined ? body.is_active : true,
        display_order: body.display_order || 0
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Database error creating designation:', error);
      
      // Check for duplicate name
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A designation with this name already exists' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to create designation' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating donation designation:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
