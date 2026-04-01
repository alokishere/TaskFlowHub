import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { ListTodo, CheckCircle, Clock, Timer, AlertCircle, Check, X } from 'lucide-react';
import API from '../../services/api';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const { data } = await API.get('/projects/my-tasks');
      setTasks(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const updateStatus = async (taskId, status) => {
    try {
      await API.patch(`/projects/tasks/${taskId}/status`, { status });
      fetchTasks();
    } catch (err) { alert('Failed'); }
  };

  const respondToAssignment = async (taskId, acceptanceStatus) => {
    try {
      await API.patch(`/projects/tasks/${taskId}/respond`, { acceptanceStatus });
      fetchTasks();
    } catch (err) { alert('Failed'); }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-600';
      case 'testing': return 'bg-purple-100 text-purple-600';
      case 'in-progress': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <Layout role="employee">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">My Tasks</h2>
          <p className="text-gray-400">Manage your specific project tasks and progress.</p>
        </div>
      </div>

      <div className="space-y-6">
        {tasks.map((task) => (
          <div key={task._id} className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-white">{task.projectId?.title || 'Project Task'}</h3>
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                    task.acceptanceStatus === 'accepted' ? 'bg-green-900/30 text-green-400' : 
                    task.acceptanceStatus === 'rejected' ? 'bg-red-900/30 text-red-400' : 'bg-yellow-900/30 text-yellow-400'
                  }`}>
                    {task.acceptanceStatus}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-4">{task.message}</p>
                
                {task.acceptanceStatus === 'pending' && (
                  <div className="flex gap-3 mb-4">
                    <button 
                      onClick={() => respondToAssignment(task._id, 'accepted')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-all"
                    >
                      <Check size={14}/> Accept Project
                    </button>
                    <button 
                      onClick={() => respondToAssignment(task._id, 'rejected')}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all"
                    >
                      <X size={14}/> Reject
                    </button>
                  </div>
                )}
              </div>

              {task.acceptanceStatus === 'accepted' && (
                <div className="flex flex-wrap gap-2">
                  {['pending', 'in-progress', 'testing', 'completed'].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(task._id, s)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                        task.status === s 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {!loading && tasks.length === 0 && (
          <div className="text-center py-20 bg-gray-900 border border-dashed border-gray-800 rounded-3xl">
            <ListTodo size={48} className="mx-auto text-gray-700 mb-4" />
            <h3 className="text-lg font-bold text-gray-500">No tasks assigned yet</h3>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyTasks;
