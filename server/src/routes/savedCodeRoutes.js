const express = require('express');
const router = express.Router();
const { saveCode, getSavedCodes, deleteCode } = require('../controllers/savedCodeController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/', authenticateToken, saveCode);      // Save code
router.get('/', authenticateToken, getSavedCodes);  // Get all saved codes
router.delete('/:id', authenticateToken, deleteCode); // Delete a code

module.exports = router;
