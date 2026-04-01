import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { FileText, Check, X, Clock, Filter } from 'lucide-react';
import API from '../../services/api';
import { imageBaseUrl } from '../../services/api';
const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/leaves/all?status=${status}`);
      setLeaves(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [status]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await API.patch(`/leaves/${id}/status`, { status: newStatus });
      fetchLeaves();
    } catch (err) {
      alert('Failed to update leave status');
    }
  };

  return (
    <Layout role="admin">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight">Leave Management</h2>
          <p className="text-sm font-medium text-gray-500">Review and manage employee leave requests.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-4 md:p-8">
        <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <Filter size={18} className="text-gray-400 shrink-0" />
          <div className="flex bg-gray-50 p-1.5 rounded-2xl shrink-0">
            {['pending', 'approved', 'rejected'].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  status === s ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="pb-4 px-4">Employee</th>
                <th className="pb-4 px-4">Type</th>
                <th className="pb-4 px-4">Duration</th>
                <th className="pb-4 px-4">Reason</th>
                <th className="pb-4 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leaves.map((leave) => (
                <tr key={leave._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold overflow-hidden">
                        {leave.userId?.image ? <img src={`${imageBaseUrl}${leave.userId.image}`} alt="" className="w-full h-full object-cover" /> : leave.userId?.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{leave.userId?.name}</div>
                        <div className="text-[10px] text-gray-500">{leave.userId?.department}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-medium text-gray-700 capitalize">{leave.type}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-xs font-bold text-gray-600">
                      {new Date(leave.from).toLocaleDateString()} — {new Date(leave.to).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-xs text-gray-500 max-w-xs line-clamp-2" title={leave.reason}>{leave.reason}</p>
                  </td>
                  <td className="py-4 px-4">
                    {leave.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleStatusUpdate(leave._id, 'approved')}
                          className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all"
                          title="Approve"
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(leave._id, 'rejected')}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                          title="Reject"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${
                        leave.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {leave.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && leaves.length === 0 && (
            <div className="text-center py-20 text-gray-400 flex flex-col items-center">
              <Clock size={48} className="mb-4 opacity-20" />
              <p>No {status} leave requests found.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LeaveManagement;
