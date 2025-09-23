'use client';

import { HeroCarousels } from '@/data/heroCarouselData';

export default function AdminCarousel() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Carousel Management</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
        <h3 className="font-semibold text-yellow-800">Static Data Mode</h3>
        <p className="text-yellow-700 mt-1">
          Carousel slides are managed in /src/data/heroCarouselData.ts
        </p>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Current Slides ({HeroCarousels.length})</h2>
        
        <div className="space-y-4">
          {HeroCarousels.map((slide, index) => (
            <div key={slide.id} className="border rounded p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{slide.title}</h3>
                <span className="text-sm text-gray-500">#{index + 1}</span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{slide.description}</p>
              {slide.image && (
                <div className="w-32 h-20 bg-gray-100 rounded overflow-hidden">
                  <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
