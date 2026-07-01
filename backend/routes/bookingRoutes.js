import express from 'express';
import {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  verifyQRCheckin,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createBooking);

router.route('/my-bookings')
  .get(protect, getUserBookings);

router.route('/check-in')
  .post(protect, verifyQRCheckin);

router.route('/:id')
  .get(protect, getBookingById);

router.route('/:id/cancel')
  .post(protect, cancelBooking);

export default router;
