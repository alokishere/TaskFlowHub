import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { 
  ArrowLeft, Briefcase, FileText,
  Trash2, Lock, Unlock, Key, Upload, File, Download,
  CheckCircle2, AlertCircle, XCircle, TrendingUp, Calendar,
  ChevronLeft, ChevronRight, Timer
} from 'lucide-react';
import API from '../../services/api';

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
              {data.image ? <img src={`http://localhost:5001/${data.image}`} className="w-full h-full object-cover transition-transform group-hover:scale-110"/> : <span className="text-4xl font-black text-purple-600 leading-[8rem]">{data.name.charAt(0)}</span>}
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
                    <a href={`http://localhost:5001/${doc.fileUrl}`} target="_blank" className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl"><Download size={14}/></a>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="font-black text-gray-800 flex items-center gap-2"><TrendingUp size={20} className="text-purple-600"/> Work Progress</h4>
                  <span className="text-2xl font-black text-purple-600">{calculateProgress()}%</span>
                </div>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden mb-6 shadow-inner">
                  <div className="h-full bg-linear-to-r from-purple-500 to-blue-500 transition-all duration-1000 ease-out" style={{ width: `${calculateProgress()}%` }}></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-xl font-black text-gray-800">{data.tasks?.length || 0}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Total Tasks</p>
                  </div>
                  <div className="text-center border-x border-gray-50">
                    <p className="text-xl font-black text-green-600">{data.tasks?.filter(t => t.status === 'completed').length || 0}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-black text-blue-600">{data.tasks?.filter(t => t.status === 'in-progress').length || 0}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Ongoing</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                <h4 className="font-black text-gray-800 mb-6 flex items-center gap-2"><Calendar size={20} className="text-blue-600"/> Stats</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl">
                    <span className="text-xs font-bold text-gray-500">Active Projects</span>
                    <span className="text-sm font-black text-gray-800">{data.projects?.filter(p => p.status !== 'completed').length}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl">
                    <span className="text-xs font-bold text-gray-500">Leaves Taken</span>
                    <span className="text-sm font-black text-gray-800">{data.leaves?.filter(l => l.status === 'approved').length}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl">
                    <span className="text-xs font-bold text-gray-500">Attendance Rate</span>
                    <span className="text-sm font-black text-gray-800">{attendanceRate}%</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                  <h4 className="font-black text-gray-800 mb-6 flex items-center gap-2">
                    <Timer size={18} className="text-blue-600" />
                    Hours Summary
                  </h4>
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-blue-50">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Total Worked</p>
                      <p className="text-2xl font-black text-blue-700 mt-1">{formatDuration(attendanceSummary.totalWorkedMinutes)}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-50">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Days Present</p>
                      <p className="text-2xl font-black text-emerald-700 mt-1">{attendanceSummary.presentDays}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
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
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
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
                      {data.attendance?.map(a => (
                        <tr key={a._id} className="group hover:bg-gray-50/30 transition-colors">
                          <td className="py-4 px-4 text-sm font-black text-gray-700">{a.date}</td>
                          <td className="py-4 px-4 text-sm font-bold text-gray-500">{a.punchIn || '--:--'}</td>
                          <td className="py-4 px-4 text-sm font-bold text-gray-500">{a.punchOut || '--:--'}</td>
                          <td className="py-4 px-4 text-sm font-black text-blue-700">{formatDuration(calculateWorkedMinutes(a))}</td>
                          <td className="py-4 px-4 text-right">
                            <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${(a.status === 'present' || a.status === 'late') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{a.status}</span>
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
