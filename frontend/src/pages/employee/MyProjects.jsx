import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { Briefcase, Calendar, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import API from '../../services/api';

const MyProjects = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        API.get('/projects/my-projects'),
        API.get('/projects/my-tasks')
      ]);
      setProjects(projRes.data.data);
      setTasks(taskRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateTaskStatus = async (taskId, status) => {
    try {
      await API.patch(`/projects/tasks/${taskId}/status`, { status });
      fetchData();
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  return (
    <Layout role="employee">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Projects</h2>
          <p className="text-gray-500">View and manage projects assigned to you.</p>
        </div>
      </div>

      <div className="space-y-8">
        {projects.map((project) => {
          const projectTasks = tasks.filter(t => t.projectId?._id === project._id);
          return (
            <div key={project._id} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                    <Briefcase size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{project.title}</h3>
                    <div className="flex items-center gap-4 text-sm font-medium">
                      <span className="flex items-center gap-1 text-gray-400">
                        <Calendar size={16} />
                        Deadline: {new Date(project.deadline).toLocaleDateString()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider ${
                        project.status === 'completed' ? 'bg-green-100 text-green-600' : 
                        project.status === 'in-progress' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Description</h4>
                  <p className="text-gray-600 leading-relaxed">{project.description}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">My Tasks</h4>
                  <div className="space-y-3">
                    {projectTasks.map((task) => (
                      <div key={task._id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-start gap-3">
                            <MessageSquare size={18} className="text-blue-500 mt-1" />
                            <p className="text-sm text-gray-700 font-medium">{task.message}</p>
                          </div>
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                            task.status === 'done' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => updateTaskStatus(task._id, 'pending')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${task.status === 'pending' ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'bg-white text-gray-400 hover:bg-gray-100'}`}
                          >
                            Pending
                          </button>
                          <button 
                            onClick={() => updateTaskStatus(task._id, 'done')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${task.status === 'done' ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'bg-white text-gray-400 hover:bg-gray-100'}`}
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    ))}
                    {projectTasks.length === 0 && (
                      <p className="text-sm text-gray-400 italic">No specific tasks assigned for this project.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {!loading && projects.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <Briefcase size={64} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-gray-400">No projects assigned to you yet</h3>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyProjects;
