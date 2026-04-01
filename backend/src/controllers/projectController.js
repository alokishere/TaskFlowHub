const Project = require('../models/Project');
const Task = require('../models/Task');
const { getLocalDateString } = require('../utils/time');

const getTaskProgressPercent = (task) => {
  if (typeof task.progressPercent === 'number') {
    return Math.max(0, Math.min(100, task.progressPercent));
  }
  return task.status === 'completed' ? 100 : 0;
};

const calculateProjectMetrics = (tasks) => {
  const taskCount = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === 'completed').length;
  const totalProgress = tasks.reduce((sum, task) => sum + getTaskProgressPercent(task), 0);
  const today = getLocalDateString();
  const todayUpdates = tasks.filter((task) => {
    if (!task.progressUpdatedAt) return false;
    return getLocalDateString(new Date(task.progressUpdatedAt)) === today;
  }).length;

  return {
    taskCount,
    completedTasks,
    progress: taskCount > 0 ? Math.round(totalProgress / taskCount) : 0,
    todayUpdates
  };
};

const upsertTodayProgress = (task, percent, note = '') => {
  const today = getLocalDateString();
  const now = new Date();
  const history = Array.isArray(task.progressHistory) ? task.progressHistory : [];
  const existingEntry = history.find((entry) => entry.date === today);

  if (existingEntry) {
    existingEntry.percent = percent;
    existingEntry.note = note || existingEntry.note || '';
    existingEntry.updatedAt = now;
  } else {
    history.push({
      date: today,
      percent,
      note,
      updatedAt: now
    });
  }

  task.progressHistory = history.slice(-60);
};

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
        status: 'pending',
        progressPercent: 0,
        progressHistory: []
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

    const projectIds = projects.map((project) => project._id);
    const allTasks = await Task.find({ projectId: { $in: projectIds } }).select(
      'projectId status progressPercent progressUpdatedAt'
    );
    const tasksByProjectId = allTasks.reduce((acc, task) => {
      const key = task.projectId.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(task);
      return acc;
    }, {});

    const projectsWithProgress = projects.map((project) => {
      const tasks = tasksByProjectId[project._id.toString()] || [];
      const metrics = calculateProjectMetrics(tasks);

      return {
        ...project.toObject(),
        ...metrics
      };
    });

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
    const metrics = calculateProjectMetrics(tasks);

    res.status(200).json({
      success: true,
      data: {
        ...project.toObject(),
        tasks,
        ...metrics
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
            status: 'pending',
            progressPercent: 0,
            progressHistory: []
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
        taskMessage: task ? task.message : '',
        taskStatus: task ? task.status : 'pending',
        taskAcceptanceStatus: task ? task.acceptanceStatus : 'pending',
        taskProgressPercent: task ? getTaskProgressPercent(task) : 0,
        taskProgressUpdatedAt: task ? task.progressUpdatedAt : null
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
    const tasks = await Task.find({ assignedTo: req.user.id }).populate('projectId', 'title deadline status');
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
    if (status === 'completed') {
      task.progressPercent = 100;
      task.progressUpdatedAt = new Date();
      upsertTodayProgress(task, 100, 'Marked completed');
    }
    await task.save();

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

const updateTaskProgress = async (req, res, next) => {
  try {
    const { progressPercent, note = '' } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.assignedTo.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (task.acceptanceStatus !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Accept the assignment before submitting progress updates'
      });
    }

    const parsedProgress = Number(progressPercent);
    if (!Number.isFinite(parsedProgress)) {
      return res.status(400).json({ success: false, message: 'Progress must be a valid number' });
    }

    const normalizedProgress = Math.max(0, Math.min(100, Math.round(parsedProgress)));
    const normalizedNote = String(note || '').trim();

    task.progressPercent = normalizedProgress;
    task.progressUpdatedAt = new Date();
    upsertTodayProgress(task, normalizedProgress, normalizedNote);

    if (normalizedProgress === 100) {
      task.status = 'completed';
    } else if (normalizedProgress > 0 && task.status === 'pending') {
      task.status = 'in-progress';
    }

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
    if (acceptanceStatus === 'rejected') {
      task.progressPercent = 0;
      task.progressUpdatedAt = null;
    }
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
  updateTaskProgress,
  respondToProjectAssignment
};
