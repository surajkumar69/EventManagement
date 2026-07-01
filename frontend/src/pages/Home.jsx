import React, { useState, useEffect } from 'react';
import api from '../services/api';
import EventCard from '../components/EventCard';
import Navbar from '../components/Navbar';
import { Search, Filter, SlidersHorizontal, ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [priceType, setPriceType] = useState('All');
  const [locationType, setLocationType] = useState('All');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/events/categories');
        setCategories(['All', ...data]);
      } catch (err) {
        console.error('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  // Fetch events based on filters
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          keyword: search,
          category: selectedCategory,
          priceType,
          locationType,
          pageNumber: page,
          pageSize: 8,
        });

        const { data } = await api.get(`/events?${queryParams.toString()}`);
        setEvents(data.events);
        setTotalPages(data.pages);
      } catch (err) {
        addToast('Error loading events list', 'error');
      } finally {
        setLoading(false);
      }
    };

    // Debounce search input
    const timer = setTimeout(() => {
      fetchEvents();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, selectedCategory, priceType, locationType, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory, priceType, locationType]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg text-gray-800 dark:text-gray-250 transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <header className="relative py-20 px-4 text-center overflow-hidden bg-gradient-to-tr from-indigo-950 via-slate-900 to-indigo-900 text-white border-b border-indigo-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15),transparent_60%)]"></div>
        <div className="relative max-w-4xl mx-auto z-10 space-y-6">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Discover <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Incredible</span> Events Nearby
          </h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto font-medium">
            Join tech conferences, music festivals, food events, workshops, and build memories.
          </p>

          {/* Large Search Bar */}
          <div className="max-w-2xl mx-auto relative mt-8">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-indigo-400">
              <Search className="w-6 h-6" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events by title, description, keywords..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:text-gray-900 focus:placeholder-gray-500 shadow-lg backdrop-blur-md transition-all text-base font-medium"
            />
          </div>
        </div>
      </header>

      {/* Filtering and Exploration Grid */}
      <section className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-64 shrink-0 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm p-6 rounded-2xl h-fit space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-150 dark:border-gray-700 pb-3">
              <SlidersHorizontal className="w-5 h-5 text-indigo-500" />
              <h2 className="text-base font-bold text-gray-800 dark:text-gray-200 m-0">Filter Options</h2>
            </div>

            {/* Price Filter */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Ticket Cost</label>
              <select
                value={priceType}
                onChange={(e) => setPriceType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-gray-700 dark:text-gray-300"
              >
                <option value="All">All Pricing</option>
                <option value="Free">Free Tickets Only</option>
                <option value="Paid">Paid Tickets Only</option>
              </select>
            </div>

            {/* Location Type Filter */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Event Venue Type</label>
              <select
                value={locationType}
                onChange={(e) => setLocationType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-gray-700 dark:text-gray-300"
              >
                <option value="All">All Types</option>
                <option value="venue">In-person Venue</option>
                <option value="online">Online / Virtual</option>
              </select>
            </div>
          </div>

          {/* Event Content Area */}
          <div className="flex-1 space-y-8">
            {/* Category horizontal scrolling bar */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border shrink-0 transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/10'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Event Cards Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl h-[420px] p-5 space-y-4">
                    <div className="bg-slate-200 dark:bg-slate-700 aspect-video rounded-xl w-full"></div>
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="space-y-2 pt-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                    </div>
                    <div className="pt-4 flex justify-between items-center">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-3xl p-8">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto text-indigo-500 mb-4">
                  <Filter className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">No events found</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto text-sm">
                  We couldn't find any events matching your selected criteria. Try adjusting your search keyword or filters.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <EventCard key={event._id} event={event} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12 pt-6 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 px-4">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                      disabled={page === totalPages}
                      className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
