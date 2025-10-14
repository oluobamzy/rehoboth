'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ContentEditor from '@/components/admin/ContentEditor';

interface ContentItem {
  id: string;
  page_key: string;
  section_key: string;
  content: string;
  updated_at: string;
  updated_by: string;
}

export default function AdminContentPage() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPage, setSelectedPage] = useState<string>('all');
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadContentItems();
  }, []);

  // No auth check needed here since admin layout handles it

  const loadContentItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('page_content')
        .select(`
          id,
          page_key,
          section_key,
          content,
          updated_at,
          updated_by
        `)
        .order('page_key', { ascending: true })
        .order('section_key', { ascending: true });

      if (error) throw error;

      // Temporarily skip user lookup to avoid RLS policy recursion
      // TODO: Fix user_roles RLS policies and re-enable user name lookup
      const formattedItems = data.map(item => ({
        id: item.id,
        page_key: item.page_key,
        section_key: item.section_key,
        content: item.content,
        updated_at: item.updated_at,
        updated_by: 'System' // Temporary fallback until RLS policies are fixed
      }));

      setContentItems(formattedItems);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContent = async (pageKey: string, sectionKey: string, content: string) => {
    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_key: pageKey,
          section_key: sectionKey,
          content,
        }),
      });

      if (response.ok) {
        await loadContentItems();
        setEditingItem(null);
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error('Error saving content:', error);
      return { success: false, error: 'Failed to save content' };
    }
  };

  const filteredItems = contentItems.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.page_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.section_key.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPage = selectedPage === 'all' || item.page_key === selectedPage;
    
    return matchesSearch && matchesPage;
  });

  const uniquePages = [...new Set(contentItems.map(item => item.page_key))];

  const formatSectionName = (sectionKey: string) => {
    return sectionKey
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatPageName = (pageKey: string) => {
    return pageKey.charAt(0).toUpperCase() + pageKey.slice(1);
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    const textContent = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    return textContent.length > maxLength ? 
      textContent.substring(0, maxLength) + '...' : 
      textContent;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading content management...</p>
        </div>
      </div>
    );
  }

  if (editingItem) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Edit Content
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatPageName(editingItem.page_key)} - {formatSectionName(editingItem.section_key)}
                  </p>
                </div>
                <button
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <ContentEditor
                initialContent={editingItem.content}
                pageKey={editingItem.page_key}
                sectionKey={editingItem.section_key}
                onSave={async (content) => {
                  await handleSaveContent(editingItem.page_key, editingItem.section_key, content);
                }}
                onCancel={() => setEditingItem(null)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
            <p className="text-gray-600 mt-1">
              Manage all editable content across your website
            </p>
          </div>
          
          {/* Filters */}
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <select
                  value={selectedPage}
                  onChange={(e) => setSelectedPage(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Pages</option>
                  {uniquePages.map(page => (
                    <option key={page} value={page}>
                      {formatPageName(page)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Content Sections ({filteredItems.length})
            </h2>
          </div>
          
          {filteredItems.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">
                {searchTerm || selectedPage !== 'all' ? 
                  'No content matches your search criteria.' : 
                  'No content sections found.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {formatPageName(item.page_key)}
                        </span>
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {formatSectionName(item.section_key)}
                        </h3>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {truncateContent(item.content)}
                      </p>
                      <div className="mt-2 text-xs text-gray-400">
                        Last updated {new Date(item.updated_at).toLocaleDateString()} by {item.updated_by}
                      </div>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <h3 className="font-medium text-gray-900">Back to Dashboard</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Return to the main admin dashboard
                </p>
              </button>
              <button
                onClick={() => window.open('/', '_blank')}
                className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <h3 className="font-medium text-gray-900">Preview Website</h3>
                <p className="text-sm text-gray-500 mt-1">
                  View your changes on the live website
                </p>
              </button>
              <button
                onClick={() => loadContentItems()}
                className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <h3 className="font-medium text-gray-900">Refresh Content</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Reload the latest content from database
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}