// src/utils/mediaProcessing.ts
"use client";

import { storage } from '@/services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// Initialize FFmpeg - this should be done in a React component that uses this
let ffmpeg: FFmpeg | null = null;

export interface MediaProcessingOptions {
  generateThumbnail?: boolean;
  transcodeAudio?: boolean;
  transcodeVideo?: boolean;
  generateWaveform?: boolean;
  targetFormat?: string;
  quality?: 'low' | 'medium' | 'high';
  thumbnailTime?: number; // Time in seconds to extract thumbnail
}

export type ProgressCallback = (progress: number, stage: string) => void;

/**
 * Initialize FFmpeg in browser environment
 * This should be called before any other processing functions
 */
export async function initFFmpeg() {
  if (ffmpeg) return ffmpeg;
  
  try {
    // Check if we're in a Node.js environment (for testing)
    const isNode = typeof window === 'undefined' || 
                  (typeof process !== 'undefined' && process.versions && process.versions.node);
    
    if (isNode) {
      console.log('Running in Node environment, using mock FFmpeg');
      // For tests, we'll use the mock that's injected by jest.mock
      return ffmpeg;
    }
    
    // Only run the browser-specific code in a browser environment
    if (typeof window !== 'undefined') {
      ffmpeg = new FFmpeg();
      
      // Load FFmpeg core
      await ffmpeg.load({
        coreURL: "/ffmpeg-core.js",
        wasmURL: "/ffmpeg-core.wasm",
      });
      
      console.log('FFmpeg initialized successfully');
    }
    
    return ffmpeg;
  } catch (error) {
    console.error('FFmpeg initialization failed:', error);
    throw new Error('Failed to initialize media processing tools');
  }
}

/**
 * Extract thumbnail from video file at specific timestamp
 */
export async function extractThumbnail(
  videoFile: File, 
  timeInSeconds: number = 5, 
  progressCallback?: ProgressCallback
): Promise<Blob> {
  if (!ffmpeg) {
    throw new Error('FFmpeg not initialized. Call initFFmpeg() first.');
  }

  try {
    if (progressCallback) progressCallback(10, 'Reading video file');
    
    // Convert file to ArrayBuffer
    const videoData = await fetchFile(videoFile);
    
    if (progressCallback) progressCallback(30, 'Processing video');
    
    // Write the video file to FFmpeg's virtual file system
    await ffmpeg.writeFile('input.mp4', videoData);
    
    if (progressCallback) progressCallback(50, 'Extracting thumbnail');
    
    // Extract a frame at the specified time
    await ffmpeg.exec([
      '-i', 'input.mp4',
      '-ss', timeInSeconds.toString(),
      '-frames:v', '1',
      '-q:v', '2', 
      'thumbnail.jpg'
    ]);
    
    if (progressCallback) progressCallback(80, 'Finalizing thumbnail');
    
    // Read the generated thumbnail
    const thumbnailData = await ffmpeg.readFile('thumbnail.jpg');
    
    // Convert to blob with proper MIME type
    const result = new Blob([thumbnailData], { type: 'image/jpeg' });
    
    if (progressCallback) progressCallback(100, 'Thumbnail ready');
    
    return result;
  } catch (error) {
    console.error('Thumbnail extraction failed:', error);
    throw new Error('Failed to extract thumbnail from video');
  }
}

/**
 * Transcode audio to MP3 format
 */
export async function transcodeAudio(
  audioFile: File, 
  quality: 'low' | 'medium' | 'high' = 'medium',
  progressCallback?: ProgressCallback
): Promise<Blob> {
  if (!ffmpeg) {
    throw new Error('FFmpeg not initialized. Call initFFmpeg() first.');
  }
  
  try {
    if (progressCallback) progressCallback(10, 'Reading audio file');
    
    // Map quality settings to bitrates
    const bitrates = {
      low: '96k',
      medium: '128k',
      high: '192k'
    };
    
    // Write input file
    const audioData = await fetchFile(audioFile);
    await ffmpeg.writeFile('input_audio', audioData);
    
    if (progressCallback) progressCallback(30, 'Transcoding audio');
    
    // Transcode to MP3
    await ffmpeg.exec([
      '-i', 'input_audio',
      '-b:a', bitrates[quality],
      '-c:a', 'libmp3lame',
      'output.mp3'
    ]);
    
    if (progressCallback) progressCallback(80, 'Finalizing audio');
    
    // Read output file
    const outputData = await ffmpeg.readFile('output.mp3');
    
    // Return as blob
    const result = new Blob([outputData], { type: 'audio/mp3' });
    
    if (progressCallback) progressCallback(100, 'Audio ready');
    
    return result;
  } catch (error) {
    console.error('Audio transcoding failed:', error);
    throw new Error('Failed to transcode audio file');
  }
}

