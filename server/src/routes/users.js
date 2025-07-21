const express = require('express');
const router = express.Router();
const SavedCode = require('../models/SavedCode');
const User = require('../models/User');


const {
  getAllUsers,
  getUserById,
  getUserByUsername,
  updateUser,       
  deleteAccount,
  reactivateAccount,
  getUserStats,
  searchUsers
} = require('../controllers/userController');

const { protect, admin } = require('../middleware/auth');

// More specific routes should come BEFORE general parameter routes
router.get('/', protect, admin, getAllUsers);
router.get('/search', protect, searchUsers);
router.get('/stats', protect, getUserStats);
router.get('/username/:username', protect, getUserByUsername);
router.post('/reactivate', reactivateAccount);

router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('username email');
    const savedCodes = await SavedCode.find({ user: req.user.id });
    res.json({ user, savedCodes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load profile data' });
  }
});

// Must be below
router.get('/:id', protect, getUserById);
router.put('/:id', protect, admin, updateUser);  
router.delete('/:id', protect, admin, deleteAccount);


module.exports = router;