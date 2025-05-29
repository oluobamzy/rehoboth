"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import Button from '@/components/common/Button';
import Image from 'next/image'; // Import next/image
import { fetchSermonSeriesById, saveSermonSeries, SermonSeries } from '@/services/sermonService';
import { storage } from '@/services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface AdminSeriesFormProps {
  seriesId?: string;
  onSave?: (seriesData: SermonSeries) => Promise<void>;
  isSaving?: boolean;
}

export default function AdminSeriesForm({ seriesId, onSave, isSaving = false }: AdminSeriesFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = !!seriesId;
  
  // Form setup with react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty }
  } = useForm<SermonSeries>({
    defaultValues: {
      title: '',
      description: '',
      image_url: '',
      start_date: '',
      end_date: '',
      is_active: true,
    }
  });
  
  // State for image upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  // const [isSaving, setIsSaving] = useState(false); // 'isSaving' is assigned a value but never used.

  // Get existing series data if in edit mode
  const { data: existingSeries } = useQuery({
    queryKey: ['sermonSeries', seriesId],
    queryFn: () => fetchSermonSeriesById(seriesId!),
    enabled: isEditMode,
  });
  
  // Save series mutation
  const saveMutation = useMutation({
    mutationFn: saveSermonSeries,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermonSeries'] });
    },
  });
  
  // Set form values when existing series data is loaded
  useEffect(() => {
    if (existingSeries) {
      // Format dates for form inputs
      const formattedSeries = {
        ...existingSeries,
        start_date: existingSeries.start_date ? existingSeries.start_date.split('T')[0] : '',
        end_date: existingSeries.end_date ? existingSeries.end_date.split('T')[0] : '',
      };
      
      reset(formattedSeries);
      
      // Set image preview if available
      if (existingSeries.image_url) {
        setImagePreview(existingSeries.image_url);
      }
    }
  }, [existingSeries, reset]);
  
  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle image upload to Firebase Storage
  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    
    try {
      setIsUploading(true);
      
      // Create a unique file name
      const fileExtension = imageFile.name.split('.').pop();
      const fileName = `series_${Date.now()}.${fileExtension}`;
      
      // Reference to storage location
      const storageRef = ref(storage, `sermons/series/${fileName}`);
      
      // Upload the file
      await uploadBytes(storageRef, imageFile);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle form submission
  const onSubmit = async (data: SermonSeries) => {
    try {
      // First upload the image if a new one is selected
      let imageUrl = data.image_url;
      
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }
      
      // Save the series data with the image URL
      const seriesData = {
        ...data,
        image_url: imageUrl
      };
      
      // Use the onSave prop if provided, otherwise use the default mutation
      if (onSave) {
        await onSave(seriesData);
      } else {
        await saveMutation.mutateAsync(seriesData);
        
        // Success message
        alert(isEditMode ? 'Series updated successfully!' : 'Series created successfully!');
        
        // Redirect
        router.push('/admin/sermons/series');
      }
    } catch (error) {
      console.error('Error saving series:', error);
      alert('Error saving series. Please try again.');
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold">
          {isEditMode ? 'Edit Series' : 'Create New Series'}
        </h2>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Series Title */}
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Series Title*
            </label>
            <input
              id="title"
              type="text"
              className={`w-full border rounded-md py-2 px-3 text-gray-700 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter series title"
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>
          
          {/* Date Range */}
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              id="start_date"
              type="date"
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700"
              {...register('start_date')}
            />
          </div>
          
          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              id="end_date"
              type="date"
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700"
              {...register('end_date')}
            />
          </div>
          
          {/* Description */}
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700"
              placeholder="Enter series description"
              {...register('description')}
            ></textarea>
          </div>
          
          {/* Series Image */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Series Image
            </label>
            
            <div className="mt-1 flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              {/* Preview area */}
              <div className="w-full md:w-1/3">
                {imagePreview ? (
                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Series cover preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                        setValue('image_url', '');
                      }}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                      aria-label="Remove image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Upload controls */}
              <div className="w-full md:w-2/3">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-gray-700 mb-1">
                        <span className="font-medium">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Maximum file size: 5MB. Recommended dimensions: 1200x675.</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                
                {imageFile && (
                  <p className="mt-2 text-sm text-gray-500">
                    Selected: {imageFile.name} ({(imageFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
                
                {/* Hidden input to store the image URL for the form */}
                <input
                  type="hidden"
                  {...register('image_url')}
                />
              </div>
            </div>
          </div>
          
          {/* Active Status */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              <input
                id="is_active"
                type="checkbox"
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                {...register('is_active')}
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Active (visible to public)
              </label>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="pt-6 border-t border-gray-200 flex items-center justify-end space-x-3">
          <Button
            type="button"
            onClick={() => router.back()}
            variant="outline"
            disabled={isSubmitting || isUploading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isUploading || (!isDirty && !isEditMode)}
            className={(isSubmitting || isUploading) ? 'opacity-70 cursor-not-allowed' : ''}
          >
            {isSubmitting || isUploading ? 'Saving...' : isEditMode ? 'Update Series' : 'Create Series'}
          </Button>
        </div>
      </form>
    </div>
  );
}
