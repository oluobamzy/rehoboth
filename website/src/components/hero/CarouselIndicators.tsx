"use client";

// src/components/hero/CarouselIndicators.tsx
import React from 'react';

interface CarouselIndicatorsProps {
  slideCount: number;
  currentIndex: number;
  goToSlide: (index: number) => void;
}

export default function CarouselIndicators({
  slideCount,
  currentIndex,
  goToSlide,
}: CarouselIndicatorsProps) {
  return (
    <div className="absolute bottom-6 left-0 right-0 md:left-8 md:right-auto md:bottom-8 flex justify-center md:justify-start z-10">
      <div className="flex space-x-3 px-4 py-3 rounded-full bg-black/20 backdrop-blur-sm shadow-lg" style={{ backdropFilter: 'blur(8px)' }}>
        {Array.from({ length: slideCount }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 ${
              currentIndex === index 
                ? 'bg-orange-500 scale-110 shadow-md' 
                : 'bg-white/70 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
