const Project = require('../models/Project');
const User = require('../models/User');

// Get all projects (for current user)
const getAllProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { language, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build query
    const query = { owner: userId };
    if (language) {
      query.language = language;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const projects = await Project.find(query)
      .populate('owner', 'username avatar')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Project.countDocuments(query);

    res.json({
      message: 'Projects retrieved successfully',
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all projects error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Get public projects
const getPublicProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { language, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const projects = await Project.getPublicProjects(limit, page);

    const total = await Project.countDocuments({ isPublic: true });

    res.json({
      message: 'Public projects retrieved successfully',
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get public projects error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Get project by ID
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const project = await Project.findById(id).populate('owner', 'username avatar');
    
    if (!project) {
      return res.status(404).json({
        message: 'Project not found'
      });
    }

    // Check if user has permission to view this project
    if (!project.isPublic && (!userId || project.owner._id.toString() !== userId.toString())) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    res.json({
      message: 'Project retrieved successfully',
      project
    });
  } catch (error) {
    console.error('Get project by ID error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Create new project
const createProject = async (req, res) => {
  try {
    const { title, description, language, code, isPublic = false, tags = [], template = 'basic' } = req.body;
    const userId = req.user._id;

    const project = new Project({
      title,
      description,
      language,
      code,
      owner: userId,
      isPublic,
      tags,
      template
    });

    await project.save();
    
    // Populate owner information
    await project.populate('owner', 'username avatar');

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { title, description, language, code, isPublic, tags, template } = req.body;

    // Find project and check ownership
    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({
        message: 'Project not found'
      });
    }

    if (project.owner.toString() !== userId.toString()) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    // Update project fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (language !== undefined) updateData.language = language;
    if (code !== undefined) updateData.code = code;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (tags !== undefined) updateData.tags = tags;
    if (template !== undefined) updateData.template = template;

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner', 'username avatar');

    res.json({
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Update project error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({
        message: 'Project not found'
      });
    }

    if (project.owner.toString() !== userId.toString()) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    await Project.findByIdAndDelete(id);

    res.json({
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Fork project
const forkProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const originalProject = await Project.findById(id);
    
    if (!originalProject) {
      return res.status(404).json({
        message: 'Project not found'
      });
    }

    // Check if project is public or user owns it
    if (!originalProject.isPublic && originalProject.owner.toString() !== userId.toString()) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    // Create forked project
    const forkedProject = new Project({
      title: `${originalProject.title} (Fork)`,
      description: originalProject.description,
      language: originalProject.language,
      code: originalProject.code,
      owner: userId,
      isPublic: false, // Forks are private by default
      tags: originalProject.tags,
      template: originalProject.template,
      fork: {
        originalProject: originalProject._id,
        originalOwner: originalProject.owner
      }
    });

    await forkedProject.save();
    await forkedProject.populate('owner', 'username avatar');

    res.status(201).json({
      message: 'Project forked successfully',
      project: forkedProject
    });
  } catch (error) {
    console.error('Fork project error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Search projects
const searchProjects = async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userId = req.user?._id;

    if (!q) {
      return res.status(400).json({
        message: 'Search query is required'
      });
    }

    const searchRegex = new RegExp(q, 'i');
    
    // Build query based on user authentication
    const query = {
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } }
      ]
    };

    // If user is authenticated, show their projects + public projects
    // If not authenticated, show only public projects
    if (userId) {
      query.$and = [
        {
          $or: [
            { owner: userId },
            { isPublic: true }
          ]
        }
      ];
    } else {
      query.isPublic = true;
    }

    const projects = await Project.find(query)
      .populate('owner', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Project.countDocuments(query);

    res.json({
      message: 'Search results',
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Search projects error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Get project templates
const getTemplates = async (req, res) => {
  try {
    const { language } = req.query;
    
    const templates = {
      javascript: {
        basic: 'console.log("Hello, World!");',
        algorithm: '// Algorithm implementation\nfunction solution(input) {\n    // Your code here\n    return result;\n}\n\nconsole.log(solution("test"));',
        web: '// Web development code\ndocument.addEventListener("DOMContentLoaded", function() {\n    // Your code here\n});',
        api: '// API endpoint\nconst express = require("express");\nconst app = express();\n\napp.get("/", (req, res) => {\n    res.json({ message: "Hello, World!" });\n});\n\napp.listen(3000);'
      },
      python: {
        basic: 'print("Hello, World!")',
        algorithm: '# Algorithm implementation\ndef solution(input_data):\n    # Your code here\n    return result\n\nif __name__ == "__main__":\n    print(solution("test"))',
        web: '# Web application\nfrom flask import Flask, render_template\n\napp = Flask(__name__)\n\n@app.route("/")\ndef home():\n    return "Hello, World!"\n\nif __name__ == "__main__":\n    app.run(debug=True)',
        api: '# API endpoint\nfrom flask import Flask, jsonify\n\napp = Flask(__name__)\n\n@app.route("/api/hello")\ndef hello():\n    return jsonify({"message": "Hello, World!"})\n\nif __name__ == "__main__":\n    app.run(debug=True)'
      },
      java: {
        basic: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
        algorithm: 'public class Solution {\n    public static void main(String[] args) {\n        // Your algorithm here\n        System.out.println("Result: " + solution("test"));\n    }\n    \n    public static String solution(String input) {\n        // Your code here\n        return "result";\n    }\n}'
      }
    };

    if (language && templates[language]) {
      res.json({
        message: 'Templates retrieved successfully',
        templates: templates[language]
      });
    } else {
      res.json({
        message: 'All templates retrieved successfully',
        templates
      });
    }
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllProjects,
  getPublicProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  forkProject,
  searchProjects,
  getTemplates
};
