"use client";

// src/components/hero/HeroCarousel.tsx
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import CarouselSlide, { CarouselSlideProps } from './CarouselSlide';
import CarouselControls from './CarouselControls';
import CarouselIndicators from './CarouselIndicators';
import { fetchCarouselSlides } from '@/services/carouselService';
import useCarousel from '@/hooks/useCarousel';

export default function HeroCarousel() {
  const { data: slides, isLoading, error } = useQuery({
    queryKey: ['carouselSlides'],
    queryFn: fetchCarouselSlides,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

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
      subtitle: 'Join us for Sunday worship at 10:00 AM',
      imageUrl: 'https://images.unsplash.com/photo-1602437098422-419392a1b766?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
      ctaText: 'Learn More',
      ctaLink: '/about'
    },
    {
      id: '2',
      title: 'Join Our Community',
      subtitle: 'Find fellowship, purpose, and spiritual growth',
      imageUrl: 'https://images.unsplash.com/photo-1536500152107-01ab1422f932?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
      ctaText: 'Get Involved',
      ctaLink: '/ministries'
    },
    {
      id: '3',
      title: 'Sunday School for All Ages',
      subtitle: 'Every Sunday at 9:00 AM',
      imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
      ctaText: 'View Schedule',
      ctaLink: '/events'
    }
  ];
  
  // Use placeholder slides during development or when API fails
  const displaySlides = slides?.length ? slides : placeholderSlides;

  // Handle edge cases
  if (isLoading) {
    return <div className="flex items-center justify-center h-[500px]">Loading...</div>;
  }
  
  // Only show error if both API data and placeholders are unavailable
  if (!slides?.length && !placeholderSlides.length) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-gray-100">
        <p className="text-gray-600">Unable to load carousel content</p>
      </div>
    );
  }

  return (
    <div 
      className="relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="flex transition-transform duration-500" 
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {displaySlides.map((slide) => (
          <div key={slide.id} className="w-full flex-shrink-0">
            <CarouselSlide
              id={slide.id}
              title={slide.title}
              subtitle={slide.subtitle}
              imageUrl={slide.imageUrl}
              ctaText={slide.ctaText}
              ctaLink={slide.ctaLink}
            />
          </div>
        ))}
      </div>

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
    </div>
  );
}
