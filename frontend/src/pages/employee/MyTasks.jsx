import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import { ListTodo, Check, X, Gauge, Save, Clock } from 'lucide-react';
import API from '../../services/api';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [progressDrafts, setProgressDrafts] = useState({});
  const [progressNotes, setProgressNotes] = useState({});
  const [savingTaskId, setSavingTaskId] = useState(null);
  const [loading, setLoading] = useState(true);
  const todayKey = useMemo(() => new Date().toLocaleDateString('en-CA'), []);

  const fetchTasks = async () => {
    try {
      const { data } = await API.get('/projects/my-tasks');
      const fetchedTasks = data.data || [];

      const nextDrafts = {};
      const nextNotes = {};

      fetchedTasks.forEach((task) => {
        nextDrafts[task._id] = typeof task.progressPercent === 'number'
          ? task.progressPercent
          : (task.status === 'completed' ? 100 : 0);
        const todayUpdate = task.progressHistory?.find((entry) => entry.date === todayKey);
        nextNotes[task._id] = todayUpdate?.note || '';
      });

      setTasks(fetchedTasks);
      setProgressDrafts(nextDrafts);
      setProgressNotes(nextNotes);
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
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const respondToAssignment = async (taskId, acceptanceStatus) => {
    try {
      await API.patch(`/projects/tasks/${taskId}/respond`, { acceptanceStatus });
      fetchTasks();
    } catch (err) {
      alert('Failed to update assignment response');
    }
  };

  const updateTaskProgress = async (taskId) => {
    const progressPercent = Number(progressDrafts[taskId] ?? 0);
    const note = progressNotes[taskId] || '';
    try {
      setSavingTaskId(taskId);
      await API.patch(`/projects/tasks/${taskId}/progress`, {
        progressPercent,
        note
      });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update progress');
    } finally {
      setSavingTaskId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-300';
      case 'testing':
        return 'bg-violet-500/20 text-violet-300';
      case 'in-progress':
        return 'bg-cyan-500/20 text-cyan-300';
      default:
        return 'bg-slate-500/20 text-slate-300';
    }
  };

  return (
    <Layout role="employee">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white">My Tasks</h2>
        <p className="mt-1 text-gray-400">Drag progress, add a short daily note, and save your update for admin visibility.</p>
      </div>

      <div className="space-y-6">
        {tasks.map((task) => {
          const taskProgress = typeof task.progressPercent === 'number'
            ? task.progressPercent
            : (task.status === 'completed' ? 100 : 0);
          const todayUpdate = task.progressHistory?.find((entry) => entry.date === todayKey);
          return (
            <div key={task._id} className="rounded-3xl border border-slate-700/80 bg-slate-900 p-6 shadow-xl">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black text-white">{task.projectId?.title || 'Project Task'}</h3>
                    <span className={`rounded-md px-2 py-1 text-[10px] font-black uppercase ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    <span className={`rounded-md px-2 py-1 text-[10px] font-black uppercase ${
                      task.acceptanceStatus === 'accepted'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : task.acceptanceStatus === 'rejected'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {task.acceptanceStatus}
                    </span>
                  </div>
                  <p className="mb-4 text-sm text-slate-300">{task.message}</p>

                  {task.acceptanceStatus === 'pending' && (
                    <div className="mb-4 flex gap-3">
                      <button
                        onClick={() => respondToAssignment(task._id, 'accepted')}
                        className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
                      >
                        <Check size={14} />
                        Accept Project
                      </button>
                      <button
                        onClick={() => respondToAssignment(task._id, 'rejected')}
                        className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-rose-700"
                      >
                        <X size={14} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>

                {task.acceptanceStatus === 'accepted' && (
                  <div className="w-full space-y-3 md:w-[27rem]">
                    <div className="flex flex-wrap gap-2">
                      {['pending', 'in-progress', 'testing', 'completed'].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(task._id, status)}
                          className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase transition ${
                            task.status === status
                              ? 'bg-cyan-500 text-slate-950'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>

                    <div className="rounded-xl border border-cyan-900/40 bg-cyan-500/5 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-cyan-200">
                          <Gauge size={14} />
                          <span className="text-xs font-black uppercase tracking-wide">Progress</span>
                        </div>
                        <span className="text-sm font-black text-cyan-300">{progressDrafts[task._id] ?? taskProgress}%</span>
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
                        className="h-2 w-full cursor-pointer appearance-none rounded bg-slate-700 accent-cyan-400"
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
                        className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-200 outline-none focus:border-cyan-500"
                      />
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <p className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <Clock size={12} />
                          {todayUpdate ? `Saved today at ${new Date(todayUpdate.updatedAt).toLocaleTimeString()}` : 'No update saved today'}
                        </p>
                        <button
                          onClick={() => updateTaskProgress(task._id)}
                          disabled={savingTaskId === task._id}
                          className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-3 py-2 text-[11px] font-black uppercase text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
                        >
                          <Save size={12} />
                          {savingTaskId === task._id ? 'Saving...' : 'Update'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {!loading && tasks.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 py-20 text-center">
            <ListTodo size={48} className="mx-auto mb-4 text-slate-700" />
            <h3 className="text-lg font-bold text-slate-400">No tasks assigned yet</h3>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyTasks;