/**
 * Transcode video for web streaming
 */
export async function transcodeVideo(
  videoFile: File, 
  quality: 'low' | 'medium' | 'high' = 'medium',
  progressCallback?: ProgressCallback
): Promise<Blob> {
  if (!ffmpeg) {
    throw new Error('FFmpeg not initialized. Call initFFmpeg() first.');
  }
  
  try {
    if (progressCallback) progressCallback(5, 'Reading video file');
    
    // Quality presets
    const presets = {
      low: { width: 640, height: 360, bitrate: '800k' },
      medium: { width: 1280, height: 720, bitrate: '2500k' },
      high: { width: 1920, height: 1080, bitrate: '5000k' }
    };
    
    const preset = presets[quality];
    
    // Write input file
    const videoData = await fetchFile(videoFile);
    await ffmpeg.writeFile('input_video', videoData);
    
    if (progressCallback) progressCallback(20, 'Transcoding video');
    
    // Set up log callback to track progress
    ffmpeg.on('log', ({ message }) => {
      // FFmpeg typically outputs frame= X fps= X q= X size= X time= X bitrate= X speed= X
      const timeMatch = message.match(/time=(\d+):(\d+):(\d+)/);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const seconds = parseInt(timeMatch[3]);
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        
        // Estimate the duration of the input video (this is a rough approximation)
        const duration = videoFile.size / 100000; // Rough bytes-to-seconds estimate
        const progress = Math.min(Math.round((totalSeconds / duration) * 60) + 20, 80);
        
        if (progressCallback) progressCallback(progress, 'Transcoding video');
      }
    });
    
    // Transcode to MP4 (h264 + AAC)
    await ffmpeg.exec([
      '-i', 'input_video',
      '-c:v', 'libx264',
      '-preset', 'medium', 
      '-b:v', preset.bitrate,
      '-vf', `scale=${preset.width}:${preset.height}`,
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart', // Optimize for web streaming
      'output.mp4'
    ]);
    
    if (progressCallback) progressCallback(90, 'Finalizing video');
    
    // Read output file
    const outputData = await ffmpeg.readFile('output.mp4');
    
    // Return as blob
    const result = new Blob([outputData], { type: 'video/mp4' });
    
    if (progressCallback) progressCallback(100, 'Video ready');
    
    return result;
  } catch (error) {
    console.error('Video transcoding failed:', error);
    throw new Error('Failed to transcode video file');
  }
}

/**
 * Generate audio waveform image
 */
export async function generateWaveformImage(
  audioFile: File, 
  width = 800, 
  height = 120,
  progressCallback?: ProgressCallback
): Promise<Blob> {
  if (!ffmpeg) {
    throw new Error('FFmpeg not initialized. Call initFFmpeg() first.');
  }
  
  try {
    if (progressCallback) progressCallback(10, 'Reading audio file');
    
    // Write input file
    const audioData = await fetchFile(audioFile);
    await ffmpeg.writeFile('input_audio', audioData);
    
    if (progressCallback) progressCallback(30, 'Generating waveform image');
    
    // Generate waveform image
    await ffmpeg.exec([
      '-i', 'input_audio',
      '-filter_complex', 
      `showwavespic=s=${width}x${height}:colors=orange`,
      '-frames:v', '1',
      'waveform.png'
    ]);
    
    if (progressCallback) progressCallback(80, 'Finalizing waveform image');
    
    // Read generated image
    const waveformData = await ffmpeg.readFile('waveform.png');
    
    // Return as blob
    const result = new Blob([waveformData], { type: 'image/png' });
    
    if (progressCallback) progressCallback(100, 'Waveform image ready');
    
    return result;
  } catch (error) {
    console.error('Waveform generation failed:', error);
    throw new Error('Failed to generate audio waveform');
  }
}

