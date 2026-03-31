const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

const createProject = async (req, res, next) => {
  try {
    const { title, description, deadline, assignments } = req.body;
    // assignments: [{ userId, message }]

    const project = await Project.create({
      title,
      description,
      deadline,
      assignedTo: assignments ? assignments.map(a => a.userId) : []
    });

    if (assignments && assignments.length > 0) {
      const tasks = assignments.map(a => ({
        projectId: project._id,
        assignedTo: a.userId,
        title: `Task for ${project.title}`,
        message: a.message,
        status: 'pending'
      }));
      await Task.insertMany(tasks);
    }

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

const getAllProjects = async (req, res, next) => {
  try {
    const projects = await Project.find().populate('assignedTo', 'name email image');
    res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

const updateProjectStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.status = status;
    await project.save();

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeeProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ assignedTo: req.user.id });
    
    // For each project, also get the specific task message for this employee
    const projectWithTasks = await Promise.all(projects.map(async (p) => {
      const task = await Task.findOne({ projectId: p._id, assignedTo: req.user.id });
      return {
        ...p.toObject(),
        taskMessage: task ? task.message : ''
      };
    }));

    res.status(200).json({
      success: true,
      data: projectWithTasks
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeeTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id }).populate('projectId', 'title');
    res.status(200).json({
      success: true,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    
    if (task.assignedTo.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    task.status = status;
    await task.save();

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getAllProjects,
  updateProjectStatus,
  getEmployeeProjects,
  getEmployeeTasks,
  updateTaskStatus
};
