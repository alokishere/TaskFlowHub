import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { ArrowLeft, Briefcase, Calendar, Users, MessageSquare } from 'lucide-react';
import API from '../../services/api';
import { imageBaseUrl } from '../../services/api';
import { useEmployees } from '../../hooks/useQueries';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const AddProject = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: employees = [], isLoading } = useEmployees();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
  });
  const [assignments, setAssignments] = useState([]);

  const createProjectMutation = useMutation({
    mutationFn: async (data) => {
      await API.post('/projects', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate('/admin/projects');
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to create project');
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleAssignment = (userId) => {
    if (assignments.find(a => a.userId === userId)) {
      setAssignments(assignments.filter(a => a.userId !== userId));
    } else {
      setAssignments([...assignments, { userId, message: '' }]);
    }
  };

  const handleMessageChange = (userId, message) => {
    setAssignments(assignments.map(a => a.userId === userId ? { ...a, message } : a));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (assignments.length === 0) {
      return alert('Please assign at least one employee');
    }
    createProjectMutation.mutate({
      ...formData,
      assignments
    });
  };

  if (isLoading) return <Layout role="admin"><div className="py-20 text-center"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600 mx-auto" /></div></Layout>;

  return (
    <Layout role="admin">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Create New Project</h2>
          <p className="text-gray-500">Define a new project and assign tasks to employees.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Project Title</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-purple-200 outline-none transition-all"
                  placeholder="e.g. Website Redesign"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Description</label>
              <textarea
                name="description"
                required
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-purple-200 outline-none transition-all resize-none"
                placeholder="What is this project about?"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Deadline</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="date"
                  name="deadline"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-purple-200 outline-none transition-all"
                  value={formData.deadline}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <MessageSquare size={20} className="text-purple-600" />
              Direct Task Messages
            </h3>
            {assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((a) => {
                  const emp = employees.find(e => e.id === a.userId);
                  return (
                    <div key={a.userId} className="p-4 bg-gray-50 rounded-2xl space-y-3 border border-gray-100">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center text-[10px] text-purple-600">
                          {emp?.name.charAt(0)}
                        </div>
                        {emp?.name}
                      </div>
                      <textarea
                        required
                        placeholder={`Assign specific task for ${emp?.name}...`}
                        className="w-full px-4 py-2 bg-white rounded-lg border border-gray-100 outline-none focus:border-purple-200 text-sm transition-all"
                        value={a.message}
                        onChange={(e) => handleMessageChange(a.userId, e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-400 text-sm">Select employees on the right to assign tasks.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Users size={20} className="text-purple-600" />
              Assign Employees
            </h3>
            <div className="space-y-2 max-h-100 overflow-y-auto pr-2 custom-scrollbar">
              {employees.map((emp) => (
                <label 
                  key={emp.id} 
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                    assignments.find(a => a.userId === emp.id) 
                      ? 'bg-purple-50 border-purple-100' 
                      : 'bg-gray-50 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-xs font-bold text-purple-600">
                      {emp.image ? <img src={`${imageBaseUrl}${emp.image}`} alt={emp.name} className="w-full h-full object-cover rounded-lg" /> : emp.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-800">{emp.name}</div>
                      <div className="text-[10px] text-gray-500">{emp.department}</div>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={!!assignments.find(a => a.userId === emp.id)}
                    onChange={() => toggleAssignment(emp.id)}
                  />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    assignments.find(a => a.userId === emp.id) ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                  }`}>
                    {assignments.find(a => a.userId === emp.id) && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={createProjectMutation.isPending}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-3xl transition-all shadow-lg shadow-purple-100 disabled:opacity-70"
          >
            {createProjectMutation.isPending ? 'Creating Project...' : 'Launch Project'}
          </button>
        </div>
      </form>
    </Layout>
  );
};

export default AddProject;
