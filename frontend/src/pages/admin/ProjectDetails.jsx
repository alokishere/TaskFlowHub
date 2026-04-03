import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import {
  ArrowLeft,
  Users,
  CheckCircle,
  Trash2,
  Gauge,
  Activity
} from 'lucide-react';
import API, { imageBaseUrl } from '../../services/api';
import { useProjectDetails } from '../../hooks/useQueries';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const todayKey = useMemo(() => new Date().toLocaleDateString('en-CA'), []);

  const { data, isLoading } = useProjectDetails(id);

  const deleteProjMutation = useMutation({
    mutationFn: async () => {
      await API.delete(`/projects/${id}`);
    },
    onSuccess: () => {
      navigate('/admin/projects');
    },
    onError: () => {
      alert('Failed to delete project');
    },
  });

  const deleteProj = () => {
    if (window.confirm('Delete project?')) {
      deleteProjMutation.mutate();
    }
  };

  const getTaskProgress = (task) => {
    if (typeof task.progressPercent === 'number') return task.progressPercent;
    return task.status === 'completed' ? 100 : 0;
  };

  if (isLoading) return <Layout role="admin"><div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div></Layout>;
  if (!data) return <Layout role="admin">Project not found</Layout>;

  return (
    <Layout role="admin">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="rounded-lg p-2 transition hover:bg-gray-100">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Project Details</h2>
        </div>
        <button onClick={deleteProj} disabled={deleteProjMutation.isPending} className="rounded-lg bg-red-100 p-2 text-red-600">
          <Trash2 size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-3xl font-bold text-gray-900">{data.title}</h3>
                <p className="mt-2 text-gray-500">{data.description}</p>
              </div>
              <span className={`rounded-full px-4 py-1 text-xs font-black uppercase tracking-wider ${
                data.status === 'completed'
                  ? 'bg-green-100 text-green-600'
                  : data.status === 'in-progress'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-orange-100 text-orange-600'
              }`}>
                {data.status}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-6 md:grid-cols-3">
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Deadline</p>
                <p className="mt-1 font-bold text-gray-800">{new Date(data.deadline).toLocaleDateString()}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Overall Progress</p>
                <p className="mt-1 text-xl font-black text-blue-600">{data.progress || 0}%</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Updates Today</p>
                <p className="mt-1 text-xl font-black text-violet-600">{data.todayUpdates || 0}</p>
              </div>
            </div>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full bg-linear-to-r from-blue-500 to-cyan-400 transition-all duration-700"
                style={{ width: `${Math.max(0, Math.min(100, data.progress || 0))}%` }}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <h4 className="mb-6 flex items-center gap-2 font-bold text-gray-800">
              <CheckCircle size={20} className="text-green-600" />
              Task Execution Board
            </h4>
            <div className="space-y-4">
              {data.tasks?.map((task) => {
                const taskProgress = getTaskProgress(task);
                const todayUpdate = task.progressHistory?.find((entry) => entry.date === todayKey);
                return (
                  <div key={task._id} className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-gray-800">{task.message}</p>
                        <p className="text-xs text-gray-500">Assigned to: {task.assignedTo?.name || 'Unassigned'}</p>
                      </div>
                      <span className={`rounded-md px-2 py-1 text-[10px] font-black uppercase ${
                        task.status === 'completed'
                          ? 'bg-green-100 text-green-600'
                          : task.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-600'
                            : task.status === 'testing'
                              ? 'bg-violet-100 text-violet-600'
                              : 'bg-orange-100 text-orange-600'
                      }`}>
                        {task.status}
                      </span>
                    </div>

                    <div className="mb-2 flex items-center justify-between text-xs font-bold text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <Gauge size={13} />
                        Employee progress
                      </span>
                      <span>{taskProgress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-linear-to-r from-cyan-500 to-blue-500 transition-all duration-700"
                        style={{ width: `${Math.max(0, Math.min(100, taskProgress))}%` }}
                      />
                    </div>

                    <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3">
                      <p className="mb-1 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-blue-600">
                        <Activity size={12} />
                        Today&apos;s update
                      </p>
                      <p className="text-xs text-blue-900">
                        {todayUpdate?.note || 'No update note submitted today.'}
                      </p>
                      <p className="mt-1 text-[11px] text-blue-700">
                        {todayUpdate
                          ? `Updated at ${new Date(todayUpdate.updatedAt).toLocaleTimeString()}`
                          : 'Waiting for employee progress update'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="h-fit rounded-3xl border border-gray-100 bg-white p-8 shadow-sm lg:col-span-1">
          <h4 className="mb-6 flex items-center gap-2 font-bold text-gray-800">
            <Users size={20} className="text-blue-600" />
            Assigned Team
          </h4>
          <div className="space-y-4">
            {data.assignedTo?.map((employee) => (
              <div key={employee._id} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-purple-100 font-bold text-purple-600">
                  {employee.image ? (
                    <img src={`${imageBaseUrl}${employee.image}`} alt={employee.name} className="h-full w-full object-cover" />
                  ) : (
                    employee.name.charAt(0)
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{employee.name}</p>
                  <p className="text-[10px] font-bold uppercase text-gray-400">{employee.department}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectDetails;
