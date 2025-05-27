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
    <div className="absolute bottom-6 left-0 right-0 flex justify-center">
      <div className="flex space-x-2">
        {Array.from({ length: slideCount }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`w-3 h-3 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              currentIndex === index 
                ? 'bg-white scale-110' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
