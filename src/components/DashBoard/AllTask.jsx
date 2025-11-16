import React, { useState } from 'react';
import { taskAPI } from '../../services/api';

const TaskCard = ({ task, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'newTask': return 'text-blue-600 bg-blue-100';
      case 'active': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-gray-800 border border-emerald-700 rounded-lg p-4 shadow-lg">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">{task.taskTitle}</h3>
          <p className="text-gray-300 text-sm mb-3 line-clamp-2">{task.taskDescription}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
              {task.category}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              {formatDate(task.taskDate)}
            </span>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onEdit(task)}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            title="Edit Task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            title="Delete Task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Assigned to:</span>
          <span className="text-emerald-400 font-medium">
            {task.assignedTo?.firstName || 'Unknown'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Created by:</span>
          <span className="text-emerald-400 font-medium">
            {task.assignedBy?.firstName || 'Unknown'}
          </span>
        </div>
      </div>
    </div>
  );
};

const AllTask = ({ tasks, onTaskUpdated, onTaskDeleted }) => {
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState({});

  const handleEdit = (task) => {
    setEditingTask(task);
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    setLoading(prev => ({ ...prev, [taskId]: true }));

    try {
      await taskAPI.deleteTask(taskId);
      if (onTaskDeleted) {
        onTaskDeleted(taskId);
      }
    } catch (error) {
      alert('Failed to delete task: ' + (error.error || 'Unknown error'));
    } finally {
      setLoading(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const handleUpdate = async (updatedData) => {
    if (!editingTask) return;

    setLoading(prev => ({ ...prev, [editingTask._id]: true }));

    try {
      const response = await taskAPI.updateTask(editingTask._id, updatedData);
      if (onTaskUpdated) {
        onTaskUpdated(response.data.task);
      }
      setEditingTask(null);
    } catch (error) {
      alert('Failed to update task: ' + (error.error || 'Unknown error'));
    } finally {
      setLoading(prev => ({ ...prev, [editingTask._id]: false }));
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  if (editingTask) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 border border-emerald-700 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-emerald-400 mb-6">Edit Task</h2>

          <EditTaskForm
            task={editingTask}
            onSubmit={handleUpdate}
            onCancel={handleCancelEdit}
            loading={loading[editingTask._id]}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold text-emerald-400 mb-6">All Tasks</h2>

      {tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-lg">No tasks created yet</p>
          <p className="text-sm mt-2">Create your first task to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const EditTaskForm = ({ task, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    taskTitle: task.taskTitle,
    taskDescription: task.taskDescription,
    taskDate: new Date(task.taskDate).toISOString().split('T')[0],
    category: task.category,
    assignedTo: task.assignedTo?._id
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-emerald-400 mb-2">Task Title</label>
        <input
          type="text"
          name="taskTitle"
          value={formData.taskTitle}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-gray-900 text-white border border-emerald-700 rounded-lg focus:ring-2 focus:ring-emerald-500"
          required
        />
      </div>

      <div>
        <label className="block text-emerald-400 mb-2">Description</label>
        <textarea
          name="taskDescription"
          value={formData.taskDescription}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 bg-gray-900 text-white border border-emerald-700 rounded-lg focus:ring-2 focus:ring-emerald-500 resize-none"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-emerald-400 mb-2">Date</label>
          <input
            type="date"
            name="taskDate"
            value={formData.taskDate}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-900 text-white border border-emerald-700 rounded-lg focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        <div>
          <label className="block text-emerald-400 mb-2">Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-900 text-white border border-emerald-700 rounded-lg focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Task'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AllTask;