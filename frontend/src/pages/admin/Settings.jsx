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
    Object.keys(formData).forEach(key => {
      if (formData[key]) data.append(key, formData[key]);
    });
    if (image) data.append('image', image);

    try {
      const response = await API.put('/auth/settings', data);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout role="admin">
      <div className="mb-10">
        <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">Account Settings</h2>
        <p className="text-sm font-medium text-gray-500">Update your personal information and security settings.</p>
      </div>

      <div className="max-w-2xl mx-auto lg:mx-0">
        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-6 md:p-10 space-y-10">
          {success && (
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest border border-emerald-100 shadow-sm animate-bounce">
              <CheckCircle size={18} />
              Profile updated successfully!
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-gray-50/50 rounded-[2rem] border border-gray-100/50">
            <div className="w-24 h-24 bg-purple-100 rounded-[1.5rem] flex items-center justify-center text-purple-600 text-3xl font-black border-4 border-white shadow-xl overflow-hidden relative group shrink-0">
              {image ? (
                <img src={URL.createObjectURL(image)} alt="" className="w-full h-full object-cover" />
              ) : user.image ? (
                <img src={`${imageBaseUrl}${user.image}`} alt="" className="w-full h-full object-cover" />
              ) : user.name.charAt(0)}
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer backdrop-blur-xs">
                <Upload className="text-white" size={24} />
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
              </label>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-xl font-black text-gray-900 tracking-tight">{user.name}</h4>
              <p className="text-[10px] text-purple-600 uppercase tracking-[0.2em] font-black mt-1">{user.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Full Name</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="name"
                  className="w-full pl-12 pr-6 py-4 bg-gray-50/50 rounded-2xl border-transparent focus:bg-white focus:border-purple-200 outline-none transition-all border font-bold text-sm shadow-inner"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  name="email"
                  className="w-full pl-12 pr-6 py-4 bg-gray-50/50 rounded-2xl border-transparent focus:bg-white focus:border-purple-200 outline-none transition-all border font-bold text-sm shadow-inner"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="mobile"
                  className="w-full pl-12 pr-6 py-4 bg-gray-50/50 rounded-2xl border-transparent focus:bg-white focus:border-purple-200 outline-none transition-all border font-bold text-sm shadow-inner"
                  value={formData.mobile}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">New Password</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  name="password"
                  className="w-full pl-12 pr-6 py-4 bg-gray-50/50 rounded-2xl border-transparent focus:bg-white focus:border-purple-200 outline-none transition-all border font-bold text-sm shadow-inner"
                  placeholder="Leave blank to keep current"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-widest py-5 rounded-[1.5rem] transition-all shadow-lg shadow-purple-200 disabled:opacity-70 active:scale-95"
          >
            {loading ? 'Saving Changes...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default Settings;
