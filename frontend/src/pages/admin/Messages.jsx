import React, { useEffect, useState, useRef } from 'react';
import Layout from '../../components/Layout';
import { Search, Send, User, Clock, ArrowLeft } from 'lucide-react';
import API, { imageBaseUrl } from '../../services/api';

const Messages = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const chatEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchEmps = async () => {
      const { data } = await API.get('/users');
      setEmployees(data.data);
      if (data.data.length === 1 && user.role !== 'admin') {
        setSelectedEmp(data.data[0]);
        setShowChatOnMobile(true);
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

  const selectEmployee = (emp) => {
    setSelectedEmp(emp);
    setShowChatOnMobile(true);
  };

  return (
    <Layout role={user.role}>
      <div className="relative flex min-h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm md:flex-row">
        {/* Conversations List */}
        <div className={`w-full min-h-0 border-r border-gray-50 md:w-[21rem] lg:w-[23rem] flex flex-col ${showChatOnMobile && selectedEmp ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 border-b border-gray-50">
            <h3 className="text-lg font-black text-gray-800 tracking-tight">
              {user.role === 'admin' ? 'Employees' : 'Administrators'}
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {employees.map(emp => (
              <button 
                key={emp.id} 
                onClick={() => selectEmployee(emp)} 
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${selectedEmp?.id === emp.id ? 'bg-purple-50 text-purple-600 shadow-sm' : 'hover:bg-gray-50 text-gray-500'}`}
              >
                <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center font-bold overflow-hidden shadow-sm shrink-0">
                  {emp.image ? <img src={`${imageBaseUrl}${emp.image}`} className="w-full h-full object-cover"/> : emp.name.charAt(0)}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-black truncate">{emp.name}</p>
                  <p className="text-[10px] uppercase font-black opacity-60 tracking-widest truncate">{emp.department}</p>
                </div>
              </button>
            ))}
            {employees.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <p className="text-xs font-bold uppercase tracking-widest">No contacts found</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`md:flex-1 flex min-h-0 min-w-0 flex-col bg-gray-50/30 ${!showChatOnMobile || !selectedEmp ? 'hidden md:flex' : 'flex'}`}>
          {selectedEmp ? (
            <>
              <div className="p-4 md:p-6 bg-white border-b border-gray-50 flex items-center gap-3 shrink-0">
                <button 
                  onClick={() => setShowChatOnMobile(false)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-bold overflow-hidden shadow-sm">
                  {selectedEmp.image ? <img src={`${imageBaseUrl}${selectedEmp.image}`} className="w-full h-full object-cover"/> : selectedEmp.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-gray-900 leading-none truncate">{selectedEmp.name}</h4>
                  <span className="text-[10px] text-green-500 font-black flex items-center gap-1 mt-1 uppercase tracking-widest"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"/> Online</span>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6">
                <div className="flex min-h-full flex-col justify-end gap-4">
                  {messages.map(m => (
                    <div key={m._id} className={`flex ${m.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[88%] break-words rounded-3xl p-3 text-sm font-medium shadow-sm md:max-w-[74%] md:p-4 ${m.senderId === user.id ? 'bg-purple-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'}`}>
                        {m.message}
                        <p className={`text-[10px] mt-1 opacity-50 flex items-center gap-1 ${m.senderId === user.id ? 'justify-end' : 'justify-start'}`}><Clock size={10}/> {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef}/>
                </div>
              </div>
              <form onSubmit={handleSend} className="border-t border-gray-50 bg-white p-3 shrink-0 sm:p-4 md:p-5 lg:p-6">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Type your message..." 
                    className="w-full rounded-3xl border border-transparent bg-gray-50 py-3.5 pl-5 pr-14 text-sm font-bold shadow-inner outline-none transition-all focus:border-purple-200 focus:bg-white sm:pl-6 sm:pr-16 sm:py-4" 
                    value={newMessage} 
                    onChange={e => setNewMessage(e.target.value)} 
                  />
                  <button 
                    type="submit" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-purple-600 p-2.5 text-white shadow-lg shadow-purple-200 transition-all hover:bg-purple-700 sm:p-3"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 p-8 text-center">
              <div className="p-8 bg-white rounded-[2.5rem] mb-6 border border-gray-100 shadow-xl"><Send size={48} className="text-purple-100" /></div>
              <h3 className="text-xl font-black text-gray-400 uppercase tracking-tighter">Start a Conversation</h3>
              <p className="text-sm font-bold text-gray-300 mt-2 uppercase tracking-widest">Select someone from the list to begin chatting</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
