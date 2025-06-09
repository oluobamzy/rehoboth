// src/app/admin/carousel/page.tsx
'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MainLayout from '@/components/common/MainLayout';
import Button from '@/components/common/Button';
import { CarouselSlideProps } from '@/components/hero/CarouselSlide';
import { fetchCarouselSlides, createCarouselSlide, updateCarouselSlide, deleteCarouselSlide } from '@/services/carouselService';
import { uploadImage, generateUniqueFilePath } from '@/utils/imageUpload';

interface CarouselSlideFormData extends Omit<CarouselSlideProps, 'id'> {
  displayOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

const initialFormData: CarouselSlideFormData = {
  title: '',
  subtitle: '',
  imageUrl: '',
  ctaText: '',
  ctaLink: '',
  displayOrder: 0,
  isActive: true,
  startDate: '',
  endDate: '',
};

export default function AdminCarouselPage() {
  const [formData, setFormData] = useState<CarouselSlideFormData>(initialFormData);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: slides, isLoading, error } = useQuery({
    queryKey: ['carouselSlides'],
    queryFn: fetchCarouselSlides,
  });

  const createMutation = useMutation({
    mutationFn: createCarouselSlide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carouselSlides'] });
      resetForm();
      setErrorMessage(null);
    },
    onError: (error: Error) => {
      setErrorMessage(`Failed to create slide: ${error.message || 'Unknown error'}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CarouselSlideFormData> }) => 
      updateCarouselSlide(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carouselSlides'] });
      resetForm();
      setErrorMessage(null);
    },
    onError: (error: Error) => {
      setErrorMessage(`Failed to update slide: ${error.message || 'Unknown error'}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCarouselSlide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carouselSlides'] });
      setErrorMessage(null);
    },
    onError: (error: Error) => {
      setErrorMessage(`Failed to delete slide: ${error.message || 'Unknown error'}`);
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingSlideId(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      setUploadProgress(10);
      
      // Generate a unique path for the image
      const path = generateUniqueFilePath(file, 'carousel');
      
      // Simulate progress (in a real app, you'd use Firebase's onStateChanged)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
          }
          return Math.min(newProgress, 90);
        });
      }, 300);
      
      // Upload the image to Firebase Storage
      const imageUrl = await uploadImage(file, path);
      
      // Update the form data with the image URL
      setFormData(prev => ({
        ...prev,
        imageUrl,
      }));
      
      // Clear the progress indicator
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Reset after a short delay
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    } catch (error) {
      console.error('Error uploading image:', error);
      setIsUploading(false);
      setUploadProgress(0);
      alert('Failed to upload image. Please try again.');
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSlideId) {
      updateMutation.mutate({ id: editingSlideId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (slide: CarouselSlideProps & { displayOrder: number; isActive: boolean }) => {
    setEditingSlideId(slide.id);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle || '',
      imageUrl: slide.imageUrl,
      ctaText: slide.ctaText || '',
      ctaLink: slide.ctaLink || '',
      displayOrder: slide.displayOrder,
      isActive: slide.isActive,
      startDate: '',
      endDate: '',
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this slide?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <MainLayout><div className="container mx-auto px-4 py-8">Loading...</div></MainLayout>;
  }

  if (error) {
    return <MainLayout><div className="container mx-auto px-4 py-8">Error loading carousel slides</div></MainLayout>;
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Carousel Slide Management</h1>
          <p className="text-gray-600">
            Create and manage carousel slides that appear on the homepage.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold mb-4">Current Slides</h2>
            {slides && slides.length > 0 ? (
              <div className="space-y-4">
                {slides.map((slide) => (
                  <div key={slide.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="w-full md:w-1/3">
                        {slide.imageUrl && (
                          <div className="aspect-video relative bg-gray-100 rounded overflow-hidden">
                            <Image
                              src={slide.imageUrl} 
                              alt={slide.title}
                              layout="fill"
                              objectFit="cover"
                            />
                          </div>
                        )}
                      </div>
                      <div className="w-full md:w-2/3">
                        <h3 className="text-lg font-semibold">{slide.title}</h3>
                        {slide.subtitle && <p className="text-sm text-gray-600">{slide.subtitle}</p>}
                        <div className="mt-2 space-x-2">
                          <Button 
                            onClick={() => handleEdit(slide as CarouselSlideProps & { displayOrder: number; isActive: boolean })}
                            variant="outline"
                            size="sm"
                          >
                            Edit
                          </Button>
                          <Button 
                            onClick={() => handleDelete(slide.id)}
                            variant="error" // Changed from "destructive" to "error"
                            size="sm"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No slides found. Add one using the form.</p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">
              {editingSlideId ? 'Edit Slide' : 'Add New Slide'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                  required
                />
              </div>

              <div>
                <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700">Subtitle</label>
                <textarea
                  name="subtitle"
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                />
              </div>

              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image</label>
                <input 
                  type="file" 
                  id="imageUrl" 
                  name="imageUrl" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                />
                {isUploading && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{uploadProgress}% uploaded</p>
                  </div>
                )}
                {formData.imageUrl && !isUploading && (
                  <div className="mt-2">
                    <p className="text-sm text-green-600">Image uploaded successfully!</p>
                    <div className="aspect-video relative bg-gray-100 rounded overflow-hidden mt-2 w-1/2">
                        <Image 
                            src={formData.imageUrl} 
                            alt="Uploaded preview" 
                            layout="fill"
                            objectFit="cover"
                        />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="ctaText" className="block text-sm font-medium text-gray-700">CTA Text</label>
                <input
                  type="text"
                  name="ctaText"
                  id="ctaText"
                  value={formData.ctaText}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                />
              </div>

              <div>
                <label htmlFor="ctaLink" className="block text-sm font-medium text-gray-700">CTA Link</label>
                <input
                  type="url"
                  name="ctaLink"
                  id="ctaLink"
                  value={formData.ctaLink}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700">Display Order</label>
                <input
                  type="number"
                  name="displayOrder"
                  id="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Active</label>
              </div>
              
              {errorMessage && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{errorMessage}</span>
                  <button 
                    type="button" 
                    className="absolute top-0 bottom-0 right-0 px-4 py-3"
                    onClick={() => setErrorMessage(null)}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                    </svg>
                  </button>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" onClick={resetForm} variant="outline">
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending || isUploading}>
                  {editingSlideId ? 'Update Slide' : 'Create Slide'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
