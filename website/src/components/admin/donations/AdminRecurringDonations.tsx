// src/components/admin/donations/AdminRecurringDonations.tsx
'use client';

import { useState, useEffect } from 'react';
import { RecurringDonation, DONATION_FREQUENCIES, DONATION_STATUSES } from '@/types/donations';
import { FiChevronLeft, FiChevronRight, FiDownload, FiPause, FiPlay, FiX } from 'react-icons/fi';
import Link from 'next/link';

interface PaginationInfo {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export default function AdminRecurringDonations() {
  const [subscriptions, setSubscriptions] = useState<RecurringDonation[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    totalItems: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    donorEmail: '',
    status: '',
    fundDesignation: '',
    frequency: ''
  });

  // Fetch recurring donations
  useEffect(() => {
    async function fetchRecurringDonations() {
      setLoading(true);
      
      try {
        // Build URL with query parameters
        const queryParams = new URLSearchParams();
        queryParams.append('page', pagination.page.toString());
        queryParams.append('limit', pagination.limit.toString());
        
        // Add filters if they have values
        if (filters.donorEmail) queryParams.append('donorEmail', filters.donorEmail);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.fundDesignation) queryParams.append('fundDesignation', filters.fundDesignation);
        if (filters.frequency) queryParams.append('frequency', filters.frequency);
        
        const response = await fetch(`/api/admin/donations/recurring?${queryParams.toString()}`);
        
        if (response.ok) {
          const data = await response.json();
          setSubscriptions(data.recurringDonations);
          setPagination(data.pagination);
        } else {
          console.error('Failed to fetch recurring donations:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching recurring donations:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRecurringDonations();
  }, [pagination.page, pagination.limit, filters]);

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
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
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle subscription status change
  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to ${newStatus === DONATION_STATUSES.ACTIVE ? 'activate' : 'pause'} this recurring donation?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/donations/recurring/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        // Update the local state
        setSubscriptions(subscriptions.map(sub => 
          sub.id === id ? { ...sub, status: newStatus } : sub
        ));
      } else {
        console.error('Failed to update subscription status:', await response.text());
        alert('Failed to update the subscription status.');
      }
    } catch (error) {
      console.error('Error updating subscription status:', error);
      alert('An error occurred while updating the subscription status.');
    }
  };

  // Handle subscription cancellation
  const handleCancelSubscription = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this recurring donation? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/donations/recurring/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove from the local state or update status to cancelled
        setSubscriptions(subscriptions.map(sub => 
          sub.id === id ? { ...sub, status: DONATION_STATUSES.CANCELED } : sub
        ));
      } else {
        console.error('Failed to cancel subscription:', await response.text());
        alert('Failed to cancel the subscription.');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('An error occurred while cancelling the subscription.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Recurring Donations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label htmlFor="donorEmail" className="text-sm font-medium text-gray-700">Donor Email</label>
            <input
              type="email"
              id="donorEmail"
              name="donorEmail"
              placeholder="donor@example.com"
              value={filters.donorEmail}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="space-y-1">
            <label htmlFor="status" className="text-sm font-medium text-gray-700">Status</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Statuses</option>
              <option value={DONATION_STATUSES.ACTIVE}>Active</option>
              <option value={DONATION_STATUSES.PAUSED}>Paused</option>
              <option value={DONATION_STATUSES.CANCELED}>Canceled</option>
              <option value={DONATION_STATUSES.PAYMENT_FAILED}>Payment Failed</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label htmlFor="fundDesignation" className="text-sm font-medium text-gray-700">Designation</label>
            <select
              id="fundDesignation"
              name="fundDesignation"
              value={filters.fundDesignation}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Designations</option>
              <option value="General">General Fund</option>
              <option value="Building">Building Fund</option>
              <option value="Missions">Missions Fund</option>
              <option value="Youth">Youth Ministry</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label htmlFor="frequency" className="text-sm font-medium text-gray-700">Frequency</label>
            <select
              id="frequency"
              name="frequency"
              value={filters.frequency}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Frequencies</option>
              {Object.entries(DONATION_FREQUENCIES).map(([key, value]) => (
                <option key={value} value={value}>
                  {key.charAt(0) + key.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Statistics and Actions */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-gray-600">
            {pagination.totalItems} recurring donation{pagination.totalItems !== 1 ? 's' : ''} found
          </span>
        </div>
        <div className="flex gap-2">
          <Link 
            href="/admin/donations"
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            All Donations
          </Link>
          <Link 
            href="/admin/donations/stats"
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Statistics
          </Link>
          <button 
            className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center gap-1"
            onClick={() => {
              // Generate CSV from subscriptions data
              const headers = ['ID', 'Created', 'Donor', 'Email', 'Amount', 'Frequency', 'Next Payment', 'Status'];
              const rows = subscriptions.map(s => [
                s.id,
                formatDate(s.created_at),
                s.donor_name || '',
                s.donor_email || '',
                formatCurrency(s.amount, s.currency),
                s.frequency,
                formatDate(s.next_payment_date),
                s.status
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
              a.download = `recurring-donations-${new Date().toISOString().split('T')[0]}.csv`;
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
      
      {/* Subscriptions Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
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
                Frequency
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Next Payment
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : subscriptions.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                  No recurring donations found
                </td>
              </tr>
            ) : (
              subscriptions.map((subscription) => (
                <tr key={subscription.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(subscription.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {subscription.donor_name || 'Anonymous'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subscription.donor_email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {formatCurrency(subscription.amount, subscription.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subscription.frequency.charAt(0).toUpperCase() + subscription.frequency.slice(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(subscription.next_payment_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      subscription.status === DONATION_STATUSES.ACTIVE
                        ? 'bg-green-100 text-green-800'
                        : subscription.status === DONATION_STATUSES.PAUSED
                        ? 'bg-yellow-100 text-yellow-800'
                        : subscription.status === DONATION_STATUSES.CANCELED
                        ? 'bg-red-100 text-red-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1).replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      {subscription.status !== DONATION_STATUSES.CANCELED && (
                        <>
                          {subscription.status === DONATION_STATUSES.ACTIVE ? (
                            <button
                              onClick={() => handleStatusChange(subscription.id, DONATION_STATUSES.PAUSED)}
                              className="text-yellow-600 hover:text-yellow-900 flex items-center"
                              title="Pause subscription"
                            >
                              <FiPause className="mr-1" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(subscription.id, DONATION_STATUSES.ACTIVE)}
                              className="text-green-600 hover:text-green-900 flex items-center"
                              title="Activate subscription"
                            >
                              <FiPlay className="mr-1" />
                            </button>
                          )}
                          <button
                            onClick={() => handleCancelSubscription(subscription.id)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                            title="Cancel subscription"
                          >
                            <FiX className="mr-1" />
                          </button>
                        </>
                      )}
                      <Link 
                        href={`/admin/donations/recurring/${subscription.id}`} 
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Details
                      </Link>
                    </div>
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
