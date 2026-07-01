import express from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getCategories,
} from '../controllers/eventController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadBanner } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getEvents)
  .post(protect, uploadBanner, createEvent);

router.get('/categories', getCategories);

router.route('/:id')
  .get(getEventById)
  .put(protect, uploadBanner, updateEvent)
  .delete(protect, deleteEvent);

export default router;