/**
 * Transcode video to HLS (HTTP Live Streaming) format for adaptive streaming
 */
export async function transcodeVideoToHLS(
  videoFile: File, 
  progressCallback?: ProgressCallback
): Promise<{ manifestFile: Blob, segments: Blob[], segmentFilenames: string[] }> {
  if (!ffmpeg) {
    throw new Error('FFmpeg not initialized. Call initFFmpeg() first.');
  }
  
  try {
    if (progressCallback) progressCallback(5, 'Reading video file');
    
    // Write input file
    const videoData = await fetchFile(videoFile);
    await ffmpeg.writeFile('input.mp4', videoData);
    
    if (progressCallback) progressCallback(15, 'Analyzing video');
    
    // Set up different quality variants
    // Modern bitrate ladder with resolutions for adaptive streaming
    const variants = [
      { name: '240p', width: 426, height: 240, bitrate: '400k' },
      { name: '360p', width: 640, height: 360, bitrate: '800k' },
      { name: '480p', width: 854, height: 480, bitrate: '1500k' },
      { name: '720p', width: 1280, height: 720, bitrate: '3000k' },
      { name: '1080p', width: 1920, height: 1080, bitrate: '5000k' }
    ];
    
    // Create master playlist
    let masterPlaylist = '#EXTM3U\n#EXT-X-VERSION:3\n';
    
    // Process each variant
    const segments: Blob[] = [];
    const segmentFilenames: string[] = [];
    
    // Set up log callback to track progress
    ffmpeg.on('log', ({ message }) => {
      // FFmpeg typically outputs frame= X fps= X q= X size= X time= X bitrate= X speed= X
      const timeMatch = message.match(/time=(\d+):(\d+):(\d+)/);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const seconds = parseInt(timeMatch[3]);
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        
        // Estimate the duration of the input video (this is a rough approximation)
        const duration = videoFile.size / 100000; // Rough bytes-to-seconds estimate
        const progress = Math.min(Math.round((totalSeconds / duration) * 60) + 20, 80);
        
        if (progressCallback) progressCallback(progress, 'Creating HLS segments');
      }
    });
    
    if (progressCallback) progressCallback(20, 'Creating HLS variants');
    
    // Process each variant
    for (const variant of variants) {
      // Create variant playlist
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-b:v', variant.bitrate,
        '-b:a', '128k',
        '-vf', `scale=${variant.width}:${variant.height}`,
        '-f', 'hls',
        '-hls_time', '10',  // 10 second segments
        '-hls_playlist_type', 'vod',
        '-hls_segment_filename', `segment_${variant.name}_%03d.ts`,
        `playlist_${variant.name}.m3u8`
      ]);
      
      // Add to master playlist
      masterPlaylist += `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(variant.bitrate) * 1000},RESOLUTION=${variant.width}x${variant.height}\n`;
      masterPlaylist += `playlist_${variant.name}.m3u8\n`;
      
      // Read variant playlist
      const playlistData = await ffmpeg.readFile(`playlist_${variant.name}.m3u8`);
      segments.push(new Blob([playlistData], { type: 'application/vnd.apple.mpegurl' }));
      segmentFilenames.push(`playlist_${variant.name}.m3u8`);
      
      // Read segments
      const segmentFiles = await ffmpeg.listDir('.');
      for (const file of segmentFiles) {
        const filename = file.name;
        if (filename.startsWith(`segment_${variant.name}_`) && filename.endsWith('.ts')) {
          const segmentData = await ffmpeg.readFile(filename);
          segments.push(new Blob([segmentData], { type: 'video/mp2t' }));
          segmentFilenames.push(filename);
        }
      }
    }
    
    if (progressCallback) progressCallback(90, 'Creating master playlist');
    
    // Write master playlist
    await ffmpeg.writeFile('master.m3u8', masterPlaylist);
    const masterPlaylistData = await ffmpeg.readFile('master.m3u8');
    const manifestFile = new Blob([masterPlaylistData], { type: 'application/vnd.apple.mpegurl' });
    
    if (progressCallback) progressCallback(100, 'HLS conversion complete');
    
    return { manifestFile, segments, segmentFilenames };
  } catch (error) {
    console.error('HLS transcoding failed:', error);
    throw new Error('Failed to create HLS streaming files');
  }
}

