// src/components/admin/donations/AdminDonationList.tsx
'use client';

import { useState, useEffect } from 'react';
import { Donation, DONATION_FREQUENCIES, DonationDesignation } from '@/types/donations';
import AdminDonationFilters from './AdminDonationFilters';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight, FiDownload, FiEye } from 'react-icons/fi';

interface PaginationInfo {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export default function AdminDonationList() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    totalItems: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    donorEmail: '',
    fundDesignation: ''
  });
  const [designations, setDesignations] = useState<DonationDesignation[]>([]);

  // Fetch donation designations for filter options
  useEffect(() => {
    async function fetchDesignations() {
      try {
        const response = await fetch('/api/admin/donations/designations');
        if (response.ok) {
          const data = await response.json();
          setDesignations(data);
        }
      } catch (error) {
        console.error('Failed to fetch designations:', error);
      }
    }
    
    fetchDesignations();
  }, []);

  // Fetch donations based on current filters and pagination
  useEffect(() => {
    async function fetchDonations() {
      setLoading(true);
      
      try {
        // Build URL with query parameters
        const queryParams = new URLSearchParams();
        queryParams.append('page', pagination.page.toString());
        queryParams.append('limit', pagination.limit.toString());
        
        // Add filters if they have values
        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);
        if (filters.minAmount) queryParams.append('minAmount', filters.minAmount);
        if (filters.maxAmount) queryParams.append('maxAmount', filters.maxAmount);
        if (filters.donorEmail) queryParams.append('donorEmail', filters.donorEmail);
        if (filters.fundDesignation) queryParams.append('fundDesignation', filters.fundDesignation);
        
        const response = await fetch(`/api/admin/donations?${queryParams.toString()}`);
        
        if (response.ok) {
          const data = await response.json();
          setDonations(data.donations);
          setPagination(data.pagination);
        } else {
          console.error('Failed to fetch donations:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching donations:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDonations();
  }, [pagination.page, pagination.limit, filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    // Reset pagination when filters change
    setPagination({ ...pagination, page: 1 });
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
  };

  // Format currency
  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount / 100);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <AdminDonationFilters 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          designations={designations} 
        />
      </div>
      
      {/* Statistics and Actions */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-gray-600">
            {pagination.totalItems} donation{pagination.totalItems !== 1 ? 's' : ''} found
          </span>
        </div>
        <div className="flex gap-2">
          <Link 
            href="/admin/donations/recurring"
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Recurring Donations
          </Link>
          <Link 
            href="/admin/donations/stats"
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Statistics
          </Link>
          <Link 
            href="/admin/donations/designations"
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Manage Designations
          </Link>
          <button 
            className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center gap-1"
            onClick={() => {
              // Generate CSV from donations data
              const headers = ['ID', 'Date', 'Donor', 'Email', 'Amount', 'Designation', 'Type'];
              const rows = donations.map(d => [
                d.id,
                formatDate(d.created_at),
                d.donor_name || '',
                d.donor_email || '',
                formatCurrency(d.amount, d.currency),
                d.fund_designation || 'General',
                d.is_recurring ? `Recurring (${d.frequency})` : 'One-time'
              ]);
              
              const csvContent = [
                headers.join(','),
                ...rows.map(r => r.join(','))
              ].join('\n');
              
              // Create download link
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `donations-export-${new Date().toISOString().split('T')[0]}.csv`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
            }}
          >
            <FiDownload /> Export
          </button>
        </div>
      </div>
      
      {/* Donations Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Donor
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Designation
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : donations.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  No donations found
                </td>
              </tr>
            ) : (
              donations.map((donation) => (
                <tr key={donation.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(donation.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {donation.donor_name || 'Anonymous'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {donation.donor_email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {formatCurrency(donation.amount, donation.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {donation.fund_designation || 'General'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {donation.is_recurring ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Recurring ({donation.frequency})
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        One-time
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Link href={`/admin/donations/${donation.id}`} className="text-blue-600 hover:text-blue-900 inline-flex items-center">
                      <FiEye className="mr-1" /> View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-700">
            Showing page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
              className={`px-3 py-1 rounded ${
                pagination.page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              } flex items-center`}
            >
              <FiChevronLeft className="mr-1" /> Previous
            </button>
            <button
              onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
              disabled={pagination.page === pagination.totalPages}
              className={`px-3 py-1 rounded ${
                pagination.page === pagination.totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              } flex items-center`}
            >
              Next <FiChevronRight className="ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
