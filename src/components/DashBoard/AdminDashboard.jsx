import React, { useContext, useEffect, useState } from "react";
import Header from "../other/Header";
import CreateTask from "../other/CreateTask";
import AllTask from "./AllTask";
import { AuthContext } from "../../context/ContextProvider";
import { taskAPI, userAPI } from "../../services/api";

const AdminDashboard = ({ data, changeUser }) => {
  const { refreshUserData, refreshEmployees } = useContext(AuthContext);
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

  const handleTaskCreated = async (newTask) => {
    try {
      setTasks(prev => [newTask, ...prev]);
      await refreshEmployees();
    } catch (error) {
      console.error('Error refreshing after task creation:', error);
    }
  };

  const handleTaskUpdated = async (updatedTask) => {
    try {
      setTasks(prev =>
        prev.map(task =>
          task._id === updatedTask._id ? updatedTask : task
        )
      );
      await refreshEmployees();
    } catch (error) {
      console.error('Error refreshing after task update:', error);
    }
  };

  const handleTaskDeleted = async (taskId) => {
    try {
      setTasks(prev => prev.filter(task => task._id !== taskId));
      await refreshEmployees();
    } catch (error) {
      console.error('Error refreshing after task deletion:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-10 min-h-screen bg-gradient-to-br from-gray-900 to-emerald-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 min-h-screen bg-gradient-to-br from-gray-900 to-emerald-900 flex items-center justify-center">
        <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-6 py-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 min-h-screen bg-gradient-to-br from-gray-900 to-emerald-900">
      <Header changeUser={changeUser} name={data?.firstName || "Admin"} data={data} />
      <CreateTask data={data} onTaskCreated={handleTaskCreated} />
      <AllTask
        data={data}
        tasks={tasks}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
      />
    </div>
  );
};

export default AdminDashboard;
