// src/app/media/gallery/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { GalleryService, GalleryItem, GALLERY_CATEGORIES } from '@/services/galleryService';

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load gallery items
  useEffect(() => {
    const loadGalleryItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const items = await GalleryService.getItemsByCategory(selectedCategory);
        setGalleryItems(items);
      } catch (err) {
        console.error('Error loading gallery items:', err);
        setError('Failed to load gallery images. Please try again later.');
        setGalleryItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadGalleryItems();
  }, [selectedCategory]);

  const openModal = (item: GalleryItem) => {
    setSelectedImage(item);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Photo Gallery</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              Capturing memories and celebrating God's faithfulness in our church community
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white py-8 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2">
            {GALLERY_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-teal-100 hover:text-teal-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading gallery images...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">😞</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : galleryItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📷</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Photos Found</h3>
              <p className="text-gray-600">
                {selectedCategory === 'all' 
                  ? 'No photos have been uploaded yet. Check back soon for new additions!'
                  : `No photos are available in the ${GALLERY_CATEGORIES.find(c => c.id === selectedCategory)?.name} category yet.`
                }
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <p className="text-gray-600">
                  Showing {galleryItems.length} photo{galleryItems.length !== 1 ? 's' : ''} 
                  {selectedCategory !== 'all' && ` in ${GALLERY_CATEGORIES.find(c => c.id === selectedCategory)?.name}`}
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleryItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => openModal(item)}
                  >
                    <div className="relative h-64">
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-teal-600 text-white text-xs px-2 py-1 rounded">
                          {GALLERY_CATEGORIES.find(c => c.id === item.category)?.name}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
                      <p className="text-teal-600 text-sm font-medium">{formatDate(item.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
              <div className="relative h-96 md:h-[500px]">
                <Image
                  src={selectedImage.image_url}
                  alt={selectedImage.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                />
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{selectedImage.title}</h2>
                <span className="bg-teal-100 text-teal-800 text-sm px-3 py-1 rounded">
                  {GALLERY_CATEGORIES.find(c => c.id === selectedImage.category)?.name}
                </span>
              </div>
              <p className="text-gray-600 mb-3">{selectedImage.description}</p>
              <div className="flex items-center justify-between text-sm">
                <p className="text-teal-600 font-medium">{formatDate(selectedImage.created_at)}</p>
                {selectedImage.metadata?.photographer && (
                  <p className="text-gray-500">Photo by: {selectedImage.metadata.photographer}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-teal-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Share Your Photos</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Have photos from church events that you'd like to share? We'd love to include them in our gallery! 
              Help us capture and preserve the memories of our church family.
            </p>
            <div className="bg-white rounded-lg p-6 shadow inline-block">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">How to Submit Photos</h3>
              <ul className="text-left space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-teal-500 mr-2">•</span>
                  Email high-resolution photos to photos@rehobothchurch.ca
                </li>
                <li className="flex items-start">
                  <span className="text-teal-500 mr-2">•</span>
                  Include event details and photo descriptions
                </li>
                <li className="flex items-start">
                  <span className="text-teal-500 mr-2">•</span>
                  Ensure you have permission from people in the photos
                </li>
                <li className="flex items-start">
                  <span className="text-teal-500 mr-2">•</span>
                  Contact the church office for large file transfers
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Guidelines */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Photography Guidelines</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">What We Welcome</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Worship services and special events
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Fellowship gatherings and meals
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Ministry activities and outreach
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Baptisms and special ceremonies
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Church building and facilities
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Guidelines to Remember</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">!</span>
                    Always respect people's privacy and dignity
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">!</span>
                    Ask permission before photographing children
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">!</span>
                    Be mindful during worship times
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">!</span>
                    Focus on capturing the spirit of the event
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">!</span>
                    Submit photos within 2 weeks of the event
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Stay Connected</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Follow us on social media to see the latest photos and stay updated on church events and activities.
          </p>
          <div className="flex justify-center space-x-4">
            <a 
              href="#" 
              className="bg-white text-teal-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Facebook
            </a>
            <a 
              href="#" 
              className="bg-white text-teal-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Instagram
            </a>
            <a 
              href="/events" 
              className="border-2 border-white text-white px-6 py-2 rounded-lg font-semibold hover:bg-white hover:text-teal-600 transition-colors"
            >
              View Upcoming Events
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}