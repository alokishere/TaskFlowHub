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
    const projects = await Project.find().populate('assignedTo', 'name email image department');
    
    // Add progress and task info to each project
    const projectsWithProgress = await Promise.all(projects.map(async (p) => {
      const tasks = await Task.find({ projectId: p._id });
      const completed = tasks.filter(t => t.status === 'completed').length;
      const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
      
      return {
        ...p.toObject(),
        taskCount: tasks.length,
        completedTasks: completed,
        progress
      };
    }));

    res.status(200).json({
      success: true,
      data: projectsWithProgress
    });
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('assignedTo', 'name email image department');
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const tasks = await Task.find({ projectId: project._id }).populate('assignedTo', 'name');
    const completed = tasks.filter(t => t.status === 'completed').length;
    const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        ...project.toObject(),
        tasks,
        taskCount: tasks.length,
        completedTasks: completed,
        progress
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { title, description, deadline, status, assignments } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (title) project.title = title;
    if (description) project.description = description;
    if (deadline) project.deadline = deadline;
    if (status) project.status = status;
    
    if (assignments) {
      project.assignedTo = assignments.map(a => a.userId);
      
      // Sync Tasks
      const currentTasks = await Task.find({ projectId: project._id });
      const currentAssignedIds = currentTasks.map(t => t.assignedTo.toString());
      const newAssignedIds = assignments.map(a => a.userId.toString());

      // 1. Remove tasks for users no longer assigned
      await Task.deleteMany({ 
        projectId: project._id, 
        assignedTo: { $nin: assignments.map(a => a.userId) } 
      });

      // 2. Update or Create tasks
      for (const assignment of assignments) {
        const existingTask = currentTasks.find(t => t.assignedTo.toString() === assignment.userId.toString());
        if (existingTask) {
          existingTask.message = assignment.message;
          await existingTask.save();
        } else {
          await Task.create({
            projectId: project._id,
            assignedTo: assignment.userId,
            title: `Task for ${project.title}`,
            message: assignment.message,
            status: 'pending'
          });
        }
      }
    }

    await project.save();
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    // Also delete associated tasks
    await Task.deleteMany({ projectId: req.params.id });
    
    res.status(200).json({ success: true, message: 'Project deleted' });
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

const respondToProjectAssignment = async (req, res, next) => {
  try {
    const { acceptanceStatus } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (task.assignedTo.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    task.acceptanceStatus = acceptanceStatus;
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
  getProjectById,
  updateProject,
  deleteProject,
  updateProjectStatus,
  getEmployeeProjects,
  getEmployeeTasks,
  updateTaskStatus,
  respondToProjectAssignment
};
