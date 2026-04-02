import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { ArrowLeft, Briefcase, Calendar, Users, MessageSquare, Save, Loader2 } from 'lucide-react';
import API from '../../services/api';
import { imageBaseUrl } from '../../services/api';

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    status: 'pending'
  });
  const [assignments, setAssignments] = useState([]); // [{ userId, message }]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, projRes] = await Promise.all([
          API.get('/users'),
          API.get(`/projects/${id}`)
        ]);
        setEmployees(empRes.data.data);
        
        const proj = projRes.data.data;
        setFormData({
          title: proj.title,
          description: proj.description,
          deadline: proj.deadline.split('T')[0],
          status: proj.status
        });
        
        // Map existing tasks to assignments
        const existingAssignments = proj.tasks.map(t => ({
          userId: t.assignedTo._id,
          message: t.message,
          taskId: t._id // Keep track of task ID if needed
        }));
        setAssignments(existingAssignments);
      } catch (err) {
        console.error(err);
        alert('Failed to fetch project data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleAssignment = (userId) => {
    if (assignments.find(a => a.userId === userId)) {
      setAssignments(assignments.filter(a => a.userId !== userId));
    } else {
      setAssignments([...assignments, { userId, message: '' }]);
    }
  };

  const handleMessageChange = (userId, message) => {
    setAssignments(assignments.map(a => a.userId === userId ? { ...a, message } : a));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (assignments.length === 0) {
      return alert('Please assign at least one employee');
    }
    setSaving(true);

    try {
      await API.patch(`/projects/${id}`, {
        ...formData,
        assignments
      });
      navigate('/admin/projects');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout role="admin"><div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-purple-600" size={40} /></div></Layout>;

  return (
    <Layout role="admin">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-gray-800">Edit Project</h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Update project details and assignments</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Project Title</label>
              <div className="relative">
                <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 rounded-2xl border-transparent focus:bg-white focus:border-purple-200 border outline-none font-bold transition-all shadow-inner"
                  placeholder="e.g. Website Redesign"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Description</label>
              <textarea
                name="description"
                required
                rows={4}
                className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-transparent focus:bg-white focus:border-purple-200 border outline-none font-bold transition-all shadow-inner resize-none"
                placeholder="What is this project about?"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Deadline</label>
                <div className="relative">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="date"
                    name="deadline"
                    required
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 rounded-2xl border-transparent focus:bg-white focus:border-purple-200 border outline-none font-bold transition-all shadow-inner"
                    value={formData.deadline}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Status</label>
                <select
                  name="status"
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-transparent focus:bg-white focus:border-purple-200 border outline-none font-bold transition-all shadow-inner appearance-none"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
              <MessageSquare size={20} className="text-purple-600" />
              Task Assignments
            </h3>
            {assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((a) => {
                  const emp = employees.find(e => e.id === a.userId);
                  return (
                    <div key={a.userId} className="p-6 bg-gray-50/50 rounded-[2rem] space-y-4 border border-gray-50 relative group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xs font-black text-purple-600">
                          {emp?.image ? <img src={`${imageBaseUrl}${emp.image}`} alt={emp.name} className="w-full h-full object-cover rounded-xl" /> : emp?.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-800">{emp?.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">{emp?.department}</p>
                        </div>
                      </div>
                      <textarea
                        required
                        placeholder={`Update task instructions for ${emp?.name}...`}
                        className="w-full px-5 py-3 bg-white rounded-xl border-transparent focus:border-purple-200 border outline-none text-sm font-bold transition-all shadow-sm"
                        value={a.message}
                        onChange={(e) => handleMessageChange(a.userId, e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-50 rounded-[2rem]">
                <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Select team members on the right</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
              <Users size={20} className="text-purple-600" />
              Team Roster
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {employees.map((emp) => (
                <label 
                  key={emp.id} 
                  className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                    assignments.find(a => a.userId === emp.id) 
                      ? 'bg-purple-50/50 border-purple-100' 
                      : 'bg-white border-gray-50 hover:border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xs font-black text-purple-600 overflow-hidden shadow-sm">
                      {emp.image ? <img src={`${imageBaseUrl}${emp.image}`} alt={emp.name} className="w-full h-full object-cover" /> : emp.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-black text-gray-800">{emp.name}</div>
                      <div className="text-[9px] font-bold text-gray-400 uppercase">{emp.department}</div>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={!!assignments.find(a => a.userId === emp.id)}
                    onChange={() => toggleAssignment(emp.id)}
                  />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    assignments.find(a => a.userId === emp.id) ? 'bg-purple-600 border-purple-600 shadow-lg shadow-purple-100' : 'border-gray-200'
                  }`}>
                    {assignments.find(a => a.userId === emp.id) && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-widest py-5 rounded-[1.5rem] transition-all shadow-xl shadow-purple-100 disabled:opacity-70 flex items-center justify-center gap-3"
          >
            {saving ? <><Loader2 className="animate-spin" size={18} /> Saving Changes...</> : <><Save size={18} /> Save Changes</>}
          </button>
        </div>
      </form>
    </Layout>
  );
};

export default EditProject;
