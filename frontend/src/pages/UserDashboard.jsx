import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Calendar, Ticket, DollarSign, ArrowRight, Compass } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [stats, setStats] = useState({ totalBookings: 0, activeTickets: 0, moneySpent: 0 });
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await api.get('/bookings/my-bookings');
        
        // Calculate statistics
        let total = data.length;
        let active = 0;
        let spent = 0;
        const upcomingList = [];

        data.forEach((booking) => {
          if (booking.paymentStatus === 'paid') {
            spent += booking.totalAmount;
            if (new Date(booking.event.date) >= new Date()) {
              active += booking.ticketsBooked;
              upcomingList.push(booking);
            }
          }
        });

        setStats({ totalBookings: total, activeTickets: active, moneySpent: spent });
        setUpcoming(upcomingList.slice(0, 3)); // show top 3 upcoming
      } catch (err) {
        addToast('Error loading dashboard statistics', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-28 bg-white dark:bg-gray-800 rounded-3xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-white dark:bg-gray-800 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center justify-center -mr-10">
          <Ticket className="w-64 h-64 rotate-12" />
        </div>
        <div className="relative z-10 max-w-xl space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold m-0">Welcome back, {user.name}!</h1>
          <p className="text-indigo-100 text-sm sm:text-base font-medium">
            Manage your booked events, download QR entry boarding passes, or explore what's happening next.
          </p>
        </div>
      </div>

      {/* Grid Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total bookings card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Bookings</p>
            <p className="text-2xl font-extrabold text-gray-850 dark:text-gray-250 mt-1">{stats.totalBookings}</p>
          </div>
        </div>

        {/* Active Passes card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Active Passes</p>
            <p className="text-2xl font-extrabold text-gray-850 dark:text-gray-250 mt-1">{stats.activeTickets}</p>
          </div>
        </div>

        {/* Money spent card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Spent Total</p>
            <p className="text-2xl font-extrabold text-gray-850 dark:text-gray-250 mt-1">${stats.moneySpent}</p>
          </div>
        </div>
      </div>

      {/* Upcoming bookings grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-250 m-0">Upcoming Events</h2>
          <Link
            to="/bookings"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
          >
            <span>View All Bookings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-3xl p-8 text-center py-12">
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto text-indigo-500 mb-4">
              <Compass className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-700 dark:text-gray-300">No upcoming events</h4>
            <p className="text-xs text-gray-400 mt-1 mb-4">You have no upcoming booked events at the moment.</p>
            <Link
              to="/"
              className="inline-flex items-center justify-center py-2 px-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
            >
              Explore Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {upcoming.map((booking) => {
              const event = booking.event;
              const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={booking._id}
                  className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow"
                >
                  <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded bg-indigo-50 dark:bg-indigo-950/25 text-indigo-600 dark:text-indigo-400">
                    {event.category}
                  </span>
                  <h3 className="font-bold text-gray-800 dark:text-gray-150 text-sm line-clamp-1 m-0">{event.title}</h3>
                  
                  <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-750">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{formattedDate} • {event.time}</span>
                    </p>
                    <p className="truncate">
                      <strong>Qty:</strong> {booking.ticketsBooked} Ticket(s)
                    </p>
                  </div>
                  <Link
                    to="/bookings"
                    className="w-full text-center block text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-2"
                  >
                    View Ticket QR Pass
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
