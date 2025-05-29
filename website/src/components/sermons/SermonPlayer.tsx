"use client";

import { useState, useEffect, useRef } from 'react';
import SermonAnalytics from '@/services/analyticsService';
import Hls from 'hls.js';

interface SermonPlayerProps {
  audioUrl?: string;
  videoUrl?: string;
  title: string;
  sermonId: string;
  thumbnailUrl?: string;
}

const LOCAL_STORAGE_KEY_PREFIX = 'sermon_progress_';

export default function SermonPlayer({
  audioUrl,
  videoUrl,
  title,
  sermonId,
  thumbnailUrl,
}: SermonPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [hasSentQuarterView, setHasSentQuarterView] = useState(false);
  const [hasSentHalfView, setHasSentHalfView] = useState(false);
  const [hasSentThreeQuarterView, setHasSentThreeQuarterView] = useState(false);
  const [hasSentCompleteView, setHasSentCompleteView] = useState(false);
  const [viewTracked, setViewTracked] = useState(false);
  const [hlsInstance, setHlsInstance] = useState<Hls | null>(null);
  
  // State for quality levels from HLS
  const [qualityLevels, setQualityLevels] = useState<Array<{height: number, width: number, bitrate: number}>>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 means auto

  // Determine media type
  const mediaType = videoUrl ? 'video' : audioUrl ? 'audio' : null;
  const mediaRef = videoUrl ? videoRef : audioUrl ? audioRef : null;
  const mediaUrl = videoUrl || audioUrl;
  
  // Check if the video URL is an HLS stream (.m3u8 extension)
  const isHlsVideo = videoUrl && videoUrl.includes('.m3u8');

  // Load saved progress if any
  useEffect(() => {
    if (!sermonId) return;
    
    const savedProgress = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${sermonId}`);
    if (savedProgress && mediaRef?.current) {
      const parsedProgress = parseFloat(savedProgress);
      mediaRef.current.currentTime = parsedProgress;
      setCurrentTime(parsedProgress);
    }
  }, [sermonId, mediaRef]);

  // Setup HLS.js for streaming
  useEffect(() => {
    if (!videoUrl || !videoRef.current || !isHlsVideo) return;
    
    const video = videoRef.current;
    
    // Check if HLS.js is supported
    if (Hls.isSupported()) {
      const hls = new Hls({
        maxBufferSize: 30 * 1000 * 1000, // 30MB for large buffers
        maxBufferLength: 60, // 60 seconds buffer
        enableWorker: true, // Enable web workers for better performance
        startLevel: -1 // Auto select quality
      });
      
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      
      // Handle HLS events
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Set quality levels based on available levels
        const levels = hls.levels;
        setQualityLevels(levels);
        console.log(`HLS: Manifest parsed, found ${levels.length} quality levels`);
        
        // Play the video if paused
        if (video.paused && isPlaying) {
          video.play().catch(e => console.error('Autoplay prevented:', e));
        }
      });
      
      // Handle quality level changes
      if (Hls.Events.LEVEL_SWITCHED) {
        hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
          if (hls.levels && hls.levels[data.level]) {
            const level = hls.levels[data.level];
            setCurrentQuality(data.level);
            console.log(`HLS: Quality switched to ${level.height}p (${Math.round(level.bitrate / 1000)}kbps)`);
            
            // Track quality change with analytics
            SermonAnalytics.trackPlaybackQuality(sermonId, `${level.height}p`, level.bitrate);
          }
        });
      }
      
      // Handle errors
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('HLS network error, attempting to recover');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('HLS media error, attempting to recover');
              hls.recoverMediaError();
              break;
            default:
              console.error('Fatal HLS error, destroying instance:', data);
              hls.destroy();
              break;
          }
        } else {
          console.warn('Non-fatal HLS error:', data);
        }
      });
      
      setHlsInstance(hls);
      
      return () => {
        hls.destroy();
        setHlsInstance(null);
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // For browsers that support HLS natively (Safari)
      video.src = videoUrl;
      console.log('Using native HLS support');
    } else {
      console.error('HLS is not supported in this browser and no fallback is available');
      // Fallback to regular video if available
      video.src = videoUrl.replace('master.m3u8', '../video.mp4');
    }
  }, [videoUrl, isHlsVideo, sermonId, isPlaying]);

  // Handle quality change
  const handleQualityChange = (level: number) => {
    if (!hlsInstance) return;
    
    hlsInstance.currentLevel = level;
    setCurrentQuality(level);
    
    // Track quality change
    if (level === -1) {
      SermonAnalytics.trackPlaybackQuality(sermonId, 'auto', 0);
    } else if (qualityLevels[level]) {
      const { height, bitrate } = qualityLevels[level];
      SermonAnalytics.trackPlaybackQuality(sermonId, `${height}p`, bitrate);
    }
  };

  // Auto-play and tracking setup
  useEffect(() => {
    if (!mediaRef?.current || !sermonId) return;
    
    const media = mediaRef.current;
    
    // View tracking
    if (!viewTracked) {
      setViewTracked(true);
      // Track view event using analytics service
      SermonAnalytics.trackPlaybackStarted(sermonId, mediaType as 'audio' | 'video');
    }
    
    // Media event listeners
    const onTimeUpdate = () => {
      const currentTime = media.currentTime;
      const duration = media.duration || 0;
      const progressPercent = (currentTime / duration) * 100;
      
      setCurrentTime(currentTime);
      setProgress(progressPercent);
      
      // Save progress to localStorage
      localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${sermonId}`, currentTime.toString());
      
      // Track engagement at different points
      if (progressPercent >= 25 && !hasSentQuarterView) {
        setHasSentQuarterView(true);
        SermonAnalytics.trackPlaybackProgress(sermonId, 25, currentTime, duration);
      }
      if (progressPercent >= 50 && !hasSentHalfView) {
        setHasSentHalfView(true);
        SermonAnalytics.trackPlaybackProgress(sermonId, 50, currentTime, duration);
      }
      if (progressPercent >= 75 && !hasSentThreeQuarterView) {
        setHasSentThreeQuarterView(true);
        SermonAnalytics.trackPlaybackProgress(sermonId, 75, currentTime, duration);
      }
      if (progressPercent >= 95 && !hasSentCompleteView) {
        setHasSentCompleteView(true);
        SermonAnalytics.trackPlaybackCompleted(sermonId);
      }
    };
    
    const onDurationChange = () => {
      setDuration(media.duration);
    };
    
    const onPlay = () => {
      setIsPlaying(true);
      SermonAnalytics.trackPlaybackStarted(sermonId, mediaType as 'audio' | 'video');
    };
    
    const onPause = () => {
      setIsPlaying(false);
      if (media.currentTime < media.duration - 1) { // Not at the end
        // Calculate progress percentage
        const progressPercent = (media.currentTime / media.duration) * 100;
        SermonAnalytics.trackPlaybackProgress(
          sermonId, 
          Math.floor(progressPercent), 
          media.currentTime, 
          media.duration
        );
      }
    };
    
    const onEnded = () => {
      setIsPlaying(false);
      SermonAnalytics.trackPlaybackCompleted(sermonId);
    };
    
    // Add event listeners
    media.addEventListener('timeupdate', onTimeUpdate);
    media.addEventListener('durationchange', onDurationChange);
    media.addEventListener('play', onPlay);
    media.addEventListener('pause', onPause);
    media.addEventListener('ended', onEnded);
    
    // Cleanup
    return () => {
      media.removeEventListener('timeupdate', onTimeUpdate);
      media.removeEventListener('durationchange', onDurationChange);
      media.removeEventListener('play', onPlay);
      media.removeEventListener('pause', onPause);
      media.removeEventListener('ended', onEnded);
    };
  }, [sermonId, mediaRef, mediaType, hasSentQuarterView, hasSentHalfView, hasSentThreeQuarterView, hasSentCompleteView, viewTracked]);

  // Format time (seconds to MM:SS)
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Handle play/pause
  const togglePlay = () => {
    if (!mediaRef?.current) return;
    
    if (isPlaying) {
      mediaRef.current.pause();
    } else {
      mediaRef.current.play();
    }
  };

  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!mediaRef?.current || !duration) return;
    
    const newProgress = parseFloat(e.target.value);
    const newTime = (newProgress / 100) * duration;
    
    mediaRef.current.currentTime = newTime;
    setProgress(newProgress);
    setCurrentTime(newTime);
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!mediaRef?.current) return;
    
    const newVolume = parseFloat(e.target.value);
    mediaRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  // Handle playback rate change
  const handlePlaybackRateChange = (rate: number) => {
    if (!mediaRef?.current) return;
    
    mediaRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    
    // Track playback speed change
    SermonAnalytics.trackPlaybackSpeed(sermonId, rate);
  };

  // If no media available
  if (!mediaUrl) {
    return (
      <div className="bg-gray-100 rounded-lg p-6 text-center">
        <p className="text-gray-500">No media available for this sermon.</p>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full rounded-lg overflow-hidden bg-black"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Player */}
      {videoUrl && (
        <video
          ref={videoRef}
          src={!isHlsVideo ? videoUrl : undefined}
          poster={thumbnailUrl}
          className="w-full"
          playsInline
          data-testid="sermon-video-player"
        />
      )}
      
      {/* Audio Player */}
      {audioUrl && !videoUrl && (
        <>
          <audio ref={audioRef} src={audioUrl} className="hidden" data-testid="sermon-audio-player" />
          <div className="aspect-video bg-gray-800 flex items-center justify-center">
            {thumbnailUrl ? (
              <div className="w-full h-full relative">
                <div 
                  className="absolute inset-0 bg-cover bg-center" 
                  style={{ backgroundImage: `url(${thumbnailUrl})` }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-40" />
              </div>
            ) : (
              <div className="text-white text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <h3 className="font-medium text-lg">{title}</h3>
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Controls Overlay */}
      <div className={`absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-3 transition-opacity duration-300 ${(showControls || !isPlaying) ? 'opacity-100' : 'opacity-0'}`}>
        {/* Progress bar */}
        <div className="flex items-center mb-2">
          <span className="text-white text-sm mr-2">{formatTime(currentTime)}</span>
          <input
            type="range"
            className="w-full h-2 bg-gray-400 rounded-lg appearance-none cursor-pointer"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          />
          <span className="text-white text-sm ml-2">{formatTime(duration)}</span>
        </div>
        
        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Play/Pause button */}
            <button 
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"} 
              className="text-white hover:text-orange-500 focus:outline-none"
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
            
            {/* Volume control */}
            <div className="flex items-center">
              <button 
                className="text-white hover:text-orange-500 focus:outline-none mr-1"
                aria-label="Volume"
              >
                {volume === 0 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                )}
              </button>
              <input
                type="range"
                className="w-16 h-1 bg-gray-400 rounded-lg appearance-none cursor-pointer"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
              />
            </div>
          </div>
          
          {/* Right side controls */}
          <div className="flex items-center space-x-3">
            {/* Quality selector for HLS */}
            {isHlsVideo && qualityLevels.length > 0 && (
              <div className="relative group">
                <button 
                  className="text-white hover:text-orange-500 focus:outline-none text-sm font-medium"
                  aria-label="Quality"
                >
                  {currentQuality === -1 
                    ? 'AUTO' 
                    : qualityLevels[currentQuality] 
                      ? `${qualityLevels[currentQuality].height}p`
                      : 'AUTO'
                  }
                </button>
                <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
                  <div className="bg-white rounded shadow-lg py-1">
                    <button
                      onClick={() => handleQualityChange(-1)}
                      className={`block w-full text-left px-4 py-1 text-sm ${currentQuality === -1 ? 'bg-orange-100 text-orange-600' : 'hover:bg-gray-100'}`}
                    >
                      Auto
                    </button>
                    {qualityLevels.map((level, index) => (
                      <button
                        key={`quality-${level.height}`}
                        onClick={() => handleQualityChange(index)}
                        className={`block w-full text-left px-4 py-1 text-sm ${currentQuality === index ? 'bg-orange-100 text-orange-600' : 'hover:bg-gray-100'}`}
                      >
                        {level.height}p {Math.round(level.bitrate / 1000)} kbps
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Playback speed selector */}
            <div className="relative group">
              <button 
                className="text-white hover:text-orange-500 focus:outline-none text-sm font-medium"
              >
                {playbackRate}x
              </button>
              <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
                <div className="bg-white rounded shadow-lg py-1">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                    <button
                      key={rate}
                      onClick={() => handlePlaybackRateChange(rate)}
                      className={`block w-full text-left px-4 py-1 text-sm ${playbackRate === rate ? 'bg-orange-100 text-orange-600' : 'hover:bg-gray-100'}`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Download button */}
            <a 
              href={mediaUrl} 
              download 
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-orange-500 focus:outline-none"
              onClick={() => {
                SermonAnalytics.trackSermonDownload(
                  sermonId, 
                  mediaType as 'audio' | 'video' | 'transcript'
                );
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
