import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { DollarSign, Search, Plus, History, Calendar, CheckCircle } from 'lucide-react';
import API from '../../services/api';
import { imageBaseUrl } from '../../services/api';

const SalaryManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: '',
    note: ''
  });

  const fetchEmployees = async () => {
    try {
      const { data } = await API.get('/users');
      setEmployees(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const viewHistory = async (emp) => {
    setSelectedEmp(emp);
    setLoading(true);
    try {
      const { data } = await API.get(`/salaries/${emp.id}`);
      setHistory(data.data);
      setFormData({ ...formData, amount: emp.salary });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      await API.post('/salaries', {
        userId: selectedEmp.id,
        ...formData
      });
      setShowModal(false);
      viewHistory(selectedEmp);
    } catch (err) {
      alert('Failed to add payment record');
    }
  };

  return (
    <Layout role="admin">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Salary Management</h2>
          <p className="text-gray-500">Manage payroll and view employee payment history.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm h-fit">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Select Employee</h3>
          <div className="space-y-3 max-h-150 overflow-y-auto pr-2 custom-scrollbar">
            {employees.map((emp) => (
              <button
                key={emp.id}
                onClick={() => viewHistory(emp)}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all border ${
                  selectedEmp?.id === emp.id ? 'bg-purple-50 border-purple-100' : 'bg-gray-50 border-transparent hover:bg-gray-100'
                }`}
              >
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-purple-600 font-bold border border-gray-100 overflow-hidden">
                  {emp.image ? <img src={`${imageBaseUrl}${emp.image}`} alt={emp.name} className="w-full h-full object-cover" /> : emp.name.charAt(0)}
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-gray-800">{emp.name}</div>
                  <div className="text-[10px] text-gray-500">{emp.department}</div>
                </div>
                <div className="ml-auto text-xs font-bold text-purple-600">₹{emp.salary}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {selectedEmp ? (
            <>
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 font-bold text-2xl">
                    {selectedEmp.image ? <img src={`${imageBaseUrl}${selectedEmp.image}`} alt={selectedEmp.name} className="w-full h-full object-cover rounded-2xl" /> : selectedEmp.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedEmp.name}</h3>
                    <p className="text-gray-500 font-medium">Monthly Salary: ₹{selectedEmp.salary}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-100"
                >
                  <Plus size={20} />
                  Add Payment
                </button>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <History size={20} className="text-purple-600" />
                  Payment History
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <th className="pb-4 px-4">Period</th>
                        <th className="pb-4 px-4">Amount</th>
                        <th className="pb-4 px-4">Paid On</th>
                        <th className="pb-4 px-4">Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {history.map((h) => (
                        <tr key={h._id}>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                              <Calendar size={14} className="text-gray-400" />
                              {new Date(0, h.month - 1).toLocaleString('default', { month: 'long' })} {h.year}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm font-bold text-green-600">₹{h.amount}</span>
                          </td>
                          <td className="py-4 px-4 text-xs text-gray-500 font-medium">
                            {new Date(h.paidOn).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4 text-xs text-gray-400">
                            {h.note || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!loading && history.length === 0 && (
                    <div className="text-center py-10 text-gray-400">No payment records found.</div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-3xl p-20 border border-dashed border-gray-200 text-center flex flex-col items-center justify-center">
              <DollarSign size={64} className="text-gray-200 mb-4" />
              <h3 className="text-xl font-bold text-gray-400">Select an employee to manage salary</h3>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Add Payment Record</h3>
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Month</label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-purple-200 outline-none transition-all border"
                    value={formData.month}
                    onChange={(e) => setFormData({...formData, month: e.target.value})}
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Year</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-purple-200 outline-none transition-all border"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Amount</label>
                <input 
                  type="number" 
                  required
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-purple-200 outline-none transition-all border font-bold text-green-600"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Note</label>
                <textarea 
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-purple-200 outline-none transition-all border resize-none"
                  rows={2}
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  placeholder="Salary for the month..."
                />
              </div>
              <div className="flex gap-4 mt-8">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-3 rounded-xl shadow-lg shadow-purple-100 transition-all"
                >
                  Pay Salary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SalaryManagement;
