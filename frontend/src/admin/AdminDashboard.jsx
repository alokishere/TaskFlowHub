import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { Users, Briefcase, FileText, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import API from '../services/api';
import { imageBaseUrl } from '../services/api';
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingLeaves: 0,
  });
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, projRes, leaveRes] = await Promise.all([
          API.get('/users'),
          API.get('/projects'),
          API.get('/leaves/all')
        ]);

        const employees = empRes.data.data;
        const projects = projRes.data.data;
        const leaves = leaveRes.data.data;

        setStats({
          totalEmployees: employees.length,
          activeProjects: projects.filter(p => p.status === 'in-progress').length,
          completedProjects: projects.filter(p => p.status === 'completed').length,
          pendingLeaves: leaves.filter(l => l.status === 'pending').length,
        });

        setRecentEmployees(employees.slice(0, 3));
        setRecentLeaves(leaves.slice(0, 3));
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <Layout role="admin">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome, {user.name}</h2>
          <p className="text-gray-500">Here's what's happening at Sarathi India today.</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Employees" value={stats.totalEmployees} icon={Users} color="purple" trend="+12%" />
        <StatCard title="Active Projects" value={stats.activeProjects} icon={Briefcase} color="blue" trend="+8%" />
        <StatCard title="Completed Projects" value={stats.completedProjects} icon={CheckCircle} color="green" trend="+4%" />
        <StatCard title="Pending Leaves" value={stats.pendingLeaves} icon={FileText} color="orange" trend="-2%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Employees */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Recent Employees</h3>
            <button className="text-purple-600 text-sm font-semibold flex items-center gap-1 hover:underline">
              View All <ChevronRight size={16} />
            </button>
          </div>
          <div className="space-y-4">
            {recentEmployees.map((emp) => (
              <div key={emp.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-bold overflow-hidden">
                    {emp.image ? (
                      <img src={`${imageBaseUrl}${emp.image}`} alt={emp.name} className="w-full h-full object-cover" />
                    ) : (
                      emp.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{emp.name}</h4>
                    <p className="text-xs text-gray-500">{emp.department}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${emp.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {emp.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Leave Requests */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Recent Leave Requests</h3>
            <button className="text-purple-600 text-sm font-semibold flex items-center gap-1 hover:underline">
              View All <ChevronRight size={16} />
            </button>
          </div>
          <div className="space-y-4">
            {recentLeaves.map((leave) => (
              <div key={leave._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{leave.userId?.name}</h4>
                    <p className="text-xs text-gray-500">{leave.type} - {new Date(leave.from).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                  leave.status === 'pending' ? 'bg-orange-100 text-orange-600' : 
                  leave.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {leave.status}
                </span>
              </div>
            ))}
            {recentLeaves.length === 0 && (
              <p className="text-center text-gray-400 py-10">No pending leave requests</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
