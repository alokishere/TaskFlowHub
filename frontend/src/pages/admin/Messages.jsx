import React, { useEffect, useState, useRef } from 'react';
import Layout from '../../components/Layout';
import { Search, Send, User, Clock } from 'lucide-react';
import API, { imageBaseUrl } from '../../services/api';

const Messages = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchEmps = async () => {
      const { data } = await API.get('/users');
      setEmployees(data.data);
      if (data.data.length === 1 && user.role !== 'admin') {
        setSelectedEmp(data.data[0]);
      }
    };
    fetchEmps();
  }, []);

  const fetchMessages = async (empId) => {
    const { data } = await API.get(`/messages/${empId}`);
    setMessages(data.data);
  };

  useEffect(() => {
    let interval;
    if (selectedEmp) {
      fetchMessages(selectedEmp.id);
      interval = setInterval(() => fetchMessages(selectedEmp.id), 3000);
    }
    return () => clearInterval(interval);
  }, [selectedEmp]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await API.post('/messages', { receiverId: selectedEmp.id, message: newMessage });
      setNewMessage('');
      fetchMessages(selectedEmp.id);
    } catch (err) { console.error(err); }
  };

  return (
    <Layout role={user.role}>
      <div className="h-[calc(100vh-160px)] bg-white rounded-3xl border border-gray-100 shadow-sm flex overflow-hidden">
        <div className="w-80 border-r border-gray-50 flex flex-col">
          <div className="p-6 border-b border-gray-50">
            <h3 className="text-lg font-bold text-gray-800">
              {user.role === 'admin' ? 'Employees' : 'Administrators'}
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {employees.map(emp => (
              <button key={emp.id} onClick={() => setSelectedEmp(emp)} className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${selectedEmp?.id === emp.id ? 'bg-purple-50 text-purple-600 shadow-sm' : 'hover:bg-gray-50 text-gray-500'}`}>
                <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center font-bold overflow-hidden shadow-sm">
                  {emp.image ? <img src={`${imageBaseUrl}${emp.image}`} className="w-full h-full object-cover"/> : emp.name.charAt(0)}
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-bold truncate">{emp.name}</p>
                  <p className="text-[10px] uppercase font-black opacity-60">{emp.department}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-gray-50/30">
          {selectedEmp ? (
            <>
              <div className="p-6 bg-white border-b border-gray-50 flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-bold overflow-hidden">
                  {selectedEmp.image ? <img src={`${imageBaseUrl}${selectedEmp.image}`} className="w-full h-full object-cover"/> : selectedEmp.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 leading-none">{selectedEmp.name}</h4>
                  <span className="text-[10px] text-green-500 font-bold flex items-center gap-1 mt-1"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"/> Online</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map(m => (
                  <div key={m._id} className={`flex ${m.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-4 rounded-2xl text-sm font-medium shadow-sm ${m.senderId === user.id ? 'bg-purple-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>
                      {m.message}
                      <p className={`text-[10px] mt-1 opacity-50 flex items-center gap-1 ${m.senderId === user.id ? 'justify-end' : 'justify-start'}`}><Clock size={10}/> {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef}/>
              </div>
              <form onSubmit={handleSend} className="p-6 bg-white border-t border-gray-50">
                <div className="relative">
                  <input type="text" placeholder="Type a message..." className="w-full pl-6 pr-16 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:border-purple-200 border outline-none font-medium transition-all" value={newMessage} onChange={e => setNewMessage(e.target.value)} />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all"><Send size={20}/></button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
              <div className="p-8 bg-white rounded-full mb-6 border border-gray-100 shadow-xl"><Send size={48}/></div>
              <h3 className="text-xl font-bold">Select a conversation to start chatting</h3>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
