// src/app/admin/messages/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/services/auth';
import { ContactServiceClient, type ContactMessage, type ContactMessageStats } from '@/services/contactService.client';
import Link from 'next/link';

const STATUS_COLORS = {
  unread: 'bg-red-100 text-red-800',
  read: 'bg-blue-100 text-blue-800',
  replied: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-800'
};

const STATUS_LABELS = {
  unread: 'Unread',
  read: 'Read',
  replied: 'Replied',
  archived: 'Archived'
};

const SUBJECT_ICONS = {
  'General Inquiry': '💬',
  'Prayer Request': '🙏',
  'Volunteer Information': '🤝',
  'Church Events': '📅',
  'Other': '📝'
};

export default function AdminMessagesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<ContactMessageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | ContactMessage['status']>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      loadMessages();
      loadStats();
    }
  }, [user, filterStatus]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      let data;
      
      if (filterStatus === 'all') {
        data = await ContactServiceClient.getAllMessages();
      } else {
        data = await ContactServiceClient.getMessagesByStatus(filterStatus);
      }
      
      setMessages(data);
    } catch (error) {
      setError('Failed to load contact messages');
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await ContactServiceClient.getMessageStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const updateMessageStatus = async (id: string, status: ContactMessage['status'], adminNotes?: string) => {
    try {
      setUpdating(true);
      await ContactServiceClient.updateMessage(id, { status, admin_notes: adminNotes });
      
      // Refresh messages and stats
      await loadMessages();
      await loadStats();
      
      setShowModal(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error updating message:', error);
      alert('Failed to update message');
    } finally {
      setUpdating(false);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return;
    }

    try {
      await ContactServiceClient.deleteMessage(id);
      await loadMessages();
      await loadStats();
      setShowModal(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  const openMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    setShowModal(true);
    
    // Mark as read if unread
    if (message.status === 'unread') {
      try {
        await ContactServiceClient.markAsRead(message.id);
        await loadMessages();
        await loadStats();
      } catch (error) {
        console.error('Error marking as read:', error);
      }
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

  const getSubjectIcon = (subject: string) => {
    return SUBJECT_ICONS[subject as keyof typeof SUBJECT_ICONS] || SUBJECT_ICONS['Other'];
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
          <p className="text-lg text-gray-600 mb-4">Please sign in to access message management.</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Messages</h1>
        <p className="text-gray-600">Manage and respond to website contact form submissions</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Messages</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-red-600">{stats.unread}</div>
            <div className="text-sm text-gray-600">Unread</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{stats.read}</div>
            <div className="text-sm text-gray-600">Read</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{stats.replied}</div>
            <div className="text-sm text-gray-600">Replied</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-600">{stats.archived}</div>
            <div className="text-sm text-gray-600">Archived</div>
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
            All Messages ({stats?.total || 0})
          </button>
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as ContactMessage['status'])}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterStatus === status 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {label} ({stats?.[status as keyof ContactMessageStats] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No contact messages found.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {messages.map((message) => (
              <li key={message.id}>
                <div 
                  className={`px-4 py-4 hover:bg-gray-50 cursor-pointer ${
                    message.status === 'unread' ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => openMessage(message)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{getSubjectIcon(message.subject)}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className={`text-sm font-medium ${
                              message.status === 'unread' ? 'text-gray-900 font-bold' : 'text-gray-900'
                            } truncate`}>
                              {message.name}
                            </p>
                            {message.status === 'unread' && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{message.email}</p>
                          <p className="text-sm font-medium text-gray-700 truncate">{message.subject}</p>
                          <p className="text-sm text-gray-500 truncate">{message.message.substring(0, 100)}...</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{formatDate(message.submitted_at)}</p>
                          <div className="mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[message.status]}`}>
                              {STATUS_LABELS[message.status]}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
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

      {/* Message Detail Modal */}
      {showModal && selectedMessage && (
        <MessageModal
          message={selectedMessage}
          onClose={() => {
            setShowModal(false);
            setSelectedMessage(null);
          }}
          onUpdateStatus={updateMessageStatus}
          onDelete={deleteMessage}
          isUpdating={updating}
        />
      )}
    </div>
  );
}

// Message Detail Modal Component
interface MessageModalProps {
  message: ContactMessage;
  onClose: () => void;
  onUpdateStatus: (id: string, status: ContactMessage['status'], adminNotes?: string) => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
}

function MessageModal({ message, onClose, onUpdateStatus, onDelete, isUpdating }: MessageModalProps) {
  const [adminNotes, setAdminNotes] = useState(message.admin_notes || '');

  const getSubjectIcon = (subject: string) => {
    return SUBJECT_ICONS[subject as keyof typeof SUBJECT_ICONS] || SUBJECT_ICONS['Other'];
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="w-full">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-3">{getSubjectIcon(message.subject)}</div>
                  <h3 className="text-xl leading-6 font-medium text-gray-900">
                    Contact Message Details
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">From</label>
                      <p className="mt-1 text-sm text-gray-900">{message.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <a href={`mailto:${message.email}`} className="mt-1 text-sm text-blue-600 hover:text-blue-800">
                        {message.email}
                      </a>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <p className="mt-1 text-sm text-gray-900 font-medium">{message.subject}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{message.message}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[message.status]}`}>
                        {STATUS_LABELS[message.status]}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Submitted</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(message.submitted_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {message.replied_at && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Replied</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(message.replied_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Add notes about this message..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(STATUS_LABELS).map(([status, label]) => (
                        <button
                          key={status}
                          onClick={() => onUpdateStatus(message.id, status as ContactMessage['status'], adminNotes)}
                          disabled={isUpdating || message.status === status}
                          className={`px-3 py-2 rounded-md text-sm font-medium ${
                            message.status === status
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

                  <div className="bg-yellow-50 p-4 rounded-md">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">Quick Actions</h4>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`mailto:${message.email}?subject=Re: ${message.subject}&body=Dear ${message.name},%0A%0AThank you for contacting Rehoboth Christian Church.%0A%0A`}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                      >
                        📧 Reply via Email
                      </a>
                      <button
                        onClick={() => onUpdateStatus(message.id, 'replied', adminNotes)}
                        disabled={isUpdating}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 disabled:opacity-50"
                      >
                        ✅ Mark as Replied
                      </button>
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
              onClick={() => onDelete(message.id)}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-red-300 shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Delete Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}