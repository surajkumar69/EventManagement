import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PlusCircle, Edit, Trash2, Calendar, MapPin, Tag } from 'lucide-react';

const ManageEvents = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/events?pageSize=100'); // Load all events for management list
      setEvents(data.events);
    } catch (err) {
      addToast('Failed to load events list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to permanently delete this event? This action is irreversible.')) {
      return;
    }

    setActionLoading(true);
    try {
      await api.delete(`/events/${eventId}`);
      addToast('Event deleted successfully', 'success');
      fetchEvents();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete event', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Platform Events</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Add, update, or cancel platform event details</p>
        </div>
        <Link
          to="/admin/events/new"
          className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm transition-colors text-sm shrink-0"
        >
          <PlusCircle className="w-4.5 h-4.5" />
          <span>Create Event</span>
        </Link>
      </div>

      {loading ? (
        <div className="animate-pulse bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 h-64 rounded-3xl"></div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-3xl p-8">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-bold text-gray-700 dark:text-gray-350">No events yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">Launch your first platform event right away.</p>
          <Link
            to="/admin/events/new"
            className="inline-flex items-center gap-1.5 py-2 px-4 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 rounded-xl"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Event</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-3xl p-6 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400 font-semibold">
                  <th className="pb-3 pl-2">Event Title</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Date & Time</th>
                  <th className="pb-3">Tickets Sold</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 font-medium text-gray-700 dark:text-gray-300">
                {events.map((e) => {
                  const isSoldOut = e.ticketsSold >= e.capacity;
                  const formattedDate = new Date(e.date).toLocaleDateString();

                  return (
                    <tr key={e._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="py-4.5 pl-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={e.bannerUrl}
                            alt={e.title}
                            className="w-10 h-10 object-cover rounded-lg bg-slate-100 shrink-0"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000&auto=format&fit=crop';
                            }}
                          />
                          <div>
                            <p className="font-bold text-gray-850 dark:text-gray-200 line-clamp-1 max-w-[180px]">
                              {e.title}
                            </p>
                            <p className="text-[11px] text-gray-400 font-medium truncate max-w-[180px]">
                              {e.locationType === 'online' ? 'Online' : e.location}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4.5">
                        <span className="text-xs px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-500">
                          {e.category}
                        </span>
                      </td>
                      <td className="py-4.5 text-xs text-gray-450 dark:text-gray-400">
                        <span>{formattedDate} • {e.time}</span>
                      </td>
                      <td className="py-4.5">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className={`font-bold ${isSoldOut ? 'text-red-500' : 'text-slate-700 dark:text-slate-350'}`}>
                            {e.ticketsSold} / {e.capacity}
                          </span>
                          {isSoldOut && <span className="text-[10px] bg-red-50 text-red-500 rounded px-1">Full</span>}
                        </div>
                      </td>
                      <td className="py-4.5 font-bold">
                        {e.price === 0 ? 'Free' : `$${e.price}`}
                      </td>
                      <td className="py-4.5 text-right pr-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit event */}
                          <Link
                            to={`/admin/events/edit/${e._id}`}
                            className="p-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-slate-55 dark:hover:bg-slate-750 inline-flex items-center gap-1"
                          >
                            <Edit className="w-4 h-4" />
                            <span className="hidden sm:inline">Edit</span>
                          </Link>

                          {/* Delete event */}
                          <button
                            onClick={() => handleDeleteEvent(e._id)}
                            disabled={actionLoading}
                            className="p-2 rounded-xl text-xs font-bold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 inline-flex items-center gap-1 cursor-pointer"
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

export default ManageEvents;
