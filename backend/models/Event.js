import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an event title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide an event description'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['Music', 'Tech', 'Arts', 'Sports', 'Food', 'Business', 'Other'],
      default: 'Other',
    },
    bannerUrl: {
      type: String,
      required: [true, 'Please provide an event banner image'],
    },
    date: {
      type: Date,
      required: [true, 'Please provide the event date'],
    },
    time: {
      type: String,
      required: [true, 'Please provide the event time'],
    },
    locationType: {
      type: String,
      enum: ['venue', 'online'],
      required: [true, 'Please specify if the event is online or venue-based'],
      default: 'venue',
    },
    location: {
      type: String,
      required: [true, 'Please provide the event location or URL'],
    },
    capacity: {
      type: Number,
      required: [true, 'Please specify maximum capacity'],
      min: [1, 'Capacity must be at least 1 person'],
    },
    ticketsSold: {
      type: Number,
      default: 0,
      min: [0, 'Tickets sold cannot be negative'],
    },
    price: {
      type: Number,
      required: [true, 'Please specify ticket price (0 for free)'],
      min: [0, 'Price cannot be negative'],
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model('Event', eventSchema);

export default Event;
