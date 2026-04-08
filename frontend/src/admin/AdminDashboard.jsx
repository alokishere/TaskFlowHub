import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import PushNotificationToggle from '../components/PushNotificationToggle';
import {
  Users,
  Briefcase,
  FileText,
  CheckCircle,
  Clock,
  ChevronRight,
  Activity,
  RefreshCw
} from 'lucide-react';
import { imageBaseUrl } from '../services/api';
import { useAdminDashboardData } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';

const CHART_COLORS = ['#7C3AED', '#2563EB', '#F97316', '#10B981', '#EF4444', '#06B6D4'];

const formatLabel = (value = '') =>
  value
    .toString()
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const buildLastSevenDays = () => {
  const dates = [];
  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const key = date.toISOString().slice(0, 10);
    const label = date.toLocaleDateString('en-US', { weekday: 'short' });
    dates.push({ key, label, present: 0 });
  }
  return dates;
};

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useAdminDashboardData();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const processedData = useMemo(() => {
    if (!data) return null;

    const { employees, projects, leaves, attendanceEntries } = data;
    const todayKey = new Date().toISOString().slice(0, 10);

    const departmentMap = employees.reduce((acc, employee) => {
      const key = employee.department || 'Unassigned';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const projectMap = projects.reduce(
      (acc, project) => {
        const key = project.status || 'pending';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      { pending: 0, 'in-progress': 0, completed: 0 }
    );

    const leaveMap = leaves.reduce(
      (acc, leave) => {
        const key = leave.status || 'pending';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      { pending: 0, approved: 0, rejected: 0 }
    );

    const dailyTrendMap = buildLastSevenDays().reduce((acc, day) => {
      acc[day.key] = { ...day };
      return acc;
    }, {});

    attendanceEntries.forEach((entry) => {
      if (!entry?.date || !dailyTrendMap[entry.date]) {
        return;
      }
      if (entry.status === 'present') {
        dailyTrendMap[entry.date].present += 1;
      }
    });

    const todayAttendance = attendanceEntries.filter((entry) => entry.date === todayKey);
    const attendanceTodayCount = todayAttendance.filter((entry) => entry.status === 'present').length;
    const totalAttendanceToday = todayAttendance.length;
    const attendanceRate = totalAttendanceToday ? Math.round((attendanceTodayCount / totalAttendanceToday) * 100) : 0;

    return {
      stats: {
        totalEmployees: employees.length,
        activeProjects: projectMap['in-progress'] || 0,
        completedProjects: projectMap.completed || 0,
        pendingLeaves: leaveMap.pending || 0,
        attendanceToday: attendanceTodayCount,
        totalAttendanceToday,
        attendanceRate
      },
      recentEmployees: employees.slice(0, 5),
      recentLeaves: leaves.slice(0, 5),
      departmentChart: Object.entries(departmentMap)
        .map(([name, count]) => ({ name, count }))
        .sort((left, right) => right.count - left.count),
      projectStatusChart: Object.entries(projectMap).map(([name, value]) => ({ name: formatLabel(name), value })),
      leaveStatusChart: Object.entries(leaveMap).map(([name, value]) => ({ name: formatLabel(name), value })),
      attendanceTrend: Object.values(dailyTrendMap).map((day) => ({
        day: day.label,
        present: day.present
      }))
    };
  }, [data]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
  };

  const renderChartPlaceholder = (message) => (
    <div className="flex h-65 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-sm font-medium text-gray-500">
      {message}
    </div>
  );

  if (isLoading) return <Layout role="admin"><div className="flex justify-center py-20"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600" /></div></Layout>;

  const { stats, recentEmployees, recentLeaves, departmentChart, projectStatusChart, leaveStatusChart, attendanceTrend } = processedData;

  return (
    <Layout role="admin">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-800 md:text-2xl">
            Welcome, {user.name || 'Admin'}
          </h2>
          <p className="text-sm text-gray-500">Live overview from your backend for people, projects, leaves, and attendance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-purple-200 hover:text-purple-700"
            aria-label="Refresh admin dashboard data"
          >
            <RefreshCw size={16} />
            Refresh Data
          </button>
          <div className="rounded-2xl border border-gray-100/50 bg-white/50 px-4 py-2 backdrop-blur-sm sm:text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-purple-600">
              {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </p>
            <p className="text-sm font-black text-gray-800">
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8 max-w-sm">
        <PushNotificationToggle userId={user?.id||user?._id} />
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="status" aria-live="polite">
          {error.message || 'Unable to load dashboard metrics right now.'}
        </div>
      ) : null}

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Employees" value={stats.totalEmployees} icon={Users} color="purple" />
        <StatCard title="Active Projects" value={stats.activeProjects} icon={Briefcase} color="blue" />
        <StatCard title="Completed Projects" value={stats.completedProjects} icon={CheckCircle} color="green" />
        <StatCard title="Pending Leaves" value={stats.pendingLeaves} icon={FileText} color="orange" />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm" aria-label="Employee department distribution">
          <h3 className="mb-5 text-lg font-bold text-gray-800">Employees by Department</h3>
          {departmentChart.length > 0 ? (
            <div className="h-65" role="img" aria-label="Bar chart showing employee count by department">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentChart} layout="vertical" margin={{ top: 4, right: 16, left: 16, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={90} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => [value, 'Employees']} />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]} fill="#7C3AED" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            renderChartPlaceholder('No department data available')
          )}
        </section>

        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm" aria-label="Project status chart">
          <h3 className="mb-5 text-lg font-bold text-gray-800">Project Status Split</h3>
          {projectStatusChart.some((entry) => entry.value > 0) ? (
            <div className="h-65" role="img" aria-label="Pie chart showing project status distribution">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatusChart}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={86}
                    paddingAngle={2}
                  >
                    {projectStatusChart.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Projects']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            renderChartPlaceholder('No project status data available')
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            {projectStatusChart.map((entry, index) => (
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
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm" aria-label="Weekly attendance trend">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">Attendance Trend (7 days)</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              <Activity size={14} />
              Today: {stats.attendanceRate}% present
            </span>
          </div>
          {attendanceTrend.some((entry) => entry.present > 0) ? (
            <div className="h-65" role="img" aria-label="Area chart showing present employee count for the last 7 days">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceTrend} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.32} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => [value, 'Present']} />
                  <Area type="monotone" dataKey="present" stroke="#10B981" strokeWidth={2.5} fill="url(#presentGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            renderChartPlaceholder('No attendance entries for the last 7 days')
          )}
        </section>

        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm" aria-label="Leave status chart">
          <h3 className="mb-5 text-lg font-bold text-gray-800">Leave Request Status</h3>
          {leaveStatusChart.some((entry) => entry.value > 0) ? (
            <div className="h-65" role="img" aria-label="Bar chart showing leave status counts">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leaveStatusChart} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => [value, 'Requests']} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {leaveStatusChart.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            renderChartPlaceholder('No leave requests available')
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm" aria-label="Recent employees list">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">Recent Employees</h3>
            <button
              type="button"
              onClick={() => navigate('/admin/employees')}
              className="inline-flex items-center gap-1 text-sm font-semibold text-purple-600 hover:underline"
            >
              View All <ChevronRight size={16} />
            </button>
          </div>
          <div className="space-y-4">
            {recentEmployees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between rounded-2xl bg-gray-50 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-purple-100 font-bold text-purple-600">
                    {employee.image ? (
                      <img src={`${imageBaseUrl}${employee.image}`} alt={employee.name} className="h-full w-full object-cover" />
                    ) : (
                      employee.name?.charAt(0)
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{employee.name}</h4>
                    <p className="text-xs text-gray-500">{employee.department || 'Unassigned Department'}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    employee.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {employee.status}
                </span>
              </div>
            ))}
            {recentEmployees.length === 0 ? (
              <p className="py-10 text-center text-gray-400">No employees found</p>
            ) : null}
          </div>
        </section>

        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm" aria-label="Recent leave requests list">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">Recent Leave Requests</h3>
            <button
              type="button"
              onClick={() => navigate('/admin/leaves')}
              className="inline-flex items-center gap-1 text-sm font-semibold text-purple-600 hover:underline"
            >
              View All <ChevronRight size={16} />
            </button>
          </div>
          <div className="space-y-4">
            {recentLeaves.map((leave) => (
              <div key={leave._id} className="flex items-center justify-between rounded-2xl bg-gray-50 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{leave.userId?.name || 'Unknown Employee'}</h4>
                    <p className="text-xs text-gray-500">
                      {formatLabel(leave.type)} - {new Date(leave.from).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    leave.status === 'pending'
                      ? 'bg-orange-100 text-orange-700'
                      : leave.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {leave.status}
                </span>
              </div>
            ))}
            {recentLeaves.length === 0 ? (
              <p className="py-10 text-center text-gray-400">No leave requests available</p>
            ) : null}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
