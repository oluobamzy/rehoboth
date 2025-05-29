// src/components/sermons/__tests__/SermonPlayer.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SermonPlayer from '../SermonPlayer';
import { posthog } from '@/services/posthog';

// Mock the PostHog service
jest.mock('@/services/posthog', () => ({
  posthog: {
    capture: jest.fn()
  }
}));

// Mock the sermon service
jest.mock('@/services/sermonService', () => ({
  // incrementSermonViewCount: jest.fn()
}));

// Mock the analytics service
jest.mock('@/services/analyticsService', () => ({
  trackPlaybackStarted: jest.fn(),
  trackPlaybackProgress: jest.fn(),
  trackPlaybackCompleted: jest.fn(),
  trackPlaybackSpeed: jest.fn(),
  trackPlaybackQuality: jest.fn(),
  trackSermonDownload: jest.fn(),
}));

// Mock HLS.js
jest.mock('hls.js', () => {
  const mockConstructor = jest.fn().mockImplementation(() => {
    const instance = {
      loadSource: jest.fn(),
      attachMedia: jest.fn(),
      on: jest.fn(),
      destroy: jest.fn(),
      levels: [
        { height: 240, width: 426, bitrate: 400000 },
        { height: 360, width: 640, bitrate: 800000 },
        { height: 720, width: 1280, bitrate: 3000000 }
      ],
      currentLevel: -1,
      nextLevel: -1,
      loadLevel: -1
    };

    // Add event listener support
    instance.on.mockImplementation((event, callback) => {
      if (event === 'manifestparsed') {
        setTimeout(() => callback(), 10);
      }
      return instance;
    });

    return instance;
  });

  Object.defineProperty(mockConstructor, 'isSupported', {
    value: jest.fn(() => true),
    writable: true
  });

  Object.defineProperty(mockConstructor, 'Events', {
    value: {
      MANIFEST_PARSED: 'manifestparsed',
      LEVEL_SWITCHED: 'level-switched',
      ERROR: 'error',
    },
    writable: true
  });

  Object.defineProperty(mockConstructor, 'ErrorTypes', {
    value: {
      NETWORK_ERROR: 'networkError',
      MEDIA_ERROR: 'mediaError',
    },
    writable: true
  });
  
  return mockConstructor;
});

// Mock HTML5 media elements that are not implemented in JSDOM
window.HTMLMediaElement.prototype.load = jest.fn();
window.HTMLMediaElement.prototype.play = jest.fn();
window.HTMLMediaElement.prototype.pause = jest.fn();
Object.defineProperty(window.HTMLMediaElement.prototype, 'duration', {
  writable: true,
  value: 300 // 5 minutes for testing
});

describe('SermonPlayer Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    });
  });

  it('renders audio player when only audio URL is provided', () => {
    render(
      <SermonPlayer
        audioUrl="https://example.com/audio.mp3"
        title="Test Sermon"
        sermonId="123"
      />
    );

    // Audio player should be rendered (though hidden in the DOM)
    expect(document.querySelector('audio')).toBeInTheDocument();
    
    // Verify the title is displayed in the audio player view
    expect(screen.getByText('Test Sermon')).toBeInTheDocument();
  });

  it('renders video player when video URL is provided', () => {
    render(
      <SermonPlayer
        videoUrl="https://example.com/video.mp4"
        title="Test Video Sermon"
        sermonId="123"
      />
    );

    // Video player should be rendered
    expect(document.querySelector('video')).toBeInTheDocument();
  });

  it('shows a message when no media is available', () => {
    render(
      <SermonPlayer
        title="No Media Sermon"
        sermonId="123"
      />
    );

    // Should show a "no media available" message
    expect(screen.getByText('No media available for this sermon.')).toBeInTheDocument();
  });

  it('tracks sermon view when media is loaded', async () => {
    const analyticsService = require('@/services/analyticsService');
    render(
      <SermonPlayer
        audioUrl="https://example.com/audio.mp3"
        title="Track View Test"
        sermonId="456"
      />
    );

    // Simulate media loaded event
    const audio = document.querySelector('audio');
    if (audio) {
      fireEvent.loadedMetadata(audio);
    }

    // Verify analytics event was captured
    await waitFor(() => {
      expect(analyticsService.trackPlaybackStarted).toHaveBeenCalledWith('456', 'audio');
    });
  });

  it('handles play/pause button clicks', () => {
    render(
      <SermonPlayer
        videoUrl="https://example.com/video.mp4"
        title="Play Pause Test"
        sermonId="789"
      />
    );

    // Find play button by aria-label and click it
    const playButton = screen.getByLabelText('Play');
    fireEvent.click(playButton);
    
    // Verify play was called
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
    
    // For testing pause, we need to simulate that the media is currently playing
    // by updating the component state
    const video = document.querySelector('video');
    if (video) {
      fireEvent.play(video);
    }
    
    // Now the button should have changed to "Pause"
    const pauseButton = screen.getByLabelText('Pause');
    fireEvent.click(pauseButton);
    
    // Verify pause was called
    expect(window.HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });

  it('saves playback position to localStorage', () => {
    render(
      <SermonPlayer
        audioUrl="https://example.com/audio.mp3"
        title="Save Progress Test"
        sermonId="progress123"
      />
    );

    // Simulate timeupdate event with currentTime
    const audio = document.querySelector('audio');
    if (!audio) {
      throw new Error('Audio element not found');
    }
    Object.defineProperty(audio, 'currentTime', {
      value: 120 // 2 minutes in
    });
    
    fireEvent.timeUpdate(audio);
    
    // Verify localStorage.setItem was called to save progress
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      'sermon_progress_progress123', 
      '120'
    );
  });

  it('loads saved progress from localStorage', () => {
    // Mock localStorage to return a saved position
    (window.localStorage.getItem as jest.Mock).mockReturnValue('60'); // 1 minute in
    
    render(
      <SermonPlayer
        audioUrl="https://example.com/audio.mp3"
        title="Load Progress Test"
        sermonId="savedProgress123"
      />
    );
    
    // Verify localStorage was checked for saved progress
    expect(window.localStorage.getItem).toHaveBeenCalledWith(
      'sermon_progress_savedProgress123'
    );
    
    // Verify the audio element's currentTime was set
    const audio = document.querySelector('audio');
    if (audio) {
      expect(audio.currentTime).toBe(60);
    } else {
      throw new Error('Audio element not found');
    }
  });
});
