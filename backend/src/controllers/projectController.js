const Project = require('../models/Project');
const User = require('../models/User');

const createProject = async (req, res, next) => {
  try {
    const { title, description = '', assignedTo } = req.body;

    if (!title || !assignedTo) {
      return res.status(400).json({ success: false, error: 'Title and assigned employee are required' });
    }

    const employee = await User.findById(assignedTo);
    if (!employee || employee.role !== 'employee') {
      return res.status(400).json({ success: false, error: 'Assigned user must be an employee' });
    }

    const project = await Project.create({
      title: title.trim(),
      description: description.trim(),
      assignedTo,
      createdBy: req.user._id
    });

    await project.populate('assignedTo', 'name email');
    await project.populate('createdBy', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Project created',
      data: { project }
    });
  } catch (error) {
    return next(error);
  }
};

const listProjects = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { assignedTo: req.user._id };

    const projects = await Project.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: { projects } });
  } catch (error) {
    return next(error);
  }
};

module.exports = { createProject, listProjects };