/**
 * Upload HLS streaming files to Firebase Storage 
 */
export async function uploadHLSFiles(
  sermonId: string, 
  hlsData: { manifestFile: Blob, segments: Blob[], segmentFilenames: string[] },
  progressCallback?: ProgressCallback
): Promise<string> {
  try {
    if (progressCallback) progressCallback(10, 'Preparing HLS files for upload');
    
    const basePath = `sermons/video/${sermonId}`;
    const totalFiles = hlsData.segments.length + 1; // +1 for manifest
    let uploadedCount = 0;
    
    // Upload master manifest
    if (progressCallback) progressCallback(20, 'Uploading master playlist');
    
    const masterRef = ref(storage, `${basePath}/master.m3u8`);
    await uploadBytes(masterRef, hlsData.manifestFile);
    
    uploadedCount++;
    if (progressCallback) {
      const progress = 20 + Math.floor((uploadedCount / totalFiles) * 70);
      progressCallback(progress, `Uploading HLS files (${uploadedCount}/${totalFiles})`);
    }
    
    // Upload all segments
    for (let i = 0; i < hlsData.segments.length; i++) {
      const segment = hlsData.segments[i];
      const filename = hlsData.segmentFilenames[i];
      
      const segmentRef = ref(storage, `${basePath}/${filename}`);
      await uploadBytes(segmentRef, segment);
      
      uploadedCount++;
      if (progressCallback) {
        const progress = 20 + Math.floor((uploadedCount / totalFiles) * 70);
        progressCallback(progress, `Uploading HLS files (${uploadedCount}/${totalFiles})`);
      }
    }
    
    // Get download URL for master playlist
    if (progressCallback) progressCallback(95, 'Finalizing HLS upload');
    
    const masterUrl = await getDownloadURL(masterRef);
    
    if (progressCallback) progressCallback(100, 'HLS upload complete');
    
    return masterUrl;
  } catch (error) {
    console.error('Error uploading HLS files:', error);
    throw new Error('Failed to upload HLS streaming files');
  }
}

/**
 * Process media file with multiple operations
 */
