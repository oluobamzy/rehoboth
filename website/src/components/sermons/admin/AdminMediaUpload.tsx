"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image'; // Added import for next/image
import { uploadSermonMedia, UploadResult } from '@/services/sermonService'; // Added UploadResult import
import { 
  initFFmpeg, 
  processMediaFile, 
  MediaProcessingOptions 
} from '@/utils/mediaProcessing';

interface AdminMediaUploadProps {
  sermonId: string;
  type: 'audio' | 'video' | 'thumbnail';
  currentUrl?: string;
  onUploadComplete: (url: string) => void;
  onThumbnailGenerated?: (url: string) => void;
}

export default function AdminMediaUpload({
  sermonId,
  type,
  currentUrl,
  onUploadComplete,
  onThumbnailGenerated
}: AdminMediaUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);
  const [processingOptions, setProcessingOptions] = useState<MediaProcessingOptions>({
    generateThumbnail: type === 'video',
    transcodeAudio: type === 'audio',
    transcodeVideo: type === 'video',
    quality: 'medium',
    thumbnailTime: 5
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize FFmpeg when needed
  useEffect(() => {
    if ((type === 'audio' || type === 'video') && file) {
      const loadFFmpeg = async () => {
        try {
          await initFFmpeg();
          setIsFFmpegLoaded(true);
        } catch (err) {
          console.error('Error loading FFmpeg:', err);
          setError('Media processing tools failed to load. Simple upload will be used instead.');
        }
      };
      
      if (!isFFmpegLoaded) {
        loadFFmpeg();
      }
    }
  }, [file, type, isFFmpegLoaded]);

  // File type validation
  const validateFileType = (file: File): boolean => {
    if (type === 'audio' && !file.type.startsWith('audio/')) {
      setError('Please select an audio file.');
      return false;
    }
    
    if (type === 'video' && !file.type.startsWith('video/')) {
      setError('Please select a video file.');
      return false;
    }
    
    if (type === 'thumbnail' && !file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return false;
    }
    
    return true;
  };

  // File size validation (10MB for audio, 500MB for video, 5MB for thumbnails)
  const validateFileSize = (file: File): boolean => {
    const maxSizes = {
      audio: 10 * 1024 * 1024, // 10MB
      video: 500 * 1024 * 1024, // 500MB
      thumbnail: 5 * 1024 * 1024, // 5MB
    };
    
    if (file.size > maxSizes[type]) {
      const sizeMB = Math.round(maxSizes[type] / (1024 * 1024));
      setError(`File size exceeds the maximum allowed (${sizeMB}MB).`);
      return false;
    }
    
    return true;
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (validateFileType(selectedFile) && validateFileSize(selectedFile)) {
        setFile(selectedFile);
      } else {
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  // Handle processing options change
  const handleOptionChange = (
    option: keyof MediaProcessingOptions,
    value: boolean | string | number
  ) => {
    setProcessingOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  // Start upload process
  const handleUpload = async () => {
    if (!file || !sermonId) return;
    
    setError(null);
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate progress updates (in a real app, you'd use Firebase's onSnapshot)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + Math.random() * 10;
        });
      }, 500);
      
      let uploadResult: UploadResult | null = null; 
      
      // If FFmpeg is loaded and we're processing audio/video
      if (isFFmpegLoaded && (type === 'audio' || type === 'video')) {
        setIsProcessing(true);
        
        // Process the media file with FFmpeg
        // The return type of processMediaFile now includes path, aligning better with UploadResult
        const processingResult = await processMediaFile(
          file,
          sermonId,
          type,
          processingOptions
        );
        
        // Upload the processed file or use direct upload if processing failed
        if (processingResult.mediaUrl && processingResult.path) {
          uploadResult = { url: processingResult.mediaUrl, path: processingResult.path }; 
          
          // If thumbnail was generated, pass it to parent
          if (processingResult.thumbnailUrl && onThumbnailGenerated) {
            onThumbnailGenerated(processingResult.thumbnailUrl);
          }
        } else {
          // Fall back to direct upload if processing didn't yield a mediaUrl and path
          uploadResult = await uploadSermonMedia(file, sermonId, type);
        }
        
        setIsProcessing(false);
      } else {
        // Direct upload without processing
        uploadResult = await uploadSermonMedia(file, sermonId, type);
      }
      
      // Clear interval and set to 100%
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Notify parent component
      if (uploadResult) { // Check if uploadResult is not null
        onUploadComplete(uploadResult.url); // Pass only the URL string
      } else {
        // Handle the case where uploadResult is null, though it shouldn't happen with current logic
        console.error('Upload result is null, cannot call onUploadComplete');
        setError('Upload completed but failed to get URL.');
      }
      
      // Reset state after a short delay
      setTimeout(() => {
        setUploadProgress(0);
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 1500);
    } catch (err) {
      console.error('Upload error:', err);
      setError('An error occurred during upload. Please try again.');
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  // Cancel upload
  const handleCancel = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get media type details
  const getMediaTypeDetails = () => {
    switch (type) {
      case 'audio':
        return {
          title: 'Audio',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          ),
          acceptTypes: 'audio/*',
          recommendedFormats: 'MP3, WAV, AAC',
        };
      case 'video':
        return {
          title: 'Video',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          ),
          acceptTypes: 'video/*',
          recommendedFormats: 'MP4, MOV, WebM',
        };
      case 'thumbnail':
        return {
          title: 'Thumbnail',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
          acceptTypes: 'image/*',
          recommendedFormats: 'JPG, PNG, WebP',
        };
      default:
        return {
          title: 'File',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          acceptTypes: '*/*',
          recommendedFormats: 'Any format',
        };
    }
  };

  const { title, icon, acceptTypes, recommendedFormats } = getMediaTypeDetails();

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-medium text-gray-800">{title} Upload</h3>
      </div>
      
      <div className="p-6">
        {/* Current file preview if available */}
        {currentUrl && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Current {title}:</p>
            {type === 'audio' && (
              <audio src={currentUrl} controls className="w-full mb-2" />
            )}
            {type === 'video' && (
              <video src={currentUrl} controls className="w-full mb-2" />
            )}
            {type === 'thumbnail' && (
              <div className="relative aspect-video bg-gray-100 mb-2">
                <Image // Replaced img with Image
                  src={currentUrl}
                  alt="Current thumbnail"
                  layout="fill" // Added layout prop
                  objectFit="cover" // Added objectFit prop
                />
              </div>
            )}
          </div>
        )}
        
        {/* Upload area */}
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor={`${type}-file-upload`}
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer ${
              file
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            } ${isUploading ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {file ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-700">
                    {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                </>
              ) : (
                <>
                  {icon}
                  <p className="mt-2 text-sm text-gray-700">
                    <span className="font-medium">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">{recommendedFormats}</p>
                </>
              )}
            </div>
            <input
              id={`${type}-file-upload`}
              type="file"
              className="hidden"
              accept={acceptTypes}
              onChange={handleFileChange}
              ref={fileInputRef}
              disabled={isUploading}
            />
          </label>
        </div>
        
        {/* Processing options for audio/video */}
        {file && (type === 'audio' || type === 'video') && isFFmpegLoaded && (
          <div className="mt-4 border rounded-lg p-3 bg-gray-50">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Processing Options</h4>
            
            {/* Transcode option */}
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id={`transcode-${type}`}
                checked={type === 'audio' ? processingOptions.transcodeAudio : processingOptions.transcodeVideo}
                onChange={(e) => handleOptionChange(
                  type === 'audio' ? 'transcodeAudio' : 'transcodeVideo',
                  e.target.checked
                )}
                className="mr-2"
              />
              <label htmlFor={`transcode-${type}`} className="text-sm">
                Transcode {type} for web optimization
              </label>
            </div>
            
            {/* Quality selector */}
            <div className="flex items-center mb-2">
              <label className="text-sm mr-2">Quality:</label>
              <select
                value={processingOptions.quality}
                onChange={(e) => handleOptionChange('quality', e.target.value)}
                className="text-sm border rounded p-1"
                disabled={!processingOptions.transcodeAudio && !processingOptions.transcodeVideo}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            {/* Thumbnail generation for video */}
            {type === 'video' && (
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="generate-thumbnail"
                  checked={processingOptions.generateThumbnail}
                  onChange={(e) => handleOptionChange('generateThumbnail', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="generate-thumbnail" className="text-sm">
                  Generate thumbnail from video
                </label>
              </div>
            )}
            
            {/* Thumbnail time selector */}
            {type === 'video' && processingOptions.generateThumbnail && (
              <div className="flex items-center">
                <label className="text-sm mr-2">Thumbnail at (seconds):</label>
                <input
                  type="number"
                  min="1"
                  value={processingOptions.thumbnailTime || 5}
                  onChange={(e) => handleOptionChange('thumbnailTime', parseInt(e.target.value))}
                  className="text-sm border rounded p-1 w-16"
                />
              </div>
            )}
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="mt-3 text-sm text-red-600">
            {error}
          </div>
        )}
        
        {/* Upload progress */}
        {uploadProgress > 0 && (
          <div className="mt-4">
            <div className="flex justify-between mb-1 items-center">
              <span className="text-xs font-medium text-gray-700">
                {isProcessing ? 'Processing media...' : 
                  uploadProgress < 100 ? 'Uploading...' : 'Upload complete!'}
              </span>
              <span className="text-xs font-medium text-gray-700">{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  uploadProgress < 100 ? 'bg-blue-600' : 'bg-green-600'
                }`}
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Action buttons */}
        {file && uploadProgress === 0 && (
          <div className="mt-4 flex space-x-2 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isUploading}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading || (isProcessing && !isFFmpegLoaded)}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              {isUploading ? 'Uploading...' : isProcessing ? 'Processing...' : 'Start Upload'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
