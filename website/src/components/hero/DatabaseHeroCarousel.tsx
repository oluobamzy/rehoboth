'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import CarouselSlide from './CarouselSlide';
import CarouselControls from './CarouselControls';
import useCarousel from '@/hooks/useCarousel';

interface CarouselSlideData {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  image?: string;
  video?: string;
  ctas: {
    primary?: {
      text: string;
      link: string;
      variant: 'primary' | 'secondary';
    };
    secondary?: {
      text: string;
      link: string;
      variant: 'outline' | 'ghost';
    };
  };
  overlay?: {
    gradient: string;
    opacity: number;
  };
  textPosition: 'left' | 'center' | 'right';
  theme: 'light' | 'dark';
}

export default function DatabaseHeroCarousel() {
  const [slides, setSlides] = useState<CarouselSlideData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const carouselRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const {
    currentIndex,
    goToSlide,
    goToPrevious,
    goToNext,
    isPlaying,
    togglePlayPause,
    handleTouchStart,
    handleTouchEnd
  } = useCarousel(slides, 6000);

  // Fetch carousel slides from database
  useEffect(() => {
    fetchCarouselSlides();
  }, []);

  const fetchCarouselSlides = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/content/carousel', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.slides && data.slides.length > 0) {
        // Transform database slides to match expected format
        const transformedSlides = data.slides.map((slide: any) => ({
          id: slide.id,
          title: slide.title,
          subtitle: slide.metadata?.subtitle || '',
          description: slide.content.replace(/<[^>]*>/g, ''), // Strip HTML for description
          image: slide.metadata?.image,
          video: slide.metadata?.video,
          ctas: slide.metadata?.ctas || {},
          overlay: slide.metadata?.overlay || {
            gradient: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.5) 100%)',
            opacity: 0.6
          },
          textPosition: slide.metadata?.textPosition || 'left',
          theme: slide.metadata?.theme || 'dark'
        }));
        
        setSlides(transformedSlides);
      } else {
        // Fallback to default slides if none found
        setSlides([
          {
            id: 'default-1',
            title: 'Welcome Home to Rehoboth',
            subtitle: 'A Place Where Faith Meets Family',
            description: 'Experience authentic worship, genuine community, and transformative faith in the heart of our vibrant church family. Join us every Sunday as we grow together in God\'s love.',
            image: '/pastoral_care.jpeg',
            ctas: {
              primary: {
                text: 'Visit This Sunday',
                link: '/about',
                variant: 'primary'
              },
              secondary: {
                text: 'Learn About Us',
                link: '/about',
                variant: 'outline'
              }
            },
            overlay: {
              gradient: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.5) 100%)',
              opacity: 0.6
            },
            textPosition: 'left',
            theme: 'dark'
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching carousel slides:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch carousel slides');
      
      // Use fallback slides on error
      setSlides([
        {
          id: 'fallback-1',
          title: 'Welcome to Rehoboth Christian Church',
          subtitle: 'Experience faith, community, and transformation',
          description: 'Join us for worship, prayer, and fellowship as we grow together in God\'s love.',
          image: '/pastoral_care.jpeg',
          ctas: {
            primary: {
              text: 'Learn More',
              link: '/about',
              variant: 'primary'
            }
          },
          overlay: {
            gradient: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.5) 100%)',
            opacity: 0.6
          },
          textPosition: 'center',
          theme: 'dark'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Intersection Observer for animation triggers
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (carouselRef.current) {
      observer.observe(carouselRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Preload next slide for smooth transitions
  useEffect(() => {
    if (slides.length > 0) {
      const nextIndex = (currentIndex + 1) % slides.length;
      const nextSlide = slides[nextIndex];
      
      if (nextSlide?.image) {
        const img = new Image();
        img.src = nextSlide.image;
      }
    }
  }, [currentIndex, slides]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNext();
      } else if (event.key === ' ') {
        event.preventDefault();
        togglePlayPause();
      } else if (event.key >= '1' && event.key <= '9') {
        const slideIndex = parseInt(event.key) - 1;
        if (slideIndex < slides.length) {
          event.preventDefault();
          goToSlide(slideIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext, togglePlayPause, goToSlide, slides.length]);

  if (isLoading) {
    return (
      <section className="relative w-full h-[90vh] bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading carousel...</p>
        </div>
      </section>
    );
  }

  if (error) {
    console.warn('Carousel error:', error);
  }

  // Return early if no slides available
  if (slides.length === 0) {
    return (
      <section className="relative w-full h-[90vh] bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Welcome to Rehoboth Christian Church</h2>
          <p className="text-xl mb-8">Experience faith, community, and transformation</p>
          <Link href="/about">
            <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Learn More
            </button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={carouselRef}
      className="relative w-full h-[90vh] overflow-hidden bg-black mb-16 md:mb-20 lg:mb-24"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      data-testid="hero-carousel"
      style={{
        minHeight: '90vh',
        maxHeight: '90vh'
      }}
    >
      {/* Slides Container */}
      <div className="relative w-full min-h-[85vh] h-full">
        {slides.map((slide, index) => {
          const isActive = currentIndex === index;
          const isPrev = currentIndex === index - 1 || (currentIndex === 0 && index === slides.length - 1);
          const isNext = currentIndex === index + 1 || (currentIndex === slides.length - 1 && index === 0);
          
          return (
            <div 
              key={slide.id}
              className={`absolute inset-0 w-full min-h-[85vh] h-full transition-all duration-1000 ease-out ${
                isActive 
                  ? 'opacity-100 scale-100 z-20' 
                  : isPrev 
                    ? 'opacity-0 scale-105 -translate-x-full z-10'
                    : isNext
                      ? 'opacity-0 scale-105 translate-x-full z-10'
                      : 'opacity-0 scale-110 z-0'
              }`}
              data-testid={`carousel-slide-${index}`}
            >
              <CarouselSlide
                {...slide}
                isActive={isActive}
                slideIndex={index}
              />
            </div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      {slides.length > 1 && (
        <CarouselControls 
          onPrevious={goToPrevious} 
          onNext={goToNext} 
          isPlaying={isPlaying} 
          togglePlayPause={togglePlayPause}
        />
      )}
    </section>
  );
}