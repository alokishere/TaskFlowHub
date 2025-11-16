import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/ContextProvider';
import { taskAPI } from '../../services/api';
import { validateTaskForm } from '../../utils/validation';

const CreateTask = ({ data, onTaskCreated }) => {
  const { employees } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    taskTitle: "",
    taskDescription: "",
    assignedTo: "",
    category: "",
    taskDate: ""
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    if (submitError) {
      setSubmitError("");
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const validationErrors = validateTaskForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setSubmitError("");

    try {
      const response = await taskAPI.createTask(formData);
      if (response.success) {
        setFormData({
          taskTitle: "",
          taskDescription: "",
          assignedTo: "",
          category: "",
          taskDate: ""
        });

        if (onTaskCreated) {
          onTaskCreated(response.data.task);
        }
      } else {
        setSubmitError('Failed to create task');
      }
    } catch (error) {
      setSubmitError(error.error || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start mt-10">
      <form onSubmit={submitHandler} className="bg-gray-800 shadow-2xl border border-emerald-700 rounded-2xl p-10 flex gap-10 w-full max-w-4xl">
        {/* Left Side */}
        <div className="flex flex-col gap-6 flex-1">
          <div>
            <h3 className="text-lg font-semibold text-emerald-400 mb-2">Task Title</h3>
            <input
              name="taskTitle"
              value={formData.taskTitle}
              onChange={handleInputChange}
              type="text"
              placeholder="Make a UI design"
              className={`w-full py-3 px-4 rounded-lg focus:ring-2 transition placeholder:text-gray-400 ${
                errors.taskTitle
                  ? 'bg-red-500 bg-opacity-10 text-white border border-red-500 focus:ring-red-500'
                  : 'bg-gray-900 text-white border border-emerald-700 focus:ring-emerald-500'
              }`}
            />
            {errors.taskTitle && (
              <p className="text-red-400 text-sm mt-1">{errors.taskTitle}</p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-emerald-400 mb-2">Date</h3>
            <input
              name="taskDate"
              value={formData.taskDate}
              onChange={handleInputChange}
              type="date"
              className={`w-full py-3 px-4 rounded-lg focus:ring-2 transition ${
                errors.taskDate
                  ? 'bg-red-500 bg-opacity-10 text-white border border-red-500 focus:ring-red-500'
                  : 'bg-gray-900 text-white border border-emerald-700 focus:ring-emerald-500'
              }`}
            />
            {errors.taskDate && (
              <p className="text-red-400 text-sm mt-1">{errors.taskDate}</p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-emerald-400 mb-2">Assign to</h3>
            <select
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleInputChange}
              className={`w-full py-3 px-4 rounded-lg focus:ring-2 transition ${
                errors.assignedTo
                  ? 'bg-red-500 bg-opacity-10 text-white border border-red-500 focus:ring-red-500'
                  : 'bg-gray-900 text-white border border-emerald-700 focus:ring-emerald-500'
              }`}
            >
              <option value="">Select Employee</option>
              {employees?.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName}
                </option>
              ))}
            </select>
            {errors.assignedTo && (
              <p className="text-red-400 text-sm mt-1">{errors.assignedTo}</p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-emerald-400 mb-2">Category</h3>
            <input
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              type="text"
              placeholder="Dev, Design etc"
              className={`w-full py-3 px-4 rounded-lg focus:ring-2 transition placeholder:text-gray-400 ${
                errors.category
                  ? 'bg-red-500 bg-opacity-10 text-white border border-red-500 focus:ring-red-500'
                  : 'bg-gray-900 text-white border border-emerald-700 focus:ring-emerald-500'
              }`}
            />
            {errors.category && (
              <p className="text-red-400 text-sm mt-1">{errors.category}</p>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex flex-col gap-6 flex-1 justify-between">
          <div>
            <h3 className="text-lg font-semibold text-emerald-400 mb-2">Description</h3>
            <textarea
              name="taskDescription"
              value={formData.taskDescription}
              onChange={handleInputChange}
              rows={8}
              placeholder="Describe the task in detail..."
              className={`w-full py-3 px-4 rounded-lg focus:ring-2 transition placeholder:text-gray-400 resize-none ${
                errors.taskDescription
                  ? 'bg-red-500 bg-opacity-10 text-white border border-red-500 focus:ring-red-500'
                  : 'bg-gray-900 text-white border border-emerald-700 focus:ring-emerald-500'
              }`}
            />
            {errors.taskDescription && (
              <p className="text-red-400 text-sm mt-1">{errors.taskDescription}</p>
            )}
          </div>

          {submitError && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-4 py-2 rounded-lg text-sm">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="py-3 px-6 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-semibold shadow-lg hover:scale-105 transition self-end disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
            ) : (
              "Create Task"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTask;