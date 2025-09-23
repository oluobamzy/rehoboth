// src/app/api/carousel/slides/route.ts
import { NextResponse } from 'next/server';
import { HeroCarousels } from '@/data/heroCarouselData';

export async function GET() {
  try {
    // Return static carousel data instead of fetching from database
    return NextResponse.json({ 
      data: HeroCarousels,
      meta: {
        total: HeroCarousels.length,
        cached: true // Indicate this is static data
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error returning carousel slides:', error);
    return NextResponse.json({ error: 'Failed to get carousel slides' }, { status: 500 });
  }
}
