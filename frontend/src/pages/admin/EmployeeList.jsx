import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { Search, Plus, Edit, Trash2, Lock, Unlock, MoreHorizontal } from 'lucide-react';
import API from '../../services/api';
import { imageBaseUrl } from '../../services/api';
const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      const { data } = await API.get(`/users?search=${search}&department=${department}`);
      setEmployees(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, department]);

  const toggleStatus = async (id) => {
    try {
      await API.patch(`/users/${id}/toggle-status`);
      fetchEmployees();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const deleteEmployee = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await API.delete(`/users/${id}`);
        fetchEmployees();
      } catch (err) {
        alert('Failed to delete employee');
      }
    }
  };

  return (
    <Layout role="admin">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Employee Management</h2>
          <p className="text-gray-500">Manage your workforce, view details, and onboard new staff.</p>
        </div>
        <Link 
          to="/admin/employees/add"
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-purple-100"
        >
          <Plus size={20} />
          Add Employee
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search employees..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-purple-200 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-3 bg-gray-50 rounded-xl border border-transparent outline-none min-w-50"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">All Departments</option>
            <option value="Management">Management</option>
            <option value="Operations">Operations</option>
            <option value="IT">IT</option>
            <option value="HR">HR</option>
            <option value="Sales">Sales</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="pb-4 font-semibold text-gray-500 px-4">Profile</th>
                <th className="pb-4 font-semibold text-gray-500 px-4">Role & Dept</th>
                <th className="pb-4 font-semibold text-gray-500 px-4">Contact</th>
                <th className="pb-4 font-semibold text-gray-500 px-4">Status</th>
                <th className="pb-4 font-semibold text-gray-500 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold overflow-hidden">
                        {emp.image ? (
                          <img src={`${imageBaseUrl}${emp.image}`} alt={emp.name} className="w-full h-full object-cover" />
                        ) : (
                          emp.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <Link to={`/admin/employees/${emp.id}`} className="font-bold text-gray-900 hover:text-purple-600 transition-colors">{emp.name}</Link>
                        <div className="text-xs text-gray-500">{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm font-medium text-gray-900">{emp.role}</div>
                    <div className="text-xs text-gray-500">{emp.department}</div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {emp.mobile}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${emp.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Link 
                        to={`/admin/employees/edit/${emp.id}`}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                      >
                        <Edit size={18} />
                      </Link>
                      <button 
                        onClick={() => toggleStatus(emp.id)}
                        className={`p-2 rounded-lg transition-all ${emp.status === 'active' ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
                      >
                        {emp.status === 'active' ? <Lock size={18} /> : <Unlock size={18} />}
                      </button>
                      <button 
                        onClick={() => deleteEmployee(emp.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && employees.length === 0 && (
            <div className="text-center py-20 text-gray-500">No employees found.</div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeList;
