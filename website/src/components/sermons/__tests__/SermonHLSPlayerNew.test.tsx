// src/components/sermons/__tests__/SermonHLSPlayer.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SermonPlayerNew from '../SermonPlayerNew';

// Mock services
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
  const mockHls = jest.fn().mockImplementation(() => ({
    loadSource: jest.fn(),
    attachMedia: jest.fn(),
    on: jest.fn((event, callback) => {
      if (event === 'manifestparsed') {
        setTimeout(() => callback(), 10);
      }
    }),
    destroy: jest.fn(),
    levels: [
      { height: 240, width: 426, bitrate: 400000 },
      { height: 360, width: 640, bitrate: 800000 },
      { height: 720, width: 1280, bitrate: 3000000 }
    ],
    currentLevel: -1,
    nextLevel: -1,
    loadLevel: -1
  }));
  
  Object.defineProperty(mockHls, 'isSupported', {
    value: jest.fn(() => true),
    writable: true
  });
  
  Object.defineProperty(mockHls, 'Events', {
    value: {
      MANIFEST_PARSED: 'manifestparsed',
      LEVEL_SWITCHED: 'level-switched',
      ERROR: 'error',
    },
    writable: true
  });
  
  Object.defineProperty(mockHls, 'ErrorTypes', {
    value: {
      NETWORK_ERROR: 'networkError',
      MEDIA_ERROR: 'mediaError',
    },
    writable: true
  });
  
  return mockHls;
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('SermonPlayer Component with HLS', () => {
  const mockSermonProps = {
    sermonId: 'test-sermon-id',
    title: 'Test Sermon',
    videoUrl: 'https://example.com/sermons/video/test-sermon-id/master.m3u8',
    thumbnailUrl: 'https://example.com/sermons/thumbnails/test-sermon-id.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders HLS video player when videoUrl is provided with m3u8 extension', () => {
    render(<SermonPlayerNew {...mockSermonProps} />);
    
    // Video player should be rendered
    const videoElement = screen.getByTestId('sermon-video-player');
    expect(videoElement).toBeInTheDocument();
    
    // Audio player should not be rendered
    const audioElement = screen.queryByTestId('sermon-audio-player');
    expect(audioElement).not.toBeInTheDocument();
  });

  test('renders default player controls for HLS videos', () => {
    render(<SermonPlayerNew {...mockSermonProps} />);
    
    // Check that the play button exists
    const playButton = screen.getByLabelText('Play');
    expect(playButton).toBeInTheDocument();
    
    // Check that volume control exists
    const volumeControl = screen.getByLabelText('Volume');
    expect(volumeControl).toBeInTheDocument();
    
    // Check that the progress bar exists
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });
  
  test('initializes HLS.js when provided with m3u8 URL', () => {
    const HlsMock = require('hls.js');
    render(<SermonPlayerNew {...mockSermonProps} />);
    
    // Get the mock instance from the constructor call
    const mockInstance = (HlsMock as jest.Mock).mock.instances[0];
    
    // HLS.js should be initialized
    expect(HlsMock).toHaveBeenCalled();
    expect(mockInstance.loadSource).toHaveBeenCalledWith(mockSermonProps.videoUrl);
    expect(mockInstance.attachMedia).toHaveBeenCalled();
  });
  
  test('falls back to native HLS in Safari when HLS.js is not supported', () => {
    // Override the isSupported implementation just for this test
    const hlsModule = require('hls.js');
    const originalIsSupported = hlsModule.isSupported;
    hlsModule.isSupported = jest.fn(() => false);
    
    // Mock canPlayType for Safari-like behavior
    const originalCanPlayType = HTMLVideoElement.prototype.canPlayType;
    const canPlayTypeSpy = jest.fn().mockImplementation((type: string): CanPlayTypeResult => 'maybe');
    Object.defineProperty(HTMLVideoElement.prototype, 'canPlayType', {
      writable: true,
      value: canPlayTypeSpy
    });
    
    render(<SermonPlayerNew {...mockSermonProps} />);
    
    const videoElement = screen.getByTestId('sermon-video-player');
    expect(canPlayTypeSpy).toHaveBeenCalledWith('application/vnd.apple.mpegurl');
    
    // Reset mocks
    hlsModule.isSupported = originalIsSupported;
    Object.defineProperty(HTMLVideoElement.prototype, 'canPlayType', {
      writable: true,
      value: originalCanPlayType
    });
  });
});
