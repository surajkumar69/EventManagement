import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event_management');
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Event.deleteMany();
    await Booking.deleteMany();
    await Payment.deleteMany();
    console.log('Cleared existing collections.');

    // Create Admin
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@eventflow.com',
      password: 'password123',
      role: 'admin',
    });

    // Create User
    const standardUser = await User.create({
      name: 'Sarah Jenkins',
      email: 'user@eventflow.com',
      password: 'password123',
      role: 'user',
    });

    console.log('Created Users.');

    // Seed Events
    const events = [
      {
        title: 'Global Tech Innovators Summit 2026',
        description: 'Join industry leaders, software builders, and designers as we discuss AI agentic systems, web scalability, and decentralized computing paradigms. Refreshments and certificate of attendance included.',
        category: 'Tech',
        bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000&auto=format&fit=crop',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days in future
        time: '09:00 AM',
        locationType: 'venue',
        location: 'Silicon Valley Convention Center, Hall B, CA',
        capacity: 120,
        ticketsSold: 0,
        price: 99,
        organizer: adminUser._id,
      },
      {
        title: 'Neon Horizon Music Festival',
        description: 'An open-air electronic synthwave festival featuring multi-genre artists, live laser display acts, and immersive soundscapes under the city stars. Food vendors on-site.',
        category: 'Music',
        bannerUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1000&auto=format&fit=crop',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days in future
        time: '18:00 PM',
        locationType: 'venue',
        location: 'Prospect Park Outdoor Amphitheater, Brooklyn, NY',
        capacity: 500,
        ticketsSold: 0,
        price: 45,
        organizer: adminUser._id,
      },
      {
        title: 'Culinary Masterclass & Tasting',
        description: 'Elevate your culinary skills with hands-on instructions from award-winning gourmet chefs. Learn the secret behind artisanal breads, fine sauces, and chocolate work.',
        category: 'Food',
        bannerUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1000&auto=format&fit=crop',
        date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days in future
        time: '11:30 AM',
        locationType: 'venue',
        location: 'Le Cordon Bleu Training Kitchens, Paris Suite',
        capacity: 25,
        ticketsSold: 0,
        price: 150,
        organizer: adminUser._id,
      },
      {
        title: 'Virtual Startup Networking Mixer',
        description: 'Connect with early-stage venture capitalists, developers, co-founders, and tech lawyers in structured 1-on-1 breakout lounges. Accelerate your startup growth strategy.',
        category: 'Business',
        bannerUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1000&auto=format&fit=crop',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days in future
        time: '15:00 PM',
        locationType: 'online',
        location: 'https://gather.town/app/eventflow-mixer-2026',
        capacity: 200,
        ticketsSold: 0,
        price: 0, // Free event
        organizer: adminUser._id,
      },
      {
        title: 'Abstract Expressionism Art Gallery',
        description: 'A modern art exhibition showcasing canvases from local post-modern painters. Wine, hors d\'oeuvres, and classical violin accompaniments included.',
        category: 'Arts',
        bannerUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1000&auto=format&fit=crop',
        date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days in future
        time: '17:00 PM',
        locationType: 'venue',
        location: 'Metropolitan Art Center, Gallery Room 4',
        capacity: 80,
        ticketsSold: 0,
        price: 20,
        organizer: adminUser._id,
      }
    ];

    await Event.insertMany(events);
    console.log('Seeded platform events successfully.');

    mongoose.connection.close();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
