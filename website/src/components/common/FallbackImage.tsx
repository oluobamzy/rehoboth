"use client";

// src/components/common/FallbackImage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

// Remove legacy props from ImageProps
type ModernImageProps = Omit<ImageProps, 'onError' | 'layout' | 'objectFit'>;

interface FallbackImageProps extends ModernImageProps {
  fallbackSrc?: string;
  maxRetries?: number;
  // Add modern equivalents of legacy props
  fill?: boolean;
  style?: React.CSSProperties;
  // Account for StaticImport type from next/image
  src: string | any;
}

// Default fallback is a simple gray box with "R" letter as SVG
const DEFAULT_FALLBACK = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNOTAgNjBIMTEwQzEyMy44IDYwIDEzNSA3MS4yIDEzNSA4NVYxMTVDMTM1IDEyOC44IDEyMy44IDE0MCAxMTAgMTQwSDkwQzc2LjIgMTQwIDY1IDEyOC44IDY1IDExNVY4NUM2NSA3MS4yIDc2LjIgNjAgOTAgNjBaIiBmaWxsPSIjOTRBM0IzIi8+PHBhdGggZD0iTTExMCAxMDBIOTBWMTE1SDExMFYxMDBaIiBmaWxsPSIjRTVFN0VCIi8+PHBhdGggZD0iTTkwIDg1SDExMEwxMDAgNzBMOTAgODVaIiBmaWxsPSIjRTVFN0VCIi8+PC9zdmc+';

