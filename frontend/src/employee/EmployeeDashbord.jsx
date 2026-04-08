import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  LineChart,
  Line
} from 'recharts';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import PushNotificationToggle from '../components/PushNotificationToggle';
import { Briefcase, Clock, CheckCircle, FileText, RefreshCw } from 'lucide-react';
import API from '../services/api';

const CHART_COLORS = ['#7C3AED', '#F97316', '#0EA5E9', '#10B981'];

const INITIAL_STATS = {
  assignedProjects: 0,
  presentDays: 0,
  pendingTasks: 0,
  approvedLeaves: 0
};

const TASK_STATUS_ORDER = ['pending', 'in-progress', 'testing', 'completed'];

const toTitleCase = (value = '') =>
  value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const buildLastSevenDaysMap = () => {
  const map = {};
  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const key = date.toISOString().slice(0, 10);
    map[key] = {
      key,
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      hours: 0,
      progress: 0,
      progressEntries: 0
    };
  }
  return map;
};

const EmployeeDashboard = () => {
  const [stats, setStats] = useState(INITIAL_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [taskStatusChart, setTaskStatusChart] = useState([]);
  const [attendanceChart, setAttendanceChart] = useState([]);
  const [progressChart, setProgressChart] = useState([]);
  const [upcomingProjects, setUpcomingProjects] = useState([]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  const attendanceAverageHours = useMemo(() => {
    if (!attendanceChart.length) return 0;
    const totalHours = attendanceChart.reduce((sum, day) => sum + day.hours, 0);
    return Number((totalHours / attendanceChart.length).toFixed(1));
  }, [attendanceChart]);

  const fetchData = useCallback(async () => {
    setError('');
    try {
      const [projRes, attRes, taskRes, leaveRes] = await Promise.all([
        API.get('/projects/my-projects'),
        API.get('/attendance/my'),
        API.get('/projects/my-tasks'),
        API.get('/leaves/my')
      ]);

      const projects = projRes.data?.data || [];
      const attendance = attRes.data?.data || [];
      const tasks = taskRes.data?.data || [];
      const leaves = leaveRes.data?.data || [];

      setStats({
        assignedProjects: projects.length,
        presentDays: attendance.filter((entry) => entry.status === 'present').length,
        pendingTasks: tasks.filter((task) => task.status === 'pending').length,
        approvedLeaves: leaves.filter((leave) => leave.status === 'approved').length
      });

      const taskStatusMap = TASK_STATUS_ORDER.reduce((acc, status) => ({ ...acc, [status]: 0 }), {});
      tasks.forEach((task) => {
        const key = task.status || 'pending';
        taskStatusMap[key] = (taskStatusMap[key] || 0) + 1;
      });

      setTaskStatusChart(
        Object.entries(taskStatusMap).map(([name, value]) => ({
          name: toTitleCase(name),
          value
        }))
      );

      const lastSevenDaysMap = buildLastSevenDaysMap();

      attendance.forEach((entry) => {
        if (!entry?.date || !lastSevenDaysMap[entry.date]) {
          return;
        }
        lastSevenDaysMap[entry.date].hours = Number(((entry.workedMinutes || 0) / 60).toFixed(1));
      });

      tasks.forEach((task) => {
        const history = Array.isArray(task.progressHistory) ? task.progressHistory : [];
        history.forEach((entry) => {
          if (!entry?.date || !lastSevenDaysMap[entry.date]) {
            return;
          }
          lastSevenDaysMap[entry.date].progress += Number(entry.percent || 0);
          lastSevenDaysMap[entry.date].progressEntries += 1;
        });

        if (task.progressUpdatedAt) {
          const dateKey = new Date(task.progressUpdatedAt).toISOString().slice(0, 10);
          if (lastSevenDaysMap[dateKey] && history.length === 0) {
            lastSevenDaysMap[dateKey].progress += Number(task.progressPercent || 0);
            lastSevenDaysMap[dateKey].progressEntries += 1;
          }
        }
      });

      const weeklyData = Object.values(lastSevenDaysMap).map((day) => ({
        day: day.day,
        hours: day.hours,
        progress:
          day.progressEntries > 0 ? Number((day.progress / day.progressEntries).toFixed(0)) : 0
      }));

      setAttendanceChart(weeklyData);
      setProgressChart(weeklyData);

      setUpcomingProjects(
        projects
          .filter((project) => project.deadline)
          .sort((left, right) => new Date(left.deadline) - new Date(right.deadline))
          .slice(0, 4)
      );
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to load employee dashboard right now.');
      console.error(requestError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const chartPlaceholder = (message) => (
    <div className="flex h-62.5 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-sm font-medium text-gray-500">
      {message}
    </div>
  );

  return (
    <Layout role="employee">
      <div className="mb-8 rounded-3xl bg-linear-to-r from-purple-600 to-indigo-700 p-6 text-white shadow-xl shadow-purple-200 md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight md:text-4xl">Good Day, {user.name || 'Team Member'}!</h2>
            <p className="mt-2 text-sm font-medium text-purple-100 opacity-90 md:text-base">
              {new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                weekday: 'long'
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={fetchData}
            className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/25"
            aria-label="Refresh employee dashboard data"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="mb-8 max-w-sm">
        <PushNotificationToggle userId={user?.id || user?._id}  />
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="status" aria-live="polite">
          {error}
        </div>
      ) : null}

      <div className="mb-10 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
        <StatCard title="Assigned Projects" value={stats.assignedProjects} icon={Briefcase} color="purple" />
        <StatCard title="Present Days" value={stats.presentDays} icon={Clock} color="green" />
        <StatCard title="Pending Tasks" value={stats.pendingTasks} icon={CheckCircle} color="orange" />
        <StatCard title="Approved Leaves" value={stats.approvedLeaves} icon={FileText} color="purple" />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm" aria-label="Task status chart">
          <h3 className="mb-4 text-lg font-bold text-gray-800">My Tasks by Status</h3>
          {taskStatusChart.some((entry) => entry.value > 0) ? (
            <div className="h-62.5" role="img" aria-label="Pie chart showing your task status distribution">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusChart}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={86}
                    paddingAngle={2}
                  >
                    {taskStatusChart.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Tasks']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            chartPlaceholder(loading ? 'Loading chart...' : 'No tasks assigned yet')
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            {taskStatusChart.map((entry, index) => (
              <div key={entry.name} className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  aria-hidden="true"
                />
                {entry.name}: {entry.value}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm" aria-label="Attendance hours chart">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">Work Hours (Last 7 Days)</h3>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
              Avg: {attendanceAverageHours}h/day
            </span>
          </div>
          {attendanceChart.some((entry) => entry.hours > 0) ? (
            <div className="h-62.5" role="img" aria-label="Area chart showing daily worked hours for the last 7 days">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceChart} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.32} />
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => [`${value} hrs`, 'Worked']} />
                  <Area type="monotone" dataKey="hours" stroke="#0EA5E9" strokeWidth={2.5} fill="url(#hoursGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            chartPlaceholder(loading ? 'Loading chart...' : 'No attendance logs in the last 7 days')
          )}
        </section>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm" aria-label="Weekly progress chart">
          <h3 className="mb-4 text-lg font-bold text-gray-800">Task Progress Trend (Last 7 Days)</h3>
          {progressChart.some((entry) => entry.progress > 0) ? (
            <div className="h-62.5" role="img" aria-label="Line chart showing your average task progress by day">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressChart} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Progress']} />
                  <Line type="monotone" dataKey="progress" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            chartPlaceholder(loading ? 'Loading chart...' : 'No progress updates available for this week')
          )}
        </section>

        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm" aria-label="Upcoming project deadlines">
          <h3 className="mb-6 text-lg font-bold text-gray-800">Upcoming Deadlines</h3>
          <div className="space-y-4">
            {upcomingProjects.map((project) => (
              <div key={project._id} className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="font-semibold text-gray-900">{project.title}</p>
                <p className="text-xs text-gray-500">
                  Deadline: {new Date(project.deadline).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                <p className="mt-1 text-xs font-medium text-purple-700">Status: {toTitleCase(project.taskStatus || 'pending')}</p>
              </div>
            ))}
            {!loading && upcomingProjects.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-500">No upcoming deadlines found.</p>
            ) : null}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="rounded-4xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <h3 className="mb-6 text-xl font-black text-gray-800">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => navigate('/employee/attendance')}
              className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-purple-50 p-5 text-center font-semibold text-purple-600 transition-all hover:bg-purple-100"
              aria-label="Open attendance page"
            >
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <Clock size={24} className="md:h-8 md:w-8" />
              </div>
              <span className="text-sm md:text-base">Punch In / Out</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/employee/leaves')}
              className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-indigo-50 p-5 text-center font-semibold text-indigo-600 transition-all hover:bg-indigo-100"
              aria-label="Open leave request page"
            >
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <FileText size={24} className="md:h-8 md:w-8" />
              </div>
              <span className="text-sm md:text-base">Apply Leave</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/employee/projects')}
              className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-emerald-50 p-5 text-center font-semibold text-emerald-600 transition-all hover:bg-emerald-100"
              aria-label="Open my projects page"
            >
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <Briefcase size={24} className="md:h-8 md:w-8" />
              </div>
              <span className="text-sm md:text-base">My Projects</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/employee/tasks')}
              className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-orange-50 p-5 text-center font-semibold text-orange-600 transition-all hover:bg-orange-100"
              aria-label="Open my tasks page"
            >
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <CheckCircle size={24} className="md:h-8 md:w-8" />
              </div>
              <span className="text-sm md:text-base">My Tasks</span>
            </button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;
