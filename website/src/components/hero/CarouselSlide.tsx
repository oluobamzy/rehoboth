"use client";

// src/components/hero/CarouselSlide.tsx
import React from 'react';
import Link from 'next/link';
import Button from '@/components/common/Button';
import FallbackImage from '@/components/common/FallbackImage';

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

  console.log('Rendering CarouselSlide:', { title, subtitle, imageUrl, ctaText, ctaLink });
  return (
    <div className="relative h-[500px]">
      <div className="absolute inset-0 z-0">
        <FallbackImage
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          priority
          fallbackSrc="/assets/images/church-hero.jpg"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>
      <div className="relative z-10 flex flex-col justify-center h-full container mx-auto px-4">
        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {title.split(' ').map((word, i) => 
              i % 3 === 1 ? 
                <span key={i} className="text-orange-500">{word} </span> : 
                <span key={i}>{word} </span>
            )}
          </h2>
          {subtitle && <p className="text-xl text-white/90 mb-6">{subtitle}</p>}
          <div className="flex flex-wrap gap-4">
            {ctaText && ctaLink && (
              <Link href={ctaLink}>
                <Button variant="primary" size="lg">
                  {ctaText}
                </Button>
              </Link>
            )}
            <Link href="/about">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-900">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
