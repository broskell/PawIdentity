import { User, Pet, ScanLog } from '../models/index.js';

export const getUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin role required.' });
    }
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Error in admin getUsers:', error);
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin role required.' });
    }

    const totalUsers = await User.countDocuments({});
    const totalPets = await Pet.countDocuments({});
    const missingPets = await Pet.countDocuments({ status: 'missing' });
    const totalScans = await ScanLog.countDocuments({});

    const recentScans = await ScanLog.find({})
      .populate('pet', 'name')
      .sort({ scannedAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        totalPets,
        missingPets,
        totalScans,
        recentScans
      }
    });
  } catch (error) {
    console.error('Error in admin getAnalytics:', error);
    res.status(500).json({ success: false, message: 'Server error fetching analytics' });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin role required.' });
    }

    const { userId, role } = req.body;
    if (!['owner', 'vet', 'shelter', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User role updated successfully', user });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ success: false, message: 'Server error updating user role' });
  }
};
