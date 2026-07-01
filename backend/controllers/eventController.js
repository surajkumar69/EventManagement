import Event from '../models/Event.js';
import Booking from '../models/Booking.js';

// @desc    Get all events (with filter, search, pagination)
// @route   GET /api/events
// @access  Public
export const getEvents = async (req, res, next) => {
  try {
    const pageSize = parseInt(req.query.pageSize) || 8;
    const page = parseInt(req.query.pageNumber) || 1;

    // Search query keyword
    const keyword = req.query.keyword
      ? {
          title: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    // Category filter
    const category = req.query.category && req.query.category !== 'All'
      ? { category: req.query.category }
      : {};

    // Price filters (Free / Paid / All)
    let priceFilter = {};
    if (req.query.priceType === 'Free') {
      priceFilter = { price: 0 };
    } else if (req.query.priceType === 'Paid') {
      priceFilter = { price: { $gt: 0 } };
    }

    // Location type filter (online / venue)
    const locationType = req.query.locationType && req.query.locationType !== 'All'
      ? { locationType: req.query.locationType }
      : {};

    // Combine all filters
    const filter = { ...keyword, ...category, ...priceFilter, ...locationType };

    const count = await Event.countDocuments(filter);
    const events = await Event.find(filter)
      .populate('organizer', 'name email')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ date: 1 }); // Sort by upcoming date first

    res.json({
      events,
      page,
      pages: Math.ceil(count / pageSize),
      totalEvents: count,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email');

    if (event) {
      res.json(event);
    } else {
      res.status(404);
      throw new Error('Event not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
export const createEvent = async (req, res, next) => {
  try {
    const { title, description, category, date, time, locationType, location, capacity, price } = req.body;

    const bannerUrl = req.fileUrl || '/uploads/default-event.jpg'; // default placeholder if no image uploaded

    const event = new Event({
      title,
      description,
      category,
      bannerUrl,
      date,
      time,
      locationType,
      location,
      capacity: Number(capacity),
      price: Number(price),
      organizer: req.user._id,
    });

    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error) {
    next(error);
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private
export const updateEvent = async (req, res, next) => {
  try {
    const { title, description, category, date, time, locationType, location, capacity, price } = req.body;

    const event = await Event.findById(req.params.id);

    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    // Check authorization: User must be organizer or admin
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('User not authorized to update this event');
    }

    event.title = title || event.title;
    event.description = description || event.description;
    event.category = category || event.category;
    event.date = date || event.date;
    event.time = time || event.time;
    event.locationType = locationType || event.locationType;
    event.location = location || event.location;
    event.capacity = capacity !== undefined ? Number(capacity) : event.capacity;
    event.price = price !== undefined ? Number(price) : event.price;

    if (req.fileUrl) {
      event.bannerUrl = req.fileUrl;
    }

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private
export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    // Check authorization: User must be organizer or admin
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('User not authorized to delete this event');
    }

    // Check if bookings exist for this event
    const bookingsCount = await Booking.countDocuments({ event: req.params.id, paymentStatus: 'paid' });
    if (bookingsCount > 0) {
      res.status(400);
      throw new Error('Cannot delete event with active bookings. Refund/cancel bookings first.');
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all categories
// @route   GET /api/events/categories
// @access  Public
export const getCategories = async (req, res) => {
  res.json(['Music', 'Tech', 'Arts', 'Sports', 'Food', 'Business', 'Other']);
};
