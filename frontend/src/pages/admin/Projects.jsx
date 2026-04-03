import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import {
  Plus,
  Briefcase,
  Clock,
  AlertCircle,
  Trash2,
  ExternalLink,
  Target,
  Users
} from 'lucide-react';
import API from '../../services/api';
import { imageBaseUrl } from '../../services/api';
import { useProjects } from '../../hooks/useQueries';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const Projects = () => {
  const queryClient = useQueryClient();
  const { data: projects = [], isLoading } = useProjects();

  const deleteProjectMutation = useMutation({
    mutationFn: async (id) => {
      await API.delete(`/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: () => {
      alert('Failed to delete project');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await API.patch(`/projects/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: () => {
      alert('Failed to update project status');
    },
  });

  const deleteProject = (id) => {
    if (window.confirm('Are you sure you want to delete this project? This will also delete all associated tasks.')) {
      deleteProjectMutation.mutate(id);
    }
  };

  const updateStatus = (id, status) => {
    updateStatusMutation.mutate({ id, status });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-600';
      case 'in-progress':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-orange-100 text-orange-600';
    }
  };

  if (isLoading) {
    return (
      <Layout role="admin">
        <div className="flex h-full items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="admin">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-gray-800 md:text-3xl">Project Engine</h2>
          <p className="text-sm font-medium text-gray-500">Track execution and team performance</p>
        </div>
        <Link
          to="/admin/projects/add"
          className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-purple-700 active:scale-95"
        >
          <Plus size={16} />
          Create New Project
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project._id}
            className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className={`rounded-lg p-2.5 ${getStatusColor(project.status)}`}>
                <Briefcase size={17} />
              </div>
              <button
                onClick={() => deleteProject(project._id)}
                disabled={deleteProjectMutation.isPending}
                className="rounded-lg p-2 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500"
                aria-label="Delete project"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-gray-300">
                  <Clock size={10} />
                  {new Date(project.deadline).toLocaleDateString()}
                </span>
              </div>
              <Link
                to={`/admin/projects/${project._id}`}
                className="mb-1 block line-clamp-1 text-lg font-black text-gray-900 transition-colors group-hover:text-purple-600"
              >
                {project.title}
              </Link>
              <p className="mb-5 line-clamp-2 text-xs font-semibold leading-relaxed text-gray-400">{project.description}</p>
            </div>

            <div className="mb-5 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <div className="mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target size={13} className="text-purple-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Progress</span>
                </div>
                <span className="text-sm font-black text-gray-900">{project.progress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white">
                <div
                  className={`h-full transition-all duration-1000 ease-out ${project.progress === 100 ? 'bg-green-500' : 'bg-purple-600'}`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] font-black uppercase tracking-wide">
                <div className="flex items-center gap-1 text-gray-400">
                  <Users size={11} />
                  <span>{project.assignedTo.length} Assigned</span>
                </div>
                <div className="text-purple-600">{project.completedTasks}/{project.taskCount} Tasks Done</div>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[10px] font-black uppercase tracking-wide">
                <span className="text-gray-400">Today Updates</span>
                <span className="text-blue-600">{project.todayUpdates || 0}</span>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
              <div className="flex -space-x-2">
                {project.assignedTo.slice(0, 3).map((user) => (
                  <div
                    key={user._id}
                    className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border-2 border-white bg-white text-[10px] font-black shadow-sm"
                    title={user.name}
                  >
                    {user.image ? (
                      <img src={`${imageBaseUrl}${user.image}`} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-purple-50 text-purple-600">
                        {user.name.charAt(0)}
                      </div>
                    )}
                  </div>
                ))}
                {project.assignedTo.length > 3 && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-white bg-gray-50 text-[10px] font-black text-gray-400 shadow-sm">
                    +{project.assignedTo.length - 3}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/admin/projects/edit/${project._id}`}
                  className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 transition hover:border-purple-200 hover:text-purple-600"
                >
                  Edit
                </Link>
                <Link
                  to={`/admin/projects/${project._id}`}
                  className="rounded-lg bg-gray-50 p-2 text-gray-500 transition hover:bg-purple-600 hover:text-white"
                >
                  <ExternalLink size={15} />
                </Link>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                disabled={updateStatusMutation.isPending}
                onClick={() => updateStatus(project._id, 'pending')}
                className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition ${project.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500 hover:bg-orange-50 hover:text-orange-600'}`}
              >
                Pending
              </button>
              <button
                type="button"
                disabled={updateStatusMutation.isPending}
                onClick={() => updateStatus(project._id, 'in-progress')}
                className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition ${project.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}
              >
                In Progress
              </button>
              <button
                type="button"
                disabled={updateStatusMutation.isPending}
                onClick={() => updateStatus(project._id, 'completed')}
                className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition ${project.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600'}`}
              >
                Done
              </button>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="rounded-3xl border-2 border-dashed border-gray-100 bg-white py-24 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
            <AlertCircle size={30} className="text-gray-300" />
          </div>
          <h3 className="mb-2 text-lg font-black text-gray-800">No projects running</h3>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Start by creating your first project</p>
          <Link to="/admin/projects/add" className="mt-6 inline-block text-xs font-black uppercase tracking-widest text-purple-600 hover:underline">
            Create Project
          </Link>
        </div>
      )}
    </Layout>
  );
};

export default Projects;
