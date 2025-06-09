// src/app/api/admin/donations/designations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Get database connection
    const { serverSupabase } = await import('../../../../../../services/server/eventService.server');
    
    // Fetch the designation
    const { data, error } = await serverSupabase
      .from('donation_designations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Database error fetching designation:', error);
      return NextResponse.json(
        { error: 'Designation not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching donation designation:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();
    
    // Get database connection
    const { serverSupabase } = await import('../../../../../../services/server/eventService.server');
    
    // Prepare updates, omitting any undefined fields
    const updates: Record<string, any> = {};
    
    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.target_amount_cents !== undefined) updates.target_amount_cents = body.target_amount_cents;
    if (body.is_active !== undefined) updates.is_active = body.is_active;
    if (body.display_order !== undefined) updates.display_order = body.display_order;
    
    // Update the designation
    const { data, error } = await serverSupabase
      .from('donation_designations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Database error updating designation:', error);
      
      // Check for duplicate name
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A designation with this name already exists' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to update designation' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating donation designation:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Get database connection
    const { serverSupabase } = await import('../../../../../../services/server/eventService.server');
    
    // Check if this designation has been used in donations
    const { count, error: countError } = await serverSupabase
      .from('donations')
      .select('id', { count: 'exact', head: true })
      .eq('fund_designation', id);
    
    if (countError) {
      console.error('Error checking designation usage:', countError);
    } else if (count && count > 0) {
      return NextResponse.json(
        { error: 'This designation has been used in donations and cannot be deleted.' },
        { status: 400 }
      );
    }
    
    // Delete the designation
    const { error } = await serverSupabase
      .from('donation_designations')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Database error deleting designation:', error);
      return NextResponse.json(
        { error: 'Failed to delete designation' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting donation designation:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
