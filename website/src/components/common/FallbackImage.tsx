"use client";

// src/components/common/FallbackImage.tsx
import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface FallbackImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
}

export default function FallbackImage({
  src,
  fallbackSrc = '/assets/images/church-hero.jpg',
  alt,
  ...rest
}: FallbackImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  return (
    <Image
      {...rest}
      src={imgSrc}
      alt={alt}
      onError={handleError}
    />
  );
}
