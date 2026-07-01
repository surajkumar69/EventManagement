import User from '../models/User.js';
import Event from '../models/Event.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';

// @desc    Get dashboard overview stats & graphs
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalBookings = await Booking.countDocuments({ paymentStatus: 'paid' });

    // Aggregate total revenue
    const revenueResult = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Get 5 recent bookings
    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('event', 'title price')
      .sort({ createdAt: -1 })
      .limit(6);

    // Get monthly sales data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Set to start of month
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlySales = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          tickets: { $sum: '$ticketsBooked' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Format monthly sales data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthlyData = [];

    // Initialize 6 months structure
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const monthIndex = d.getMonth();
      const monthLabel = monthNames[monthIndex];

      const match = monthlySales.find(
        (item) => item._id.year === year && item._id.month === monthIndex + 1
      );

      formattedMonthlyData.push({
        month: monthLabel,
        revenue: match ? match.revenue : 0,
        tickets: match ? match.tickets : 0,
      });
    }

    // Category Sales breakdown
    const categorySales = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $lookup: {
          from: 'events',
          localField: 'event',
          foreignField: '_id',
          as: 'eventDetails',
        },
      },
      { $unwind: '$eventDetails' },
      {
        $group: {
          _id: '$eventDetails.category',
          sales: { $sum: '$ticketsBooked' },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $project: { name: '$_id', value: '$sales', revenue: '$revenue', _id: 0 } },
    ]);

    res.json({
      stats: {
        totalUsers,
        totalEvents,
        totalBookings,
        totalRevenue,
      },
      recentBookings,
      monthlyData: formattedMonthlyData,
      categoryData: categorySales,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (admin only)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res, next) => {
  const { role } = req.body;

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot change your own role');
    }

    user.role = role || user.role;
    await user.save();

    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot delete your own admin account');
    }

    // Optional: Delete user's bookings or set user reference to null
    await Booking.deleteMany({ user: req.params.id });
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User and their bookings removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (admin only)
// @route   GET /api/admin/bookings
// @access  Private/Admin
export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({})
      .populate('user', 'name email')
      .populate('event', 'title price date location')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment report list
// @route   GET /api/admin/payments
// @access  Private/Admin
export const getPaymentReports = async (req, res, next) => {
  try {
    const payments = await Payment.find({})
      .populate('user', 'name email')
      .populate('event', 'title price')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    next(error);
  }
};
