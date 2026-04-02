import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { 
  ArrowLeft, Briefcase, FileText,
  Trash2, Lock, Unlock, Key, Upload, File, Download,
  CheckCircle2, AlertCircle, XCircle, TrendingUp, Calendar,
  ChevronLeft, ChevronRight, Timer
} from 'lucide-react';
import API, { imageBaseUrl } from '../../services/api';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

const CHART_COLORS = ['#7C3AED', '#2563EB', '#10B981', '#F97316', '#EF4444', '#06B6D4'];

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState([]);
  const [showPassModal, setShowPassModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [attendanceMonth, setAttendanceMonth] = useState(() => {
    const current = new Date();
    return new Date(current.getFullYear(), current.getMonth(), 1);
  });

  const fetchData = async () => {
    try {
      const [userRes, docRes] = await Promise.all([
        API.get(`/users/${id}`),
        API.get(`/documents/${id}`)
      ]);
      setData(userRes.data.data);
      setDocs(docRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const toggleStatus = async () => {
    try {
      await API.patch(`/users/${id}/toggle-status`);
      fetchData();
    } catch (err) { alert('Failed'); }
  };

  const deleteEmp = async () => {
    if (window.confirm('Delete this employee?')) {
      try {
        await API.delete(`/users/${id}`);
        navigate('/admin/employees');
      } catch (err) { alert('Failed'); }
    }
  };

  const changePass = async (e) => {
    e.preventDefault();
    try {
      await API.patch(`/users/${id}/change-password`, { password: newPassword });
      setShowPassModal(false);
      setNewPassword('');
      alert('Password changed');
    } catch (err) { alert(err.response?.data?.message); }
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const type = prompt('Enter document type (e.g. Aadhaar, PAN):');
    if (!type) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('employeeId', id);
    formData.append('docType', type);

    try {
      await API.post('/documents', formData);
      fetchData();
    } catch (err) { alert('Upload failed'); }
  };

  const deleteDoc = async (docId) => {
    try {
      await API.delete(`/documents/${docId}`);
      fetchData();
    } catch (err) { alert('Delete failed'); }
  };

  const calculateProgress = () => {
    if (!data?.tasks || data.tasks.length === 0) return 0;
    const completed = data.tasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / data.tasks.length) * 100);
  };

  const dateKey = (date) => date.toLocaleDateString('en-CA');
  const toDateOnly = (value) => {
    const raw = String(value || '').split('T')[0];
    return new Date(`${raw}T00:00:00`);
  };
  const parseTimeToMinutes = (time) => {
    if (!time) return null;
    const [hours, minutes, seconds = '0'] = String(time).split(':');
    const hh = Number(hours);
    const mm = Number(minutes);
    const ss = Number(seconds);
    if ([hh, mm, ss].some((part) => Number.isNaN(part))) return null;
    return (hh * 60) + mm + (ss / 60);
  };
  const calculateWorkedMinutes = (record) => {
    if (!record?.punchIn || !record?.punchOut) return Number(record?.workedMinutes) || 0;
    const inMinutes = parseTimeToMinutes(record.punchIn);
    const outMinutes = parseTimeToMinutes(record.punchOut);
    if (inMinutes === null || outMinutes === null) return Number(record?.workedMinutes) || 0;

    let diff = outMinutes - inMinutes;
    if (diff < 0) diff += 24 * 60;
    return Math.max(0, Math.round(diff));
  };
  const formatDuration = (minutes) => {
    const safeMinutes = Math.max(0, Math.round(minutes || 0));
    const hrs = Math.floor(safeMinutes / 60);
    const mins = safeMinutes % 60;
    return `${hrs}h ${mins}m`;
  };

  const attendanceMap = useMemo(() => {
    const map = {};
    (data?.attendance || []).forEach((entry) => {
      map[entry.date] = entry;
    });
    return map;
  }, [data?.attendance]);

  const approvedLeaveDates = useMemo(() => {
    const set = new Set();
    (data?.leaves || [])
      .filter((leave) => leave.status === 'approved')
      .forEach((leave) => {
        const start = toDateOnly(leave.from);
        const end = toDateOnly(leave.to);
        for (let current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
          set.add(dateKey(current));
        }
      });
    return set;
  }, [data?.leaves]);

  const attendanceCalendarCells = useMemo(() => {
    const year = attendanceMonth.getFullYear();
    const month = attendanceMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const totalDays = new Date(year, month + 1, 0).getDate();
    const firstWeekday = firstDay.getDay();
    const cells = [];

    for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
    for (let day = 1; day <= totalDays; day += 1) cells.push(new Date(year, month, day));
    return cells;
  }, [attendanceMonth]);

  const attendanceSummary = useMemo(() => {
    const attendance = data?.attendance || [];
    const totalWorkedMinutes = attendance.reduce((sum, entry) => sum + calculateWorkedMinutes(entry), 0);
    const presentDays = attendance.filter((entry) => entry.status === 'present' || entry.status === 'late').length;
    return {
      totalWorkedMinutes,
      presentDays
    };
  }, [data?.attendance]);

  const attendanceRate = useMemo(() => {
    const attendance = data?.attendance || [];
    if (attendance.length === 0) return 0;
    const presentDays = attendance.filter((entry) => entry.status === 'present' || entry.status === 'late').length;
    return Math.round((presentDays / attendance.length) * 100);
  }, [data?.attendance]);

  const taskStatusData = useMemo(() => {
    const base = { pending: 0, 'in-progress': 0, testing: 0, completed: 0 };
    (data?.tasks || []).forEach((task) => {
      const key = base[task.status] !== undefined ? task.status : 'pending';
      base[key] += 1;
    });
    return Object.entries(base)
      .map(([name, value]) => ({ name, value }))
      .filter((entry) => entry.value > 0);
  }, [data?.tasks]);

  const projectStatusData = useMemo(() => {
    const base = { pending: 0, 'in-progress': 0, completed: 0 };
    (data?.projects || []).forEach((project) => {
      const key = base[project.status] !== undefined ? project.status : 'pending';
      base[key] += 1;
    });
    return Object.entries(base).map(([name, value]) => ({
      name,
      value
    }));
  }, [data?.projects]);

  const leaveStatusData = useMemo(() => {
    const base = { pending: 0, approved: 0, rejected: 0 };
    (data?.leaves || []).forEach((leave) => {
      const key = base[leave.status] !== undefined ? leave.status : 'pending';
      base[key] += 1;
    });
    return Object.entries(base).map(([name, value]) => ({
      name,
      value
    }));
  }, [data?.leaves]);

  const attendanceTrendData = useMemo(() => {
    const map = {};
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = dateKey(date);
      map[key] = {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        hours: 0
      };
    }

    (data?.attendance || []).forEach((entry) => {
      if (!map[entry.date]) return;
      map[entry.date].hours = Number((calculateWorkedMinutes(entry) / 60).toFixed(1));
    });

    return Object.values(map);
  }, [data?.attendance]);

  const monthAttendanceBreakdown = useMemo(() => {
    const monthStart = new Date(attendanceMonth.getFullYear(), attendanceMonth.getMonth(), 1);
    const monthEnd = new Date(attendanceMonth.getFullYear(), attendanceMonth.getMonth() + 1, 0);
    const today = new Date();
    const effectiveEnd = monthStart.getMonth() === today.getMonth() && monthStart.getFullYear() === today.getFullYear()
      ? new Date(today.getFullYear(), today.getMonth(), today.getDate())
      : monthEnd;

    const base = { present: 0, leave: 0, absent: 0 };

    for (let cursor = new Date(monthStart); cursor <= effectiveEnd; cursor.setDate(cursor.getDate() + 1)) {
      if (cursor.getDay() === 0) continue;
      const key = dateKey(cursor);
      if (approvedLeaveDates.has(key)) {
        base.leave += 1;
      } else if (attendanceMap[key]?.status === 'present' || attendanceMap[key]?.status === 'late') {
        base.present += 1;
      } else {
        base.absent += 1;
      }
    }

    return Object.entries(base).map(([name, value]) => ({ name, value }));
  }, [attendanceMonth, approvedLeaveDates, attendanceMap]);

  const averageWorkedHours = useMemo(() => {
    const attendance = data?.attendance || [];
    if (!attendance.length) return 0;
    const totalHours = attendance.reduce((sum, entry) => sum + (calculateWorkedMinutes(entry) / 60), 0);
    return Number((totalHours / attendance.length).toFixed(1));
  }, [data?.attendance]);

  if (loading) return <Layout role="admin"><div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div></Layout>;
  if (!data) return <Layout role="admin">Not found</Layout>;

  return (
    <Layout role="admin">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ArrowLeft size={20}/></button>
          <div>
            <h2 className="text-2xl font-black text-gray-800">Employee Profile</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Manage details and track performance</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPassModal(true)} className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 border border-gray-100 rounded-xl hover:bg-gray-50 font-bold transition-all shadow-sm"><Key size={16}/> Reset Password</button>
          <button onClick={toggleStatus} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-sm ${data.status === 'active' ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
            {data.status === 'active' ? <><Lock size={16}/> Suspend</> : <><Unlock size={16}/> Activate</>}
          </button>
          <button onClick={deleteEmp} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"><Trash2 size={20}/></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm text-center">
            <div className="w-32 h-32 mx-auto bg-linear-to-br from-purple-50 to-blue-50 rounded-[2rem] mb-6 overflow-hidden border-4 border-white shadow-xl relative group">
              {data.image ? <img src={`${imageBaseUrl}${data.image}`} className="w-full h-full object-cover transition-transform group-hover:scale-110"/> : <span className="text-4xl font-black text-purple-600 leading-[8rem]">{data.name.charAt(0)}</span>}
              <div className={`absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-white shadow-sm ${data.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-1">{data.name}</h3>
            <p className="text-sm font-bold text-gray-400 mb-6">{data.email}</p>
            
            <div className="space-y-3 text-left">
              <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">Department</p>
                <p className="text-sm font-black text-gray-700">{data.department}</p>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">Salary</p>
                <p className="text-sm font-black text-gray-700">₹{data.salary.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">Contact</p>
                <p className="text-sm font-black text-gray-700">{data.mobile}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-black text-gray-800 flex items-center gap-2"><FileText size={18} className="text-purple-600"/> Documents</h4>
              <label className="p-2 bg-purple-50 text-purple-600 rounded-xl cursor-pointer hover:bg-purple-100 transition-colors shadow-sm"><Upload size={16}/><input type="file" className="hidden" onChange={handleDocUpload}/></label>
            </div>
            <div className="space-y-3">
              {docs.map(doc => (
                <div key={doc._id} className="group flex items-center justify-between p-3 bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 rounded-2xl transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm"><File size={16} className="text-purple-400"/></div>
                    <span className="text-xs font-bold text-gray-700">{doc.docType}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a href={`${imageBaseUrl}${doc.fileUrl}`} target="_blank" className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl"><Download size={14}/></a>
                    <button onClick={() => deleteDoc(doc._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl"><Trash2 size={14}/></button>
                  </div>
                </div>
              ))}
              {docs.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-gray-50 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-300 uppercase">No documents</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="flex gap-2 p-1 bg-gray-100/50 rounded-2xl w-fit">
            {['overview', 'projects', 'attendance', 'leaves'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Total Tasks</p>
                  <p className="mt-1 text-2xl font-black text-gray-900">{data.tasks?.length || 0}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Work Progress</p>
                  <p className="mt-1 text-2xl font-black text-purple-700">{calculateProgress()}%</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Active Projects</p>
                  <p className="mt-1 text-2xl font-black text-blue-700">{data.projects?.filter((project) => project.status !== 'completed').length || 0}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Attendance Rate</p>
                  <p className="mt-1 text-2xl font-black text-emerald-700">{attendanceRate}%</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-black text-gray-800 flex items-center gap-2">
                      <TrendingUp size={18} className="text-purple-600" />
                      Task Status Mix
                    </h4>
                    <span className="text-lg font-black text-purple-600">{calculateProgress()}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-linear-to-r from-purple-500 to-blue-500 transition-all duration-1000 ease-out" style={{ width: `${calculateProgress()}%` }} />
                  </div>
                  {taskStatusData.length > 0 ? (
                    <div className="h-52" role="img" aria-label="Task status pie chart">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={taskStatusData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={48}
                            outerRadius={76}
                            paddingAngle={2}
                          >
                            {taskStatusData.map((entry, index) => (
                              <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [value, 'Tasks']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-52 flex items-center justify-center rounded-2xl border border-dashed border-gray-200 text-sm font-bold text-gray-400">
                      No task data yet
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {taskStatusData.map((entry, index) => (
                      <span key={entry.name} className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-gray-600">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                        {entry.name.replace('-', ' ')}: {entry.value}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm space-y-6">
                  <div>
                    <h4 className="font-black text-gray-800 mb-3 flex items-center gap-2">
                      <Briefcase size={18} className="text-blue-600" />
                      Projects by Status
                    </h4>
                    <div className="h-44" role="img" aria-label="Project status bar chart">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={projectStatusData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" tickLine={false} axisLine={false} tickFormatter={(value) => value.replace('-', ' ')} />
                          <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                          <Tooltip formatter={(value) => [value, 'Projects']} labelFormatter={(label) => label.replace('-', ' ')} />
                          <Bar dataKey="value" fill="#2563EB" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-black text-gray-800 mb-3 flex items-center gap-2">
                      <Calendar size={18} className="text-violet-600" />
                      Leave Summary
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      {leaveStatusData.map((entry, index) => (
                        <div key={entry.name} className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
                          <p className="text-[10px] font-black uppercase tracking-wide text-gray-500">{entry.name}</p>
                          <p className="mt-1 text-xl font-black" style={{ color: CHART_COLORS[index % CHART_COLORS.length] }}>{entry.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.projects?.map(p => (
                  <Link key={p._id} to={`/admin/projects/${p._id}`} className="group p-6 bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 rounded-[2rem] transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:bg-blue-50 transition-colors"><Briefcase size={20} className="text-blue-600"/></div>
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${p.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>{p.status}</span>
                    </div>
                    <h5 className="font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{p.title}</h5>
                    <p className="text-xs font-bold text-gray-400 line-clamp-2">{p.description}</p>
                  </Link>
                ))}
                {data.projects?.length === 0 && <p className="text-center py-10 text-gray-400 font-bold col-span-2">No projects assigned</p>}
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-wide text-gray-400">Total Worked</p>
                  <p className="mt-1 text-xl font-black text-blue-700">{formatDuration(attendanceSummary.totalWorkedMinutes)}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-wide text-gray-400">Present Days</p>
                  <p className="mt-1 text-xl font-black text-emerald-700">{attendanceSummary.presentDays}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-wide text-gray-400">Avg Hours / Day</p>
                  <p className="mt-1 text-xl font-black text-violet-700">{averageWorkedHours}h</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-wide text-gray-400">Attendance Rate</p>
                  <p className="mt-1 text-xl font-black text-gray-900">{attendanceRate}%</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
                  <h4 className="font-black text-gray-800 mb-4 flex items-center gap-2">
                    <Timer size={18} className="text-blue-600" />
                    Last 7 Days Work Hours
                  </h4>
                  {attendanceTrendData.some((entry) => entry.hours > 0) ? (
                    <div className="h-52" role="img" aria-label="Worked hours trend chart">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={attendanceTrendData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="workedHoursGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#2563EB" stopOpacity={0.04} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="day" tickLine={false} axisLine={false} />
                          <YAxis tickLine={false} axisLine={false} />
                          <Tooltip formatter={(value) => [`${value} hrs`, 'Worked']} />
                          <Area type="monotone" dataKey="hours" stroke="#2563EB" strokeWidth={2.5} fill="url(#workedHoursGradient)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-52 flex items-center justify-center rounded-2xl border border-dashed border-gray-200 text-sm font-bold text-gray-400">
                      No recent attendance logs
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
                  <h4 className="font-black text-gray-800 mb-4 flex items-center gap-2">
                    <Calendar size={18} className="text-purple-600" />
                    Monthly Attendance Split
                  </h4>
                  {monthAttendanceBreakdown.some((entry) => entry.value > 0) ? (
                    <div className="h-52" role="img" aria-label="Monthly attendance split pie chart">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={monthAttendanceBreakdown}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={46}
                            outerRadius={74}
                            paddingAngle={2}
                          >
                            {monthAttendanceBreakdown.map((entry, index) => (
                              <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [value, 'Days']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-52 flex items-center justify-center rounded-2xl border border-dashed border-gray-200 text-sm font-bold text-gray-400">
                      No month data yet
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {monthAttendanceBreakdown.map((entry, index) => (
                      <span key={entry.name} className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-gray-600">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                        {entry.name}: {entry.value}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-black text-gray-800 flex items-center gap-2">
                    <Calendar size={18} className="text-purple-600" />
                    Attendance Calendar
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const prev = new Date(attendanceMonth);
                        prev.setMonth(prev.getMonth() - 1);
                        setAttendanceMonth(new Date(prev.getFullYear(), prev.getMonth(), 1));
                      }}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="text-xs font-black text-gray-600 min-w-28 text-center">
                      {attendanceMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                    <button
                      onClick={() => {
                        const next = new Date(attendanceMonth);
                        next.setMonth(next.getMonth() + 1);
                        setAttendanceMonth(new Date(next.getFullYear(), next.getMonth(), 1));
                      }}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-[10px] font-black uppercase text-gray-400 mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label) => (
                    <div key={label} className="text-center">{label}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {attendanceCalendarCells.map((cell, idx) => {
                    if (!cell) return <div key={`empty-${idx}`} className="h-9 rounded-md bg-gray-50" />;

                    const currentKey = dateKey(cell);
                    const isSunday = cell.getDay() === 0;
                    let type = 'absent';

                    if (approvedLeaveDates.has(currentKey)) type = 'leave';
                    else if (isSunday) type = 'sunday';
                    else if (attendanceMap[currentKey]?.status === 'present' || attendanceMap[currentKey]?.status === 'late') type = 'present';

                    const typeClassMap = {
                      present: 'bg-emerald-100 text-emerald-700',
                      leave: 'bg-violet-100 text-violet-700',
                      sunday: 'bg-amber-100 text-amber-700',
                      absent: 'bg-rose-100 text-rose-700'
                    };

                    return (
                      <div key={currentKey} className={`h-9 rounded-md flex items-center justify-center text-[11px] font-black ${typeClassMap[type]}`}>
                        {cell.getDate()}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <th className="pb-4 px-4">Date</th>
                        <th className="pb-4 px-4">Check In</th>
                        <th className="pb-4 px-4">Check Out</th>
                        <th className="pb-4 px-4">Worked</th>
                        <th className="pb-4 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {data.attendance?.map((attendanceRecord) => (
                        <tr key={attendanceRecord._id} className="group hover:bg-gray-50/30 transition-colors">
                          <td className="py-4 px-4 text-sm font-black text-gray-700">{attendanceRecord.date}</td>
                          <td className="py-4 px-4 text-sm font-bold text-gray-500">{attendanceRecord.punchIn || '--:--'}</td>
                          <td className="py-4 px-4 text-sm font-bold text-gray-500">{attendanceRecord.punchOut || '--:--'}</td>
                          <td className="py-4 px-4 text-sm font-black text-blue-700">{formatDuration(calculateWorkedMinutes(attendanceRecord))}</td>
                          <td className="py-4 px-4 text-right">
                            <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${(attendanceRecord.status === 'present' || attendanceRecord.status === 'late') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{attendanceRecord.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'leaves' && (
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
              <div className="space-y-4">
                {data.leaves?.map(l => (
                  <div key={l._id} className="p-6 bg-gray-50/50 rounded-[2rem] border border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${l.status === 'approved' ? 'bg-green-100 text-green-600' : l.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                        {l.status === 'approved' ? <CheckCircle2 size={20}/> : l.status === 'rejected' ? <XCircle size={20}/> : <AlertCircle size={20}/>}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-black text-gray-900 capitalize">{l.type} Leave</h5>
                          <span className="text-[10px] font-black text-gray-400">•</span>
                          <p className="text-xs font-bold text-gray-500">{new Date(l.from).toLocaleDateString()} - {new Date(l.to).toLocaleDateString()}</p>
                        </div>
                        <p className="text-xs font-bold text-gray-400 mt-1">{l.reason}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full ${l.status === 'approved' ? 'bg-green-100 text-green-600' : l.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                      {l.status}
                    </span>
                  </div>
                ))}
                {data.leaves?.length === 0 && <p className="text-center py-10 text-gray-400 font-bold">No leave history</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {showPassModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-black mb-2 text-gray-900">Reset Password</h3>
            <p className="text-sm font-bold text-gray-400 mb-8 uppercase tracking-tighter">Enter a new secure password</p>
            <form onSubmit={changePass} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">New Password</label>
                <div className="relative">
                  <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                  <input type="password" required className="w-full pl-12 pr-6 py-4 bg-gray-50 border-transparent rounded-[1.5rem] focus:bg-white focus:border-purple-200 border outline-none font-bold transition-all shadow-inner" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowPassModal(false)} className="flex-1 py-4 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-600">Cancel</button>
                <button type="submit" className="flex-1 bg-purple-600 text-white font-black text-xs uppercase tracking-widest py-4 rounded-[1.5rem] shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default EmployeeDetails;
