// src/app/admin/volunteers/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/services/auth';
import { VolunteerService, type VolunteerApplication, type VolunteerApplicationStats } from '@/services/volunteerService';
import Link from 'next/link';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  contacted: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800'
};

const STATUS_LABELS = {
  pending: 'Pending Review',
  contacted: 'Contacted',
  accepted: 'Accepted',
  declined: 'Declined'
};

export default function AdminVolunteersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [stats, setStats] = useState<VolunteerApplicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | VolunteerApplication['status']>('all');
  const [selectedApp, setSelectedApp] = useState<VolunteerApplication | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      loadApplications();
      loadStats();
    }
  }, [user, filterStatus]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      let data;
      
      if (filterStatus === 'all') {
        data = await VolunteerService.getAllApplications();
      } else {
        data = await VolunteerService.getApplicationsByStatus(filterStatus);
      }
      
      setApplications(data);
    } catch (error) {
      setError('Failed to load volunteer applications');
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await VolunteerService.getApplicationStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const updateApplicationStatus = async (id: string, status: VolunteerApplication['status'], adminNotes?: string) => {
    try {
      setUpdating(true);
      await VolunteerService.updateApplication(id, { status, admin_notes: adminNotes });
      
      // Refresh applications and stats
      await loadApplications();
      await loadStats();
      
      setShowModal(false);
      setSelectedApp(null);
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Failed to update application');
    } finally {
      setUpdating(false);
    }
  };

  const deleteApplication = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }

    try {
      await VolunteerService.deleteApplication(id);
      await loadApplications();
      await loadStats();
      setShowModal(false);
      setSelectedApp(null);
    } catch (error) {
      console.error('Error deleting application:', error);
      alert('Failed to delete application');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Please sign in to access volunteer management.</p>
          <Link 
            href="/auth/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Volunteer Applications</h1>
        <p className="text-gray-600">Manage and review volunteer applications</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Applications</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{stats.contacted}</div>
            <div className="text-sm text-gray-600">Contacted</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            <div className="text-sm text-gray-600">Accepted</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-red-600">{stats.declined}</div>
            <div className="text-sm text-gray-600">Declined</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">{stats.thisMonth}</div>
            <div className="text-sm text-gray-600">This Month</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filterStatus === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Applications
          </button>
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as VolunteerApplication['status'])}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === status 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {applications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No volunteer applications found.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {applications.map((app) => (
              <li key={app.id}>
                <div 
                  className="px-4 py-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedApp(app);
                    setShowModal(true);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {app.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{app.email}</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{app.ministry}</p>
                          <p className="text-sm text-gray-500">{formatDate(app.submitted_at)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[app.status]}`}>
                        {STATUS_LABELS[app.status]}
                      </span>
                      <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Application Detail Modal */}
      {showModal && selectedApp && (
        <ApplicationModal
          application={selectedApp}
          onClose={() => {
            setShowModal(false);
            setSelectedApp(null);
          }}
          onUpdateStatus={updateApplicationStatus}
          onDelete={deleteApplication}
          isUpdating={updating}
        />
      )}
    </div>
  );
}

// Application Detail Modal Component
interface ApplicationModalProps {
  application: VolunteerApplication;
  onClose: () => void;
  onUpdateStatus: (id: string, status: VolunteerApplication['status'], adminNotes?: string) => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
}

function ApplicationModal({ application, onClose, onUpdateStatus, onDelete, isUpdating }: ApplicationModalProps) {
  const [adminNotes, setAdminNotes] = useState(application.admin_notes || '');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Volunteer Application Details
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="mt-1 text-sm text-gray-900">{application.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{application.email}</p>
                    </div>
                  </div>

                  {application.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="mt-1 text-sm text-gray-900">{application.phone}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ministry</label>
                    <p className="mt-1 text-sm text-gray-900">{application.ministry}</p>
                  </div>

                  {application.experience && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Experience</label>
                      <p className="mt-1 text-sm text-gray-900">{application.experience}</p>
                    </div>
                  )}

                  {application.availability && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Availability</label>
                      <p className="mt-1 text-sm text-gray-900">{application.availability}</p>
                    </div>
                  )}

                  {application.message && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Message</label>
                      <p className="mt-1 text-sm text-gray-900">{application.message}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[application.status]}`}>
                        {STATUS_LABELS[application.status]}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Submitted</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(application.submitted_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Add notes about this application..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(STATUS_LABELS).map(([status, label]) => (
                        <button
                          key={status}
                          onClick={() => onUpdateStatus(application.id, status as VolunteerApplication['status'], adminNotes)}
                          disabled={isUpdating || application.status === status}
                          className={`px-3 py-2 rounded-md text-sm font-medium ${
                            application.status === status
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : isUpdating
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
            <button
              onClick={() => onDelete(application.id)}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-red-300 shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}