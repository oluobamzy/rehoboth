// src/app/admin/donations/[id]/page.tsx
import { Metadata } from 'next';
import AdminDonationDetail from '@/components/admin/donations/AdminDonationDetail';

export const metadata: Metadata = {
  title: 'Donation Details | Admin | Rehoboth Church',
  description: 'Manage and review donation details for Rehoboth Church.',
};

interface AdminDonationDetailPageProps {
  params: { id: string };
}

export default function AdminDonationDetailPage({ params }: AdminDonationDetailPageProps) {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <AdminDonationDetail donationId={params.id} />
    </div>
  );
}
