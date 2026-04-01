import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { ArrowLeft, Briefcase, Users, CheckCircle, Clock, Trash2, Edit } from 'lucide-react';
import API, { imageBaseUrl } from '../../services/api';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const { data } = await API.get(`/projects/${id}`);
      setData(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const deleteProj = async () => {
    if (window.confirm('Delete project?')) {
      try {
        await API.delete(`/projects/${id}`);
        navigate('/admin/projects');
      } catch (err) { alert('Failed'); }
    }
  };

  if (loading) return <Layout role="admin">Loading...</Layout>;

  return (
    <Layout role="admin">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20}/></button>
          <h2 className="text-2xl font-bold text-gray-800">Project Details</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={deleteProj} className="p-2 bg-red-100 text-red-600 rounded-lg"><Trash2 size={18}/></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-3xl font-bold text-gray-900">{data.title}</h3>
              <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                data.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
              }`}>{data.status}</span>
            </div>
            <p className="text-gray-500 leading-relaxed mb-8">{data.description}</p>
            <div className="flex items-center gap-6 border-t border-gray-50 pt-6">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Deadline</p>
                <p className="font-bold text-gray-700">{new Date(data.deadline).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><CheckCircle size={20} className="text-green-600"/> Tasks & Milestones</h4>
            <div className="space-y-4">
              {data.tasks?.map(t => (
                <div key={t._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="font-bold text-gray-800">{t.message}</p>
                    <p className="text-xs text-gray-400">Assigned to: {t.assignedTo?.name}</p>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${t.status === 'done' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>{t.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm h-fit">
          <h4 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><Users size={20} className="text-blue-600"/> Assigned Team</h4>
          <div className="space-y-4">
            {data.assignedTo?.map(emp => (
              <div key={emp._id} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl overflow-hidden flex items-center justify-center text-purple-600 font-bold">
                  {emp.image ? <img src={`${imageBaseUrl}${emp.image}`} className="w-full h-full object-cover"/> : emp.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{emp.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{emp.department}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectDetails;
