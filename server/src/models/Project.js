const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'python', 'java', 'cpp', 'c', 'php', 'ruby', 'go', 'rust']
  },
  code: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  executionCount: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
projectSchema.index({ owner: 1, createdAt: -1 });
projectSchema.index({ language: 1 });
projectSchema.index({ isPublic: 1 });

// Method to increment execution count
projectSchema.methods.incrementExecution = async function() {
  this.executionCount += 1;
  return this.save();
};

// Static method to get user's projects
projectSchema.statics.getUserProjects = function(userId) {
  return this.find({ owner: userId }).sort({ createdAt: -1 });
};

// Static method to get public projects
projectSchema.statics.getPublicProjects = function() {
  return this.find({ isPublic: true }).populate('owner', 'name').sort({ createdAt: -1 });
};

module.exports = mongoose.model('Project', projectSchema);