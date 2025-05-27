"use client";

// src/hooks/useCarousel.ts
import { useState, useEffect, useCallback } from 'react';
import { CarouselSlideProps } from '@/components/hero/CarouselSlide';

export default function useCarousel(slides: CarouselSlideProps[], autoPlayDelay = 5000) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Function to go to a specific slide
  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    resetInactivityTimer();
  }, []);
  
  // Function to go to the previous slide
  const goToPrevious = useCallback(() => {
    const newIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setIsPlaying(false);
    resetInactivityTimer();
  }, [currentIndex, slides.length]);
  
  // Function to go to the next slide
  const goToNext = useCallback(() => {
    const newIndex = (currentIndex + 1) % slides.length;
    setCurrentIndex(newIndex);
    resetInactivityTimer();
  }, [currentIndex, slides.length]);
  
  // Function to toggle play/pause state
  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
    resetInactivityTimer();
  }, []);
  
  // Function to handle touch start event
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setIsPlaying(false);
  }, []);
  
  // Function to handle touch end event
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }
    
    resetInactivityTimer();
  }, [touchStart, goToNext, goToPrevious]);
  
  // Reset the inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    
    // Resume auto-play after 3 seconds of inactivity
    const timer = setTimeout(() => {
      setIsPlaying(true);
    }, 3000);
    
    setInactivityTimer(timer);
  }, [inactivityTimer]);
  
  // Auto-play logic
  useEffect(() => {
    if (!isPlaying || slides.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % slides.length);
    }, autoPlayDelay);
    
    return () => clearInterval(interval);
  }, [isPlaying, slides.length, autoPlayDelay]);
  
  // Clean up inactivity timer on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    };
  }, [inactivityTimer]);

  return {
    currentIndex,
    goToSlide,
    goToPrevious,
    goToNext,
    isPlaying,
    togglePlayPause,
    handleTouchStart,
    handleTouchEnd
  };
}
