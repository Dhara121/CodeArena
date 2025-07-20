const express = require('express');
const router = express.Router();
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
router.get('/username/:username', protect, getUserByUsername); // Move this up
router.post('/reactivate', reactivateAccount);

// General parameter routes should come AFTER specific ones
router.get('/:id', protect, getUserById);
router.put('/:id', protect, admin, updateUser);  
router.delete('/:id', protect, admin, deleteAccount);

module.exports = router;