"use client";

// src/components/hero/CarouselSlide.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/common/Button';

export interface CarouselSlideProps {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  ctaText?: string;
  ctaLink?: string;
}

export default function CarouselSlide({
  title,
  subtitle,
  imageUrl,
  ctaText,
  ctaLink,
}: CarouselSlideProps) {
  return (
    <div className="relative h-[500px]">
      <div className="absolute inset-0 z-0">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>
      <div className="relative z-10 flex flex-col justify-center h-full container mx-auto px-4">
        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h2>
          {subtitle && <p className="text-xl text-white/90 mb-6">{subtitle}</p>}
          {ctaText && ctaLink && (
            <Link href={ctaLink}>
              <Button variant="primary" size="lg">
                {ctaText}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
