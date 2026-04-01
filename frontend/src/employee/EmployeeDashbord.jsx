import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

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
      <div className="bg-linear-to-r from-purple-600 to-indigo-700 rounded-3xl p-6 md:p-10 text-white mb-8 shadow-xl shadow-purple-200">
        <h2 className="text-2xl md:text-4xl font-black tracking-tight">Good Day, {user.name}! 👋</h2>
        <p className="mt-2 text-purple-100 font-medium opacity-90">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', weekday: 'long' })}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
        <StatCard title="Assigned Projects" value={stats.assignedProjects} icon={Briefcase} color="purple" />
        <StatCard title="Present Days" value={stats.presentDays} icon={Clock} color="green" />
        <StatCard title="Pending Tasks" value={stats.pendingTasks} icon={CheckCircle} color="orange" />
        <StatCard title="Approved Leaves" value={stats.approvedLeaves} icon={FileText} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 md:p-8 rounded-4xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-black text-gray-800 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => navigate('/employee/attendance')}
              className="p-5 bg-purple-50 text-purple-600 rounded-3xl font-semibold hover:bg-purple-100 transition-all flex flex-col items-center justify-center gap-3 text-center"
            >
              <div className="p-3 bg-white rounded-2xl shadow-sm">
                <Clock size={24} className="md:w-8 md:h-8" />
              </div>
              <span className="text-sm md:text-base">Punch In / Out</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/employee/leaves')}
              className="p-5 bg-indigo-50 text-indigo-600 rounded-3xl font-semibold hover:bg-indigo-100 transition-all flex flex-col items-center justify-center gap-3 text-center"
            >
              <div className="p-3 bg-white rounded-2xl shadow-sm">
                <FileText size={24} className="md:w-8 md:h-8" />
              </div>
              <span className="text-sm md:text-base">Apply Leave</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/employee/projects')}
              className="p-5 bg-emerald-50 text-emerald-600 rounded-3xl font-semibold hover:bg-emerald-100 transition-all flex flex-col items-center justify-center gap-3 text-center"
            >
              <div className="p-3 bg-white rounded-2xl shadow-sm">
                <Briefcase size={24} className="md:w-8 md:h-8" />
              </div>
              <span className="text-sm md:text-base">My Projects</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/employee/tasks')}
              className="p-5 bg-orange-50 text-orange-600 rounded-3xl font-semibold hover:bg-orange-100 transition-all flex flex-col items-center justify-center gap-3 text-center"
            >
              <div className="p-3 bg-white rounded-2xl shadow-sm">
                <CheckCircle size={24} className="md:w-8 md:h-8" />
              </div>
              <span className="text-sm md:text-base">My Tasks</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;
