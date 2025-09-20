"use client";

// src/components/hero/HeroCarousel.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import CarouselSlide from './CarouselSlide';
import CarouselControls from './CarouselControls';
import CarouselIndicators from './CarouselIndicators';
import { fetchCarouselSlides } from '@/services/carouselService';
import useCarousel from '@/hooks/useCarousel';
import { HeroCarousels } from '@/data/heroCarouselData';

export default function HeroCarousel() {
  const { data: apiSlides, isLoading, error } = useQuery({
    queryKey: ['carouselSlides'],
    queryFn: fetchCarouselSlides,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once for better UX
  });

  // Use curated slides as primary content, fallback to API if available
  const displaySlides = HeroCarousels; // Always use our curated content for now
  
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
  } = useCarousel(displaySlides, 6000); // 6 second intervals for professional feel

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
    const nextIndex = (currentIndex + 1) % displaySlides.length;
    const nextSlide = displaySlides[nextIndex];
    
    if (nextSlide?.image) {
      const img = new Image();
      img.src = nextSlide.image;
    }
  }, [currentIndex, displaySlides]);

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
        if (slideIndex < displaySlides.length) {
          event.preventDefault();
          goToSlide(slideIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext, togglePlayPause, goToSlide, displaySlides.length]);

  if (isLoading) {
    return (
      <section className="relative w-full h-[90vh] bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            <p className="text-white/90 text-lg font-medium">Loading Experience...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || displaySlides.length === 0) {
    return (
      <section className="relative w-full h-[90vh] bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Welcome to Rehoboth Christian Church</h2>
          <p className="text-xl mb-8">Experience faith, community, and transformation</p>
          <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            Learn More
          </button>
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
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <div className="h-1 bg-white/20">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-blue-400 transition-all duration-100 ease-linear"
            style={{ width: `${((currentIndex + 1) / displaySlides.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Slides Container */}
      <div className="relative w-full min-h-[85vh] h-full">
        {displaySlides.map((slide, index) => {
          const isActive = currentIndex === index;
          const isPrev = currentIndex === index - 1 || (currentIndex === 0 && index === displaySlides.length - 1);
          const isNext = currentIndex === index + 1 || (currentIndex === displaySlides.length - 1 && index === 0);
          
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
      {displaySlides.length > 1 && (
        <>
          <CarouselControls 
            onPrevious={goToPrevious} 
            onNext={goToNext} 
            isPlaying={isPlaying} 
            togglePlayPause={togglePlayPause}
          />
          <CarouselIndicators 
            slideCount={displaySlides.length} 
            currentIndex={currentIndex} 
            goToSlide={goToSlide}
          />
        </>
      )}

      {/* Scroll Indicator - Positioned to avoid button conflicts */}
      <div className="absolute bottom-2 right-4 md:right-8 z-20 hidden md:block">
        <div className="flex flex-col items-center space-y-1 text-white/50">
          <span className="text-xs font-medium tracking-wide">SCROLL</span>
          <svg 
            className="w-4 h-4 animate-bounce" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
