'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchSermonSeriesById, saveSermonSeries, SermonSeries } from '@/services/sermonService';
import AdminSeriesForm from '@/components/sermons/admin/AdminSeriesForm';

export default function EditSermonSeriesPage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // const [series, setSeries] = useState<SermonSeries | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { id } = params;
  
  const isNewSeries = id === 'new';

  // Fetch series data if editing an existing series
  useEffect(() => {
    async function loadSeries() {
      if (isNewSeries) {
        // setSeries({
        //   id: 'new',
        //   title: '',
        //   description: '',
        //   start_date: '',
        //   end_date: '',
        //   is_active: true,
        //   created_at: new Date().toISOString(),
        // });
        setIsLoading(false);
        return;
      }
      
      try {
        const seriesData = await fetchSermonSeriesById(id);
        if (!seriesData) {
          setError('Sermon series not found');
        } else {
          // setSeries(seriesData);
        }
      } catch (error) {
        console.error('Error fetching sermon series:', error);
        setError('Failed to load sermon series data');
      } finally {
        setIsLoading(false);
      }
    }

    loadSeries();
  }, [id, isNewSeries]);

  // Save series data
  const handleSaveSeries = async (seriesData: SermonSeries) => {
    try {
      setIsSaving(true);
      setError(null);
      
      const savedSeries = await saveSermonSeries(seriesData);
      
      if (savedSeries) {
        router.push('/admin/sermons/series');
        router.refresh();
      } else {
        setError('Failed to save sermon series');
      }
    } catch (error) {
      console.error('Error saving sermon series:', error);
      setError('An error occurred while saving the sermon series');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <Link
          href="/admin/sermons/series"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
        >
          Back to Series
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isNewSeries ? 'Add New Sermon Series' : 'Edit Sermon Series'}
        </h1>
        <Link
          href="/admin/sermons/series"
          className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
      
      <AdminSeriesForm
        seriesId={id}
        isSaving={isSaving}
        onSave={handleSaveSeries}
      />
    </div>
  );
}
