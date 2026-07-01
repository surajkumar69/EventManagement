import crypto from 'crypto';
import Stripe from 'stripe';
import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import Payment from '../models/Payment.js';
import generateQR from '../utils/generateQR.js';
import sendEmail from '../utils/sendEmail.js';

const isStripeConfigured = () => {
  return (
    process.env.STRIPE_SECRET_KEY &&
    !process.env.STRIPE_SECRET_KEY.startsWith('sk_test_51P1234567890')
  );
};

let stripe;
if (isStripeConfigured()) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res, next) => {
  const { eventId, ticketsBooked, paymentId } = req.body;

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    // Verify capacity
    const availableCapacity = event.capacity - event.ticketsSold;
    if (availableCapacity < ticketsBooked) {
      res.status(400);
      throw new Error(`Only ${availableCapacity} tickets remaining`);
    }

    const totalAmount = event.price * ticketsBooked;
    let paymentStatus = 'paid'; // Default to paid if free or mock

    // Verify payment with Stripe if not free and Stripe is configured
    if (totalAmount > 0 && isStripeConfigured() && paymentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
        if (paymentIntent.status !== 'succeeded') {
          paymentStatus = 'failed';
          res.status(400);
          throw new Error('Stripe payment has not succeeded');
        }
      } catch (stripeErr) {
        console.error('Stripe payment verification failed:', stripeErr);
        res.status(400);
        throw new Error('Failed to verify payment with Stripe');
      }
    }

    // Generate unique verification token
    const uniqueVerificationToken = crypto.randomBytes(16).toString('hex');

    // Create the booking
    const booking = new Booking({
      user: req.user._id,
      event: eventId,
      ticketsBooked,
      totalAmount,
      paymentStatus,
      paymentId: paymentId || `free_or_mock_${Date.now()}`,
      qrCodeData: uniqueVerificationToken,
    });

    const savedBooking = await booking.save();

    // Increment event tickets sold count
    event.ticketsSold += Number(ticketsBooked);
    await event.save();

    // Generate audit Payment log
    const payment = new Payment({
      user: req.user._id,
      booking: savedBooking._id,
      event: eventId,
      amount: totalAmount,
      status: paymentStatus === 'paid' ? 'succeeded' : 'failed',
      transactionId: paymentId || `txn_mock_${Date.now()}`,
      paymentMethod: totalAmount > 0 ? 'card' : 'free',
    });
    await payment.save();

    // Generate QR Code URL
    const qrCodeDataUrl = await generateQR(uniqueVerificationToken);

    // Send email with ticket details and QR code
    const formattedDate = new Date(event.date).toLocaleDateString();
    const emailMessage = `Your booking for ${event.title} is confirmed!\n\nDate: ${formattedDate}\nTime: ${event.time}\nLocation: ${event.location}\nTickets Booked: ${ticketsBooked}\nTotal Amount: $${totalAmount}\nBooking ID: ${savedBooking._id}`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #4f46e5; text-align: center;">Ticket Confirmation</h2>
        <p style="color: #475569; font-size: 16px; text-align: center;">Your ticket for <strong>${event.title}</strong> is confirmed!</p>
        
        <div style="background-color: #f8fafc; border-radius: 6px; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0f172a;">Event Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 4px 0; color: #64748b;">Date:</td><td style="padding: 4px 0; color: #0f172a; font-weight: bold;">${formattedDate}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Time:</td><td style="padding: 4px 0; color: #0f172a; font-weight: bold;">${event.time}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Location:</td><td style="padding: 4px 0; color: #0f172a; font-weight: bold;">${event.location}</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Quantity:</td><td style="padding: 4px 0; color: #0f172a; font-weight: bold;">${ticketsBooked} ticket(s)</td></tr>
            <tr><td style="padding: 4px 0; color: #64748b;">Amount Paid:</td><td style="padding: 4px 0; color: #0f172a; font-weight: bold;">$${totalAmount}</td></tr>
          </table>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #475569; font-size: 14px; margin-bottom: 10px;">Show this QR code at the event gate to check-in:</p>
          <img src="${qrCodeDataUrl}" alt="Event Ticket QR Code" style="border: 2px solid #e2e8f0; padding: 10px; border-radius: 8px; background-color: white; max-width: 200px;" />
        </div>

        <p style="color: #64748b; font-size: 12px; text-align: center;">Booking ID: ${savedBooking._id}</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #94a3b8; font-size: 11px; text-align: center;">Thank you for using EventFlow!</p>
      </div>
    `;

    try {
      await sendEmail({
        email: req.user.email,
        subject: `Your ticket is confirmed: ${event.title}`,
        message: emailMessage,
        html: emailHtml,
      });
    } catch (mailErr) {
      console.error('Ticket confirmation email could not be sent:', mailErr);
      // Don't throw error to client because booking is already completed successfully in db
    }

    res.status(201).json(savedBooking);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
export const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({
        path: 'event',
        populate: {
          path: 'organizer',
          select: 'name email',
        },
      })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking details by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate({
        path: 'event',
        populate: {
          path: 'organizer',
          select: 'name email',
        },
      });

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    // Check authorization: must be booker, event organizer, or admin
    const isBooker = booking.user._id.toString() === req.user._id.toString();
    const isOrganizer = booking.event.organizer._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isBooker && !isOrganizer && !isAdmin) {
      res.status(403);
      throw new Error('Not authorized to view this booking');
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   POST /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('event');

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    // Check authorization: must be booker or admin
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to cancel this booking');
    }

    if (booking.paymentStatus === 'refunded') {
      res.status(400);
      throw new Error('Booking is already cancelled and refunded');
    }

    // Check if event has already occurred
    if (new Date(booking.event.date) < new Date()) {
      res.status(400);
      throw new Error('Cannot cancel booking for an event that has already occurred');
    }

    // Refund Stripe payment if stripe is configured and it was a paid event
    if (booking.totalAmount > 0 && isStripeConfigured() && !booking.paymentId.startsWith('free_or_mock_')) {
      try {
        await stripe.refunds.create({
          payment_intent: booking.paymentId,
        });
      } catch (stripeErr) {
        console.error('Stripe refund failed:', stripeErr);
        res.status(500);
        throw new Error('Refund failed, please try again or contact support');
      }
    }

    // Update event capacity (reduce tickets sold)
    const event = await Event.findById(booking.event._id);
    event.ticketsSold -= booking.ticketsBooked;
    await event.save();

    // Mark booking refunded/cancelled
    booking.paymentStatus = 'refunded';
    await booking.save();

    // Update payment audit log to refunded
    const payment = await Payment.findOne({ booking: booking._id });
    if (payment) {
      payment.status = 'refunded';
      await payment.save();
    }

    res.json({ message: 'Booking successfully cancelled and refunded', booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify QR check-in
// @route   POST /api/bookings/check-in
// @access  Private (Admin / Event Organizer)
export const verifyQRCheckin = async (req, res, next) => {
  const { qrCodeData } = req.body;

  try {
    const booking = await Booking.findOne({ qrCodeData }).populate('event').populate('user', 'name email');

    if (!booking) {
      res.status(404);
      throw new Error('Invalid ticket QR code');
    }

    // Check authorization: User must be organizer of this event or admin
    if (booking.event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized: only event organizer or admin can check-in attendees');
    }

    if (booking.checkedIn) {
      res.status(400).json({
        success: false,
        message: 'Ticket already scanned & checked-in!',
        attendeeName: booking.user.name,
        checkedInAt: booking.checkedInAt,
        eventTitle: booking.event.title,
      });
      return;
    }

    if (booking.paymentStatus !== 'paid') {
      res.status(400);
      throw new Error(`Cannot check-in. Ticket payment status is ${booking.paymentStatus}`);
    }

    // Success check-in
    booking.checkedIn = true;
    booking.checkedInAt = Date.now();
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Check-in successful!',
      attendeeName: booking.user.name,
      attendeeEmail: booking.user.email,
      eventTitle: booking.event.title,
      ticketsBooked: booking.ticketsBooked,
      checkedInAt: booking.checkedInAt,
    });
  } catch (error) {
    next(error);
  }
};
