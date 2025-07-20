const validator = require('validator');

// Validate user registration
const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;
  const errors = [];

  // Username validation
  if (!username || username.trim().length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  
  if (username && username.length > 30) {
    errors.push('Username cannot exceed 30 characters');
  }
  
  if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }

  // Email validation
  if (!email || !validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  // Password validation
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (password && password.length > 128) {
    errors.push('Password cannot exceed 128 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validate user login
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Email validation
  if (!email || !validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  // Password validation
  if (!password || password.trim().length === 0) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validate project creation/update
const validateProject = (req, res, next) => {
  const { title, language, code } = req.body;
  const errors = [];

  // Title validation
  if (!title || title.trim().length < 1) {
    errors.push('Project title is required');
  }
  
  if (title && title.length > 100) {
    errors.push('Project title cannot exceed 100 characters');
  }

  // Language validation
  const supportedLanguages = ['javascript', 'python', 'java', 'cpp', 'c', 'php', 'ruby', 'go', 'rust'];
  if (!language || !supportedLanguages.includes(language)) {
    errors.push(`Language must be one of: ${supportedLanguages.join(', ')}`);
  }

  // Code validation
  if (!code || code.trim().length === 0) {
    errors.push('Code is required');
  }
  
  if (code && code.length > 100000) { // 100KB limit
    errors.push('Code cannot exceed 100KB');
  }

  // Description validation (optional)
  if (req.body.description && req.body.description.length > 500) {
    errors.push('Description cannot exceed 500 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validate code execution
const validateCodeExecution = (req, res, next) => {
  const { language, code } = req.body;
  const errors = [];

  // Language validation
  const supportedLanguages = ['javascript', 'python', 'java', 'cpp', 'c', 'php', 'ruby', 'go', 'rust'];
  if (!language || !supportedLanguages.includes(language)) {
    errors.push(`Language must be one of: ${supportedLanguages.join(', ')}`);
  }

  // Code validation
  if (!code || code.trim().length === 0) {
    errors.push('Code is required');
  }
  
  if (code && code.length > 50000) { // 50KB limit for execution
    errors.push('Code for execution cannot exceed 50KB');
  }

  // Input validation (optional)
  if (req.body.input && req.body.input.length > 10000) {
    errors.push('Input cannot exceed 10KB');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validate search query
const validateSearch = (req, res, next) => {
  const { query } = req.query;
  const errors = [];

  if (!query || query.trim().length === 0) {
    errors.push('Search query is required');
  }
  
  if (query && query.length > 100) {
    errors.push('Search query cannot exceed 100 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validate pagination parameters
const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;
  const errors = [];

  if (page && (!Number.isInteger(Number(page)) || Number(page) < 1)) {
    errors.push('Page must be a positive integer');
  }

  if (limit && (!Number.isInteger(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
    errors.push('Limit must be a positive integer between 1 and 100');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }

  // Set default values
  req.query.page = Number(page) || 1;
  req.query.limit = Number(limit) || 10;

  next();
};

// Validate ObjectId format
const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: `Invalid ${paramName} format`
      });
    }
    
    next();
  };
};

module.exports = {
  validateRegister,
  validateLogin,
  validateProject,
  validateCodeExecution,
  validateSearch,
  validatePagination,
  validateObjectId
};