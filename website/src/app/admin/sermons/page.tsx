"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminSermonList from '@/components/sermons/admin/AdminSermonList';

export default function AdminSermonsPage() {
  const router = useRouter();

  // Handle create new sermon
  const handleCreateSermon = () => {
    router.push('/admin/sermons/new');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Sermons</h1>
        <div className="space-x-2">
          <Link 
            href="/admin/sermons/dashboard" 
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            View Analytics
          </Link>
          <Link 
            href="/admin/sermons/series" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Manage Series
          </Link>
          <button 
            onClick={handleCreateSermon}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Add New Sermon
          </button>
        </div>
      </div>

      {/* The AdminSermonList component handles its own loading state,
          sermon fetching, and pagination internally */}
      <AdminSermonList />
    </div>
  );
}
