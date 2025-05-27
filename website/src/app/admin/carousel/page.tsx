// src/app/admin/carousel/page.tsx
'use client';

import React, { useState, useRef } from 'react';
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
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CarouselSlideFormData> }) => 
      updateCarouselSlide(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carouselSlides'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCarouselSlide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carouselSlides'] });
    },
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
                            <img 
                              src={slide.imageUrl} 
                              alt={slide.title} 
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{slide.title}</h3>
                        {slide.subtitle && <p className="text-gray-600 mb-2">{slide.subtitle}</p>}
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <span className="font-semibold">Order:</span>
                          <span>{(slide as any).displayOrder || 0}</span>
                        </div>
                        {slide.ctaText && (
                          <div className="flex items-center gap-2 text-sm mb-2">
                            <span className="font-semibold">CTA:</span>
                            <span>{slide.ctaText}</span>
                          </div>
                        )}
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(slide as any)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="error"
                            size="sm"
                            onClick={() => handleDelete(slide.id)}
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
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <p className="text-gray-600">No carousel slides found.</p>
              </div>
            )}
          </div>

          <div>
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingSlideId ? 'Edit Slide' : 'Add New Slide'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-1">
                      Subtitle
                    </label>
                    <textarea
                      id="subtitle"
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        id="imageUrl"
                        name="imageUrl"
                        required
                        value={formData.imageUrl}
                        onChange={handleInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? 'Uploading...' : 'Upload'}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </div>
                    {isUploading && (
                      <div className="mt-2">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 transition-all duration-300" 
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Uploading: {uploadProgress}%
                        </p>
                      </div>
                    )}
                    {formData.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="h-32 object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="ctaText" className="block text-sm font-medium text-gray-700 mb-1">
                        CTA Text
                      </label>
                      <input
                        type="text"
                        id="ctaText"
                        name="ctaText"
                        value={formData.ctaText}
                        onChange={handleInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="ctaLink" className="block text-sm font-medium text-gray-700 mb-1">
                        CTA Link
                      </label>
                      <input
                        type="text"
                        id="ctaLink"
                        name="ctaLink"
                        value={formData.ctaLink}
                        onChange={handleInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      id="displayOrder"
                      name="displayOrder"
                      value={formData.displayOrder}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                      Active
                    </label>
                  </div>
                  
                  <div className="pt-4 flex gap-2">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {editingSlideId ? 'Update Slide' : 'Add Slide'}
                    </Button>
                    {editingSlideId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
