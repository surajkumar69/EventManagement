import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Save, Upload, Calendar, Clock, MapPin, Tag, Users, DollarSign } from 'lucide-react';

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const isEditMode = !!id;

  // Form Fields State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Music');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [locationType, setLocationType] = useState('venue');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState(100);
  const [price, setPrice] = useState(0);
  
  // Banner state
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');

  // Page level state
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchEventDetails = async () => {
        setPageLoading(true);
        try {
          const { data } = await api.get(`/events/${id}`);
          setTitle(data.title);
          setDescription(data.description);
          setCategory(data.category);
          setDate(data.date ? new Date(data.date).toISOString().split('T')[0] : '');
          setTime(data.time);
          setLocationType(data.locationType);
          setLocation(data.location);
          setCapacity(data.capacity);
          setPrice(data.price);
          setBannerPreview(data.bannerUrl);
        } catch (err) {
          addToast('Error loading event data', 'error');
          navigate('/admin/events');
        } finally {
          setPageLoading(false);
        }
      };
      fetchEventDetails();
    }
  }, [id, isEditMode]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast('File size must be under 5MB', 'warning');
        return;
      }
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !date || !time || !location || capacity <= 0) {
      addToast('Please fill in all required fields correctly', 'warning');
      return;
    }

    setLoading(true);
    
    // Create multipart form object
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('date', date);
    formData.append('time', time);
    formData.append('locationType', locationType);
    formData.append('location', location);
    formData.append('capacity', capacity);
    formData.append('price', price);
    
    if (bannerFile) {
      formData.append('banner', bannerFile);
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (isEditMode) {
        await api.put(`/events/${id}`, formData, config);
        addToast('Event updated successfully', 'success');
      } else {
        await api.post('/events', formData, config);
        addToast('Event created successfully', 'success');
      }
      navigate('/admin/events');
    } catch (err) {
      addToast(err.response?.data?.message || 'Error processing request', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <Link
          to="/admin/events"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Manage</span>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {isEditMode ? 'Edit Event' : 'Create Event'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {isEditMode ? 'Modify event attributes, schedule, or pricing' : 'Launch a new event on the platform'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Inputs panel */}
        <div className="lg:col-span-2 space-y-6 bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
          
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-gray-750 dark:text-gray-300 mb-1.5">Event Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. International Web Developers Summit"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-gray-700 dark:text-gray-300 font-semibold"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-750 dark:text-gray-300 mb-1.5">Description *</label>
            <textarea
              rows="6"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write a compelling description of the event details, guest speakers, schedule..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-gray-700 dark:text-gray-300 font-medium"
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-gray-750 dark:text-gray-300 mb-1.5">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-gray-700 dark:text-gray-300 font-semibold"
              >
                <option value="Music">Music</option>
                <option value="Tech">Tech</option>
                <option value="Arts">Arts</option>
                <option value="Sports">Sports</option>
                <option value="Food">Food</option>
                <option value="Business">Business</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Location Type */}
            <div>
              <label className="block text-sm font-bold text-gray-750 dark:text-gray-300 mb-1.5">Location Type *</label>
              <select
                value={locationType}
                onChange={(e) => setLocationType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-gray-700 dark:text-gray-300 font-semibold"
              >
                <option value="venue">In-Person Venue</option>
                <option value="online">Online / Virtual</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-bold text-gray-750 dark:text-gray-300 mb-1.5">Date *</label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-gray-700 dark:text-gray-300 font-semibold"
                  required
                />
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-bold text-gray-750 dark:text-gray-300 mb-1.5">Time *</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 10:00 AM or 18:30"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-gray-700 dark:text-gray-300 font-semibold"
                required
              />
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-bold text-gray-750 dark:text-gray-300 mb-1.5">Capacity *</label>
              <input
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-gray-700 dark:text-gray-300 font-semibold"
                required
              />
            </div>

            {/* Ticket Price */}
            <div>
              <label className="block text-sm font-bold text-gray-750 dark:text-gray-300 mb-1.5">Ticket Price ($) *</label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0 for free admission"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-gray-700 dark:text-gray-300 font-semibold"
                required
              />
            </div>

            {/* Location input address / meeting URL */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-gray-750 dark:text-gray-300 mb-1.5">
                {locationType === 'online' ? 'Online Meeting Link *' : 'Venue Address *'}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={locationType === 'online' ? 'https://zoom.us/j/...' : 'e.g. Madison Square Garden, New York'}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-gray-700 dark:text-gray-300 font-semibold"
                required
              />
            </div>
          </div>
        </div>

        {/* Banner Media Panel */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-250 m-0">Event Banner</h3>
            
            <div className="aspect-video w-full rounded-2xl border-2 border-dashed border-gray-250 dark:border-gray-700 overflow-hidden flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 relative">
              {bannerPreview ? (
                <>
                  <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                    <label className="bg-white text-gray-800 px-3.5 py-1.5 rounded-xl font-bold text-xs cursor-pointer shadow-sm">
                      Change Banner
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  </div>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 cursor-pointer p-4 w-full h-full">
                  <Upload className="w-8 h-8 text-gray-400 animate-bounce" />
                  <span className="text-xs font-bold text-gray-500 text-center">Upload image (PNG, JPG, WEBP)</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" required />
                </label>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 cursor-pointer pt-2.5"
            >
              <Save className="w-4.5 h-4.5" />
              <span>{isEditMode ? 'Update Event' : 'Publish Event'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
