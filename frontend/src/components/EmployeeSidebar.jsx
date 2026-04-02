import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Clock,
  FileCheck,
  User,
  Settings,
  LogOut,
  ListTodo,
  MessageSquare,
} from "lucide-react";

const EmployeeSidebar = ({ onClose }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    onClose?.();
  };

  const handleNavClick = () => {
    onClose?.();
  };

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/employee" },
    { name: "My Projects", icon: Briefcase, path: "/employee/projects" },
    { name: "My Tasks", icon: ListTodo, path: "/employee/tasks" },
    { name: "Attendance", icon: Clock, path: "/employee/attendance" },
    { name: "Leave Request", icon: FileCheck, path: "/employee/leaves" },
    { name: "Messages", icon: MessageSquare, path: "/employee/messages" },
    { name: "Profile", icon: User, path: "/employee/profile" },
    { name: "Settings", icon: Settings, path: "/employee/settings" },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col p-6 overflow-y-auto">
      <div className="flex items-center gap-2 mb-10 px-2">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
          <img
            className="h-full w-full object-cover hover:scale-105 transition-transform rounded-2xl"
            src="/logo.png"
            alt="logo"
          />
        </div>
        <div>
          <h1 className="text-lg font-black text-gray-800 leading-tight">
            SARATHI
          </h1>
          <p className="text-[10px] font-bold text-gray-400 tracking-tighter uppercase">
            India Pvt. Ltd.
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === "/employee"}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-purple-50 text-purple-600 font-bold shadow-sm shadow-purple-100/50"
                  : "text-gray-500 hover:bg-gray-50 font-medium"
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="pt-6 mt-6 border-t border-gray-50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold"
        >
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default EmployeeSidebar;
