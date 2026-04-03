import React from 'react';
import Layout from '../../components/Layout';
import { Briefcase, MessageSquare, Check, X } from 'lucide-react';
import API from '../../services/api';
import { useMyProjects, useMyTasks } from '../../hooks/useQueries';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const MyProjects = () => {
  const queryClient = useQueryClient();
  const { data: projects = [], isLoading: projectsLoading } = useMyProjects();
  const { data: tasks = [] } = useMyTasks();

  const respondMutation = useMutation({
    mutationFn: async ({ taskId, acceptanceStatus }) => {
      await API.patch(`/projects/tasks/${taskId}/respond`, { acceptanceStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProjects'] });
      queryClient.invalidateQueries({ queryKey: ['myTasks'] });
    },
    onError: () => {
      alert('Failed to update assignment response');
    },
  });

  const respondToAssignment = (taskId, acceptanceStatus) => {
    respondMutation.mutate({ taskId, acceptanceStatus });
  };

  if (projectsLoading) return <Layout role="employee"><div className="flex justify-center py-20"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600" /></div></Layout>;

  return (
    <Layout role="employee">
      <div className="mb-8 max-w-4xl space-y-3">
        <h2 className="text-3xl font-black text-slate-900">My Assigned Projects</h2>
        <p className="text-sm text-slate-600 md:text-base">Review assigned projects and respond to admin messages quickly.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[...projects].reverse().map((project) => {
          const projectTasks = tasks.filter((task) => task.projectId?._id === project._id);

          return (
            <div
              key={project._id}
              className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-4"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="mb-3 flex items-center gap-3 text-slate-600">
                    <div className="rounded-2xl bg-purple-100 p-2.5 text-purple-600">
                      <Briefcase size={22} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900">{project.title || 'Untitled Project'}</h3>
                      {project.deadline && (
                        <p className="text-sm text-slate-500">Deadline {new Date(project.deadline).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                </div>
                <span className="rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs uppercase tracking-[0.18em] text-slate-600">
                  Project
                </span>
              </div>

              {project.description && (
                <p className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {project.description}
                </p>
              )}

              <div className="mt-5 space-y-4">
                {projectTasks.length === 0 && (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                    No project messages available.
                  </div>
                )}

                {projectTasks.map((task) => (
                  <div key={task._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                      <MessageSquare size={14} />
                      <span>Admin Message</span>
                    </div>
                    <p className="text-sm leading-6 text-slate-700">{task.message || 'No message from admin.'}</p>

                    {task.acceptanceStatus === 'pending' ? (
                      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <button
                          onClick={() => respondToAssignment(task._id, 'accepted')}
                          disabled={respondMutation.isPending}
                          className="flex-1 rounded-2xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
                        >
                          <Check size={16} className="inline-block" />
                          <span className="ml-2">Accept</span>
                        </button>
                        <button
                          onClick={() => respondToAssignment(task._id, 'rejected')}
                          disabled={respondMutation.isPending}
                          className="flex-1 rounded-2xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-300 disabled:opacity-50"
                        >
                          <X size={16} className="inline-block" />
                          <span className="ml-2">Reject</span>
                        </button>
                      </div>
                    ) : (
                      <div className={`mt-5 inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
                        task.acceptanceStatus === 'accepted'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {task.acceptanceStatus === 'accepted' ? 'Accepted' : 'Rejected'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {!projectsLoading && projects.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center col-span-2">
            <Briefcase size={48} className="mx-auto mb-4 text-slate-400" />
            <h3 className="text-xl font-bold text-slate-700">No projects assigned yet</h3>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyProjects;
