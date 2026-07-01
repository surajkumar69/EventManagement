import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Tag, Users } from 'lucide-react';

const EventCard = ({ event }) => {
  const { _id, title, category, bannerUrl, date, time, locationType, location, capacity, ticketsSold, price } = event;
  
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate ticket availability percentage
  const soldPercent = Math.min(Math.round((ticketsSold / capacity) * 100), 100);
  const isSoldOut = ticketsSold >= capacity;

  // Category Color Map
  const categoryColors = {
    Music: 'bg-pink-50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400 border-pink-100 dark:border-pink-900/30',
    Tech: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30',
    Arts: 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30',
    Sports: 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30',
    Food: 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900/30',
    Business: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30',
    Other: 'bg-gray-50 dark:bg-gray-950/20 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-900/30',
  };

  const badgeStyle = categoryColors[category] || categoryColors.Other;

  return (
    <div className="group flex flex-col bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 overflow-hidden">
      {/* Banner */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
        <img
          src={bannerUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000&auto=format&fit=crop';
          }}
        />
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${badgeStyle}`}>
            {category}
          </span>
        </div>
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 text-xs font-bold rounded-lg">
          {price === 0 ? 'Free' : `$${price}`}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 dark:text-gray-150 text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
          {title}
        </h3>

        <div className="mt-3.5 space-y-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>{formattedDate} • {time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="truncate">{locationType === 'online' ? 'Online Event' : location}</span>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1 text-gray-400">
              <Users className="w-3.5 h-3.5" />
              <span>Attendance</span>
            </span>
            <span className={`font-semibold ${isSoldOut ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'}`}>
              {isSoldOut ? 'Sold Out' : `${ticketsSold} / ${capacity} Sold`}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isSoldOut ? 'bg-red-500' : soldPercent > 80 ? 'bg-amber-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${soldPercent}%` }}
            ></div>
          </div>
        </div>

        {/* View Details Link */}
        <div className="mt-5">
          <Link
            to={`/events/${_id}`}
            className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
