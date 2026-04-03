import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { Search, Plus, Edit, Trash2, Lock, Unlock } from 'lucide-react';
import API from '../../services/api';
import { imageBaseUrl } from '../../services/api';
import { useEmployees } from '../../hooks/useQueries';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const EmployeeList = () => {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const queryClient = useQueryClient();

  const { data: employees = [], isLoading } = useEmployees(search, department);

  const toggleStatusMutation = useMutation({
    mutationFn: async (id) => {
      await API.patch(`/users/${id}/toggle-status`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: () => {
      alert('Failed to update status');
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id) => {
      await API.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: () => {
      alert('Failed to delete employee');
    },
  });

  const toggleStatus = (id) => {
    toggleStatusMutation.mutate(id);
  };

  const deleteEmployee = (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      deleteEmployeeMutation.mutate(id);
    }
  };

  return (
    <Layout role="admin">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight">Employee Management</h2>
          <p className="text-sm font-medium text-gray-500">Manage your workforce, view details, and onboard new staff.</p>
        </div>
        <Link 
          to="/admin/employees/add"
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-200 active:scale-95"
        >
          <Plus size={18} />
          Add Employee
        </Link>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-4 md:p-8">
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search employees by name or email..."
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 rounded-2xl border border-transparent focus:bg-white focus:border-purple-200 outline-none transition-all font-medium text-sm shadow-inner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="flex-1 lg:w-60 px-4 py-3.5 bg-gray-50/50 rounded-2xl border border-transparent outline-none font-bold text-sm text-gray-700 transition-all focus:bg-white focus:border-purple-200 shadow-inner"
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
                        disabled={toggleStatusMutation.isPending}
                        className={`p-2 rounded-lg transition-all ${emp.status === 'active' ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
                      >
                        {emp.status === 'active' ? <Lock size={18} /> : <Unlock size={18} />}
                      </button>
                      <button 
                        onClick={() => deleteEmployee(emp.id)}
                        disabled={deleteEmployeeMutation.isPending}
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
          {!isLoading && employees.length === 0 && (
            <div className="text-center py-20 text-gray-500">No employees found.</div>
          )}
          {isLoading && (
            <div className="flex justify-center py-20">
               <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600" />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeList;
