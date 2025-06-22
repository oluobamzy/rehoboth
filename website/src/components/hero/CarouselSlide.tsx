"use client";

// src/components/hero/CarouselSlide.tsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/common/Button';

export interface CarouselSlideProps {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  ctaText?: string;
  ctaLink?: string;
}

export default function CarouselSlide({
  title,
  subtitle,
  imageUrl,
  ctaText,
  ctaLink,
}: CarouselSlideProps) {
  // Fallback to a default image if none is provided
  const backgroundImage = '/pastoral_care.jpeg';
  
  // Track image loading status
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // For debugging
  useEffect(() => {
    console.log('CarouselSlide state:', { 
      title, 
      imageUrl, 
      backgroundImage,
      imageLoaded,
      imageError
    });
  }, [title, imageUrl, backgroundImage, imageLoaded, imageError]);
  
  // Use reliable CSS background image with enhanced fallback logic
  const backgroundImageUrl = imageError ? '/pastoral_care.jpeg' : backgroundImage;
  
  // Create a reliable background style value, with fallback for critical errors
  let bgStyleValue;
  try {
    // Use high-quality image processing parameters for Unsplash or other external URLs
    if (backgroundImageUrl.includes('unsplash.com') && !backgroundImageUrl.includes('q=')) {
      // Add quality parameters for Unsplash images
      const enhancedUrl = backgroundImageUrl.includes('?') 
        ? `${backgroundImageUrl}&q=85&auto=format&fit=crop` 
        : `${backgroundImageUrl}?q=85&auto=format&fit=crop`;
      bgStyleValue = `url('${enhancedUrl}')`;
    } else {
      bgStyleValue = `url('${backgroundImageUrl}')`;
    }
  } catch (err) {
    console.error("Error creating background style:", err);
    bgStyleValue = "url('/rehoboth_logo_plain.png')";
  }
  
  // Show debug mode when in development or through a URL param
  const debugMode = process.env.NODE_ENV === 'development' || 
                    (typeof window !== 'undefined' && window.location.search.includes('debug=true'));
                    
  return (
    <div 
      className="relative h-full w-full" 
      data-carousel-slide 
      data-image-url={backgroundImageUrl}
      style={{ 
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        margin: '0 auto'
      }}
    >
      {/* Full width background image container */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: bgStyleValue,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'absolute',
          zIndex: 1,
          filter: 'contrast(1.1) brightness(0.85)',
        }}
        data-testid="carousel-slide-background"
        data-image-url={backgroundImage}
      />
      
      {/* Overlay with gradient for better text readability */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/30"
        style={{
          zIndex: 2
        }}
      />
      
      {/* Content layout */}
      <div 
        className="relative flex flex-col-reverse md:flex-row h-full w-full"
        style={{
          zIndex: 3
        }}
      >
        {/* Text content area */}
        <div 
          className="relative md:w-1/2 h-full md:h-full flex items-center backdrop-blur-sm"
          style={{
            minHeight: '300px'
          }}
          data-testid="carousel-slide-content"
        >
          <div className="px-8 py-10 md:py-0 md:px-16 w-full relative">
            {/* Subtle accent line above title */}
            <div className="w-20 h-1 bg-orange-500 mb-6 rounded-full"></div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-5 md:mb-7 leading-tight">
              {title.split(' ').map((word, i) => 
                i % 3 === 1 ? 
                  <span key={i} className="text-orange-400">{word} </span> : 
                  <span key={i}>{word} </span>
              )}
            </h2>
            
            {subtitle && (
              <p className="text-lg md:text-xl text-gray-300 mb-8 md:mb-10 leading-relaxed max-w-xl">
                {subtitle}
              </p>
            )}
            
            <div className="flex flex-wrap gap-4 items-center mt-10">
              {ctaText && ctaLink && (
                <Link href={ctaLink}>
                  <Button variant="primary" size="lg" className="shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
                    {ctaText}
                  </Button>
                </Link>
              )}
              <Link href="/about">
                <Button variant="outline" size="lg" className="border-orange-400 text-orange-400 hover:bg-orange-500 hover:text-white shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Visual side - empty container that shows the background image */}
        <div className="relative md:w-1/2 h-[250px] md:h-full overflow-hidden">
          {/* This area will show the background image with gradient overlay */}
        </div>
      </div>
    </div>
  );
}
