import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Ticket, Trash2, Calendar, ShieldAlert } from 'lucide-react';

const ManageBookings = () => {
  const { addToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/admin/bookings');
      setBookings(data);
    } catch (err) {
      addToast('Failed to load platform bookings list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel and refund this booking? This action is final.')) {
      return;
    }

    setActionLoading(true);
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      addToast('Booking successfully cancelled & refunded', 'success');
      fetchBookings();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to cancel booking', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Manage Bookings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Review all user ticket reservations and process refunds</p>
      </div>

      {loading ? (
        <div className="animate-pulse bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 h-64 rounded-3xl"></div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-3xl p-8">
          <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-bold text-gray-750 dark:text-gray-350">No bookings yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Platform ticket orders will show up here.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-3xl p-6 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400 font-semibold">
                  <th className="pb-3 pl-2">Attendee</th>
                  <th className="pb-3">Event Details</th>
                  <th className="pb-3 text-center">Tickets</th>
                  <th className="pb-3">Paid Total</th>
                  <th className="pb-3">Gate Checkin</th>
                  <th className="pb-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 font-medium text-gray-700 dark:text-gray-300">
                {bookings.map((b) => {
                  const isRefunded = b.paymentStatus === 'refunded';
                  const isCheckedIn = b.checkedIn;
                  const canCancel = !isRefunded && new Date(b.event?.date) > new Date();

                  return (
                    <tr key={b._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="py-4.5 pl-2">
                        <p className="font-bold text-gray-850 dark:text-gray-200">{b.user?.name || 'Deleted User'}</p>
                        <p className="text-xs text-gray-450">{b.user?.email}</p>
                      </td>
                      <td className="py-4.5">
                        <p className="font-semibold line-clamp-1 max-w-[200px]">{b.event?.title || 'Deleted Event'}</p>
                        <p className="text-xs text-gray-400">
                          {b.event?.date ? new Date(b.event.date).toLocaleDateString() : ''}
                        </p>
                      </td>
                      <td className="py-4.5 text-center font-bold text-gray-800 dark:text-gray-250">{b.ticketsBooked}</td>
                      <td className="py-4.5 font-bold">${b.totalAmount}</td>
                      <td className="py-4.5">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isCheckedIn
                            ? 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-500'
                        }`}>
                          {isCheckedIn ? 'Checked In' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-4.5 text-right pr-4">
                        {canCancel ? (
                          <button
                            onClick={() => handleCancelBooking(b._id)}
                            disabled={actionLoading}
                            className="p-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Cancel</span>
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 font-semibold italic">
                            {isRefunded ? 'Refunded' : 'Locked'}
                          </span>
                        )}
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

export default ManageBookings;
