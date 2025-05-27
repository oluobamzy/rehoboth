// src/app/api/carousel/slides/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/services/supabase';

export async function GET() {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('carousel_slides')
      .select('*')
      .eq('is_active', true)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('display_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching carousel slides:', error);
      return NextResponse.json({ error: 'Failed to fetch carousel slides' }, { status: 500 });
    }
    
    // Transform the data to match our component props format
    const slides = data.map(slide => ({
      id: slide.id,
      title: slide.title,
      subtitle: slide.subtitle || undefined,
      imageUrl: slide.image_url,
      ctaText: slide.cta_text || undefined,
      ctaLink: slide.cta_link || undefined,
    }));
    
    return NextResponse.json({ 
      data: slides,
      meta: {
        total: slides.length,
        cached: false
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Server error when fetching carousel slides:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
