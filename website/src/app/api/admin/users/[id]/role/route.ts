// src/app/api/admin/users/[id]/role/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { role } = await req.json();
    const userId = params.id;

    if (!['admin', 'moderator', 'user'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Get database connection
    const { serverSupabase } = await import('@/services/server/eventService.server');
    
    // Update user metadata with role
    const { error: authError } = await serverSupabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: { role }
      }
    );

    if (authError) {
      console.error('Error updating user metadata:', authError);
      return NextResponse.json(
        { error: 'Failed to update user role in auth' },
        { status: 500 }
      );
    }

    // Also update in profiles table
    const { error: profileError } = await serverSupabase
      .from('profiles')
      .upsert(
        { id: userId, role },
        { onConflict: 'id' }
      );

    if (profileError) {
      console.error('Error updating profile role:', profileError);
      // Don't fail the request if profile update fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}