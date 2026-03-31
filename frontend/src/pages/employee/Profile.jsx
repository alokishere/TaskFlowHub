import React from 'react';
import Layout from '../../components/Layout';
import { imageBaseUrl } from '../../services/api';
import { User, Mail, Phone, Briefcase, DollarSign, Calendar } from 'lucide-react';

const Profile = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <Layout role="employee">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
          <p className="text-gray-500">View your employment details and personal information.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl">
        <div className="h-32 bg-linear-to-r from-blue-600 to-indigo-700" />
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row gap-8 items-end -mt-12 mb-8">
            <div className="w-32 h-32 bg-white rounded-3xl p-1 shadow-lg">
              <div className="w-full h-full bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 text-4xl font-bold overflow-hidden border border-gray-100">
                {user.image ? <img src={`${imageBaseUrl}${user.image}`} alt="" className="w-full h-full object-cover" /> : user.name.charAt(0)}
              </div>
            </div>
            <div className="flex-1 pb-2">
              <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
              <p className="text-blue-600 font-bold text-sm uppercase tracking-widest">{user.role} • {user.department}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                  <p className="text-sm font-bold text-gray-700">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mobile Number</p>
                  <p className="text-sm font-bold text-gray-700">{user.mobile}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                  <Briefcase size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Department</p>
                  <p className="text-sm font-bold text-gray-700">{user.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
                  <p className="text-sm font-bold text-green-600 capitalize">{user.status}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
