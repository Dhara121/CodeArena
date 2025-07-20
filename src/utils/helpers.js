const jwt = require('jsonwebtoken');
const { JWT_CONFIG, PAGINATION } = require('./constants');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_CONFIG.SECRET,
    { expiresIn: JWT_CONFIG.EXPIRES_IN }
  );
};

// Create standardized API response
const createResponse = (success, message, data = null, meta = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  return response;
};

// Create success response
const successResponse = (message, data = null, meta = null) => {
  return createResponse(true, message, data, meta);
};

// Create error response
const errorResponse = (message, errors = null) => {
  const response = createResponse(false, message);
  
  if (errors) {
    response.errors = errors;
  }

  return response;
};

// Pagination helper
const getPaginationData = (page, limit, total) => {
  const currentPage = Math.max(1, parseInt(page) || PAGINATION.DEFAULT_PAGE);
  const itemsPerPage = Math.min(
    Math.max(1, parseInt(limit) || PAGINATION.DEFAULT_LIMIT),
    PAGINATION.MAX_LIMIT
  );
  
  const totalPages = Math.ceil(total / itemsPerPage);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;
  
  return {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems: total,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? currentPage + 1 : null,
    prevPage: hasPrevPage ? currentPage - 1 : null
  };
};

// Calculate skip value for pagination
const getSkipValue = (page, limit) => {
  const currentPage = Math.max(1, parseInt(page) || PAGINATION.DEFAULT_PAGE);
  const itemsPerPage = Math.min(
    Math.max(1, parseInt(limit) || PAGINATION.DEFAULT_LIMIT),
    PAGINATION.MAX_LIMIT
  );
  
  return (currentPage - 1) * itemsPerPage;
};

// Format execution time
const formatExecutionTime = (timeInMs) => {
  if (timeInMs < 1000) {
    return `${timeInMs}ms`;
  } else if (timeInMs < 60000) {
    return `${(timeInMs / 1000).toFixed(2)}s`;
  } else {
    const minutes = Math.floor(timeInMs / 60000);
    const seconds = ((timeInMs % 60000) / 1000).toFixed(2);
    return `${minutes}m ${seconds}s`;
  }
};

// Sanitize user data for public display
const sanitizeUserData = (user) => {
  const sanitized = {
    _id: user._id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
    bio: user.bio,
    preferences: user.preferences,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  // Add virtual fields if they exist
  if (user.fullName) {
    sanitized.fullName = user.fullName;
  }

  return sanitized;
};

// Sanitize project data for public display
const sanitizeProjectData = (project, includeCode = true) => {
  const sanitized = {
    _id: project._id,
    title: project.title,
    description: project.description,
    language: project.language,
    owner: project.owner,
    isPublic: project.isPublic,
    tags: project.tags,
    stats: project.stats,
    version: project.version,
    lastExecuted: project.lastExecuted,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt
  };

  if (includeCode) {
    sanitized.code = project.code;
  }

  // Add virtual fields if they exist
  if (project.executionCount !== undefined) {
    sanitized.executionCount = project.executionCount;
  }

  return sanitized;
};

// Handle async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Generate random string
const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

module.exports = {
  generateToken,
  createResponse,
  successResponse,
  errorResponse,
  getPaginationData,
  getSkipValue,
  formatExecutionTime,
  sanitizeUserData,
  sanitizeProjectData,
  asyncHandler,
  generateRandomString,
  isValidObjectId,
  formatFileSize
}; 
