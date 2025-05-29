"use client";

import { useState } from 'react';
import { Sermon, SermonSeries, fetchSermons, deleteSermon, PaginatedSermons } from '@/services/sermonService';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'; // Corrected import path
import Link from 'next/link';
import Image from 'next/image'; // Import next/image
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Add useQueryClient
import { format } from 'date-fns';
import { posthog } from '@/services/posthog';

interface AdminSermonListProps { // Define AdminSermonListProps
  currentView?: 'list' | 'grid';
  onSetView?: (view: 'list' | 'grid') => void;
  onEdit?: (sermon: Sermon) => void;
  onDelete?: (id: string) => void;
  onAddNew?: () => void;
}

export default function AdminSermonList({ /*sermons, series,*/ currentView, onSetView, onEdit, onDelete, onAddNew }: AdminSermonListProps) {
  // const router = useRouter(); // 'router' is assigned a value but never used.
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1); // Add page state
  const pageSize = 10; // Define pageSize
  const queryClient = useQueryClient(); 

  const { data, isLoading, error } = useQuery<PaginatedSermons, Error>({
    queryKey: ['admin-sermons', page, searchTerm], 
    queryFn: () => fetchSermons({ page, pageSize, query: searchTerm, includeUnpublished: true, sort_by: 'sermon_date', sort_order: 'desc' }), 
  });
  const sermonsData = data;

  const deleteMutation = useMutation<boolean, Error, string>({
    mutationFn: (id: string) => deleteSermon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sermons'] });
    },
    onError: (error: Error) => {
      console.error("Error deleting sermon:", error);
    }
  });

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  // Handle sermon deletion
  const handleDeleteSermon = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
        
        // Track sermon deletion in PostHog
        posthog.capture('sermon_deleted', {
          sermon_id: id,
          sermon_title: title
        });
      } catch (error) {
        console.error('Error deleting sermon:', error);
      }
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Safely access properties of sermonsData only if it's defined
  const sermonsToDisplay = sermonsData?.sermons || [];
  const totalSermons = sermonsData?.count || 0;
  const totalPages = Math.ceil(totalSermons / pageSize);

  if (isLoading) return <p>Loading sermons...</p>;
  if (error) return <p>Error loading sermons: {error.message}</p>;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <h2 className="text-2xl font-bold mb-4 md:mb-0">Manage Sermons</h2>
          <Link
            href="/admin/sermons/new"
            className="px-4 py-2 bg-orange-600 text-white font-medium rounded-md hover:bg-orange-700 transition-colors inline-flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add New Sermon
          </Link>
        </div>

        {/* Search bar */}
        <div className="mt-6">
          <div className="relative">
            <input
              type="search"
              placeholder="Search sermons..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400 absolute left-3 top-2.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="p-6 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-6 text-center text-red-600">
          <p>Error loading sermons. Please try again.</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && (!sermonsData || !sermonsData.sermons || sermonsData.sermons.length === 0) && (
        <div className="p-12 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-gray-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="text-lg font-medium mb-2">No sermons found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? `No results found for "${searchTerm}"` : 'Get started by adding your first sermon'}
          </p>
          {searchTerm ? (
            <button
              className="text-orange-600 hover:text-orange-800 font-medium"
              onClick={() => setSearchTerm('')}
            >
              Clear search
            </button>
          ) : (
            <Link
              href="/admin/sermons/new"
              className="px-4 py-2 bg-orange-600 text-white font-medium rounded-md hover:bg-orange-700 transition-colors"
            >
              Add First Sermon
            </Link>
          )}
        </div>
      )}

      {/* Sermon list */}
      {!isLoading && !error && sermonsData && sermonsData.sermons && sermonsData.sermons.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Speaker</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Series</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sermonsToDisplay.map((sermon: Sermon) => (
                <tr key={sermon.id}>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {sermon.thumbnail_url && (
                        <div className="flex-shrink-0 h-10 w-10 mr-3">
                          <Image 
                            src={sermon.thumbnail_url} 
                            alt="Thumbnail" 
                            width={40} 
                            height={40} 
                            className="rounded-md object-cover"
                          />
                        </div>
                      )}
                      <Link href={`/sermons/${sermon.id}`} className="text-sm font-medium text-orange-600 hover:text-orange-800">
                        {sermon.title}
                      </Link>
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{sermon.speaker_name}</td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{sermon.series?.title || 'N/A'}</td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{formatDate(sermon.sermon_date)}</td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        sermon.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {sermon.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/sermons/${sermon.id}`} target="_blank" className="text-blue-600 hover:text-blue-800 mr-3">
                      <EyeIcon className="h-5 w-5 inline" />
                    </Link>
                    <Link href={`/admin/sermons/${sermon.id}`} className="text-indigo-600 hover:text-indigo-800 mr-3">
                      <PencilIcon className="h-5 w-5 inline" />
                    </Link>
                    <button
                      onClick={() => handleDeleteSermon(sermon.id, sermon.title)}
                      className="text-red-600 hover:text-red-800"
                      disabled={deleteMutation.isPending}
                    >
                      <TrashIcon className="h-5 w-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
