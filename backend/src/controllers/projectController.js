const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { getLocalDateString } = require('../utils/time');
const { normalizeStoredPath } = require('../middleware/upload');
const { sendPushToUsers } = require('../utils/pushNotifications');

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

const normalizeAssigneeImages = (assignees = []) => assignees.map((assignee) => {
  const data = assignee.toObject ? assignee.toObject() : assignee;
  return {
    ...data,
    image: normalizeStoredPath(data.image)
  };
});

const hasOwn = (payload, key) => Object.prototype.hasOwnProperty.call(payload || {}, key);

const notifyAssignedEmployees = async (project, assignments = []) => {
  try {
    const assignedUserIds = (Array.isArray(assignments) ? assignments : [])
      .map((assignment) => assignment?.userId)
      .filter(Boolean);

    if (!assignedUserIds.length) return;

    await sendPushToUsers(assignedUserIds, {
      title: '📌 New Project Assigned',
      body: `You have been assigned to "${project.title}"`,
      data: {
        url: '/employee/my-projects',
        projectId: String(project._id)
      }
    });
  } catch (error) {
    console.error('Failed to notify assigned employees:', error.message);
  }
};

const notifyAdminsTaskCompleted = async (task, employeeName = 'An employee') => {
  try {
    const [project, admins] = await Promise.all([
      Project.findById(task.projectId).select('title'),
      User.find({ role: 'admin', status: 'active' }).select('_id')
    ]);

    const adminIds = admins.map((admin) => admin._id);
    if (!adminIds.length) return;

    await sendPushToUsers(adminIds, {
      title: '✅ Task Completed',
      body: `${employeeName} completed a task for "${project?.title || 'a project'}"`,
      data: {
        url: '/admin/projects',
        projectId: String(task.projectId)
      }
    });
  } catch (error) {
    console.error('Failed to notify admins for task completion:', error.message);
  }
};

const buildAssignmentInput = (assignments = []) => {
  if (!Array.isArray(assignments)) {
    const error = new Error('Assignments must be an array');
    error.status = 400;
    throw error;
  }

  const deduped = new Map();
  assignments.forEach((assignment) => {
    const userId = assignment?.userId ? String(assignment.userId) : '';
    if (!userId) {
      const error = new Error('Each assignment requires a userId');
      error.status = 400;
      throw error;
    }

    deduped.set(userId, {
      userId,
      message: typeof assignment.message === 'string' ? assignment.message : '',
      title: typeof assignment.title === 'string' ? assignment.title.trim() : ''
    });
  });

  return Array.from(deduped.values());
};

const applyProjectChanges = async (project, payload = {}) => {
  const titleProvided = hasOwn(payload, 'title');
  const descriptionProvided = hasOwn(payload, 'description');
  const deadlineProvided = hasOwn(payload, 'deadline');
  const statusProvided = hasOwn(payload, 'status');
  const assignmentsProvided = hasOwn(payload, 'assignments');

  if (titleProvided) {
    const title = String(payload.title || '').trim();
    if (!title) {
      const error = new Error('Project title is required');
      error.status = 400;
      throw error;
    }
    project.title = title;
  }

  if (descriptionProvided) {
    project.description = String(payload.description || '').trim();
  }

  if (deadlineProvided) {
    const nextDeadline = new Date(payload.deadline);
    if (Number.isNaN(nextDeadline.getTime())) {
      const error = new Error('Invalid project deadline');
      error.status = 400;
      throw error;
    }
    project.deadline = nextDeadline;
  }

  if (statusProvided) {
    const allowedStatuses = ['pending', 'in-progress', 'completed'];
    if (!allowedStatuses.includes(payload.status)) {
      const error = new Error('Invalid project status');
      error.status = 400;
      throw error;
    }
    project.status = payload.status;
  }

  if (assignmentsProvided) {
    const assignmentInput = buildAssignmentInput(payload.assignments);
    const assignedUserIds = assignmentInput.map((assignment) => assignment.userId);

    project.assignedTo = assignedUserIds;

    const currentTasks = await Task.find({ projectId: project._id });
    const taskByUserId = new Map(currentTasks.map((task) => [task.assignedTo.toString(), task]));

    await Task.deleteMany({
      projectId: project._id,
      assignedTo: { $nin: assignedUserIds }
    });

    for (const assignment of assignmentInput) {
      const existingTask = taskByUserId.get(assignment.userId);
      const nextTaskTitle = assignment.title || `Task for ${project.title}`;

      if (existingTask) {
        existingTask.title = nextTaskTitle;
        existingTask.message = assignment.message;
        await existingTask.save();
      } else {
        await Task.create({
          projectId: project._id,
          assignedTo: assignment.userId,
          title: nextTaskTitle,
          message: assignment.message,
          status: 'pending',
          progressPercent: 0,
          progressHistory: []
        });
      }
    }
  } else if (titleProvided) {
    await Task.updateMany(
      { projectId: project._id },
      { $set: { title: `Task for ${project.title}` } }
    );
  }

  await project.save();
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

    await notifyAssignedEmployees(project, assignments);

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
        assignedTo: normalizeAssigneeImages(project.assignedTo),
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
        assignedTo: normalizeAssigneeImages(project.assignedTo),
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
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await applyProjectChanges(project, req.body || {});
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const modifyProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await applyProjectChanges(project, req.body || {});
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
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

    const wasCompleted = task.status === 'completed';
    task.status = status;
    if (status === 'completed') {
      task.progressPercent = 100;
      task.progressUpdatedAt = new Date();
      upsertTodayProgress(task, 100, 'Marked completed');
    }
    await task.save();

    if (!wasCompleted && task.status === 'completed') {
      await notifyAdminsTaskCompleted(task, req.user.name);
    }

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
    const wasCompleted = task.status === 'completed';

    task.progressPercent = normalizedProgress;
    task.progressUpdatedAt = new Date();
    upsertTodayProgress(task, normalizedProgress, normalizedNote);

    if (normalizedProgress === 100) {
      task.status = 'completed';
    } else if (normalizedProgress > 0 && task.status === 'pending') {
      task.status = 'in-progress';
    }

    await task.save();

    if (!wasCompleted && task.status === 'completed') {
      await notifyAdminsTaskCompleted(task, req.user.name);
    }

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
  modifyProject,
  deleteProject,
  updateProjectStatus,
  getEmployeeProjects,
  getEmployeeTasks,
  updateTaskStatus,
  updateTaskProgress,
  respondToProjectAssignment
};
