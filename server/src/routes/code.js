// routes/code.js
const express = require('express');
const router = express.Router();

const {
  executeCode,
  getSupportedLanguages,
  getCreditInfo,
  executeWithCustomIO,
  validateCode
} = require('../controllers/codeController');

const { protect } = require('../middleware/auth');
const { validateCodeExecution } = require('../middleware/validation');

router.post('/execute', protect, validateCodeExecution, executeCode);
router.post('/execute-with-tests', protect, validateCodeExecution, executeWithCustomIO);
router.post('/validate', protect, validateCode);
router.get('/languages', getSupportedLanguages);
router.get('/credits', protect, getCreditInfo);

const {
  saveCode,
  getSavedCodes,
  deleteCode,
} = require('../controllers/savedCodeController'); // Adjust path if different

router.post('/save', protect, saveCode);
router.get('/saved', protect, getSavedCodes);
router.delete('/:id', protect, deleteCode);


module.exports = router;