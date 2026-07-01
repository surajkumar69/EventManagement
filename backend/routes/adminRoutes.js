import express from 'express';
import {
  getDashboardAnalytics,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllBookings,
  getPaymentReports,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/analytics', protect, admin, getDashboardAnalytics);
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);
router.delete('/users/:id', protect, admin, deleteUser);
router.get('/bookings', protect, admin, getAllBookings);
router.get('/payments', protect, admin, getPaymentReports);

export default router;
