// src/services/carouselService.ts
import { HeroCarousels, HeroCarouselItem } from '@/data/heroCarouselData';

// Return static carousel slides (no database fetching)
export async function fetchCarouselSlides(): Promise<HeroCarouselItem[]> {
  // Return static data directly - simulating async operation for compatibility
  return Promise.resolve(HeroCarousels);
}

// For backward compatibility - these functions now return static data or no-ops
export async function createCarouselSlide(): Promise<HeroCarouselItem> {
  throw new Error('Creating carousel slides is disabled - using static data only');
}

export async function updateCarouselSlide(): Promise<HeroCarouselItem> {
  throw new Error('Updating carousel slides is disabled - using static data only');
}

export async function deleteCarouselSlide(): Promise<void> {
  throw new Error('Deleting carousel slides is disabled - using static data only');
}
