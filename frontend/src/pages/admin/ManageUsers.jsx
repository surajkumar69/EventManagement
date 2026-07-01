import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Shield, Trash2, User, UserCheck } from 'lucide-react';

const ManageUsers = () => {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      addToast('Failed to retrieve platform users list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleToggle = async (userId, currentRole) => {
    if (userId === currentUser._id) {
      addToast('You cannot change your own admin role', 'warning');
      return;
    }

    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to change user role to ${nextRole}?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await api.put(`/admin/users/${userId}/role`, { role: nextRole });
      addToast('User role updated successfully', 'success');
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update user role', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser._id) {
      addToast('You cannot delete your own admin account', 'warning');
      return;
    }

    if (!window.confirm('WARNING: Deleting this user will delete all their bookings. Proceed?')) {
      return;
    }

    setActionLoading(true);
    try {
      await api.delete(`/admin/users/${userId}`);
      addToast('User and their bookings deleted successfully', 'success');
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete user', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Platform Users</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Configure and manage user accounts and security roles</p>
      </div>

      {loading ? (
        <div className="animate-pulse bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 h-64 rounded-3xl"></div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-3xl p-6 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400 font-semibold">
                  <th className="pb-3 pl-2">User Details</th>
                  <th className="pb-3">Security Role</th>
                  <th className="pb-3">Joined Date</th>
                  <th className="pb-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 font-medium text-gray-700 dark:text-gray-300">
                {users.map((u) => {
                  const isSelf = u._id === currentUser._id;
                  return (
                    <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="py-4.5 pl-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700/50 text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0 font-bold">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-850 dark:text-gray-200">
                              {u.name} {isSelf && <span className="text-xs text-indigo-500 font-normal">(You)</span>}
                            </p>
                            <p className="text-xs text-gray-400 font-medium">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4.5">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                          u.role === 'admin'
                            ? 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-500'
                        }`}>
                          <Shield className="w-3 h-3" />
                          <span>{u.role}</span>
                        </span>
                      </td>
                      <td className="py-4.5 text-xs text-gray-450 dark:text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4.5 text-right pr-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Change role */}
                          <button
                            onClick={() => handleRoleToggle(u._id, u.role)}
                            disabled={isSelf || actionLoading}
                            className={`p-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1 hover:bg-slate-55 dark:hover:bg-slate-750 cursor-pointer ${
                              isSelf ? 'opacity-30' : 'text-indigo-600 dark:text-indigo-400'
                            }`}
                            title="Toggle role (admin / user)"
                          >
                            <UserCheck className="w-4 h-4" />
                            <span className="hidden sm:inline">Role</span>
                          </button>

                          {/* Delete user */}
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            disabled={isSelf || actionLoading}
                            className={`p-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer ${
                              isSelf ? 'opacity-30' : 'text-red-500 dark:text-red-400'
                            }`}
                            title="Delete User account"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
