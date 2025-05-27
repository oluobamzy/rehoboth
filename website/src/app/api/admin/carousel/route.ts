// src/app/api/admin/carousel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/services/supabase';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Helper function to check if user is authenticated as admin
async function isAdmin() {
  const cookieStore = cookies();
  const supabaseAuth = createServerActionClient({ cookies: () => cookieStore });
  
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) return false;
  
  // Check if user has admin role (you'll need to customize this based on your auth setup)
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (error || !data || data.role !== 'admin') {
    return false;
  }
  
  return true;
}

// Create a new carousel slide
export async function POST(req: NextRequest) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.title || !body.imageUrl) {
      return NextResponse.json(
        { error: 'Title and image URL are required' },
        { status: 400 }
      );
    }
    
    // Insert the carousel slide
    const { data, error } = await supabase
      .from('carousel_slides')
      .insert([{
        title: body.title,
        subtitle: body.subtitle,
        image_url: body.imageUrl,
        cta_text: body.ctaText,
        cta_link: body.ctaLink,
        display_order: body.displayOrder || 0,
        is_active: body.isActive !== undefined ? body.isActive : true,
        start_date: body.startDate,
        end_date: body.endDate,
      }])
      .select();
    
    if (error) {
      console.error('Error creating carousel slide:', error);
      return NextResponse.json({ error: 'Failed to create carousel slide' }, { status: 500 });
    }
    
    // Invalidate any cached data
    // (In a production environment, you'd want to implement cache invalidation here)
    
    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('Server error when creating carousel slide:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update a carousel slide
export async function PUT(req: NextRequest) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await req.json();
    
    // Validate slide ID
    if (!body.id) {
      return NextResponse.json(
        { error: 'Slide ID is required' },
        { status: 400 }
      );
    }
    
    // Update the carousel slide
    const { data, error } = await supabase
      .from('carousel_slides')
      .update({
        title: body.title,
        subtitle: body.subtitle,
        image_url: body.imageUrl,
        cta_text: body.ctaText,
        cta_link: body.ctaLink,
        display_order: body.displayOrder,
        is_active: body.isActive,
        start_date: body.startDate,
        end_date: body.endDate,
      })
      .eq('id', body.id)
      .select();
    
    if (error) {
      console.error('Error updating carousel slide:', error);
      return NextResponse.json({ error: 'Failed to update carousel slide' }, { status: 500 });
    }
    
    if (data.length === 0) {
      return NextResponse.json({ error: 'Carousel slide not found' }, { status: 404 });
    }
    
    return NextResponse.json(data[0], { status: 200 });
  } catch (error) {
    console.error('Server error when updating carousel slide:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete a carousel slide
export async function DELETE(req: NextRequest) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Slide ID is required' },
        { status: 400 }
      );
    }
    
    const { error } = await supabase
      .from('carousel_slides')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting carousel slide:', error);
      return NextResponse.json({ error: 'Failed to delete carousel slide' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Server error when deleting carousel slide:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
