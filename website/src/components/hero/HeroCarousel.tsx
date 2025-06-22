"use client";

// src/components/hero/HeroCarousel.tsx
import React, { useCallback, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import CarouselSlide, { CarouselSlideProps } from './CarouselSlide';
import CarouselControls from './CarouselControls';
import CarouselIndicators from './CarouselIndicators';
import { fetchCarouselSlides } from '@/services/carouselService';
import useCarousel from '@/hooks/useCarousel';

export default function HeroCarousel() {
  const { data: slides, isLoading } = useQuery({
    queryKey: ['carouselSlides'],
    queryFn: fetchCarouselSlides,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Reference to the carousel element for debugging
  const carouselRef = useRef<HTMLElement>(null);

  const {
    currentIndex,
    goToSlide,
    goToPrevious,
    goToNext,
    isPlaying,
    togglePlayPause,
    handleTouchStart,
    handleTouchEnd
  } = useCarousel(slides || [], 5000);
  
  // Placeholder slides for development, will be replaced by API data
  const placeholderSlides: CarouselSlideProps[] = [
    {
      id: '1',
      title: 'Welcome to Rehoboth Christian Church',
      subtitle: 'Join us for Sunday worship at 10:00 AM. We are a community committed to following Jesus Christ and serving our neighbors with compassion and love.',
      imageUrl: '/rehoboth_logo_plain.png',
      ctaText: 'Learn More',
      ctaLink: '/about'
    },
    {
      id: '2',
      title: 'Join Our Community',
      subtitle: 'Find fellowship, purpose, and spiritual growth in our vibrant church family. Connect with others who share your faith and values.',
      imageUrl: 'https://images.unsplash.com/photo-1536500152107-01ab1422f932?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
      ctaText: 'Get Involved',
      ctaLink: '/ministries'
    },
    {
      id: '3',
      title: 'Sunday School for All Ages',
      subtitle: 'Every Sunday at 9:00 AM. Our classes provide Biblical teaching and spiritual formation for children, teens, and adults.',
      imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
      ctaText: 'View Schedule',
      ctaLink: '/events'
    }
  ];
  
  // Use placeholder slides during development or when API fails
  const displaySlides = slides?.length ? slides : placeholderSlides;

  // Debug slide visibility issues
  useEffect(() => {
    // Only run in development mode
    if (process.env.NODE_ENV !== 'development') return;
    
    console.log(`Carousel has ${displaySlides.length} slides, current index: ${currentIndex}`);
    console.log('Active slide:', displaySlides[currentIndex]);
  }, [displaySlides, currentIndex]);

  // Handle edge cases
  if (isLoading) {
    return <div className="flex items-center justify-center h-[600px] bg-gray-900">Loading...</div>;
  }
  
  // Only show error if both API data and placeholders are unavailable
  if (!slides?.length && !placeholderSlides.length) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-900">
        <p className="text-gray-300">Unable to load carousel content</p>
      </div>
    );
  }

  return (
    <section 
      ref={carouselRef}
      className="relative w-full h-[600px] bg-gradient-to-r from-gray-900 to-gray-800"
      style={{ 
        position: 'relative',
        width: '100%',
        height: '600px', 
        overflow: 'hidden'
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      data-testid="hero-carousel"
      data-carousel="hero"
      id="hero-carousel"
    >
      {/* Carousel Slides Container */}
      <div 
        className="carousel-slides-container" 
        style={{ 
          position: 'relative',
          width: '100%',
          height: '100%' 
        }} 
        data-slides-container
      >
        {displaySlides.map((slide, index) => {
          const isActive = currentIndex === index;
          
          // Enhanced visibility and positioning styles
          return (
            <div 
              key={slide.id}
              className={`carousel-slide ${
                isActive ? 'active-slide' : 'inactive-slide'
              }`}
              style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100%',
                opacity: isActive ? 1 : 0,
                zIndex: isActive ? 10 : 0,
                transition: 'opacity 500ms ease-in-out, visibility 500ms ease-in-out',
                visibility: isActive ? 'visible' : 'hidden',
                pointerEvents: isActive ? 'auto' : 'none',
              }}
              aria-hidden={!isActive}
              data-testid={`carousel-slide-${index}`}
              data-slide={`slide-${index}`}
              data-active={isActive ? "true" : "false"}
            >
              <CarouselSlide
                id={slide.id}
                title={slide.title}
                subtitle={slide.subtitle}
                imageUrl={slide.imageUrl}
                ctaText={slide.ctaText}
                ctaLink={slide.ctaLink}
              />
            </div>
          );
        })}
      </div>

      {/* Carousel Controls - These are positioned on top with higher z-index */}
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
    </section>
  );
}
