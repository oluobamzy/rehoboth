"use client";

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
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl text-white hover:from-green-500/90 hover:to-green-600/90 hover:text-white flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-green-400/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 z-30 shadow-2xl group transform hover:scale-110 active:scale-95"
        onClick={onPrevious}
        aria-label="Previous Slide"
        style={{
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}
      >
        <div className="relative overflow-hidden w-full h-full rounded-full flex items-center justify-center">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-green-400 via-green-500 to-green-600 transition-all duration-500"></div>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white rounded-full animate-ping"></div>
          <svg
            className="h-7 w-7 md:h-8 md:w-8 relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-lg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </div>
      </button>

      {/* Right Control (Next) */}
      <button
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl text-white hover:from-green-500/90 hover:to-green-600/90 hover:text-white flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-green-400/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 z-30 shadow-2xl group transform hover:scale-110 active:scale-95"
        onClick={onNext}
        aria-label="Next Slide"
        style={{
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}
      >
        <div className="relative overflow-hidden w-full h-full rounded-full flex items-center justify-center">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-green-400 via-green-500 to-green-600 transition-all duration-500"></div>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white rounded-full animate-ping"></div>
          <svg
            className="h-7 w-7 md:h-8 md:w-8 relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-lg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </button>

      {/* Play/Pause Control */}
      <button
        className="absolute bottom-6 right-6 md:bottom-8 md:right-8 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-white/25 to-white/15 backdrop-blur-xl text-white hover:from-blue-500/90 hover:to-blue-600/90 hover:text-white flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 z-30 shadow-xl group transform hover:scale-110 active:scale-95"
        onClick={togglePlayPause}
        aria-label={isPlaying ? "Pause Carousel" : "Play Carousel"}
        style={{
          backdropFilter: 'blur(16px)',
          boxShadow: '0 6px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}
      >
        <div className="relative overflow-hidden w-full h-full rounded-full flex items-center justify-center">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 transition-all duration-500"></div>
          {isPlaying ? (
            <svg
              className="h-6 w-6 md:h-7 md:w-7 relative z-10 transition-all duration-300 group-hover:scale-110"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 9v6m4-6v6"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6 md:h-7 md:w-7 relative z-10 transition-all duration-300 group-hover:scale-110 ml-0.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </div>
      </button>

      {/* Control Labels for Enhanced UX */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
        <div className="flex justify-between items-end text-white/60 text-xs font-medium">
          <div className="hidden md:block">
            <kbd className="px-2 py-1 bg-black/20 rounded text-xs">←</kbd>
            <span className="ml-2">Previous</span>
          </div>
          <div className="hidden md:block">
            <span className="mr-2">Next</span>
            <kbd className="px-2 py-1 bg-black/20 rounded text-xs">→</kbd>
          </div>
        </div>
      </div>
    </>
  );
}
