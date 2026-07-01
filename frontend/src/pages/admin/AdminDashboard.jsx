import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  CalendarDays,
  Ticket,
  DollarSign,
  TrendingUp,
  MapPin,
  CheckCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#6366f1', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'];

const AdminDashboard = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await api.get('/admin/analytics');
        setData(data);
      } catch (err) {
        addToast('Failed to load admin analytics telemetry', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white dark:bg-gray-800 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-white dark:bg-gray-800 rounded-2xl lg:col-span-2"></div>
          <div className="h-80 bg-white dark:bg-gray-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const { stats, recentBookings, monthlyData, categoryData } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Admin Overview</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Platform analytics and operational metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Users</p>
            <p className="text-2xl font-extrabold text-gray-850 dark:text-gray-250 mt-1">{stats.totalUsers}</p>
          </div>
        </div>

        {/* Total Events */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-pink-50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Events</p>
            <p className="text-2xl font-extrabold text-gray-850 dark:text-gray-250 mt-1">{stats.totalEvents}</p>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Ticket Sales</p>
            <p className="text-2xl font-extrabold text-gray-850 dark:text-gray-250 mt-1">{stats.totalBookings}</p>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Revenue</p>
            <p className="text-2xl font-extrabold text-gray-850 dark:text-gray-250 mt-1">${stats.totalRevenue}</p>
          </div>
        </div>
      </div>

      {/* Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Graph */}
        <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-3xl p-6 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 dark:text-gray-250 text-base m-0 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <span>Revenue Overview (Last 6 Months)</span>
            </h3>
          </div>
          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    color: '#334155',
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <h3 className="font-bold text-gray-800 dark:text-gray-250 text-base mb-4 m-0">Tickets by Category</h3>
          <div className="h-56 w-full flex items-center justify-center">
            {categoryData.length === 0 ? (
              <p className="text-sm text-gray-400">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Custom Legends list */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center pt-4 border-t border-gray-100 dark:border-gray-700/50 mt-4 text-xs font-semibold text-gray-500">
            {categoryData.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span>{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-3xl p-6 shadow-sm overflow-hidden">
        <h3 className="font-bold text-gray-800 dark:text-gray-250 text-base mb-6 m-0">Recent Platform Bookings</h3>
        
        {recentBookings.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-6">No bookings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400 font-semibold">
                  <th className="pb-3 pl-2">User</th>
                  <th className="pb-3">Event</th>
                  <th className="pb-3 text-center">Qty</th>
                  <th className="pb-3">Total Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 font-medium text-gray-700 dark:text-gray-300">
                {recentBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                    <td className="py-4.5 pl-2">
                      <p className="font-bold text-gray-850 dark:text-gray-200">{b.user?.name || 'Deleted User'}</p>
                      <p className="text-xs text-gray-400 font-medium">{b.user?.email}</p>
                    </td>
                    <td className="py-4.5">
                      <p className="font-semibold line-clamp-1 max-w-[200px]">{b.event?.title || 'Deleted Event'}</p>
                      <p className="text-xs text-gray-400">${b.event?.price || 0} per ticket</p>
                    </td>
                    <td className="py-4.5 text-center font-bold text-gray-800 dark:text-gray-250">{b.ticketsBooked}</td>
                    <td className="py-4.5 font-bold">${b.totalAmount}</td>
                    <td className="py-4.5">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                        b.paymentStatus === 'paid'
                          ? 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400'
                          : b.paymentStatus === 'refunded'
                          ? 'bg-slate-100 dark:bg-slate-900 text-slate-500'
                          : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400'
                      }`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4.5 text-xs text-gray-400">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
