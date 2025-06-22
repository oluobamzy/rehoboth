"use client";

// src/components/hero/CarouselControls.tsx
import React from 'react';

interface CarouselControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  isPlaying: boolean;
  togglePlayPause: () => void;
}

export default function CarouselControls({
  onPrevious,
  onNext,
  isPlaying,
  togglePlayPause,
}: CarouselControlsProps) {
  return (
    <>
      {/* Left Control (Previous) */}
      <button
        className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-orange-500 hover:text-white flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-all z-10 shadow-lg group"
        onClick={onPrevious}
        aria-label="Previous Slide"
        style={{
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
        }}
      >
        <div className="relative overflow-hidden w-full h-full rounded-full flex items-center justify-center">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-orange-600 to-orange-400 transition-opacity"></div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 relative z-10 transition-transform group-hover:scale-110"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </div>
      </button>

      {/* Right Control (Next) */}
      <button
        className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-orange-500 hover:text-white flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-all z-10 shadow-lg group"
        onClick={onNext}
        aria-label="Next Slide"
        style={{
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
        }}
      >
        <div className="relative overflow-hidden w-full h-full rounded-full flex items-center justify-center">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-orange-400 to-orange-600 transition-opacity"></div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 relative z-10 transition-transform group-hover:scale-110"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </button>

      {/* Play/Pause Control */}
      <button
        className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm text-white hover:bg-white/40 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
        onClick={togglePlayPause}
        aria-label={isPlaying ? "Pause Carousel" : "Play Carousel"}
      >
        {isPlaying ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 9v6m4-6v6"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
          </svg>
        )}
      </button>
    </>
  );
}
