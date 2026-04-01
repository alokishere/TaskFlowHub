import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { Briefcase, Calendar, MessageSquare, Check, X, Clock, Play, TestTube, CheckCircle2 } from 'lucide-react';
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

  const respondToAssignment = async (taskId, acceptanceStatus) => {
    try {
      await API.patch(`/projects/tasks/${taskId}/respond`, { acceptanceStatus });
      fetchData();
    } catch (err) { alert('Failed'); }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await API.patch(`/projects/tasks/${taskId}/status`, { status });
      fetchData();
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={14} className="text-green-500" />;
      case 'testing': return <TestTube size={14} className="text-purple-500" />;
      case 'in-progress': return <Play size={14} className="text-blue-500" />;
      default: return <Clock size={14} className="text-gray-400" />;
    }
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
          <h2 className="text-2xl font-bold text-white">My Assigned Projects</h2>
          <p className="text-gray-400">Accept or reject new assignments and track project progress.</p>
        </div>
      </div>

      <div className="space-y-8">
        {projects.map((project) => {
          const projectTasks = tasks.filter(t => t.projectId?._id === project._id);
          return (
            <div key={project._id} className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-gray-800 pb-8">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-blue-900/30 text-blue-400 rounded-2xl border border-blue-800/50">
                    <Briefcase size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{project.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                      <span className="flex items-center gap-1 text-gray-500">
                        <Calendar size={16} />
                        Deadline: {new Date(project.deadline).toLocaleDateString()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        project.status === 'completed' ? 'bg-green-900/30 text-green-400' : 
                        project.status === 'in-progress' ? 'bg-blue-900/30 text-blue-400' : 'bg-orange-900/30 text-orange-400'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Project Overview</h4>
                  <p className="text-gray-400 leading-relaxed text-sm">{project.description}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Assignment Details</h4>
                  <div className="space-y-4">
                    {projectTasks.map((task) => (
                      <div key={task._id} className="p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50">
                        <div className="flex items-start justify-between gap-4 mb-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquare size={16} className="text-blue-400" />
                              <span className="text-xs font-bold text-gray-300">Admin Message:</span>
                            </div>
                            <p className="text-sm text-gray-400 italic leading-relaxed">"{task.message}"</p>
                          </div>
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                            task.acceptanceStatus === 'accepted' ? 'bg-green-900/30 text-green-400' : 
                            task.acceptanceStatus === 'rejected' ? 'bg-red-900/30 text-red-400' : 'bg-yellow-900/30 text-yellow-400'
                          }`}>
                            {task.acceptanceStatus}
                          </span>
                        </div>

                        {task.acceptanceStatus === 'pending' ? (
                          <div className="flex gap-3">
                            <button 
                              onClick={() => respondToAssignment(task._id, 'accepted')}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white text-xs font-black uppercase rounded-xl transition-all"
                            >
                              <Check size={16}/> Accept
                            </button>
                            <button 
                              onClick={() => respondToAssignment(task._id, 'rejected')}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase rounded-xl transition-all"
                            >
                              <X size={16}/> Reject
                            </button>
                          </div>
                        ) : task.acceptanceStatus === 'accepted' ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(task.status)}
                              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Current Status: {task.status}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {['in-progress', 'testing', 'completed'].map((s) => (
                                <button
                                  key={s}
                                  onClick={() => updateTaskStatus(task._id, s)}
                                  className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                                    task.status === s 
                                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                                      : 'bg-gray-800 text-gray-500 hover:bg-gray-700 border border-gray-700'
                                  }`}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-red-400 font-bold text-center py-2 bg-red-900/10 rounded-lg">You have rejected this assignment.</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {!loading && projects.length === 0 && (
          <div className="text-center py-24 bg-gray-900 border border-dashed border-gray-800 rounded-3xl">
            <Briefcase size={64} className="mx-auto text-gray-800 mb-6" />
            <h3 className="text-xl font-bold text-gray-600">No projects assigned yet</h3>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyProjects;
