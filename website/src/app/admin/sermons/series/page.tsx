"use client";

import { fetchSermonSeries, SermonSeries, deleteSermonSeries } from '@/services/sermonService';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter

export default function AdminSermonSeriesPage() {
  const queryClient = useQueryClient();
  const router = useRouter(); // Initialize useRouter
  const [series, setSeries] = useState<SermonSeries[]>([]);

  const { data: seriesList = [], isLoading: seriesLoading, error: seriesError } = useQuery<SermonSeries[], Error>({
    queryKey: ['sermonSeriesAdmin'], 
    queryFn: fetchSermonSeries,
  });

  const deleteMutation = useMutation<boolean, Error, string>({
    mutationFn: (id: string) => deleteSermonSeries(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermonSeriesAdmin'] });
    },
    onError: (error: Error) => {
      console.error('Error deleting series:', error);
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this series?')) {
      deleteMutation.mutate(id);
    }
  };

  useEffect(() => {
    if (seriesList) {
      setSeries(seriesList);
    }
  }, [seriesList]);

  if (seriesLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        <p className="ml-4 text-gray-600">Loading series...</p>
      </div>
    );
  }

  if (seriesError) {
    return (
      <div className="p-6 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
        <p className="font-semibold">Error loading series:</p>
        <p>{seriesError.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Sermon Series</h1>
        <div className="space-x-2">
          <Link 
            href="/admin/sermons" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Sermons
          </Link>
          <button 
            onClick={() => router.push('/admin/sermons/series/new')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Add New Series
          </button>
        </div>
      </div>

      {series.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sermons</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {series.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.image_url && (
                        <div className="flex-shrink-0 h-10 w-10 mr-4">
                          <Image className="h-10 w-10 rounded-md object-cover" src={item.image_url} alt="" width={40} height={40} />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.start_date && (
                      <>
                        {new Date(item.start_date).toLocaleDateString()}
                        {item.end_date && ` - ${new Date(item.end_date).toLocaleDateString()}`}
                      </>
                    )}
                    {!item.start_date && 'No dates set'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.sermons ? item.sermons.length : 0} sermons {/* Safely access sermons length */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/sermons/series/${item.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/admin/sermons?series=${item.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Sermons
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6 text-center text-sm text-gray-500">
          No sermon series found. Create your first series.
        </div>
      )}
    </div>
  );
}
