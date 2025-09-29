'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/services/auth';
import { AdminGuard } from '@/components/auth/RoleGuard';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  role?: 'admin' | 'moderator' | 'user';
  status?: 'active' | 'invited' | 'suspended';
  profile?: {
    full_name?: string;
    phone?: string;
  };
}

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  invited_by: string;
  created_at: string;
  expires_at: string;
  status: 'pending' | 'accepted' | 'expired';
}

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'moderator'>('moderator');

  // Fetch users and pending invites
  useEffect(() => {
    fetchUsers();
    fetchPendingInvites();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingInvites = async () => {
    try {
      const response = await fetch('/api/admin/users/invites');
      if (response.ok) {
        const data = await response.json();
        setPendingInvites(data.invites || []);
      }
    } catch (error) {
      console.error('Failed to fetch pending invites:', error);
    }
  };

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);

    try {
      const response = await fetch('/api/admin/users/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newUserEmail,
          role: newUserRole,
        }),
      });

      if (response.ok) {
        alert('Invitation sent successfully!');
        setNewUserEmail('');
        setShowInviteForm(false);
        fetchPendingInvites();
      } else {
        const errorData = await response.json();
        alert(`Failed to send invitation: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Failed to send invite:', error);
      alert('Failed to send invitation. Please try again.');
    } finally {
      setInviteLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        fetchUsers();
        alert('User role updated successfully!');
      } else {
        alert('Failed to update user role');
      }
    } catch (error) {
      console.error('Failed to update user role:', error);
      alert('Failed to update user role');
    }
  };

  const resendInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/admin/users/invites/${inviteId}/resend`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Invitation resent successfully!');
        fetchPendingInvites();
      } else {
        alert('Failed to resend invitation');
      }
    } catch (error) {
      console.error('Failed to resend invite:', error);
      alert('Failed to resend invitation');
    }
  };

  const cancelInvite = async (inviteId: string) => {
    if (!confirm('Are you sure you want to cancel this invitation?')) return;

    try {
      const response = await fetch(`/api/admin/users/invites/${inviteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPendingInvites();
        alert('Invitation cancelled successfully!');
      } else {
        alert('Failed to cancel invitation');
      }
    } catch (error) {
      console.error('Failed to cancel invite:', error);
      alert('Failed to cancel invitation');
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Please sign in to access the user management.</p>
        </div>
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">
              Manage admin users and send invitations.
            </p>
          </div>
          <button
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Invite New Admin
          </button>
        </div>

        {/* Invite Form */}
        {showInviteForm && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold mb-4">Invite New Admin</h3>
            <form onSubmit={sendInvite} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as 'admin' | 'moderator')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {inviteLoading ? 'Sending...' : 'Send Invitation'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Pending Invitations */}
        {pendingInvites.length > 0 && (
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-yellow-800">Pending Invitations</h3>
            <div className="space-y-3">
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between bg-white p-3 rounded border">
                  <div>
                    <p className="font-medium">{invite.email}</p>
                    <p className="text-sm text-gray-600">
                      Role: {invite.role} • Sent: {new Date(invite.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => resendInvite(invite.id)}
                      className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Resend
                    </button>
                    <button
                      onClick={() => cancelInvite(invite.id)}
                      className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Users */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Current Users</h3>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((currentUser) => (
                    <tr key={currentUser.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {currentUser.profile?.full_name || 'No name'}
                          </div>
                          <div className="text-sm text-gray-500">{currentUser.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={currentUser.role || 'user'}
                          onChange={(e) => updateUserRole(currentUser.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                          disabled={currentUser.id === user.id}
                        >
                          <option value="user">User</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          currentUser.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {currentUser.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {currentUser.last_sign_in_at 
                          ? new Date(currentUser.last_sign_in_at).toLocaleDateString()
                          : 'Never'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {currentUser.id === user.id ? (
                          <span className="text-gray-400">You</span>
                        ) : (
                          <button className="text-blue-600 hover:text-blue-800">
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
    </AdminGuard>
  );
}