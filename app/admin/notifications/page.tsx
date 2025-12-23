'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
  user: User | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const NOTIFICATION_TYPES = [
  { value: 'system', label: 'System Announcement' },
  { value: 'info', label: 'Information' },
  { value: 'warning', label: 'Warning' },
  { value: 'success', label: 'Success' },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isBroadcast, setIsBroadcast] = useState(true);
  const [formData, setFormData] = useState({
    type: 'system',
    title: '',
    message: '',
    link: '',
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/notifications?page=${page}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setUsers([]);
      return;
    }

    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(query)}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.message) return;

    setSending(true);
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: isBroadcast ? null : selectedUser?.id,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setFormData({ type: 'system', title: '', message: '', link: '' });
        setSelectedUser(null);
        setIsBroadcast(true);
        fetchNotifications();
        alert('Notification created successfully');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create notification');
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      alert('Failed to create notification');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;

    try {
      const res = await fetch(`/api/admin/notifications?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setNotifications(notifications.filter(n => n.id !== id));
      } else {
        alert('Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      system: 'bg-blue-100 text-blue-800',
      info: 'bg-gray-100 text-gray-800',
      warning: 'bg-yellow-100 text-yellow-800',
      success: 'bg-green-100 text-green-800',
    };
    return styles[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
        >
          + Create Notification
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Loading...
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          No notifications created yet.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTypeBadge(notification.type)}`}>
                      {notification.type}
                    </span>
                    {notification.user ? (
                      <span className="text-sm text-gray-500">
                        To: {notification.user.name || notification.user.email}
                      </span>
                    ) : (
                      <span className="text-sm text-purple-600 font-medium">
                        Broadcast
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <h3 className="font-medium text-gray-900">{notification.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                {notification.link && (
                  <a
                    href={notification.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {notification.link}
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => fetchNotifications(page)}
                  className={`px-3 py-1 rounded ${
                    pagination.page === page
                      ? 'bg-purple-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create Notification
            </h3>

            <div className="space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {NOTIFICATION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Broadcast or Specific User */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipients
                </label>
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={isBroadcast}
                      onChange={() => {
                        setIsBroadcast(true);
                        setSelectedUser(null);
                      }}
                      className="text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-sm">All Users (Broadcast)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!isBroadcast}
                      onChange={() => setIsBroadcast(false)}
                      className="text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-sm">Specific User</span>
                  </label>
                </div>

                {!isBroadcast && (
                  <>
                    {selectedUser ? (
                      <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg">
                        <span>{selectedUser.name || selectedUser.email}</span>
                        <button
                          onClick={() => {
                            setSelectedUser(null);
                            setUserSearch('');
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="text"
                          value={userSearch}
                          onChange={(e) => {
                            setUserSearch(e.target.value);
                            searchUsers(e.target.value);
                          }}
                          placeholder="Search for a user..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        {users.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {users.map((user) => (
                              <button
                                key={user.id}
                                onClick={() => {
                                  setSelectedUser(user);
                                  setUsers([]);
                                  setUserSearch('');
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                              >
                                <span className="font-medium">{user.name || 'No name'}</span>
                                <span className="text-gray-500 ml-2">{user.email}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Notification title"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Notification message..."
                />
              </div>

              {/* Link (optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link (optional)
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({ type: 'system', title: '', message: '', link: '' });
                  setSelectedUser(null);
                  setIsBroadcast(true);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={sending || !formData.title || !formData.message || (!isBroadcast && !selectedUser)}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50"
              >
                {sending ? 'Creating...' : 'Create Notification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
