import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { FileText, Calendar, Send, History, Clock } from 'lucide-react';
import API from '../../services/api';

const LeaveRequest = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'sick',
    from: '',
    to: '',
    reason: ''
  });

  const fetchHistory = async () => {
    try {
      const { data } = await API.get('/leaves/my');
      setHistory(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/leaves', formData);
      setFormData({ type: 'sick', from: '', to: '', reason: '' });
      fetchHistory();
    } catch (err) {
      alert('Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout role="employee">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Leave Request</h2>
          <p className="text-gray-500">Apply for time off and track your leave status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm h-fit space-y-6">
          <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Send size={20} className="text-blue-600" />
            New Application
          </h3>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Leave Type</label>
            <select
              name="type"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-blue-200 outline-none transition-all border"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="sick">Sick Leave</option>
              <option value="casual">Casual Leave</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">From Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="date"
                  name="from"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-blue-200 outline-none transition-all border text-sm"
                  value={formData.from}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">To Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="date"
                  name="to"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-blue-200 outline-none transition-all border text-sm"
                  value={formData.to}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Reason</label>
            <textarea
              name="reason"
              required
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-blue-200 outline-none transition-all border resize-none text-sm"
              placeholder="Provide a brief reason for your leave..."
              value={formData.reason}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-100 disabled:opacity-70"
          >
            {loading ? 'Submitting...' : 'Send Request'}
          </button>
        </form>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <History size={20} className="text-blue-600" />
            My Leave History
          </h3>
          <div className="space-y-4">
            {history.map((leave) => (
              <div key={leave._id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold text-gray-800 capitalize">{leave.type} Leave</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                    leave.status === 'approved' ? 'bg-green-100 text-green-600' : 
                    leave.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {leave.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                  <Calendar size={14} />
                  {new Date(leave.from).toLocaleDateString()} — {new Date(leave.to).toLocaleDateString()}
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{leave.reason}</p>
              </div>
            ))}
            {history.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <Clock size={48} className="mx-auto mb-4 opacity-20" />
                <p>No leave requests found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LeaveRequest;
