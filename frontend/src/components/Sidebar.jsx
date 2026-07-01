import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Ticket,
  QrCode,
  DollarSign,
  PlusCircle,
  History
} from 'lucide-react';

const Sidebar = ({ role = 'user' }) => {
  const adminLinks = [
    { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/events', label: 'Manage Events', icon: CalendarDays },
    { to: '/admin/events/new', label: 'Create Event', icon: PlusCircle },
    { to: '/admin/bookings', label: 'Manage Bookings', icon: Ticket },
    { to: '/admin/users', label: 'Manage Users', icon: Users },
    { to: '/admin/payments', label: 'Payment Reports', icon: DollarSign },
    { to: '/admin/check-in', label: 'Gate Check-in', icon: QrCode },
  ];

  const userLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/bookings', label: 'My Bookings', icon: History },
  ];

  const links = role === 'admin' ? adminLinks : userLinks;

  return (
    <nav className="space-y-1 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm sticky top-20">
      <div className="px-3 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
        {role === 'admin' ? 'Admin Portal' : 'User Portal'}
      </div>
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin/dashboard' || link.to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750/30'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{link.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default Sidebar;
