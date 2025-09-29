// src/services/galleryService.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  metadata?: {
    file_size?: number;
    dimensions?: {
      width: number;
      height: number;
    };
    photographer?: string;
    location?: string;
  };
}

export interface GalleryUpload {
  title: string;
  description: string;
  category: string;
  file: File;
  metadata?: {
    photographer?: string;
    location?: string;
  };
}

/**
 * Gallery Service for managing church photo gallery
 */
export class GalleryService {
  private static STORAGE_BUCKET = 'gallery-images';
  
  /**
   * Get all gallery items
   */
  static async getAllItems(): Promise<GalleryItem[]> {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching gallery items:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Gallery service error:', error);
      throw error;
    }
  }

  /**
   * Get gallery items by category
   */
  static async getItemsByCategory(category: string): Promise<GalleryItem[]> {
    if (category === 'all') {
      return this.getAllItems();
    }

    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching gallery items by category:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Gallery service error:', error);
      throw error;
    }
  }

  /**
   * Upload image to gallery
   */
  static async uploadImage(upload: GalleryUpload): Promise<GalleryItem> {
    try {
      // Generate unique filename
      const fileExt = upload.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${upload.category}/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.STORAGE_BUCKET)
        .upload(filePath, upload.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.STORAGE_BUCKET)
        .getPublicUrl(filePath);

      // Create database record
      const galleryItem = {
        title: upload.title,
        description: upload.description,
        category: upload.category,
        image_url: publicUrl,
        metadata: {
          file_size: upload.file.size,
          photographer: upload.metadata?.photographer,
          location: upload.metadata?.location
        }
      };

      const { data, error } = await supabase
        .from('gallery')
        .insert([galleryItem])
        .select()
        .single();

      if (error) {
        console.error('Error creating gallery record:', error);
        
        // Clean up uploaded file if database insert fails
        await supabase.storage
          .from(this.STORAGE_BUCKET)
          .remove([filePath]);
        
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Gallery upload error:', error);
      throw error;
    }
  }

  /**
   * Delete gallery item
   */
  static async deleteItem(id: string): Promise<void> {
    try {
      // Get item to find image URL
      const { data: item, error: fetchError } = await supabase
        .from('gallery')
        .select('image_url')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching gallery item for deletion:', fetchError);
        throw fetchError;
      }

      // Extract file path from URL
      const url = new URL(item.image_url);
      const filePath = url.pathname.split('/').slice(-2).join('/'); // category/filename

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(this.STORAGE_BUCKET)
        .remove([filePath]);

      if (storageError) {
        console.error('Error deleting image from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting gallery item:', deleteError);
        throw deleteError;
      }
    } catch (error) {
      console.error('Gallery delete error:', error);
      throw error;
    }
  }

  /**
   * Update gallery item
   */
  static async updateItem(id: string, updates: Partial<GalleryItem>): Promise<GalleryItem> {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .update({
          title: updates.title,
          description: updates.description,
          category: updates.category,
          metadata: updates.metadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating gallery item:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Gallery update error:', error);
      throw error;
    }
  }

  /**
   * Get gallery statistics
   */
  static async getStats(): Promise<{
    total: number;
    byCategory: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('category');

      if (error) {
        console.error('Error fetching gallery stats:', error);
        throw error;
      }

      const byCategory: Record<string, number> = {};
      data?.forEach(item => {
        byCategory[item.category] = (byCategory[item.category] || 0) + 1;
      });

      return {
        total: data?.length || 0,
        byCategory
      };
    } catch (error) {
      console.error('Gallery stats error:', error);
      throw error;
    }
  }

  /**
   * Check if gallery storage bucket exists and create if needed
   */
  static async ensureBucketExists(): Promise<void> {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === this.STORAGE_BUCKET);

      if (!bucketExists) {
        const { error } = await supabase.storage.createBucket(this.STORAGE_BUCKET, {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        });

        if (error) {
          console.error('Error creating gallery bucket:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Gallery bucket check error:', error);
      throw error;
    }
  }
}

// Gallery categories
export const GALLERY_CATEGORIES = [
  { id: 'all', name: 'All Photos' },
  { id: 'worship', name: 'Worship Services' },
  { id: 'events', name: 'Church Events' },
  { id: 'community', name: 'Community Outreach' },
  { id: 'youth', name: 'Youth Ministry' },
  { id: 'children', name: 'Children\'s Ministry' },
  { id: 'baptisms', name: 'Baptisms' },
  { id: 'fellowship', name: 'Fellowship' },
  { id: 'facilities', name: 'Church Facilities' },
  { id: 'special', name: 'Special Events' }
];