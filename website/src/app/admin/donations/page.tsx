{/* src/app/admin/donations/page.tsx */}
import { Metadata } from 'next';
import AdminDonationList from '@/components/admin/donations/AdminDonationList';

export const metadata: Metadata = {
  title: 'Manage Donations | Admin | Rehoboth Church',
  description: 'Manage and review donation records for Rehoboth Church.',
};

export default function AdminDonationsPage() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Donations</h1>
      </div>
      
      <AdminDonationList />
    </div>
  );
}
