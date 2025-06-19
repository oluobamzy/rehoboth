// src/services/carouselService.ts
import { supabase } from './supabase';
import { CarouselSlideProps } from '@/components/hero/CarouselSlide';
import { posthog } from './posthog';

// Fetch active carousel slides
export async function fetchCarouselSlides(): Promise<CarouselSlideProps[]> {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('carousel_slides')
      .select('*')
      .eq('is_active', true)
      .or(
        `and(start_date.is.null,end_date.is.null),` +
        `and(start_date.lte.${now},end_date.is.null),` +
        `and(start_date.is.null,end_date.gte.${now}),` +
        `and(start_date.lte.${now},end_date.gte.${now})`
      )
      .order('display_order', { ascending: true });

    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        console.log('Carousel slides table does not exist or cannot be queried. Using placeholder slides.');
        return [];
      }
      console.error('Error fetching carousel slides:', error);
      return [];
    }

    if (data && data.length > 0) {
      posthog.capture('carousel_slides_loaded', {
        slide_count: data.length,
        timestamp: new Date().toISOString()
      });
    }

    return data.map(slide => ({
      id: slide.id,
      title: slide.title,
      subtitle: slide.subtitle || undefined,
      imageUrl: slide.image_url,
      ctaText: slide.cta_text || undefined,
      ctaLink: slide.cta_link || undefined,
    }));
  } catch (error) {
    console.error('Failed to fetch carousel slides:', error);
    return [];
  }
}


// Create a new carousel slide (for admin use)
// Note: This function is intended for use by authenticated users with appropriate permissions
// Ensure your Supabase RLS policies allow authenticated inserts
// and that the 'carousel_slides' table exists in your database.

function toValidTimestamp(dateString?: string): string | null {
  if (!dateString || dateString.trim() === '') return null;

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;

  return date.toISOString();
}

export async function createCarouselSlide(
  slideData: Omit<CarouselSlideProps, 'id'> & {
    displayOrder: number;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
  }
) {
  try {
    const { data, error } = await supabase
      .from('carousel_slides')
      .insert([{
        title: slideData.title,
        subtitle: slideData.subtitle,
        image_url: slideData.imageUrl,
        cta_text: slideData.ctaText,
        cta_link: slideData.ctaLink,
        display_order: slideData.displayOrder,
        is_active: slideData.isActive ?? true,
        start_date: slideData.startDate
          ? toValidTimestamp(slideData.startDate)
          : new Date().toISOString(),
        end_date: toValidTimestamp(slideData.endDate),
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Duplicate entry: slide already exists');
      } else if (error.code === '42501') {
        throw new Error('Permission denied: ensure RLS allows authenticated inserts');
      } else {
        throw new Error(`Database error: ${error.message}`);
      }
    }

    return data;
  } catch (error) {
    console.error('Failed to create carousel slide:', error);
    throw error;
  }
}

// Update an existing carousel slide (for admin use)
export async function updateCarouselSlide(
  id: string,
  slideData: Partial<Omit<CarouselSlideProps, 'id'> & {
    displayOrder: number;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
  }>
) {
  try {
    const { data, error } = await supabase
      .from('carousel_slides')
      .update({
        title: slideData.title,
        subtitle: slideData.subtitle,
        image_url: slideData.imageUrl,
        cta_text: slideData.ctaText,
        cta_link: slideData.ctaLink,
        display_order: slideData.displayOrder,
        is_active: slideData.isActive,
        start_date: slideData.startDate,
        end_date: slideData.endDate,
      })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating carousel slide:', error);
      if (error.code === '42P01') {
        throw new Error(`Table 'carousel_slides' does not exist. Please run the setup script: npm run setup:carousel`);
      } else if (error.code === '42501') {
        throw new Error('Permission denied. Your user account may not have access to update carousel slides');
      } else if (error.message) {
        throw new Error(`Database error: ${error.message}`);
      } else {
        throw new Error(`Unknown database error: ${JSON.stringify(error)}`);
      }
    }
    
    if (!data || data.length === 0) {
      throw new Error(`Carousel slide with ID ${id} not found`);
    }
    
    return data[0];
  } catch (error) {
    console.error('Failed to update carousel slide:', error instanceof Error ? error.message : JSON.stringify(error));
    throw error;
  }
}

// Delete a carousel slide (for admin use)
export async function deleteCarouselSlide(id: string) {
  try {
    const { error } = await supabase
      .from('carousel_slides')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting carousel slide:', error);
      if (error.code === '42P01') {
        throw new Error(`Table 'carousel_slides' does not exist. Please run the setup script: npm run setup:carousel`);
      } else if (error.code === '42501') {
        throw new Error('Permission denied. Your user account may not have access to delete carousel slides');
      } else if (error.message) {
        throw new Error(`Database error: ${error.message}`);
      } else {
        throw new Error(`Unknown database error: ${JSON.stringify(error)}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Failed to delete carousel slide:', error instanceof Error ? error.message : JSON.stringify(error));
    throw error;
  }
}
