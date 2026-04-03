import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import { ListTodo, Check, X, Gauge, Save, Clock } from 'lucide-react';
import API from '../../services/api';
import { useMyTasks } from '../../hooks/useQueries';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const MyTasks = () => {
  const queryClient = useQueryClient();
  const { data: tasks = [], isLoading: tasksLoading } = useMyTasks();
  const [progressDrafts, setProgressDrafts] = useState({});
  const [progressNotes, setProgressNotes] = useState({});
  const todayKey = useMemo(() => new Date().toLocaleDateString('en-CA'), []);

  useEffect(() => {
    if (tasks.length > 0) {
      const nextDrafts = {};
      const nextNotes = {};
      tasks.forEach((task) => {
        nextDrafts[task._id] = typeof task.progressPercent === 'number'
          ? task.progressPercent
          : (task.status === 'completed' ? 100 : 0);
        const todayUpdate = task.progressHistory?.find((entry) => entry.date === todayKey);
        nextNotes[task._id] = todayUpdate?.note || '';
      });
      setProgressDrafts(nextDrafts);
      setProgressNotes(nextNotes);
    }
  }, [tasks, todayKey]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }) => {
      await API.patch(`/projects/tasks/${taskId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTasks'] });
    },
    onError: () => {
      alert('Failed to update status');
    },
  });

  const respondMutation = useMutation({
    mutationFn: async ({ taskId, acceptanceStatus }) => {
      await API.patch(`/projects/tasks/${taskId}/respond`, { acceptanceStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTasks'] });
      queryClient.invalidateQueries({ queryKey: ['myProjects'] });
    },
    onError: () => {
      alert('Failed to update assignment response');
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ taskId, progressPercent, note }) => {
      await API.patch(`/projects/tasks/${taskId}/progress`, {
        progressPercent,
        note
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTasks'] });
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to update progress');
    },
  });

  const updateStatus = (taskId, status) => {
    updateStatusMutation.mutate({ taskId, status });
  };

  const respondToAssignment = (taskId, acceptanceStatus) => {
    respondMutation.mutate({ taskId, acceptanceStatus });
  };

  const updateTaskProgress = (taskId) => {
    const progressPercent = Number(progressDrafts[taskId] ?? 0);
    const note = progressNotes[taskId] || '';
    updateProgressMutation.mutate({ taskId, progressPercent, note });
  };

  const getStatusColor = (status) => {
    return 'bg-purple-100 text-purple-700';
  };

  if (tasksLoading) return <Layout role="employee"><div className="flex justify-center py-20"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600" /></div></Layout>;

  return (
    <Layout role="employee">
      <div className="mb-8 max-w-4xl space-y-2">
        <h2 className="text-3xl font-black text-slate-900">My Tasks</h2>
        <p className="mt-1 text-slate-600">Drag progress, add a short daily note, and save your update for admin visibility.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {tasks.map((task) => {
          const taskProgress = typeof task.progressPercent === 'number'
            ? task.progressPercent
            : (task.status === 'completed' ? 100 : 0);
          const todayUpdate = task.progressHistory?.find((entry) => entry.date === todayKey);
          return (
            <div key={task._id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900">{task.projectId?.title || 'Project Task'}</h3>
                    <span className={`rounded-md px-2 py-1 text-[10px] font-black uppercase ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    <span className={`rounded-md px-2 py-1 text-[10px] font-black uppercase ${
                      task.acceptanceStatus === 'accepted'
                        ? 'bg-purple-100 text-purple-700'
                        : task.acceptanceStatus === 'rejected'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                    }`}>
                      {task.acceptanceStatus}
                    </span>
                  </div>
                  <p className="mb-4 text-sm text-slate-700">{task.message}</p>

                  {task.acceptanceStatus === 'pending' && (
                    <div className="mb-4 flex gap-3">
                      <button
                        onClick={() => respondToAssignment(task._id, 'accepted')}
                        disabled={respondMutation.isPending}
                        className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-purple-700 disabled:opacity-50"
                      >
                        <Check size={14} />
                        Accept Project
                      </button>
                      <button
                        onClick={() => respondToAssignment(task._id, 'rejected')}
                        disabled={respondMutation.isPending}
                        className="flex items-center gap-2 rounded-xl bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-300 disabled:opacity-50"
                      >
                        <X size={14} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>

                {task.acceptanceStatus === 'accepted' && (
                  <div className="w-full space-y-3 md:w-96">
                    <div className="flex flex-wrap gap-2">
                      {['pending', 'in-progress', 'testing', 'completed'].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(task._id, status)}
                          disabled={updateStatusMutation.isPending}
                          className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase transition ${
                            task.status === status
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          } disabled:opacity-50`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-purple-700">
                          <Gauge size={14} />
                          <span className="text-xs font-black uppercase tracking-wide text-slate-700">Progress</span>
                        </div>
                        <span className="text-sm font-black text-slate-900">{progressDrafts[task._id] ?? taskProgress}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={progressDrafts[task._id] ?? taskProgress}
                        onChange={(event) => {
                          setProgressDrafts((prev) => ({
                            ...prev,
                            [task._id]: Number(event.target.value)
                          }));
                        }}
                        className="h-2 w-full cursor-pointer appearance-none rounded bg-slate-200 accent-purple-500"
                      />
                      <textarea
                        rows={2}
                        value={progressNotes[task._id] || ''}
                        onChange={(event) => {
                          setProgressNotes((prev) => ({
                            ...prev,
                            [task._id]: event.target.value
                          }));
                        }}
                        placeholder="Write a short update for today..."
                        className="mt-3 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-900 outline-none focus:border-purple-500"
                      />
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <p className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <Clock size={12} />
                          {todayUpdate ? `Saved today at ${new Date(todayUpdate.updatedAt).toLocaleTimeString()}` : 'No update saved today'}
                        </p>
                        <button
                          onClick={() => updateTaskProgress(task._id)}
                          disabled={updateProgressMutation.isPending}
                          className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-[11px] font-black uppercase text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                        >
                          <Save size={12} />
                          {updateProgressMutation.isPending && updateProgressMutation.variables?.taskId === task._id ? 'Saving...' : 'Update'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {!tasksLoading && tasks.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center col-span-2">
            <ListTodo size={48} className="mx-auto mb-4 text-slate-400" />
            <h3 className="text-xl font-bold text-slate-700">No tasks assigned yet</h3>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyTasks;
