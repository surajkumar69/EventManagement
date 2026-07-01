import Stripe from 'stripe';
import Event from '../models/Event.js';

// Setup Stripe: Check if Stripe key is valid and not placeholder
const isStripeConfigured = () => {
  return (
    process.env.STRIPE_SECRET_KEY &&
    !process.env.STRIPE_SECRET_KEY.startsWith('sk_test_51P1234567890')
  );
};

let stripe;
if (isStripeConfigured()) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  console.log('Stripe SDK successfully configured.');
} else {
  console.log('Stripe API Key missing or placeholder. Running in Mock Payment Mode.');
}

// @desc    Create Stripe Payment Intent
// @route   POST /api/payments/create-intent
// @access  Private
export const createPaymentIntent = async (req, res, next) => {
  const { eventId, ticketsBooked } = req.body;

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    // Check capacity
    const availableCapacity = event.capacity - event.ticketsSold;
    if (availableCapacity < ticketsBooked) {
      res.status(400);
      throw new Error(`Only ${availableCapacity} tickets remaining for this event`);
    }

    const totalAmount = event.price * ticketsBooked;

    // Check if the event is free
    if (totalAmount === 0) {
      return res.status(200).json({
        clientSecret: null,
        totalAmount: 0,
        ticketsBooked,
        isFree: true,
      });
    }

    if (isStripeConfigured()) {
      // Create Stripe PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // Amount in cents
        currency: 'usd',
        metadata: {
          userId: req.user._id.toString(),
          eventId: eventId,
          ticketsBooked: ticketsBooked.toString(),
        },
      });

      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        totalAmount,
        ticketsBooked,
        isFree: false,
        mockMode: false,
      });
    } else {
      // Mock payment mode response
      res.status(200).json({
        clientSecret: `mock_secret_intent_${Date.now()}`,
        totalAmount,
        ticketsBooked,
        isFree: false,
        mockMode: true,
      });
    }
  } catch (error) {
    next(error);
  }
};
