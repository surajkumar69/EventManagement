import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Calendar, MapPin, Tag, Users, ShieldAlert, ArrowLeft, Ticket, CreditCard } from 'lucide-react';
import confetti from 'canvas-confetti';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  // Checkout States
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState(null);

  // Credit Card mock inputs
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        setEvent(data);
      } catch (err) {
        addToast('Error loading event details', 'error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleStartCheckout = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    setCheckoutLoading(true);
    try {
      // Create payment intent
      const { data } = await api.post('/payments/create-intent', {
        eventId: event._id,
        ticketsBooked: quantity,
      });
      setPaymentIntent(data);
      
      if (data.isFree) {
        // Automatically book free tickets without cards inputs
        handleCompleteBooking(null);
      } else {
        setShowCheckout(true);
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Payment initiation failed', 'error');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleCompleteBooking = async (paymentId) => {
    setCheckoutLoading(true);
    try {
      const { data } = await api.post('/bookings', {
        eventId: event._id,
        ticketsBooked: quantity,
        paymentId: paymentId || paymentIntent?.clientSecret,
      });

      // Fire confetti success
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      addToast('Ticket booked successfully! Check your email.', 'success');
      navigate('/bookings');
    } catch (err) {
      addToast(err.response?.data?.message || 'Booking confirmation failed', 'error');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvc) {
      addToast('Please fill in card details', 'warning');
      return;
    }

    setCheckoutLoading(true);
    // Simulate payment processing delay (3s)
    setTimeout(() => {
      handleCompleteBooking(paymentIntent.clientSecret);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const isSoldOut = event.ticketsSold >= event.capacity;
  const remainingTickets = event.capacity - event.ticketsSold;
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video w-full rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-900 border border-gray-150 dark:border-gray-850">
              <img
                src={event.bannerUrl}
                alt={event.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000&auto=format&fit=crop';
                }}
              />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 text-xs font-semibold rounded-full border bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30">
                  {event.category}
                </span>
                <span className="px-3 py-1 text-xs font-semibold rounded-full border bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700">
                  {event.locationType === 'online' ? 'Online' : 'In-Person'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
                {event.title}
              </h1>

              {/* Event Meta Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date & Time</h4>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{formattedDate}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{event.time}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</h4>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                      {event.locationType === 'online' ? 'Online Meeting Link' : event.location}
                    </p>
                    {event.locationType === 'online' && (
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/35 rounded">
                        Provided after booking
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">About This Event</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                  {event.description}
                </p>
              </div>
            </div>
          </div>

          {/* Booking / Checkout Widget */}
          <div className="space-y-6">
            {!showCheckout ? (
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-sm space-y-6 sticky top-24">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400 font-semibold text-sm">Ticket Price</span>
                  <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    {event.price === 0 ? 'Free' : `$${event.price}`}
                  </span>
                </div>

                {/* Capacity Counter */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span className="font-semibold">Availability</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {isSoldOut ? 'Sold Out' : `${remainingTickets} tickets left`}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isSoldOut ? 'bg-red-500' : 'bg-indigo-600'}`}
                      style={{ width: `${Math.min((event.ticketsSold / event.capacity) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {!isSoldOut && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Quantity</span>
                      <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900">
                        <button
                          onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
                          className="px-3.5 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-4 text-sm font-bold text-gray-800 dark:text-gray-200">{quantity}</span>
                        <button
                          onClick={() => setQuantity((q) => Math.min(q + 1, remainingTickets))}
                          className="px-3.5 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex justify-between items-center text-sm font-bold">
                      <span className="text-gray-600 dark:text-gray-300">Total Price</span>
                      <span className="text-xl text-gray-900 dark:text-white">${event.price * quantity}</span>
                    </div>
                  </div>
                )}

                {/* Checkout Trigger button */}
                {isSoldOut ? (
                  <button
                    disabled
                    className="w-full py-3.5 px-4 rounded-xl text-white font-semibold bg-red-500/20 text-red-500 border border-red-500/20 text-center"
                  >
                    Sold Out
                  </button>
                ) : (
                  <button
                    onClick={handleStartCheckout}
                    disabled={checkoutLoading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 cursor-pointer"
                  >
                    {checkoutLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Ticket className="w-5 h-5" />
                        <span>{user ? 'Book Tickets' : 'Login to Book'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            ) : (
              // Checkout form panel
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-sm space-y-6 sticky top-24">
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3">
                  <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-indigo-500" />
                    <span>Card Checkout</span>
                  </h3>
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="text-xs bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/30 font-medium">
                  {paymentIntent?.mockMode
                    ? '🛠️ running in Mock payment mode. Type any credentials to complete.'
                    : '🔒 Sandbox Transaction. Confirm tickets below.'}
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  {/* Card Number */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Card Number</label>
                    <input
                      type="text"
                      maxLength="19"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-gray-700 dark:text-gray-300 font-semibold"
                      required
                    />
                  </div>

                  {/* Expire / CVC */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Expiry Date</label>
                      <input
                        type="text"
                        maxLength="5"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-gray-700 dark:text-gray-300 font-semibold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">CVC Code</label>
                      <input
                        type="password"
                        maxLength="3"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        placeholder="•••"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-gray-700 dark:text-gray-300 font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex justify-between items-center text-sm font-bold">
                    <span className="text-gray-600 dark:text-gray-300">Pay Total</span>
                    <span className="text-xl text-gray-900 dark:text-white">${event.price * quantity}</span>
                  </div>

                  {/* Confirm checkout btn */}
                  <button
                    type="submit"
                    disabled={checkoutLoading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 cursor-pointer"
                  >
                    {checkoutLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span>Pay & Confirm Booking</span>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventDetails;
