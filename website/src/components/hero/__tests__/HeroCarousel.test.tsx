// src/components/hero/__tests__/HeroCarousel.test.tsx// src/components/hero/__tests__/HeroCarousel.test.tsx

import React from 'react';import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';import { render, screen, fireEvent } from '@testing-library/react';

import HeroCarousel from '../HeroCarousel'; import HeroCarousel from '../HeroCarousel'; 

import { HeroCarouselItem } from '@/data/heroCarouselData';import { HeroCarouselItem } from '@/data/heroCarouselData';



jest.mock('@/hooks/useCarousel');jest.mock('@/hooks/useCarousel');



// Mock CarouselSlide, CarouselControls, and CarouselIndicators// Mock CarouselSlide, CarouselControls, and CarouselIndicators

jest.mock('../CarouselSlide', () => {jest.mock('../CarouselSlide', () => {

  return function MockCarouselSlide({ title, subtitle, description, id }: HeroCarouselItem) {  return function MockCarouselSlide({ title, subtitle, description, id }: HeroCarouselItem) {

    return (    return (

      <div data-testid={`slide-${id}`}>      <div data-testid={`slide-${id}`}>

        <h2>{title}</h2>        <h2>{title}</h2>

        {subtitle && <p>{subtitle}</p>}        {subtitle && <p>{subtitle}</p>}

        <p>{description}</p>        <p>{description}</p>

      </div>      </div>

    );    );

  };  };

});});



jest.mock('../CarouselControls', () => {jest.mock('../CarouselControls', () => {

  return function MockCarouselControls() {  return function MockCarouselControls() {

    return <div data-testid="carousel-controls">Controls</div>;    return <div data-testid="carousel-controls">Controls</div>;

  };  };

});});



jest.mock('../CarouselIndicators', () => {jest.mock('../CarouselIndicators', () => {

  return function MockCarouselIndicators() {  return function MockCarouselIndicators() {

    return <div data-testid="carousel-indicators">Indicators</div>;    return <div data-testid="carousel-indicators">Indicators</div>;

  };  };

});});



describe('HeroCarousel', () => {describe('HeroCarousel', () => {

  const mockUseCarousel = {  const mockUseCarousel = {

    currentIndex: 0,    currentIndex: 0,

    goToSlide: jest.fn(),    goToSlide: jest.fn(),

    goToPrevious: jest.fn(),    goToPrevious: jest.fn(),

    goToNext: jest.fn(),    goToNext: jest.fn(),

    isPlaying: true,    isPlaying: true,

    togglePlayPause: jest.fn(),    togglePlayPause: jest.fn(),

    handleTouchStart: jest.fn(),    handleTouchStart: jest.fn(),

    handleTouchEnd: jest.fn(),    handleTouchEnd: jest.fn(),

  };  };



  beforeEach(() => {  beforeEach(() => {

    jest.clearAllMocks();    jest.clearAllMocks();

    const useCarousel = require('@/hooks/useCarousel').default;    const useCarousel = require('@/hooks/useCarousel').default;

    useCarousel.mockReturnValue(mockUseCarousel);    useCarousel.mockReturnValue(mockUseCarousel);

  });  });



  test('renders carousel with static data', () => {  test('renders carousel with static data', () => {

    render(<HeroCarousel />);    render(<HeroCarousel />);

        

    // Since we're using static data, the carousel should render immediately    // Since we're using static data, the carousel should render immediately

    expect(screen.getByTestId('hero-carousel')).toBeInTheDocument();    expect(screen.getByTestId('hero-carousel')).toBeInTheDocument();

    expect(screen.getByTestId('carousel-controls')).toBeInTheDocument();    expect(screen.getByTestId('carousel-controls')).toBeInTheDocument();

    expect(screen.getByTestId('carousel-indicators')).toBeInTheDocument();    expect(screen.getByTestId('carousel-indicators')).toBeInTheDocument();

  });  });



  test('handles keyboard navigation', () => {  test('handles keyboard navigation', () => {

    render(<HeroCarousel />);    render(<HeroCarousel />);

        

    // Test arrow keys    // Test arrow keys

    fireEvent.keyDown(window, { key: 'ArrowLeft' });    fireEvent.keyDown(window, { key: 'ArrowLeft' });

    expect(mockUseCarousel.goToPrevious).toHaveBeenCalled();    expect(mockUseCarousel.goToPrevious).toHaveBeenCalled();

        

    fireEvent.keyDown(window, { key: 'ArrowRight' });    fireEvent.keyDown(window, { key: 'ArrowRight' });

    expect(mockUseCarousel.goToNext).toHaveBeenCalled();    expect(mockUseCarousel.goToNext).toHaveBeenCalled();

        

    // Test spacebar    // Test spacebar

    fireEvent.keyDown(window, { key: ' ' });    fireEvent.keyDown(window, { key: ' ' });

    expect(mockUseCarousel.togglePlayPause).toHaveBeenCalled();    expect(mockUseCarousel.togglePlayPause).toHaveBeenCalled();

  });  });



  test('handles touch events', () => {  test('handles touch events', () => {

    render(<HeroCarousel />);    render(<HeroCarousel />);

        

    const carousel = screen.getByTestId('hero-carousel');    const carousel = screen.getByTestId('hero-carousel');

        

    // Test touch start    // Test touch start

    fireEvent.touchStart(carousel);    fireEvent.touchStart(carousel);

    expect(mockUseCarousel.handleTouchStart).toHaveBeenCalled();    expect(mockUseCarousel.handleTouchStart).toHaveBeenCalled();

        

    // Test touch end    // Test touch end

    fireEvent.touchEnd(carousel);    fireEvent.touchEnd(carousel);

    expect(mockUseCarousel.handleTouchEnd).toHaveBeenCalled();    expect(mockUseCarousel.handleTouchEnd).toHaveBeenCalled();

  });  });

});});