import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { User, Mail, Phone, Lock, Upload, CheckCircle } from 'lucide-react';
import API from '../../services/api';
import { imageBaseUrl } from '../../services/api';

const Settings = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    password: '',
  });
  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const data = new FormData();
    // Only send what is allowed to be updated by employee
    if (formData.password) data.append('password', formData.password);
    if (image) data.append('image', image);

    try {
      const response = await API.put('/auth/settings', data);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      setSuccess(true);
      setFormData({ ...formData, password: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout role="employee">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Account Settings</h2>
          <p className="text-gray-500">Manage your profile image and password.</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-8">
          {success && (
            <div className="bg-green-50 text-green-600 p-4 rounded-xl flex items-center gap-3 font-bold text-sm">
              <CheckCircle size={20} />
              Profile updated successfully!
            </div>
          )}

          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600 text-3xl font-bold border-4 border-white shadow-lg overflow-hidden relative group">
              {image ? (
                <img src={URL.createObjectURL(image)} alt="" className="w-full h-full object-cover" />
              ) : user.image ? (
                <img src={`${imageBaseUrl}${user.image}`} alt="" className="w-full h-full object-cover" />
              ) : user.name.charAt(0)}
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                <Upload className="text-white" size={24} />
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
              </label>
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">{user.name}</h4>
              <p className="text-sm text-gray-500 uppercase tracking-wider font-bold">{user.role} • {user.department}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 opacity-60">
              <label className="text-xs font-bold text-gray-500 uppercase">Full Name (Read Only)</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  disabled
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent rounded-xl outline-none cursor-not-allowed border"
                  value={formData.name}
                />
              </div>
            </div>

            <div className="space-y-2 opacity-60">
              <label className="text-xs font-bold text-gray-500 uppercase">Email (Read Only)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  disabled
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 border-transparent rounded-xl outline-none cursor-not-allowed border"
                  value={formData.email}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  name="password"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-blue-200 outline-none transition-all border"
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-100 disabled:opacity-70"
          >
            {loading ? 'Saving Changes...' : 'Update Security Settings'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default Settings;
