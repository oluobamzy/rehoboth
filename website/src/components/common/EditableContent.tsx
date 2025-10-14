'use client';

import { useState } from 'react';
import { useEditableContent } from '@/hooks/useEditableContent';
import { useAuth } from '@/services/auth';
import ContentEditor from '@/components/admin/ContentEditor';
import StyledContent from './StyledContent';

interface EditableContentProps {
  pageKey: string;
  sectionKey: string;
  fallbackContent?: string;
  className?: string;
  showEditButton?: boolean;
  onContentUpdate?: () => void;
}

export default function EditableContent({
  pageKey,
  sectionKey,
  fallbackContent = '',
  className = '',
  showEditButton = true,
  onContentUpdate
}: EditableContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { content, isLoading, error, refresh } = useEditableContent(
    pageKey,
    sectionKey,
    fallbackContent
  );
  const { user } = useAuth();

  // Check if user is admin (simplified - you might want to check roles more thoroughly)
  const isAdmin = user && user.role === 'admin';

  const handleSave = async (newContent: string) => {
    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_key: pageKey,
          section_key: sectionKey,
          content: newContent,
          content_type: 'html',
          is_published: true
        }),
      });

      if (!response.ok) {
        // If creation failed, try updating existing content
        const getAllResponse = await fetch(
          `/api/admin/content?page_key=${encodeURIComponent(pageKey)}&section_key=${encodeURIComponent(sectionKey)}`
        );
        
        if (getAllResponse.ok) {
          const data = await getAllResponse.json();
          if (data.content && data.content.length > 0) {
            const updateResponse = await fetch(`/api/admin/content/${data.content[0].id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                content: newContent,
                content_type: 'html',
                is_published: true
              }),
            });
            
            if (!updateResponse.ok) {
              throw new Error('Failed to update content');
            }
          }
        } else {
          throw new Error('Failed to save content');
        }
      }

      setIsEditing(false);
      
      // Force cache invalidation and refresh
      setTimeout(() => {
        refresh();
        // Also trigger a hard refresh of the page content if needed
        if (onContentUpdate) {
          onContentUpdate();
        }
        // Force a window reload to clear all caches
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Error saving content:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-gray-500">Loading content...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-600 ${className}`}>
        <p>Error loading content: {error}</p>
        {fallbackContent && (
          <div className="mt-2 opacity-75">
            <StyledContent content={fallbackContent} />
          </div>
        )}
      </div>
    );
  }

  const displayContent = content || fallbackContent;

  if (isEditing && isAdmin) {
    return (
      <div className={className}>
        <ContentEditor
          initialContent={displayContent}
          pageKey={pageKey}
          sectionKey={sectionKey}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Content Display */}
      <StyledContent content={displayContent} />
      
      {/* Admin Edit Button */}
      {isAdmin && showEditButton && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-lg hover:bg-blue-700"
          title={`Edit ${sectionKey}`}
        >
          <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </button>
      )}
    </div>
  );
}