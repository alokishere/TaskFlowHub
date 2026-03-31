import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { Plus, Briefcase, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
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

  return (
    <Layout role="admin">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Project Management</h2>
          <p className="text-gray-500">Track and assign work to your teams.</p>
        </div>
        <Link 
          to="/admin/projects/add"
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-purple-100"
        >
          <Plus size={20} />
          Create Project
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project._id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${getStatusColor(project.status)}`}>
                <Briefcase size={24} />
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
            <p className="text-gray-500 text-sm mb-6 flex-1 line-clamp-3">{project.description}</p>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex -space-x-2">
                {project.assignedTo.slice(0, 3).map((user) => (
                  <div key={user._id} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold overflow-hidden" title={user.name}>
                    {user.image ? <img src={`${imageBaseUrl}${user.image}`} alt={user.name} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                  </div>
                ))}
                {project.assignedTo.length > 3 && (
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                    +{project.assignedTo.length - 3}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                <Calendar size={14} />
                {new Date(project.deadline).toLocaleDateString()}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-50 grid grid-cols-3 gap-2">
              <button 
                onClick={() => updateStatus(project._id, 'pending')}
                className={`p-2 rounded-lg text-xs font-bold transition-all ${project.status === 'pending' ? 'bg-orange-600 text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
              >
                Pending
              </button>
              <button 
                onClick={() => updateStatus(project._id, 'in-progress')}
                className={`p-2 rounded-lg text-xs font-bold transition-all ${project.status === 'in-progress' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
              >
                In Progress
              </button>
              <button 
                onClick={() => updateStatus(project._id, 'completed')}
                className={`p-2 rounded-lg text-xs font-bold transition-all ${project.status === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
              >
                Done
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {!loading && projects.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-800">No projects yet</h3>
          <p className="text-gray-500">Start by creating your first project and assigning it to staff.</p>
        </div>
      )}
    </Layout>
  );
};

export default Projects;
