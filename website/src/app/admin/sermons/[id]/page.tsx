"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminSermonForm from '@/components/sermons/admin/AdminSermonForm';

export default function EditSermonPage({ params }: { params: { id: string } }) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { id } = params;
  
  const isNewSermon = id === 'new';

  const handleSaveSuccess = (_sermon: any) => { // Renamed sermon to _sermon as it's not used
    setError(null); // Clear any previous errors
    router.push('/admin/sermons');
    router.refresh(); // Refresh the sermons list page to show the new/updated sermon
  };

  const handleSaveError = (error: Error) => { 
    setError(error.message); 
  };

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
          href="/admin/sermons"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
        >
          Back to Sermons
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isNewSermon ? 'Add New Sermon' : 'Edit Sermon'}
        </h1>
        <Link
          href="/admin/sermons"
          className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
      
      <AdminSermonForm
        sermonId={id} // Pass the sermonId (which can be 'new')
        onSaveSuccess={handleSaveSuccess}
        onSaveError={handleSaveError}
      />
    </div>
  );
}
