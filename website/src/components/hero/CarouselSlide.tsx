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
  // Use pastoral_care.jpeg as the primary background image
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
      
      {/* Overlay with gradient for better text readability - more subtle */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50"
        style={{
          zIndex: 2
        }}
      />
      
      {/* Content layout - Full width with centered text overlay */}
      <div 
        className="relative flex items-center justify-center h-full w-full"
        style={{
          zIndex: 3
        }}
      >
        {/* Text content area - Centered over the full background */}
        <div 
          className="relative flex items-center justify-center h-full w-full"
          style={{
            minHeight: '300px'
          }}
          data-testid="carousel-slide-content"
        >
          <div className="px-8 py-12 md:py-20 w-full max-w-5xl mx-auto text-center relative">
            {/* Content container with glass effect */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
              {/* Subtle accent line above title */}
              <div className="w-24 h-1.5 bg-gradient-to-r from-orange-400 to-orange-600 mb-8 rounded-full mx-auto shadow-lg"></div>
              
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 md:mb-8 leading-tight tracking-tight" 
                  style={{ textShadow: '0 4px 8px rgba(0,0,0,0.5)' }}>
                {title.split(' ').map((word, i) => 
                  i % 3 === 1 ? 
                    <span key={i} className="text-orange-300 drop-shadow-lg">{word} </span> : 
                    <span key={i}>{word} </span>
                )}
              </h2>
              
              {subtitle && (
                <p className="text-xl md:text-2xl text-gray-100 mb-10 md:mb-12 leading-relaxed max-w-4xl mx-auto font-light" 
                   style={{ textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
                  {subtitle}
                </p>
              )}
              
              <div className="flex flex-wrap gap-6 items-center justify-center">
                {ctaText && ctaLink && (
                  <Link href={ctaLink}>
                    <Button variant="primary" size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-xl hover:shadow-orange-500/30 transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold">
                      {ctaText}
                    </Button>
                  </Link>
                )}
                <Link href="/about">
                  <Button variant="outline" size="lg" className="border-2 border-white/60 text-white hover:bg-white hover:text-gray-900 shadow-xl hover:shadow-white/20 transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold backdrop-blur-sm">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
