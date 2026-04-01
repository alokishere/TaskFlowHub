import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import {
  Clock,
  LogIn,
  LogOut,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Timer,
  CircleCheck,
  CircleOff
} from 'lucide-react';
import API from '../../services/api';

const Attendance = () => {
  const [history, setHistory] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const current = new Date();
    return new Date(current.getFullYear(), current.getMonth(), 1);
  });

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateKey = (date) => date.toLocaleDateString('en-CA');
  const todayKey = dateKey(now);

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

  const calculateWorkedMinutes = (punchIn, punchOut) => {
    const inMinutes = parseTimeToMinutes(punchIn);
    const outMinutes = parseTimeToMinutes(punchOut);
    if (inMinutes === null || outMinutes === null) return 0;

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

  const getWorkedMinutes = (record) => {
    if (!record) return 0;
    if (record.punchOut && typeof record.workedMinutes === 'number') return record.workedMinutes;
    if (record.punchOut) return calculateWorkedMinutes(record.punchIn, record.punchOut);
    if (record.date === todayKey && record.punchIn) {
      const currentTime = now.toLocaleTimeString('en-GB', { hour12: false });
      return calculateWorkedMinutes(record.punchIn, currentTime);
    }
    return Number(record.workedMinutes) || 0;
  };

  const fetchAttendance = async () => {
    try {
      const [attendanceRes, leaveRes] = await Promise.all([
        API.get('/attendance/my'),
        API.get('/leaves/my')
      ]);
      const attendanceData = attendanceRes.data.data || [];
      setHistory(attendanceData);
      setLeaves(leaveRes.data.data || []);

      const todayRecord = attendanceData.find((entry) => entry.date === todayKey);
      setToday(todayRecord || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    const todayRecord = history.find((entry) => entry.date === todayKey);
    setToday(todayRecord || null);
  }, [history, todayKey]);

  const handlePunchIn = async () => {
    try {
      await API.post('/attendance/punch-in');
      fetchAttendance();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to punch in');
    }
  };

  const handlePunchOut = async () => {
    try {
      await API.post('/attendance/punch-out');
      fetchAttendance();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to punch out');
    }
  };

  const attendanceMap = useMemo(() => {
    const map = {};
    history.forEach((entry) => {
      map[entry.date] = entry;
    });
    return map;
  }, [history]);

  const approvedLeaveDates = useMemo(() => {
    const set = new Set();
    leaves
      .filter((leave) => leave.status === 'approved')
      .forEach((leave) => {
        const start = toDateOnly(leave.from);
        const end = toDateOnly(leave.to);
        for (let current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
          set.add(dateKey(current));
        }
      });
    return set;
  }, [leaves]);

  const calendarCells = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const totalDays = new Date(year, month + 1, 0).getDate();
    const firstWeekday = firstDay.getDay();
    const cells = [];

    for (let i = 0; i < firstWeekday; i += 1) {
      cells.push(null);
    }

    for (let day = 1; day <= totalDays; day += 1) {
      cells.push(new Date(year, month, day));
    }

    return cells;
  }, [selectedMonth]);

  const weekWorkedMinutes = useMemo(() => {
    const start = new Date(now);
    const day = start.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - diffToMonday);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return history.reduce((sum, entry) => {
      const entryDate = toDateOnly(entry.date);
      if (entryDate < start || entryDate > end) return sum;
      return sum + getWorkedMinutes(entry);
    }, 0);
  }, [history, now]);

  const totalWorkedMinutes = useMemo(
    () => history.reduce((sum, entry) => sum + getWorkedMinutes(entry), 0),
    [history, now]
  );

  return (
    <Layout role="employee">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900">Attendance</h2>
        <p className="text-gray-500">Punch in/out, track daily work hours, and monitor present/leave/weekend days on calendar.</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <h3 className="text-6xl font-black text-gray-900">{now.toLocaleTimeString('en-US', { hour12: false })}</h3>
          <p className="mt-2 text-sm font-medium text-gray-500">
            {now.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <button
              onClick={handlePunchIn}
              disabled={today?.punchIn}
              className={`rounded-2xl border px-5 py-5 text-left transition ${
                today?.punchIn
                  ? 'border-gray-100 bg-gray-50 text-gray-400'
                  : 'border-green-100 bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                <LogIn size={20} />
                Punch In
              </div>
              <p className="text-sm font-semibold">{today?.punchIn ? today.punchIn : 'Start your workday timer'}</p>
            </button>

            <button
              onClick={handlePunchOut}
              disabled={!today?.punchIn || today?.punchOut}
              className={`rounded-2xl border px-5 py-5 text-left transition ${
                today?.punchOut || !today?.punchIn
                  ? 'border-gray-100 bg-gray-50 text-gray-400'
                  : 'border-red-100 bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                <LogOut size={20} />
                Punch Out
              </div>
              <p className="text-sm font-semibold">{today?.punchOut ? today.punchOut : 'End shift and lock worked hours'}</p>
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-black text-gray-800">Overview</h3>
          <div className="space-y-4">
            <div className="rounded-2xl bg-blue-50 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-blue-500">Today Worked</p>
              <p className="mt-1 text-2xl font-black text-blue-700">{formatDuration(getWorkedMinutes(today))}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-emerald-500">This Week</p>
              <p className="mt-1 text-2xl font-black text-emerald-700">{formatDuration(weekWorkedMinutes)}</p>
            </div>
            <div className="rounded-2xl bg-violet-50 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-violet-500">Total Logged</p>
              <p className="mt-1 text-2xl font-black text-violet-700">{formatDuration(totalWorkedMinutes)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-black text-gray-800">Attendance Calendar</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const prev = new Date(selectedMonth);
                prev.setMonth(prev.getMonth() - 1);
                setSelectedMonth(new Date(prev.getFullYear(), prev.getMonth(), 1));
              }}
              className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50"
            >
              <ChevronLeft size={16} />
            </button>
            <p className="min-w-40 text-center text-sm font-black text-gray-700">
              {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
            <button
              onClick={() => {
                const next = new Date(selectedMonth);
                next.setMonth(next.getMonth() + 1);
                setSelectedMonth(new Date(next.getFullYear(), next.getMonth(), 1));
              }}
              className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
            <div key={dayName} className="text-center text-xs font-black uppercase tracking-widest text-gray-400">
              {dayName}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarCells.map((cellDate, index) => {
            if (!cellDate) return <div key={`empty-${index}`} className="h-20 rounded-xl bg-gray-50/40" />;

            const currentKey = dateKey(cellDate);
            const record = attendanceMap[currentKey];
            const isFuture = cellDate > now;
            const isSunday = cellDate.getDay() === 0;
            const isToday = currentKey === todayKey;
            let type = 'absent';

            if (isFuture) type = 'future';
            else if (approvedLeaveDates.has(currentKey)) type = 'leave';
            else if (isSunday) type = 'sunday';
            else if (record?.status === 'present' || record?.status === 'late') type = 'present';

            const typeClassMap = {
              present: 'border-emerald-200 bg-emerald-50 text-emerald-700',
              leave: 'border-violet-200 bg-violet-50 text-violet-700',
              sunday: 'border-amber-200 bg-amber-50 text-amber-700',
              absent: 'border-rose-200 bg-rose-50 text-rose-700',
              future: 'border-gray-200 bg-gray-50 text-gray-400'
            };

            const labelMap = {
              present: 'Present',
              leave: 'Leave',
              sunday: 'Sunday',
              absent: 'Absent',
              future: '--'
            };

            return (
              <div
                key={currentKey}
                className={`h-20 rounded-xl border p-2 ${typeClassMap[type]} ${isToday ? 'ring-2 ring-blue-400' : ''}`}
              >
                <p className="text-right text-sm font-black">{cellDate.getDate()}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-wider">{labelMap[type]}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700"><CircleCheck size={12} /> Present</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-violet-700"><Calendar size={12} /> Leave</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-amber-700"><CircleOff size={12} /> Sunday</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-rose-700"><Clock size={12} /> Absent</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-blue-700"><Timer size={12} /> Today</span>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <h3 className="mb-6 text-lg font-bold text-gray-800">Recent Attendance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">
                <th className="px-4 pb-4">Date</th>
                <th className="px-4 pb-4">Punch In</th>
                <th className="px-4 pb-4">Punch Out</th>
                <th className="px-4 pb-4">Worked</th>
                <th className="px-4 pb-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {history.map((entry) => (
                <tr key={entry._id}>
                  <td className="px-4 py-4 text-sm font-bold text-gray-700">{entry.date}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{entry.punchIn || '--:--'}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{entry.punchOut || '--:--'}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-blue-700">{formatDuration(getWorkedMinutes(entry))}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                      entry.status === 'present' || entry.status === 'late'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-red-50 text-red-600'
                    }`}>
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && history.length === 0 && (
            <div className="py-10 text-center text-gray-400">No attendance history yet.</div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Attendance;
