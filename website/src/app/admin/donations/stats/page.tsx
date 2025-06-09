// src/app/admin/donations/stats/page.tsx
import { Metadata } from 'next';
import AdminDonationStats from '@/components/admin/donations/AdminDonationStats';

export const metadata: Metadata = {
  title: 'Donation Statistics | Admin | Rehoboth Church',
  description: 'View statistics and analytics for donations at Rehoboth Church.',
};

export default function AdminDonationStatsPage() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Donation Statistics</h1>
      </div>
      
      <AdminDonationStats />
    </div>
  );
}
