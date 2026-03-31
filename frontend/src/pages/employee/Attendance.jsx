import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { Clock, LogIn, LogOut, Calendar, CheckCircle } from 'lucide-react';
import API from '../../services/api';

const Attendance = () => {
  const [history, setHistory] = useState([]);
  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAttendance = async () => {
    try {
      const { data } = await API.get('/attendance/my');
      setHistory(data.data);
      const todayStr = new Date().toISOString().split('T')[0];
      const todayRecord = data.data.find(h => h.date === todayStr);
      setToday(todayRecord);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

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

  return (
    <Layout role="employee">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Attendance</h2>
          <p className="text-gray-500">Track your daily work hours and timesheet.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <h3 className="text-6xl font-black text-gray-900 mb-2">{currentTime}</h3>
          <p className="text-gray-400 font-medium mb-10">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
          
          <div className="flex gap-6 w-full max-w-md">
            <button
              onClick={handlePunchIn}
              disabled={today?.punchIn}
              className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-3xl transition-all ${
                today?.punchIn 
                  ? 'bg-gray-50 text-gray-400 border border-gray-100' 
                  : 'bg-green-50 text-green-600 border border-green-100 hover:bg-green-100'
              }`}
            >
              <LogIn size={32} />
              <span className="font-bold">{today?.punchIn ? `Punched In at ${today.punchIn}` : 'Punch In'}</span>
            </button>
            
            <button
              onClick={handlePunchOut}
              disabled={!today?.punchIn || today?.punchOut}
              className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-3xl transition-all ${
                today?.punchOut || !today?.punchIn
                  ? 'bg-gray-50 text-gray-400 border border-gray-100' 
                  : 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'
              }`}
            >
              <LogOut size={32} />
              <span className="font-bold">{today?.punchOut ? `Punched Out at ${today.punchOut}` : 'Punch Out'}</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Overview</h3>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Worked This Week</p>
                <h4 className="text-xl font-bold text-gray-900">32h 45m</h4>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Days Present</p>
                <h4 className="text-xl font-bold text-gray-900">{history.filter(h => h.status === 'present').length}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Recent Attendance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="pb-4 px-4">Date</th>
                <th className="pb-4 px-4">Punch In</th>
                <th className="pb-4 px-4">Punch Out</th>
                <th className="pb-4 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {history.map((h) => (
                <tr key={h._id}>
                  <td className="py-4 px-4 text-sm font-bold text-gray-700">{h.date}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{h.punchIn || '--:--'}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{h.punchOut || '--:--'}</td>
                  <td className="py-4 px-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${
                      h.status === 'present' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {h.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && history.length === 0 && (
            <div className="text-center py-10 text-gray-400">No attendance history yet.</div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Attendance;
