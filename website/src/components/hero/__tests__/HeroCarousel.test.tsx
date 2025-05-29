// src/components/hero/__tests__/HeroCarousel.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HeroCarousel from '../HeroCarousel'; 
import type { CarouselSlideProps as CarouselSlideData } from '../CarouselSlide'; // Import CarouselSlideProps as CarouselSlideData

jest.mock('@/hooks/useCarousel');

// Mock the carousel service
jest.mock('@/services/carouselService', () => ({
  fetchCarouselSlides: jest.fn(),
}));

// Create a wrapper with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const MockSlideComponent = ({ slide }: { slide: CarouselSlideData }) => (
  <div data-testid={`slide-${slide.id}`}>{slide.title}</div>
);
MockSlideComponent.displayName = 'MockSlideComponent'; // Add display name

describe('HeroCarousel component', () => {
  const mockSlides = [
    {
      id: '1',
      title: 'Test Slide 1',
      subtitle: 'Subtitle 1',
      imageUrl: 'https://example.com/image1.jpg',
      ctaText: 'Learn More',
      ctaLink: '/test1',
    },
    {
      id: '2',
      title: 'Test Slide 2',
      subtitle: 'Subtitle 2',
      imageUrl: 'https://example.com/image2.jpg',
      ctaText: 'Get Started',
      ctaLink: '/test2',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state when data is being fetched', () => {
    (carouselService.fetchCarouselSlides as jest.Mock).mockReturnValue(new Promise(() => {}));
    
    render(<HeroCarousel />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders error state when there is an error fetching data', async () => {
    (carouselService.fetchCarouselSlides as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));
    
    render(<HeroCarousel />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // It should fall back to placeholder slides, not show error
    expect(screen.queryByText('Unable to load carousel content')).not.toBeInTheDocument();
  });

  test('renders carousel slides when data is loaded', async () => {
    (carouselService.fetchCarouselSlides as jest.Mock).mockResolvedValue(mockSlides);
    
    render(<HeroCarousel />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('Test Slide 1')).toBeInTheDocument();
    expect(screen.getByText('Subtitle 1')).toBeInTheDocument();
    expect(screen.getByText('Learn More')).toBeInTheDocument();
  });

  test('navigates to the next slide when next button is clicked', async () => {
    (carouselService.fetchCarouselSlides as jest.Mock).mockResolvedValue(mockSlides);
    
    render(<HeroCarousel />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Initially, the first slide should be visible
    expect(screen.getByText('Test Slide 1')).toBeInTheDocument();
    
    // Click the next button
    fireEvent.click(screen.getByLabelText('Next Slide'));
    
    // The second slide should now be visible
    expect(screen.getByText('Test Slide 2')).toBeInTheDocument();
  });

  test('navigates to the previous slide when previous button is clicked', async () => {
    (carouselService.fetchCarouselSlides as jest.Mock).mockResolvedValue(mockSlides);
    
    render(<HeroCarousel />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Go to the second slide first
    fireEvent.click(screen.getByLabelText('Next Slide'));
    expect(screen.getByText('Test Slide 2')).toBeInTheDocument();
    
    // Now go back to the first slide
    fireEvent.click(screen.getByLabelText('Previous Slide'));
    expect(screen.getByText('Test Slide 1')).toBeInTheDocument();
  });

  test('navigates to a specific slide when indicator is clicked', async () => {
    (carouselService.fetchCarouselSlides as jest.Mock).mockResolvedValue(mockSlides);
    
    render(<HeroCarousel />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Click the second indicator
    fireEvent.click(screen.getByLabelText('Go to slide 2'));
    
    // The second slide should be visible
    expect(screen.getByText('Test Slide 2')).toBeInTheDocument();
  });

  test('toggles play/pause when play/pause button is clicked', async () => {
    (carouselService.fetchCarouselSlides as jest.Mock).mockResolvedValue(mockSlides);
    
    render(<HeroCarousel />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Initially, the carousel should be playing (pause button visible)
    expect(screen.getByLabelText('Pause Carousel')).toBeInTheDocument();
    
    // Click the pause button
    fireEvent.click(screen.getByLabelText('Pause Carousel'));
    
    // Now the play button should be visible
    expect(screen.getByLabelText('Play Carousel')).toBeInTheDocument();
  });
});
