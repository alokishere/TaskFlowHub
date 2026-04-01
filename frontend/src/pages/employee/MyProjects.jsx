import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import {
  Briefcase,
  Calendar,
  MessageSquare,
  Check,
  X,
  Clock,
  Play,
  TestTube,
  CheckCircle2,
  Gauge,
  Save
} from 'lucide-react';
import API from '../../services/api';

const MyProjects = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [progressDrafts, setProgressDrafts] = useState({});
  const [progressNotes, setProgressNotes] = useState({});
  const [savingTaskId, setSavingTaskId] = useState(null);
  const [loading, setLoading] = useState(true);

  const todayKey = useMemo(() => new Date().toLocaleDateString('en-CA'), []);

  const fetchData = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        API.get('/projects/my-projects'),
        API.get('/projects/my-tasks')
      ]);

      const fetchedTasks = taskRes.data.data || [];
      const nextDrafts = {};
      const nextNotes = {};

      fetchedTasks.forEach((task) => {
        const currentProgress = typeof task.progressPercent === 'number'
          ? task.progressPercent
          : (task.status === 'completed' ? 100 : 0);
        nextDrafts[task._id] = currentProgress;

        const todayUpdate = task.progressHistory?.find((entry) => entry.date === todayKey);
        nextNotes[task._id] = todayUpdate?.note || '';
      });

      setProjects(projRes.data.data || []);
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
    fetchData();
  }, []);

  const respondToAssignment = async (taskId, acceptanceStatus) => {
    try {
      await API.patch(`/projects/tasks/${taskId}/respond`, { acceptanceStatus });
      fetchData();
    } catch (err) {
      alert('Failed to update assignment response');
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await API.patch(`/projects/tasks/${taskId}/status`, { status });
      fetchData();
    } catch (err) {
      alert('Failed to update task status');
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
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task progress');
    } finally {
      setSavingTaskId(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={14} className="text-green-400" />;
      case 'testing':
        return <TestTube size={14} className="text-violet-400" />;
      case 'in-progress':
        return <Play size={14} className="text-cyan-400" />;
      default:
        return <Clock size={14} className="text-gray-400" />;
    }
  };

  const getTaskProgress = (task) => {
    if (typeof task.progressPercent === 'number') {
      return task.progressPercent;
    }
    return task.status === 'completed' ? 100 : 0;
  };

  return (
    <Layout role="employee">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white">My Assigned Projects</h2>
        <p className="text-gray-400 mt-1">Update task progress daily so admin can see exactly how much work was done today.</p>
      </div>

      <div className="space-y-8">
        {projects.map((project) => {
          const projectTasks = tasks.filter((task) => task.projectId?._id === project._id);
          return (
            <div
              key={project._id}
              className="rounded-[2rem] border border-cyan-900/40 bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 p-8 shadow-[0_20px_70px_-30px_rgba(34,211,238,0.45)]"
            >
              <div className="mb-8 flex flex-col justify-between gap-5 border-b border-slate-700/60 pb-6 md:flex-row md:items-start">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl border border-cyan-700/30 bg-cyan-500/10 p-4 text-cyan-300">
                    <Briefcase size={30} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">{project.title}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-bold">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Calendar size={14} />
                        Deadline: {new Date(project.deadline).toLocaleDateString()}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-widest ${
                        project.status === 'completed'
                          ? 'bg-green-500/20 text-green-300'
                          : project.status === 'in-progress'
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="min-w-56 rounded-2xl border border-slate-700/70 bg-slate-800/50 p-4">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Your Progress</p>
                  <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-slate-700">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-cyan-400 to-blue-500"
                      style={{
                        width: `${Math.max(0, Math.min(100, project.taskProgressPercent || 0))}%`
                      }}
                    />
                  </div>
                  <p className="text-sm font-black text-cyan-300">{project.taskProgressPercent || 0}% complete</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                <div>
                  <h4 className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Project Overview</h4>
                  <p className="rounded-2xl border border-slate-700/60 bg-slate-900/50 p-5 text-sm leading-relaxed text-slate-300">
                    {project.description || 'No description provided by admin.'}
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Assignment Details</h4>
                  {projectTasks.map((task) => {
                    const taskProgress = getTaskProgress(task);
                    const todayUpdate = task.progressHistory?.find((entry) => entry.date === todayKey);

                    return (
                      <div key={task._id} className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-5">
                        <div className="mb-5 flex items-start justify-between gap-4">
                          <div>
                            <div className="mb-2 flex items-center gap-2">
                              <MessageSquare size={15} className="text-cyan-300" />
                              <span className="text-xs font-black text-slate-300">Admin Message</span>
                            </div>
                            <p className="text-sm italic leading-relaxed text-slate-300">"{task.message}"</p>
                          </div>

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

                        {task.acceptanceStatus === 'pending' ? (
                          <div className="flex gap-3">
                            <button
                              onClick={() => respondToAssignment(task._id, 'accepted')}
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black uppercase text-white transition hover:bg-emerald-700"
                            >
                              <Check size={16} />
                              Accept
                            </button>
                            <button
                              onClick={() => respondToAssignment(task._id, 'rejected')}
                              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-xs font-black uppercase text-white transition hover:bg-rose-700"
                            >
                              <X size={16} />
                              Reject
                            </button>
                          </div>
                        ) : task.acceptanceStatus === 'accepted' ? (
                          <div className="space-y-5">
                            <div>
                              <div className="mb-2 flex items-center gap-2">
                                {getStatusIcon(task.status)}
                                <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                                  Current Status: {task.status}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {['in-progress', 'testing', 'completed'].map((status) => (
                                  <button
                                    key={status}
                                    onClick={() => updateTaskStatus(task._id, status)}
                                    className={`rounded-lg px-3 py-2 text-[10px] font-black uppercase transition ${
                                      task.status === status
                                        ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25'
                                        : 'border border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                                  >
                                    {status}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="rounded-xl border border-cyan-900/30 bg-cyan-500/5 p-4">
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-cyan-200">
                                  <Gauge size={16} />
                                  <span className="text-xs font-black uppercase tracking-wider">Today Progress Update</span>
                                </div>
                                <span className="text-lg font-black text-cyan-300">{progressDrafts[task._id] ?? taskProgress}%</span>
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
                                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-700 accent-cyan-400"
                              />

                              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-700">
                                <div
                                  className="h-full rounded-full bg-linear-to-r from-cyan-400 to-blue-500 transition-all"
                                  style={{ width: `${progressDrafts[task._id] ?? taskProgress}%` }}
                                />
                              </div>

                              <textarea
                                rows={2}
                                value={progressNotes[task._id] || ''}
                                onChange={(event) => {
                                  setProgressNotes((prev) => ({
                                    ...prev,
                                    [task._id]: event.target.value
                                  }));
                                }}
                                placeholder="What did you complete today?"
                                className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm text-slate-200 outline-none transition focus:border-cyan-500"
                              />

                              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                <p className="text-xs text-slate-400">
                                  {todayUpdate
                                    ? `Last saved today at ${new Date(todayUpdate.updatedAt).toLocaleTimeString()}`
                                    : 'No progress update saved today'}
                                </p>
                                <button
                                  onClick={() => updateTaskProgress(task._id)}
                                  disabled={savingTaskId === task._id}
                                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-black uppercase text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
                                >
                                  <Save size={14} />
                                  {savingTaskId === task._id ? 'Saving...' : 'Update Progress'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="rounded-lg bg-rose-500/10 py-2 text-center text-xs font-bold text-rose-300">
                            You have rejected this assignment.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {!loading && projects.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 py-24 text-center">
            <Briefcase size={64} className="mx-auto mb-6 text-slate-700" />
            <h3 className="text-xl font-bold text-slate-400">No projects assigned yet</h3>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyProjects;