export default function FallbackImage({
  src,
  fallbackSrc = '/rehoboth_logo_plain.png', // Use logo as fallback
  maxRetries = 1,
  alt,
  fill,
  style = {},
  className,
  // Filter out any legacy props that might be passed
  layout,
  objectFit,
  ...rest
}: FallbackImageProps & {layout?: string, objectFit?: string}) {
  // Convert Firebase Storage URLs to use our proxy
  const processedSrc = useMemo(() => {
    // Make sure we have a string URL to work with
    if (!src || typeof src !== 'string') {
      console.log('FallbackImage: Non-string src provided, using fallback', { src, fallbackSrc });
      return fallbackSrc;
    }
    
    const srcStr = src as string;
    
    // External URLs (like Unsplash) should be used directly
    if (srcStr.startsWith('http://') || srcStr.startsWith('https://')) {
      // Skip our proxy for all external URLs, including Unsplash
      console.log('FallbackImage: Using external URL directly:', srcStr);
      return srcStr;
    }
    
    // Handle data URLs and blobs directly
    if (srcStr.startsWith('/') || srcStr.startsWith('data:') || srcStr.startsWith('blob:')) {
      return srcStr;
    }
    
    // Use Firebase Storage URLs directly
    if (srcStr.includes('firebasestorage.googleapis.com')) {
      return srcStr;
    }
    
    // Handle direct paths that might be Firebase storage paths
    if (srcStr.startsWith('carousel/') || srcStr.startsWith('sermons/') || 
        srcStr.startsWith('events/') || srcStr.startsWith('sermon_series/')) {
      // Construct direct Firebase URL instead of going through proxy
      const encodedPath = encodeURIComponent(srcStr);
      return `https://firebasestorage.googleapis.com/v0/b/rehoboth-church-63d6e.appspot.com/o/${encodedPath}?alt=media`;
    }
    
    return srcStr;
  }, [src, fallbackSrc]);
  
  const [imgSrc, setImgSrc] = useState(processedSrc);
  const [hasError, setHasError] = useState(false);
  const [fallbackAttempts, setFallbackAttempts] = useState(0);

  // Reset error state and update source if src prop changes
  useEffect(() => {
    setImgSrc(processedSrc);
    setHasError(false);
    setFallbackAttempts(0);
  }, [processedSrc]);

  // Extract objectFit from className if present
  const hasObjectCoverClass = className?.includes('object-cover');
  const hasObjectContainClass = className?.includes('object-contain');

  // Convert legacy props to modern styles
  const imageStyle: React.CSSProperties = {
    ...(style || {}),
    // Set object-fit based on props or className
    ...(objectFit ? { objectFit: objectFit as 'cover' | 'contain' | 'fill' | 'none' | 'scale-down' } : {}),
    ...(hasObjectCoverClass && !objectFit ? { objectFit: 'cover' } : {}),
    ...(hasObjectContainClass && !objectFit ? { objectFit: 'contain' } : {})
  };

  // Always ensure we have objectFit when using fill
  if (fill && !imageStyle.objectFit) {
    imageStyle.objectFit = 'cover';
  }

  const handleError = () => {
    // Increment fallback attempts to track how many times we've tried
    const attempts = fallbackAttempts + 1;
    setFallbackAttempts(attempts);
    
    console.warn(`Image failed to load (attempt ${attempts}): ${imgSrc}`, { 
      original: src,
      processed: imgSrc,
      fallback: fallbackSrc
    });
    
    // If this is the first attempt and we're using a proxied URL, try direct URL
    if (attempts === 1 && typeof imgSrc === 'string' && imgSrc.startsWith('/api/proxy/')) {
      try {
        // Try direct Firebase URL as fallback
        const storageBaseUrl = 'https://firebasestorage.googleapis.com/v0/b/rehoboth-church-63d6e.appspot.com/o';
        const path = imgSrc.replace('/api/proxy/', '');
        const directUrl = `${storageBaseUrl}/${encodeURIComponent(path)}?alt=media`;
        console.log('Attempting direct Firebase URL:', directUrl);
        setImgSrc(directUrl);
        return;
      } catch (error) {
        console.warn('Error converting proxy URL to direct URL:', error);
        // Continue to fallback
      }
    }
    
    // Check if current src is already the fallback, and we need to use default
    if (imgSrc === fallbackSrc) {
      console.warn(`Fallback image ${fallbackSrc} also failed to load, using built-in default`);
      setImgSrc(DEFAULT_FALLBACK);
      setHasError(true);
      return;
    }
    
    // The fallback path is not found, use our reliable fallback
    if (fallbackSrc === '/assets/images/church-hero.jpg') {
      setImgSrc('/rehoboth_logo_plain.png');
      console.log('Using logo as fallback instead of missing church-hero.jpg');
      return;
    }
    
    // If we've reached max retries or the fallback is already failing, use default
    if (attempts >= maxRetries) {
      setImgSrc(DEFAULT_FALLBACK);
      setHasError(true);
    } else {
      // Try the fallback image
      setImgSrc(fallbackSrc);
    }
  };

  // Handle legacy layout prop
  const layoutProps = useMemo(() => {
    if (layout === 'fill') {
      return { fill: true };
    }
    if (fill) {
      return { fill };
    }
    return {};
  }, [layout, fill]);

  // Ensure we don't pass legacy props to the Image component
  const safeRest = { ...rest };
  delete (safeRest as any).objectPosition;
  
  // Determine if this img should be unoptimized
  // External URLs (like unsplash.com) and data URLs need to be unoptimized
  const isUnoptimized = typeof imgSrc === 'string' && 
    (imgSrc.startsWith('https://') || imgSrc.startsWith('http://') || imgSrc.startsWith('data:'));
    
  // Handle dimensions based on fill property
  // When using fill, don't use width/height
  const dimensionProps = fill || layout === 'fill' || layoutProps.fill 
    ? {} 
    : {
        width: rest.width || 500,
        height: rest.height || 300
      };

  return (
    <Image
      {...safeRest}
      {...layoutProps}
      style={imageStyle}
      src={imgSrc}
      alt={alt || 'Image'}
      onError={handleError}
      unoptimized={isUnoptimized}
      loading={rest.priority ? 'eager' : 'lazy'}
      {...dimensionProps}
    />
  );
}