export async function processMediaFile(
  file: File,
  sermonId: string,
  mediaType: 'audio' | 'video',
  options: MediaProcessingOptions = {},
  progressCallback?: ProgressCallback
): Promise<{
  processedFile?: Blob;
  thumbnailUrl?: string;
  mediaUrl?: string;
  waveformUrl?: string;
  path?: string; // Added path property
}> {
  // Initialize FFmpeg if not done already
  if (!ffmpeg) {
    if (progressCallback) progressCallback(5, 'Initializing media processor');
    await initFFmpeg();
  }
  
  const results: {
    processedFile?: Blob;
    thumbnailUrl?: string;
    mediaUrl?: string;
    waveformUrl?: string;
    path?: string; // Added path property
  } = {};
  
  try {    
    // Process based on media type and options
    if (mediaType === 'video' && options.transcodeVideo) {
      if (progressCallback) progressCallback(5, 'Starting video processing');
      
      // First, create standard MP4 version for compatibility
      results.processedFile = await transcodeVideo(
        file, 
        options.quality || 'medium',
        (progress, stage) => {
          if (progressCallback) {
            progressCallback(5 + Math.floor(progress * 0.2), stage);
          }
        }
      );
      
      if (progressCallback) progressCallback(30, 'Uploading MP4 version');
      
      // Use standard path format for video files: /sermons/video/{id}.mp4
      const videoStoragePath = `sermons/video/${sermonId}.mp4`;
      results.path = videoStoragePath; // Set path for the uploaded video
      const videoRef = ref(storage, videoStoragePath);
      await uploadBytes(videoRef, results.processedFile as Blob);
      results.mediaUrl = await getDownloadURL(videoRef);
      
      // Now create HLS streaming version for adaptive streaming
      if (progressCallback) progressCallback(40, 'Creating HLS streaming version');
      
      const hlsResult = await transcodeVideoToHLS(
        file,
        (progress, stage) => {
          if (progressCallback) {
            progressCallback(40 + Math.floor(progress * 0.2), stage);
          }
        }
      );
      
      if (progressCallback) progressCallback(60, 'Uploading HLS streaming files');
      
      // Upload all HLS files and get the master playlist URL
      const hlsUrl = await uploadHLSFiles(
        sermonId,
        hlsResult,
        (progress, stage) => {
          if (progressCallback) {
            progressCallback(60 + Math.floor(progress * 0.2), stage);
          }
        }
      );
      
      // Update the mediaUrl to point to the HLS stream instead of the MP4
      results.mediaUrl = hlsUrl;
      
      // Extract thumbnail if requested
      if (options.generateThumbnail) {
        if (progressCallback) progressCallback(80, 'Generating thumbnail');
        
        const thumbnailBlob = await extractThumbnail(
          file, 
          options.thumbnailTime || 5,
          (progress, stage) => {
            if (progressCallback) {
              progressCallback(80 + Math.floor(progress * 0.15), stage);
            }
          }
        );
        
        if (progressCallback) progressCallback(95, 'Uploading thumbnail');
        
        // Use standard path format for thumbnails: /sermons/thumbnails/{id}.jpg
        const thumbnailRef = ref(storage, `sermons/thumbnails/${sermonId}.jpg`);
        await uploadBytes(thumbnailRef, thumbnailBlob);
        results.thumbnailUrl = await getDownloadURL(thumbnailRef);
      }
      
      if (progressCallback) progressCallback(100, 'Processing complete');
    }
    
    else if (mediaType === 'audio' && options.transcodeAudio) {
      if (progressCallback) progressCallback(10, 'Starting audio processing');
      
      results.processedFile = await transcodeAudio(
        file, 
        options.quality || 'medium',
        (progress, stage) => {
          if (progressCallback) {
            progressCallback(10 + Math.floor(progress * 0.6), stage);
          }
        }
      );
      
      if (progressCallback) progressCallback(70, 'Uploading audio');
      
      // Use standard path format for audio files: /sermons/audio/{id}.mp3
      const audioStoragePath = `sermons/audio/${sermonId}.mp3`;
      results.path = audioStoragePath; // Set path for the uploaded audio
      const audioRef = ref(storage, audioStoragePath);
      await uploadBytes(audioRef, results.processedFile as Blob); // Ensure processedFile is Blob
      results.mediaUrl = await getDownloadURL(audioRef);
      
      // Generate waveform if requested
      if (options.generateWaveform) {
        if (progressCallback) progressCallback(80, 'Generating waveform');
        
        const waveformBlob = await generateWaveformImage(
          file,
          800,
          120,
          (progress, stage) => {
            if (progressCallback) {
              progressCallback(80 + Math.floor(progress * 0.15), stage);
            }
          }
        );
        
        if (progressCallback) progressCallback(95, 'Uploading waveform');
        
        // Store waveform images in the same directory as their corresponding audio files
        const waveformRef = ref(storage, `sermons/audio/${sermonId}_waveform.png`);
        await uploadBytes(waveformRef, waveformBlob);
        results.waveformUrl = await getDownloadURL(waveformRef);
      }
      
      if (progressCallback) progressCallback(100, 'Processing complete');
    }
    
    return results; // Ensure results is always returned
  } catch (error) {
    console.error('Media processing failed:', error);
    // Ensure a value is returned in the catch block that matches the Promise type
    // Or rethrow, but if rethrowing, the caller must handle it.
    // For now, returning an empty object or specific error structure might be an option if not rethrowing.
    // However, the function is declared to return a Promise of a specific object structure.
    // Rethrowing is often cleaner if the caller is equipped to handle it.
    throw new Error('Failed to process media file: ' + (error instanceof Error ? error.message : String(error)));
  }
}
