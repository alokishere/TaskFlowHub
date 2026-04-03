import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { ArrowLeft, User, Mail, Phone, Briefcase, DollarSign, Upload } from 'lucide-react';
import API from '../../services/api';
import { useEmployeeDetails } from '../../hooks/useQueries';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: employee, isLoading: fetching } = useEmployeeDetails(id);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    role: '',
    department: '',
    salary: '',
  });
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        mobile: employee.mobile,
        role: employee.role,
        department: employee.department,
        salary: employee.salary,
      });
    }
  }, [employee]);

  const updateEmployeeMutation = useMutation({
    mutationFn: async (data) => {
      await API.put(`/users/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', id] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      navigate('/admin/employees');
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to update employee');
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (image) data.append('image', image);
    updateEmployeeMutation.mutate(data);
  };

  if (fetching) return <Layout role="admin"><div className="py-20 text-center"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600 mx-auto" /></div></Layout>;
  if (!employee) return <Layout role="admin">Not found</Layout>;

  return (
    <Layout role="admin">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Edit Employee</h2>
          <p className="text-gray-500">Update staff information and preferences.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="name"
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-purple-200 outline-none transition-all"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                name="email"
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-purple-200 outline-none transition-all"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Mobile Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="mobile"
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-purple-200 outline-none transition-all"
                value={formData.mobile}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Department</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <select
                name="department"
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-purple-200 outline-none transition-all appearance-none"
                value={formData.department}
                onChange={handleChange}
              >
                <option value="Management">Management</option>
                <option value="Operations">Operations</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Sales">Sales</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Salary (per month)</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="number"
                name="salary"
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-purple-200 outline-none transition-all"
                value={formData.salary}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Role</label>
            <select
              name="role"
              required
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-purple-200 outline-none transition-all"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Update Profile Image</label>
            <label className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-dashed border-gray-200 cursor-pointer hover:bg-gray-100 transition-all">
              <Upload className="text-gray-400" size={18} />
              <span className="text-sm text-gray-500">{image ? image.name : 'Choose new file...'}</span>
              <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={updateEmployeeMutation.isPending}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-purple-100 disabled:opacity-70"
        >
          {updateEmployeeMutation.isPending ? 'Updating...' : 'Save Changes'}
        </button>
      </form>
    </Layout>
  );
};

export default EditEmployee;
