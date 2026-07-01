import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Calendar, MapPin, Ticket, QrCode, Download, Trash2, X, CheckCircle, AlertTriangle } from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { addToast } = useToast();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/bookings/my-bookings');
      setBookings(data);
    } catch (err) {
      addToast('Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenTicket = async (booking) => {
    setSelectedBooking(booking);
    setShowTicketModal(true);
    try {
      // Generate QR Code clientside using canvas or the booking's unique token
      // We can create a base64 image URL of the token using google charts or a standard generator
      const qrData = booking.qrCodeData;
      // We'll generate a QR code data url using a simple public service or the text directly
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrData}`;
      setQrCodeUrl(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This will refund your ticket.')) {
      return;
    }

    setActionLoading(true);
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      addToast('Booking successfully cancelled & refunded', 'success');
      fetchBookings();
    } catch (err) {
      addToast(err.response?.data?.message || 'Cancellation failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadTicket = () => {
    if (!selectedBooking) return;
    
    // Simple download logic for QR code image
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `Ticket-${selectedBooking.event.title}-${selectedBooking._id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('QR ticket downloaded successfully', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Booking History</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Review and manage your ticket bookings</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 h-44 rounded-2xl"></div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-3xl p-8">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto text-indigo-500 mb-4">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">No bookings yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto text-sm">
            You haven't booked any tickets yet. Explore active events and secure your spot today!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => {
            const event = booking.event;
            const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const isRefunded = booking.paymentStatus === 'refunded';
            const isCheckedIn = booking.checkedIn;
            const canCancel = new Date(event.date) > new Date() && !isRefunded && !isCheckedIn;

            return (
              <div
                key={booking._id}
                className={`bg-white dark:bg-gray-800 border ${
                  isRefunded ? 'border-gray-200/50 opacity-60 dark:border-gray-700' : 'border-gray-100 dark:border-gray-700/50'
                } rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden`}
              >
                {/* Visual side strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  isRefunded ? 'bg-gray-400' : isCheckedIn ? 'bg-green-500' : 'bg-indigo-600'
                }`}></div>

                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-gray-150 text-base line-clamp-1">{event.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">Booking ID: {booking._id}</p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
                        isRefunded
                          ? 'bg-slate-100 dark:bg-slate-900 text-slate-500'
                          : isCheckedIn
                          ? 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/30'
                          : 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30'
                      }`}
                    >
                      {isRefunded ? 'Refunded' : isCheckedIn ? 'Checked In' : 'Active'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="truncate">{event.locationType === 'online' ? 'Online' : event.location}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs font-semibold pt-4 border-t border-gray-100 dark:border-gray-700/50">
                    <div>
                      <p className="text-gray-400">Tickets booked</p>
                      <p className="text-sm font-bold text-gray-850 dark:text-gray-200 mt-0.5">{booking.ticketsBooked} Ticket(s)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400">Total Price</p>
                      <p className="text-sm font-bold text-gray-850 dark:text-gray-200 mt-0.5">${booking.totalAmount}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 mt-5">
                  {!isRefunded && (
                    <button
                      onClick={() => handleOpenTicket(booking)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>View Ticket</span>
                    </button>
                  )}

                  {canCancel && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      disabled={actionLoading}
                      className="flex items-center justify-center gap-1.5 py-2 px-3.5 text-xs font-bold rounded-xl border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Modal popup */}
      {showTicketModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-fade-in text-center space-y-6">
            <button
              onClick={() => setShowTicketModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Boarding Pass</h2>
              <p className="text-xs text-gray-400 mt-1">Show this QR code at the event gate check-in</p>
            </div>

            {/* Simulated Ticket cutouts */}
            <div className="border-t border-b border-dashed border-gray-200 dark:border-gray-700 py-6 bg-slate-50 dark:bg-slate-900/40 rounded-2xl relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-slate-900/60 dark:bg-slate-900 rounded-r-full -ml-2"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-slate-900/60 dark:bg-slate-900 rounded-l-full -mr-2"></div>

              <div className="space-y-4 px-4">
                <h3 className="font-extrabold text-gray-800 dark:text-gray-150 text-base line-clamp-1">
                  {selectedBooking.event.title}
                </h3>

                <div className="flex justify-center">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt="Booking QR Code"
                      className="w-44 h-44 p-2 bg-white rounded-xl border border-gray-200"
                    />
                  ) : (
                    <div className="w-44 h-44 bg-slate-100 animate-pulse rounded-xl flex items-center justify-center">
                      <QrCode className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400 text-left pt-2">
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold uppercase">Date</span>
                    <span className="text-gray-800 dark:text-gray-200 mt-0.5 block">
                      {new Date(selectedBooking.event.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold uppercase">Time</span>
                    <span className="text-gray-800 dark:text-gray-200 mt-0.5 block">
                      {selectedBooking.event.time}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[10px] text-gray-400 font-bold uppercase">Location</span>
                    <span className="text-gray-800 dark:text-gray-200 mt-0.5 block truncate">
                      {selectedBooking.event.locationType === 'online' ? 'Online link provided on day' : selectedBooking.event.location}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold uppercase">Tickets</span>
                    <span className="text-gray-800 dark:text-gray-200 mt-0.5 block">
                      {selectedBooking.ticketsBooked} Pass(es)
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold uppercase">Booking ID</span>
                    <span className="text-gray-800 dark:text-gray-200 mt-0.5 block truncate max-w-[120px]">
                      {selectedBooking._id}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadTicket}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Pass</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
