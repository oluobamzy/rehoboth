// src/app/admin/donations/designations/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Metadata } from 'next';
import AdminDesignationForm from '@/components/admin/donations/AdminDesignationForm';
import { DonationDesignation } from '@/types/donations';
import { FiEdit2, FiChevronLeft, FiPlus } from 'react-icons/fi';
import Link from 'next/link';

export default function AdminDonationDesignationsPage() {
  const [designations, setDesignations] = useState<DonationDesignation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDesignation, setSelectedDesignation] = useState<DonationDesignation | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Load designations
  useEffect(() => {
    async function fetchDesignations() {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/donations/designations');
        if (response.ok) {
          const data = await response.json();
          setDesignations(data);
        } else {
          console.error('Failed to fetch designations:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching designations:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDesignations();
  }, []);

  const handleOpenForm = (designation: DonationDesignation | null = null) => {
    setSelectedDesignation(designation);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedDesignation(null);
    setIsFormOpen(false);
  };

  const handleSave = async () => {
    // Reload the designations
    try {
      const response = await fetch('/api/admin/donations/designations');
      if (response.ok) {
        const data = await response.json();
        setDesignations(data);
      }
    } catch (error) {
      console.error('Error refreshing designations:', error);
    } finally {
      handleCloseForm();
    }
  };

  // Format currency
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <Link 
            href="/admin/donations" 
            className="flex items-center text-blue-600 hover:text-blue-800 mb-2"
          >
            <FiChevronLeft className="mr-1" /> Back to donations
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Donation Designations</h1>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => handleOpenForm()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <FiPlus className="mr-1" /> Add Designation
          </button>
        </div>
      </div>
      
      {isFormOpen ? (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {selectedDesignation ? 'Edit' : 'Add'} Designation
          </h2>
          <AdminDesignationForm
            designation={selectedDesignation || undefined}
            onSave={handleSave}
            onCancel={handleCloseForm}
          />
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {loading ? (
            <div className="px-4 py-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : designations.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-gray-500">No designations found. Add your first one!</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Display Order
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {designations.map((designation) => (
                  <tr key={designation.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {designation.name}
                      {designation.description && (
                        <p className="text-xs text-gray-500 mt-1 whitespace-normal">
                          {designation.description.length > 50 
                            ? `${designation.description.substring(0, 47)}...` 
                            : designation.description
                          }
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(designation.current_amount_cents)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {designation.target_amount_cents ? formatCurrency(designation.target_amount_cents) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        designation.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {designation.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {designation.display_order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        onClick={() => handleOpenForm(designation)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiEdit2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
