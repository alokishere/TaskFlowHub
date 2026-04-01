import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { BarChart3, PieChart, Users, Briefcase, FileCheck, DollarSign } from 'lucide-react';
import API from '../../services/api';

const Reports = () => {
  const [stats, setStats] = useState({
    employeesByDept: {},
    projectsByStatus: {},
    totalPayroll: 0,
    leaveSummary: { pending: 0, approved: 0, rejected: 0 }
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [empRes, projRes, salaryRes, leaveRes] = await Promise.all([
          API.get('/users'),
          API.get('/projects'),
          API.get('/salaries/all'),
          API.get('/leaves/all')
        ]);

        const employees = empRes.data.data;
        const projects = projRes.data.data;
        const salaries = salaryRes.data.data;
        const leaves = leaveRes.data.data;

        // Group by Dept
        const deptMap = {};
        employees.forEach(e => deptMap[e.department] = (deptMap[e.department] || 0) + 1);

        // Group Projects
        const statusMap = { pending: 0, 'in-progress': 0, completed: 0 };
        projects.forEach(p => statusMap[p.status]++);

        // Payroll
        const payroll = salaries.reduce((acc, s) => acc + s.amount, 0);

        // Leaves
        const leaveMap = { pending: 0, approved: 0, rejected: 0 };
        leaves.forEach(l => leaveMap[l.status]++);

        setStats({ employeesByDept: deptMap, projectsByStatus: statusMap, totalPayroll: payroll, leaveSummary: leaveMap });
      } catch (err) { console.error(err); }
    };
    fetchStats();
  }, []);

  return (
    <Layout role="admin">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Business Summary</h2>
        <p className="text-gray-500">Centralized inspection panel for company-wide data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><Users className="text-purple-600"/> Employees by Department</h3>
          <div className="space-y-4">
            {Object.entries(stats.employeesByDept).map(([dept, count]) => (
              <div key={dept}>
                <div className="flex justify-between text-sm font-bold mb-1">
                  <span>{dept}</span>
                  <span>{count}</span>
                </div>
                <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 transition-all" style={{ width: `${(count / Object.values(stats.employeesByDept).reduce((a,b)=>a+b,0)) * 100}%` }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><Briefcase className="text-blue-600"/> Projects Status</h3>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(stats.projectsByStatus).map(([status, count]) => (
              <div key={status} className="text-center p-4 bg-gray-50 rounded-2xl">
                <p className="text-[10px] font-black uppercase text-gray-400 mb-1">{status}</p>
                <p className="text-2xl font-black text-gray-800">{count}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><DollarSign className="text-green-600"/> Total Payroll Disbursed</h3>
          <div className="p-6 bg-green-50 rounded-3xl text-center">
            <p className="text-sm font-bold text-green-600 uppercase mb-1">Lifetime Payout</p>
            <p className="text-4xl font-black text-green-700">₹{stats.totalPayroll.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><FileCheck className="text-orange-600"/> Leave Statistics</h3>
          <div className="flex gap-4">
            {Object.entries(stats.leaveSummary).map(([status, count]) => (
              <div key={status} className="flex-1 text-center">
                <div className={`text-2xl font-black ${status === 'approved' ? 'text-green-600' : status === 'rejected' ? 'text-red-600' : 'text-orange-600'}`}>{count}</div>
                <p className="text-[10px] font-black uppercase text-gray-400">{status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
