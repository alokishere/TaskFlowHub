import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { 
  Plus, Briefcase, Calendar, CheckCircle, Clock, 
  AlertCircle, Trash2, MoreVertical, ExternalLink,
  Target, Users, TrendingUp
} from 'lucide-react';
import API from '../../services/api';
import {imageBaseUrl} from '../../services/api';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const { data } = await API.get('/projects');
      setProjects(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const deleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project? This will also delete all associated tasks.')) {
      try {
        await API.delete(`/projects/${id}`);
        setProjects(projects.filter(p => p._id !== id));
      } catch (err) {
        alert('Failed to delete project');
      }
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/projects/${id}/status`, { status });
      fetchProjects();
    } catch (err) {
      alert('Failed to update project status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-600';
      case 'in-progress': return 'bg-blue-100 text-blue-600';
      default: return 'bg-orange-100 text-orange-600';
    }
  };

  if (loading) return <Layout role="admin"><div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div></Layout>;

  return (
    <Layout role="admin">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">Project Engine</h2>
          <p className="text-sm font-medium text-gray-500">Track execution and team performance</p>
        </div>
        <Link 
          to="/admin/projects/add"
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-purple-200 flex items-center justify-center gap-3 active:scale-95"
        >
          <Plus size={18} />
          Create New Project
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
        {projects.map((project) => (
          <div key={project._id} className="group bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-500 relative">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl shadow-sm ${getStatusColor(project.status)}`}>
                <Briefcase size={24} />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => deleteProject(project._id)}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-1">
                  <Clock size={10} />
                  {new Date(project.deadline).toLocaleDateString()}
                </span>
              </div>
              <Link to={`/admin/projects/${project._id}`} className="text-xl font-black text-gray-900 mb-3 block group-hover:text-purple-600 transition-colors line-clamp-1">{project.title}</Link>
              <p className="text-xs font-bold text-gray-400 mb-8 line-clamp-2 leading-relaxed">{project.description}</p>
            </div>

            <div className="mb-8 p-6 bg-gray-50/50 rounded-[2rem] border border-gray-50">
              <div className="flex justify-between items-end mb-3">
                <div className="flex items-center gap-2">
                  <Target size={14} className="text-purple-600" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress</span>
                </div>
                <span className="text-sm font-black text-gray-900">{project.progress}%</span>
              </div>
              <div className="h-2 bg-white rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`h-full transition-all duration-1000 ease-out ${project.progress === 100 ? 'bg-green-500' : 'bg-purple-600'}`} 
                  style={{ width: `${project.progress}%` }} 
                />
              </div>
              <div className="mt-4 flex justify-between text-[10px] font-black uppercase tracking-tighter">
                <div className="flex items-center gap-1 text-gray-400">
                  <Users size={12} />
                  <span>{project.assignedTo.length} Assigned</span>
                </div>
                <div className="text-purple-600">{project.completedTasks}/{project.taskCount} Tasks Done</div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                <span className="text-gray-400">Today Updates</span>
                <span className="text-blue-600">{project.todayUpdates || 0}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
              <div className="flex -space-x-3">
                {project.assignedTo.slice(0, 3).map((user) => (
                  <div key={user._id} className="w-10 h-10 rounded-xl border-4 border-white bg-white shadow-sm flex items-center justify-center text-[10px] font-black overflow-hidden relative group/avatar" title={user.name}>
                    {user.image ? <img src={`${imageBaseUrl}${user.image}`} alt={user.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-purple-50 text-purple-600 flex items-center justify-center">{user.name.charAt(0)}</div>}
                  </div>
                ))}
                {project.assignedTo.length > 3 && (
                  <div className="w-10 h-10 rounded-xl border-4 border-white bg-gray-50 shadow-sm flex items-center justify-center text-[10px] font-black text-gray-400">
                    +{project.assignedTo.length - 3}
                  </div>
                )}
              </div>
              
              <Link to={`/admin/projects/${project._id}`} className="p-3 bg-gray-50 text-gray-400 hover:bg-purple-600 hover:text-white rounded-xl transition-all shadow-sm">
                <ExternalLink size={18} />
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {projects.length === 0 && (
        <div className="text-center py-32 bg-white rounded-[3rem] border-4 border-dashed border-gray-50">
          <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} className="text-gray-200" />
          </div>
          <h3 className="text-xl font-black text-gray-800 mb-2">No projects running</h3>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Start by creating your first engine</p>
          <Link to="/admin/projects/add" className="mt-8 inline-block text-purple-600 font-black text-xs uppercase tracking-widest hover:underline">Launch Project Now</Link>
        </div>
      )}
    </Layout>
  );
};

export default Projects;
