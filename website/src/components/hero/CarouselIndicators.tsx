"use client";

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
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:bottom-8 flex justify-center z-30">
      <div 
        className="flex items-center space-x-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-black/30 to-black/20 backdrop-blur-xl shadow-2xl border border-white/10" 
        style={{ 
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
      >
        {/* Slide Counter */}
        <div className="hidden md:flex items-center mr-4 text-white/80 font-medium text-sm">
          <span className="text-green-400 font-bold">{currentIndex + 1}</span>
          <span className="mx-1">/</span>
          <span>{slideCount}</span>
        </div>

        {/* Indicators */}
        <div className="flex items-center space-x-3 relative">
          {Array.from({ length: slideCount }).map((_, index) => {
            const isActive = currentIndex === index;
            const isPrevious = index < currentIndex;
            const isNext = index > currentIndex;
            
            return (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`group relative flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-green-400/50 rounded-full transition-all duration-500 ${
                  isActive ? 'z-10' : 'z-0'
                }`}
                style={{
                  transform: isActive ? 'scale(1.2)' : 'scale(1)'
                }}
              >
                {/* Background indicator */}
                <div 
                  className={`relative rounded-full transition-all duration-500 ease-out ${
                    isActive 
                      ? 'w-12 h-3 bg-gradient-to-r from-green-400 via-green-500 to-green-600 shadow-lg' 
                      : 'w-3 h-3 bg-white/60 hover:bg-white/80 group-hover:scale-110'
                  }`}
                >
                  {/* Active indicator inner glow */}
                  {isActive && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-300 to-green-500 animate-pulse opacity-60"></div>
                      <div className="absolute inset-0 rounded-full bg-white/30 animate-ping"></div>
                    </>
                  )}
                  
                  {/* Progress indicator for active slide */}
                  {isActive && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-1 bg-white/90 rounded-full relative overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full bg-white rounded-full transition-all duration-100 ease-linear"
                          style={{ 
                            width: '0%',
                            animation: 'progress 5s linear infinite'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Slide preview on hover (for larger screens) */}
                <div className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none hidden lg:block ${
                  isActive ? 'scale-0' : 'scale-100'
                }`}>
                  <div className="bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    Slide {index + 1}
                  </div>
                  <div className="w-2 h-2 bg-black/80 rotate-45 mx-auto -mt-1"></div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Progress bar for all slides */}
        <div className="hidden md:flex items-center ml-4">
          <div className="w-20 h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: `${((currentIndex + 1) / slideCount) * 100}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Keyboard navigation hint */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-xs font-medium hidden lg:block">
        Use ← → or click to navigate
      </div>

      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
