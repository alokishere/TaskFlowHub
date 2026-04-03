import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import {
  LogIn,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import API from '../../services/api';
import { useMyAttendance, useMyLeaves } from '../../hooks/useQueries';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const Attendance = () => {
  const [now, setNow] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const current = new Date();
    return new Date(current.getFullYear(), current.getMonth(), 1);
  });

  const queryClient = useQueryClient();
  const { data: history = [], isLoading: attendanceLoading } = useMyAttendance();
  const { data: leaves = [] } = useMyLeaves();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateKey = (date) => date.toLocaleDateString('en-CA');
  const todayKey = dateKey(now);

  const today = useMemo(() => history.find((entry) => entry.date === todayKey) || null, [history, todayKey]);

  const punchInMutation = useMutation({
    mutationFn: async () => {
      await API.post('/attendance/punch-in');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAttendance'] });
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to punch in');
    },
  });

  const punchOutMutation = useMutation({
    mutationFn: async () => {
      await API.post('/attendance/punch-out');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAttendance'] });
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to punch out');
    },
  });

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

  const handlePunchIn = () => {
    punchInMutation.mutate();
  };

  const handlePunchOut = () => {
    punchOutMutation.mutate();
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
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Attendance</h2>
          <p className="text-sm font-medium text-gray-500">Punch in/out and track your work hours.</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-[2.5rem] border border-gray-100 bg-white p-6 md:p-10 shadow-sm flex flex-col justify-center">
          <div className="flex flex-col md:flex-row md:items-baseline gap-2 mb-8">
            <h3 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter">{now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}</h3>
            <span className="text-xl md:text-2xl font-bold text-purple-600 opacity-50">{now.toLocaleTimeString('en-US', { second: '2-digit' })}</span>
          </div>
          <p className="text-sm md:text-base font-bold text-gray-400 uppercase tracking-widest mb-10">
            {now.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handlePunchIn}
              disabled={today?.punchIn || punchInMutation.isPending}
              className={`rounded-2xl border px-6 py-6 text-left transition-all active:scale-95 flex flex-col gap-3 ${
                today?.punchIn
                  ? 'border-gray-50 bg-gray-50 text-gray-400'
                  : 'border-purple-100 bg-purple-50 text-purple-700 hover:bg-purple-100 shadow-sm shadow-purple-100'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                <LogIn size={18} />
                Punch In
              </div>
              <p className="text-sm font-black">{today?.punchIn ? today.punchIn : 'Start Session'}</p>
            </button>

            <button
              onClick={handlePunchOut}
              disabled={!today?.punchIn || today?.punchOut || punchOutMutation.isPending}
              className={`rounded-2xl border px-6 py-6 text-left transition-all active:scale-95 flex flex-col gap-3 ${
                today?.punchOut || !today?.punchIn
                  ? 'border-gray-50 bg-gray-50 text-gray-400'
                  : 'border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 shadow-sm shadow-indigo-100'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                <LogOut size={18} />
                Punch Out
              </div>
              <p className="text-sm font-black">{today?.punchOut ? today.punchOut : 'End Session'}</p>
            </button>
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-gray-100 bg-white p-6 md:p-8 shadow-sm space-y-4">
          <h3 className="text-lg font-black text-gray-800 mb-6">Overview</h3>
          <div className="rounded-3xl bg-purple-50 p-6 border border-purple-100/50">
            <p className="text-[10px] font-black uppercase tracking-widest text-purple-500 mb-1">Today Worked</p>
            <p className="text-3xl font-black text-purple-700">{formatDuration(getWorkedMinutes(today))}</p>
          </div>
          <div className="rounded-3xl bg-indigo-50 p-6 border border-indigo-100/50">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">This Week</p>
            <p className="text-3xl font-black text-indigo-700">{formatDuration(weekWorkedMinutes)}</p>
          </div>
          <div className="rounded-3xl bg-gray-50 p-6 border border-gray-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Logged</p>
            <p className="text-3xl font-black text-gray-700">{formatDuration(totalWorkedMinutes)}</p>
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-[2.5rem] border border-gray-100 bg-white p-4 md:p-8 shadow-sm overflow-hidden">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-black text-gray-800">Attendance Calendar</h3>
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl w-fit">
            <button
              onClick={() => {
                const prev = new Date(selectedMonth);
                prev.setMonth(prev.getMonth() - 1);
                setSelectedMonth(new Date(prev.getFullYear(), prev.getMonth(), 1));
              }}
              className="rounded-xl border border-gray-100 p-2 text-gray-400 hover:bg-white hover:text-purple-600 transition-all bg-white shadow-sm"
            >
              <ChevronLeft size={16} />
            </button>
            <p className="min-w-32 text-center text-xs font-black text-gray-700 uppercase tracking-widest">
              {selectedMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
            <button
              onClick={() => {
                const next = new Date(selectedMonth);
                next.setMonth(next.getMonth() + 1);
                setSelectedMonth(new Date(next.getFullYear(), next.getMonth(), 1));
              }}
              className="rounded-xl border border-gray-100 p-2 text-gray-400 hover:bg-white hover:text-purple-600 transition-all bg-white shadow-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="min-w-[600px]">
            <div className="mb-4 grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
                <div key={dayName} className="text-center text-[10px] font-black uppercase tracking-widest text-gray-300">
                  {dayName}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarCells.map((cellDate, index) => {
                if (!cellDate) return <div key={`empty-${index}`} className="h-16 md:h-20 rounded-2xl bg-gray-50/50" />;

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
                  present: 'border-emerald-100 bg-emerald-50 text-emerald-600',
                  leave: 'border-purple-100 bg-purple-50 text-purple-600',
                  sunday: 'border-amber-100 bg-amber-50 text-amber-600',
                  absent: 'border-rose-100 bg-rose-50 text-rose-600',
                  future: 'border-gray-50 bg-gray-50/50 text-gray-300'
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
                    className={`h-16 md:h-20 rounded-2xl border p-2 md:p-3 transition-all ${typeClassMap[type]} ${isToday ? 'ring-2 ring-purple-400 ring-offset-2' : ''}`}
                  >
                    <p className="text-right text-xs md:text-sm font-black">{cellDate.getDate()}</p>
                    <p className="mt-1 text-[8px] md:text-[10px] font-black uppercase tracking-wider opacity-70">{labelMap[type]}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2 md:gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Present
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-100">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Leave
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Sunday
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Absent
          </div>
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
          {!attendanceLoading && history.length === 0 && (
            <div className="py-10 text-center text-gray-400">No attendance history yet.</div>
          )}
          {attendanceLoading && (
            <div className="flex justify-center py-10">
               <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-purple-600" />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Attendance;
