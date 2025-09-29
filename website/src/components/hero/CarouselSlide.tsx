"use client";

import React from 'react';
import Link from 'next/link';
import Button from '@/components/common/Button';
import { HeroCarouselItem } from '@/data/heroCarouselData';

interface CarouselSlideProps extends HeroCarouselItem {
  isActive?: boolean;
  slideIndex?: number;
}

export default function CarouselSlide({
  id,
  title,
  subtitle,
  description,
  image,
  video,
  ctas,
  overlay,
  textPosition = 'center',
  isActive = true,
}: CarouselSlideProps) {

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background Media */}
      <div className="absolute inset-0 w-full h-full">
        {video ? (
          <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={image}
          >
            <source src={video} type="video/mp4" />
          </video>
        ) : (
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('${image || '/pastoral_care.jpeg'}')`,
              filter: 'brightness(0.65) contrast(1.2) saturate(1.0)'
            }}
          />
        )}
      </div>

      {/* Overlay */}
      {overlay && (
        <div 
          className="absolute inset-0 z-10"
          style={{
            background: overlay.gradient,
            opacity: overlay.opacity
          }}
        />
      )}

      {/* Content */}
      <div className={`relative z-20 h-full flex items-center ${
        textPosition === 'left' ? 'justify-start' : 
        textPosition === 'right' ? 'justify-end' : 'justify-center'
      } px-8 md:px-16 lg:px-24`}>
        <div className={`max-w-5xl space-y-6 ${textPosition === 'center' ? 'text-center' : 'text-left'}`}>
          
          {/* Church Badge */}
          <div className={`inline-flex items-center px-5 py-2.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 shadow-lg ${textPosition === 'center' ? 'mx-auto' : ''}`}>
            <div className="w-2 h-2 bg-white/90 rounded-full mr-3" />
            <span className="text-white/95 font-medium tracking-wider uppercase text-sm">
              Rehoboth Christian Church
            </span>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight"
                style={{ textShadow: '2px 4px 12px rgba(0,0,0,0.8), 0 0 24px rgba(0,0,0,0.4)' }}>
              {title}
            </h1>
            
            {/* Subtitle */}
            {subtitle && (
              <h2 className="text-xl md:text-2xl lg:text-3xl text-white/95 font-light leading-relaxed"
                  style={{ textShadow: '1px 2px 8px rgba(0,0,0,0.7)' }}>
                {subtitle}
              </h2>
            )}
          </div>

          {/* Description */}
          <div className="max-w-2xl">
            <p className="text-lg md:text-xl text-white/90 leading-relaxed font-light"
               style={{ textShadow: '1px 2px 6px rgba(0,0,0,0.7)' }}>
              {description}
            </p>
          </div>

          {/* CTAs */}
          <div className={`flex flex-col sm:flex-row gap-4 mt-8 ${textPosition === 'center' ? 'justify-center' : ''}`}>
            {ctas.primary && (
              <Link href={ctas.primary.link}>
                <Button
                  variant="primary"
                  size="lg"
                  className="group bg-white text-gray-900 hover:bg-gray-100 hover:text-black font-semibold px-8 py-4 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 border-0 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="flex items-center text-gray-900">
                    {ctas.primary.text}
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-0.5 transition-transform duration-200 text-gray-900" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </Button>
              </Link>
            )}
            {ctas.secondary && (
              <Link href={ctas.secondary.link}>
                <Button
                  variant="outline"
                  size="lg"
                  className="group border-2 border-white/60 text-white hover:bg-white/10 hover:border-white/80 font-medium px-8 py-4 rounded-lg backdrop-blur-sm transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="flex items-center">
                    {ctas.secondary.text}
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-0.5 transition-transform duration-200" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
