// routes/projects.js
const express = require('express');
const router = express.Router();

const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  searchProjects,
} = require('../controllers/projectController');

const { protect } = require('../middleware/auth');
const { validateProject, validateObjectId, validateSearch } = require('../middleware/validation');

router.post('/', protect, validateProject, createProject);
router.get('/', protect, getAllProjects);
router.get('/search', protect, validateSearch, searchProjects);
router.get('/:id', protect, validateObjectId('id'), getProjectById);
router.put('/:id', protect, validateObjectId('id'), validateProject, updateProject);
router.delete('/:id', protect, validateObjectId('id'), deleteProject);


module.exports = router;