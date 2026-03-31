import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { Briefcase, Clock, CheckCircle, FileText } from 'lucide-react';
import API from '../services/api';

const EmployeeDashboard = () => {
  const [stats, setStats] = useState({
    assignedProjects: 0,
    presentDays: 0,
    pendingTasks: 0,
    approvedLeaves: 0,
  });
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, attRes, taskRes, leaveRes] = await Promise.all([
          API.get('/projects/my-projects'),
          API.get('/attendance/my'),
          API.get('/projects/my-tasks'),
          API.get('/leaves/my')
        ]);

        setStats({
          assignedProjects: projRes.data.data.length,
          presentDays: attRes.data.data.filter(a => a.status === 'present').length,
          pendingTasks: taskRes.data.data.filter(t => t.status === 'pending').length,
          approvedLeaves: leaveRes.data.data.filter(l => l.status === 'approved').length,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <Layout role="employee">
      <div className="bg-linear-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white mb-10 shadow-xl shadow-blue-200">
        <h2 className="text-3xl font-bold">Good Day, {user.name}! 👋</h2>
        <p className="mt-2 text-blue-100 opacity-90">Your summary for today, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Assigned Projects" value={stats.assignedProjects} icon={Briefcase} color="blue" />
        <StatCard title="Present Days" value={stats.presentDays} icon={Clock} color="green" />
        <StatCard title="Pending Tasks" value={stats.pendingTasks} icon={CheckCircle} color="orange" />
        <StatCard title="Approved Leaves" value={stats.approvedLeaves} icon={FileText} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-6 bg-blue-50 text-blue-600 rounded-2xl font-bold hover:bg-blue-100 transition-all flex flex-col items-center gap-2">
              <Clock size={32} />
              Punch In/Out
            </button>
            <button className="p-6 bg-green-50 text-green-600 rounded-2xl font-bold hover:bg-green-100 transition-all flex flex-col items-center gap-2">
              <FileText size={32} />
              Apply Leave
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;
