'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ContentItem {
  id: string;
  page_key: string;
  section_key: string;
  title?: string;
  content: string;
  content_type: string;
  updated_at: string;
}

interface UseEditableContentReturn {
  content: string | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  lastUpdated: Date | null;
}

// Cache for content to avoid repeated API calls
const contentCache = new Map<string, { data: ContentItem; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to fetch editable content from the database with fallback to static content
 * @param pageKey - The page identifier (e.g., 'about', 'homepage')
 * @param sectionKey - The section identifier (e.g., 'mission', 'welcome')
 * @param fallbackContent - Static content to use if database content is not available
 * @returns Object with content, loading state, error, and refresh function
 */
export function useEditableContent(
  pageKey: string,
  sectionKey: string,
  fallbackContent?: string
): UseEditableContentReturn {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const cacheKey = `${pageKey}_${sectionKey}`;

  const fetchContent = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check cache first
      const cached = contentCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setContent(cached.data.content);
        setLastUpdated(new Date(cached.data.updated_at));
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `/api/content?page_key=${encodeURIComponent(pageKey)}&section_key=${encodeURIComponent(sectionKey)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store', // Always fetch fresh data
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          // Content not found in database, use fallback
          setContent(fallbackContent || null);
          setLastUpdated(null);
          setIsLoading(false);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.content) {
        // Cache the result
        contentCache.set(cacheKey, {
          data: data.content,
          timestamp: Date.now()
        });
        
        setContent(data.content.content);
        setLastUpdated(new Date(data.content.updated_at));
      } else {
        // No content found, use fallback
        setContent(fallbackContent || null);
        setLastUpdated(null);
      }
    } catch (err) {
      console.error('Error fetching content:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch content');
      
      // Use fallback content on error
      setContent(fallbackContent || null);
      setLastUpdated(null);
    } finally {
      setIsLoading(false);
    }
  }, [pageKey, sectionKey, fallbackContent, cacheKey]);

  const refresh = useCallback(() => {
    // Clear cache and refetch
    contentCache.delete(cacheKey);
    fetchContent();
  }, [cacheKey, fetchContent]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return {
    content,
    isLoading,
    error,
    refresh,
    lastUpdated
  };
}

/**
 * Hook to fetch all content for a specific page
 * @param pageKey - The page identifier
 * @returns Object with content array, loading state, error, and refresh function
 */
export function usePageContent(pageKey: string) {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPageContent = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/content?page_key=${encodeURIComponent(pageKey)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setContent(data.content || []);
    } catch (err) {
      console.error('Error fetching page content:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch page content');
      setContent([]);
    } finally {
      setIsLoading(false);
    }
  }, [pageKey]);

  const refresh = useCallback(() => {
    fetchPageContent();
  }, [fetchPageContent]);

  useEffect(() => {
    fetchPageContent();
  }, [fetchPageContent]);

  return {
    content,
    isLoading,
    error,
    refresh
  };
}

/**
 * Hook for admin content management operations
 * @returns Object with CRUD functions for content management
 */
export function useContentManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearCache = useCallback(() => {
    contentCache.clear();
  }, []);

  const updateContent = useCallback(async (
    id: string,
    contentData: Partial<ContentItem>
  ): Promise<ContentItem | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/content/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update content');
      }

      const data = await response.json();
      
      // Clear cache to force refresh
      clearCache();
      
      return data.content;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update content';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearCache]);

  const createContent = useCallback(async (
    contentData: Omit<ContentItem, 'id' | 'updated_at'>
  ): Promise<ContentItem | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create content');
      }

      const data = await response.json();
      
      // Clear cache to force refresh
      clearCache();
      
      return data.content;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create content';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearCache]);

  const deleteContent = useCallback(async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/content/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete content');
      }

      // Clear cache to force refresh
      clearCache();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete content';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearCache]);

  return {
    isLoading,
    error,
    updateContent,
    createContent,
    deleteContent,
    clearCache
  };
}