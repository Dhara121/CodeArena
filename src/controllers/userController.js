const User = require('../models/User');
const Project = require('../models/Project');

// Get all users (for admin or public profiles)
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({ isActive: true })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({ isActive: true });

    res.json({
      message: 'Users retrieved successfully',
      users: users.map(user => user.getPublicProfile()),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};
// Update user by ID (admin only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: user.getPublicProfile(),
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Get user's public projects
    const publicProjects = await Project.find({ 
      owner: id, 
      isPublic: true 
    })
    .select('title description language createdAt updatedAt')
    .sort({ createdAt: -1 })
    .limit(10);

    res.json({
      message: 'User retrieved successfully',
      user: user.getPublicProfile(),
      publicProjects
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Get user by username
const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username, isActive: true }).select('-password');
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Get user's public projects
    const publicProjects = await Project.find({ 
      owner: user._id, 
      isPublic: true 
    })
    .select('title description language createdAt updatedAt')
    .sort({ createdAt: -1 })
    .limit(10);

    res.json({
      message: 'User retrieved successfully',
      user: user.getPublicProfile(),
      publicProjects
    });
  } catch (error) {
    console.error('Get user by username error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Search users
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!q) {
      return res.status(400).json({
        message: 'Search query is required'
      });
    }

    const searchRegex = new RegExp(q, 'i');
    
    const users = await User.find({
      isActive: true,
      $or: [
        { username: searchRegex },
        { email: searchRegex },
        { bio: searchRegex }
      ]
    })
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await User.countDocuments({
      isActive: true,
      $or: [
        { username: searchRegex },
        { email: searchRegex },
        { bio: searchRegex }
      ]
    });

    res.json({
      message: 'Users search results',
      users: users.map(user => user.getPublicProfile()),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};


// Get user dashboard stats
const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's project statistics
    const totalProjects = await Project.countDocuments({ owner: userId });
    const publicProjects = await Project.countDocuments({ owner: userId, isPublic: true });
    const privateProjects = totalProjects - publicProjects;

    // Get projects by language
    const projectsByLanguage = await Project.aggregate([
      { $match: { owner: userId } },
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get recent activity
    const recentProjects = await Project.find({ owner: userId })
      .select('title language updatedAt')
      .sort({ updatedAt: -1 })
      .limit(5);

    // Get total execution count
    const executionStats = await Project.aggregate([
      { $match: { owner: userId } },
      { $group: { _id: null, totalExecutions: { $sum: '$executionCount' } } }
    ]);

    const totalExecutions = executionStats.length > 0 ? executionStats[0].totalExecutions : 0;

    res.json({
      message: 'User stats retrieved successfully',
      stats: {
        totalProjects,
        publicProjects,
        privateProjects,
        totalExecutions,
        projectsByLanguage,
        recentProjects
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Delete user account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: 'Password is required to delete account'
      });
    }

    // Find user and verify password
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const isValidPassword = await user.comparePassword(password);
    
    if (!isValidPassword) {
      return res.status(400).json({
        message: 'Invalid password'
      });
    }

    // Soft delete - deactivate account instead of actual deletion
    user.isActive = false;
    await user.save();

    // Optionally, also make all user's projects private
    await Project.updateMany(
      { owner: userId },
      { isPublic: false }
    );

    res.json({
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Reactivate user account (for future use)
const reactivateAccount = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: 'Email/username and password are required'
      });
    }

    const user = await User.findByEmailOrUsername(identifier);
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    if (user.isActive) {
      return res.status(400).json({
        message: 'Account is already active'
      });
    }

    const isValidPassword = await user.comparePassword(password);
    
    if (!isValidPassword) {
      return res.status(400).json({
        message: 'Invalid password'
      });
    }

    user.isActive = true;
    user.lastLogin = new Date();
    await user.save();

    res.json({
      message: 'Account reactivated successfully'
    });
  } catch (error) {
    console.error('Reactivate account error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByUsername,
  searchUsers,
  getUserStats,
  deleteAccount,
  reactivateAccount,
  updateUser, 
};

