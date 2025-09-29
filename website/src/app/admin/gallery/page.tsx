// src/app/admin/gallery/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { GalleryService, GalleryUpload, GalleryItem, GALLERY_CATEGORIES } from '@/services/galleryService';

export default function AdminGalleryPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'worship',
    photographer: '',
    location: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Load gallery items
  const loadGalleryItems = async () => {
    try {
      setLoading(true);
      const items = await GalleryService.getAllItems();
      setGalleryItems(items);
    } catch (err) {
      console.error('Error loading gallery:', err);
      setError('Failed to load gallery items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGalleryItems();
  }, []);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file.');
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB.');
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!selectedFile) {
      setError('Please select an image file.');
      return;
    }

    if (!uploadForm.title.trim()) {
      setError('Please enter a title.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const uploadData: GalleryUpload = {
        title: uploadForm.title.trim(),
        description: uploadForm.description.trim(),
        category: uploadForm.category,
        file: selectedFile,
        metadata: {
          photographer: uploadForm.photographer.trim() || undefined,
          location: uploadForm.location.trim() || undefined
        }
      };

      await GalleryService.uploadImage(uploadData);
      
      setSuccess('Image uploaded successfully!');
      
      // Reset form
      setUploadForm({
        title: '',
        description: '',
        category: 'worship',
        photographer: '',
        location: ''
      });
      setSelectedFile(null);
      
      // Clear file input
      const fileInput = document.getElementById('image-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Reload gallery
      await loadGalleryItems();

    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await GalleryService.deleteItem(id);
      setSuccess('Image deleted successfully.');
      await loadGalleryItems();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete image.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gallery Management</h1>
              <p className="text-gray-600 mt-1">Upload and manage church gallery images</p>
            </div>
            <div className="text-sm text-gray-500">
              Total Images: {galleryItems.length}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Status Messages */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload New Image</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* File Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image File
                  </label>
                  <input
                    id="image-file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                  {selectedFile && (
                    <p className="text-sm text-gray-500 mt-1">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter image title"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {GALLERY_CATEGORIES.filter(cat => cat.id !== 'all').map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter image description"
                  />
                </div>

                {/* Photographer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photographer (Optional)
                  </label>
                  <input
                    type="text"
                    value={uploadForm.photographer}
                    onChange={(e) => setUploadForm({ ...uploadForm, photographer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Photographer name"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={uploadForm.location}
                    onChange={(e) => setUploadForm({ ...uploadForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Photo location"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </button>
              </form>
            </div>
          </div>

          {/* Gallery List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Current Gallery Images</h2>
              </div>
              
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading gallery...</p>
                  </div>
                ) : galleryItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No images in gallery yet. Upload your first image!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {galleryItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          <p className="text-sm text-gray-500">
                            {GALLERY_CATEGORIES.find(cat => cat.id === item.category)?.name} • 
                            {new Date(item.created_at).toLocaleDateString()}
                          </p>
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}