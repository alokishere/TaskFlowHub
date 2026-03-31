import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Clock, 
  FileCheck, 
  User, 
  Settings, 
  LogOut 
} from 'lucide-react';

const EmployeeSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/employee' },
    { name: 'My Projects', icon: Briefcase, path: '/employee/projects' },
    { name: 'Attendance', icon: Clock, path: '/employee/attendance' },
    { name: 'Leave Request', icon: FileCheck, path: '/employee/leaves' },
    { name: 'Profile', icon: User, path: '/employee/profile' },
    { name: 'Settings', icon: Settings, path: '/employee/settings' },
  ];

  return (
    <div className="w-64 h-screen bg-gray-900 flex flex-col p-6 fixed left-0 top-0 text-white">
      <div className="flex items-center gap-2 mb-10 px-2">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs">EMS</span>
        </div>
        <h1 className="text-xl font-bold">TASKFLOW</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/employee'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-xl transition-all mt-auto"
      >
        <LogOut size={20} />
        <span>Log Out</span>
      </button>
    </div>
  );
};

export default EmployeeSidebar;
