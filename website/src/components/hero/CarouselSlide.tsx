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
              filter: 'brightness(0.8) contrast(1.05)'
            }}
          />
        )}
      </div>

      {/* Overlay */}
      <div 
        className="absolute inset-0 z-10"
        style={{
          background: overlay?.gradient || 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.2) 100%)',
          opacity: overlay?.opacity || 0.4
        }}
      />

      {/* Content */}
      <div className={`relative z-20 h-full flex items-center ${
        textPosition === 'left' ? 'justify-start' : 
        textPosition === 'right' ? 'justify-end' : 'justify-center'
      } px-6 md:px-16 lg:px-24`}>
        <div className={`max-w-4xl space-y-8 ${textPosition === 'center' ? 'text-center' : 'text-left'}`}>
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse" />
            <span className="text-white/90 text-sm font-medium tracking-wide uppercase">
              Rehoboth Christian Church
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight"
              style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>
            {title.split(' ').map((word, index) => (
              <span
                key={index}
                className={`inline-block mr-3 ${
                  index % 4 === 1 ? 'text-green-300' : 
                  index % 4 === 3 ? 'text-blue-300' : 'text-white'
                }`}
              >
                {word}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <h2 className="text-xl md:text-2xl lg:text-3xl text-green-200 font-light leading-relaxed">
              {subtitle}
            </h2>
          )}

          {/* Description */}
          <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl font-light">
            {description}
          </p>

          {/* CTAs */}
          <div className={`flex flex-col sm:flex-row gap-4 ${textPosition === 'center' ? 'justify-center' : ''}`}>
            {ctas.primary && (
              <Link href={ctas.primary.link}>
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-8 py-4 rounded-xl shadow-2xl hover:shadow-green-500/30 transition-all duration-300 transform hover:scale-105 border-0"
                >
                  {ctas.primary.text}
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Button>
              </Link>
            )}
            {ctas.secondary && (
              <Link href={ctas.secondary.link}>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-white/70 text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-4 rounded-xl backdrop-blur-sm transition-all duration-300 transform hover:scale-105"
                >
                  {ctas.secondary.text}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
