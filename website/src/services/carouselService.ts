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
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('display_order', { ascending: true });
    
    if (error) {
      // If the table doesn't exist yet, don't log an error, just return empty array
      if (error.message?.includes('does not exist')) {
        console.log('Carousel slides table does not exist yet. Using placeholder slides.');
        return [];
      }
      
      console.error('Error fetching carousel slides:', error);
      throw error;
    }
    
    // Track the event in PostHog if we have slides
    if (data && data.length > 0) {
      posthog.capture('carousel_slides_loaded', {
        slide_count: data.length,
        timestamp: new Date().toISOString()
      });
    }
    
    // Transform the data to match our component props
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
export async function createCarouselSlide(slideData: Omit<CarouselSlideProps, 'id'> & { 
  displayOrder: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}) {
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
        is_active: slideData.isActive !== undefined ? slideData.isActive : true,
        start_date: slideData.startDate,
        end_date: slideData.endDate,
      }])
      .select();
    
    if (error) {
      console.error('Error creating carousel slide:', error);
      throw error;
    }
    
    return data[0];
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
      throw error;
    }
    
    return data[0];
  } catch (error) {
    console.error('Failed to update carousel slide:', error);
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
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to delete carousel slide:', error);
    throw error;
  }
}
