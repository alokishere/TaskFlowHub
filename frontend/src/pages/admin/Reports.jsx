import React from 'react';
import Layout from '../../components/Layout';
import { Users, Briefcase, FileCheck, DollarSign } from 'lucide-react';
import { useReportsStats } from '../../hooks/useQueries';

const Reports = () => {
  const { data: stats, isLoading } = useReportsStats();

  if (isLoading) return <Layout role="admin"><div className="flex justify-center py-20"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600" /></div></Layout>;
  if (!stats) return <Layout role="admin">No data available</Layout>;

  return (
    <Layout role="admin">
      <div className="mb-10">
        <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">Business Summary</h2>
        <p className="text-sm font-medium text-gray-500">Centralized inspection panel for company-wide data.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-800 mb-8 flex items-center gap-3"><Users className="text-purple-600" size={24}/> Employees by Department</h3>
          <div className="space-y-6">
            {Object.entries(stats.employeesByDept).map(([dept, count]) => {
              const total = Object.values(stats.employeesByDept).reduce((a,b)=>a+b,0);
              const percent = Math.round((count / total) * 100);
              return (
                <div key={dept}>
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-2">
                    <span className="text-gray-600">{dept}</span>
                    <span className="text-purple-600">{count} ({percent}%)</span>
                  </div>
                  <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden shadow-inner border border-gray-100/50">
                    <div className="h-full bg-linear-to-r from-purple-500 to-indigo-500 transition-all duration-1000 ease-out" style={{ width: `${percent}%` }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-800 mb-8 flex items-center gap-3"><Briefcase className="text-blue-600" size={24}/> Projects Status</h3>
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {Object.entries(stats.projectsByStatus).map(([status, count]) => (
              <div key={status} className="text-center p-4 md:p-6 bg-gray-50/50 rounded-4xl border border-gray-100/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{status}</p>
                <p className="text-2xl md:text-3xl font-black text-gray-800">{count}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-800 mb-8 flex items-center gap-3"><DollarSign className="text-green-600" size={24}/> Total Payroll Disbursed</h3>
          <div className="p-8 md:p-10 bg-linear-to-br from-green-50 to-emerald-50 rounded-[2.5rem] text-center border border-green-100/50">
            <p className="text-xs font-black text-green-600 uppercase tracking-widest mb-2">Lifetime Company Payout</p>
            <p className="text-3xl md:text-5xl font-black text-green-700 tracking-tighter">₹{stats.totalPayroll.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-800 mb-8 flex items-center gap-3"><FileCheck className="text-orange-600" size={24}/> Leave Statistics</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            {Object.entries(stats.leaveSummary).map(([status, count]) => (
              <div key={status} className="flex-1 text-center p-6 bg-gray-50/50 rounded-4xl border border-gray-100/50">
                <div className={`text-3xl font-black ${status === 'approved' ? 'text-green-600' : status === 'rejected' ? 'text-red-600' : 'text-orange-600'}`}>{count}</div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">{status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
