import React, { useContext, useEffect, useState } from 'react';
import Header from '../other/Header';
import TaskListNumber from '../other/TaskListNumber';
import TaskList from '../TaskList/TaskList';
import { AuthContext } from '../../context/ContextProvider';
import { taskAPI } from '../../services/api';

const EmployeeDashboard = ({ data, changeUser }) => {
  const { refreshUserData } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await taskAPI.getTasks();
        if (response.success) {
          setTasks(response.data.tasks || []);
        }
      } catch (error) {
        setError(error.error || 'Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    try {
      const response = await taskAPI.updateTaskStatus(taskId, newStatus);
      if (response.success) {
        setTasks(prev =>
          prev.map(task =>
            task._id === taskId ? response.data.task : task
          )
        );
        await refreshUserData();
      }
    } catch (error) {
      alert('Failed to update task status: ' + (error.error || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="p-10 h-screen bg-gradient-to-br from-gray-900 to-emerald-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading your tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 h-screen bg-gradient-to-br from-gray-900 to-emerald-900 flex items-center justify-center">
        <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-6 py-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  const enrichedData = {
    ...data,
    tasks
  };

  return (
    <>
      <div className='p-10 h-screen bg-gradient-to-br from-gray-900 to-emerald-900'>
        <Header changeUser={changeUser} data={data} />
        <TaskListNumber data={enrichedData} />
        <TaskList data={enrichedData} onStatusUpdate={handleTaskStatusUpdate} />
      </div>
    </>
  );
};

export default EmployeeDashboard;