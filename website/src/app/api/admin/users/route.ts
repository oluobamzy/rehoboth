// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/services/auth/apiAuth';

export async function GET(req: NextRequest) {
  try {
    // Require admin authentication first
    await requireAdmin(req);

    // Get database connection
    const { serverSupabase } = await import('@/services/server/eventService.server');
    
    // Fetch all users from auth.users and their profiles
    const { data: users, error } = await serverSupabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Get user profiles from the profiles table
    const { data: profiles, error: profilesError } = await serverSupabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }

    // Combine users with their profiles
    const usersWithProfiles = users.users.map(user => {
      const profile = profiles?.find(p => p.id === user.id);
      return {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        role: user.user_metadata?.role || profile?.role || 'user',
        status: (user as any).banned_until ? 'suspended' : 'active',
        profile: profile ? {
          full_name: profile.full_name,
          phone: profile.phone,
        } : null,
      };
    });

    return NextResponse.json({ users: usersWithProfiles });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}