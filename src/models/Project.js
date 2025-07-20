const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    minlength: [1, 'Title must be at least 1 character long'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  // Renamed from 'language' to 'programmingLanguage' to avoid MongoDB text search conflict
  programmingLanguage: {
    type: String,
    required: [true, 'Programming language is required'],
    enum: {
      values: ['javascript', 'python', 'java', 'cpp', 'c', 'php', 'ruby', 'go', 'rust', 'typescript'],
      message: 'Language must be one of: javascript, python, java, cpp, c, php, ruby, go, rust, typescript'
    },
    default: 'javascript'
  },
  code: {
    type: String,
    required: [true, 'Code is required'],
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Project owner is required']
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  lastExecuted: {
    type: Date,
    default: null
  },
  executionCount: {
    type: Number,
    default: 0
  },
  template: {
    type: String,
    enum: ['basic', 'algorithm', 'web', 'api', 'game', 'other'],
    default: 'basic'
  },
  version: {
    type: Number,
    default: 1
  },
  fork: {
    originalProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null
    },
    originalOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
projectSchema.index({ owner: 1, createdAt: -1 });
projectSchema.index({ programmingLanguage: 1 }); // Updated field name
projectSchema.index({ isPublic: 1 });
projectSchema.index({ tags: 1 });

// Text index - now safe since we don't have a 'language' field
projectSchema.index({ title: 'text', description: 'text' });

// Virtual for project URL
projectSchema.virtual('url').get(function() {
  return `/projects/${this._id}`;
});

// Pre-save middleware to update version
projectSchema.pre('save', function(next) {
  if (this.isModified('code') && !this.isNew) {
    this.version += 1;
  }
  next();
});

// Instance method to increment execution count
projectSchema.methods.incrementExecution = async function() {
  this.executionCount += 1;
  this.lastExecuted = new Date();
  return await this.save();
};

// Static method to get public projects
projectSchema.statics.getPublicProjects = function(limit = 10, page = 1) {
  const skip = (page - 1) * limit;
  return this.find({ isPublic: true })
    .populate('owner', 'username avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to search projects
projectSchema.statics.searchProjects = function(query, userId = null) {
  const searchQuery = {
    $text: { $search: query }
  };
  
  if (userId) {
    searchQuery.$or = [
      { owner: userId },
      { isPublic: true }
    ];
  } else {
    searchQuery.isPublic = true;
  }
  
  return this.find(searchQuery)
    .populate('owner', 'username avatar')
    .sort({ score: { $meta: 'textScore' } });
};

module.exports = mongoose.model('Project', projectSchema);