import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  DollarSign,
  FileText,
  Settings,
  LogOut,
  MessageSquare,
  BarChart3,
  ChevronDown,
  UserPlus,
  List,
  PlusSquare,
  PenBox,
} from "lucide-react";

const AdminSidebar = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({
    employees: location.pathname.includes("/admin/employees"),
    projects: location.pathname.includes("/admin/projects"),
    blog: location.pathname.includes("/admin/blog"),
  });

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    onClose?.();
  };

  const handleNavClick = () => {
    onClose?.();
  };

  const menuClass = (isActive) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      isActive
        ? "bg-purple-50 text-purple-600 font-bold shadow-sm shadow-purple-100/50"
        : "text-gray-500 hover:bg-gray-50 font-medium"
    }`;

  const subMenuClass = (isActive) =>
    `flex items-center gap-3 px-12 py-2.5 rounded-xl transition-all text-sm ${
      isActive
        ? "text-purple-600 font-bold bg-purple-50/50"
        : "text-gray-500 hover:text-purple-500 font-medium"
    }`;

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
        <NavLink
          to="/admin"
          end
          className={({ isActive }) => menuClass(isActive)}
          onClick={handleNavClick}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        {/* Employee Management Dropdown */}
        <div>
          <button
            onClick={() => toggleMenu("employees")}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              location.pathname.includes("/admin/employees")
                ? "text-purple-600 bg-purple-50/30"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Users size={20} />
              <span>Employees</span>
            </div>
            <ChevronDown
              size={16}
              className={`transition-transform duration-300 ${openMenus.employees ? "rotate-180" : ""}`}
            />
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ${openMenus.employees ? "max-h-40 mt-1" : "max-h-0"}`}
          >
            <NavLink
              to="/admin/employees"
              end
              className={({ isActive }) => subMenuClass(isActive)}
              onClick={handleNavClick}
            >
              <List size={16} />
              <span>Employee List</span>
            </NavLink>
            <NavLink
              to="/admin/employees/add"
              className={({ isActive }) => subMenuClass(isActive)}
              onClick={handleNavClick}
            >
              <UserPlus size={16} />
              <span>Add Employee</span>
            </NavLink>
          </div>
        </div>

        {/* Project Management Dropdown */}
        <div>
          <button
            onClick={() => toggleMenu("projects")}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              location.pathname.includes("/admin/projects")
                ? "text-purple-600 bg-purple-50/30"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Briefcase size={20} />
              <span>Projects</span>
            </div>
            <ChevronDown
              size={16}
              className={`transition-transform duration-300 ${openMenus.projects ? "rotate-180" : ""}`}
            />
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ${openMenus.projects ? "max-h-40 mt-1" : "max-h-0"}`}
          >
            <NavLink
              to="/admin/projects"
              end
              className={({ isActive }) => subMenuClass(isActive)}
              onClick={handleNavClick}
            >
              <List size={16} />
              <span>Project List</span>
            </NavLink>
            <NavLink
              to="/admin/projects/add"
              className={({ isActive }) => subMenuClass(isActive)}
              onClick={handleNavClick}
            >
              <PlusSquare size={16} />
              <span>Create Project</span>
            </NavLink>
          </div>
        </div>

        <NavLink
          to="/admin/documents"
          className={({ isActive }) => menuClass(isActive)}
          onClick={handleNavClick}
        >
          <FileText size={20} />
          <span>Documents</span>
        </NavLink>

        <NavLink
          to="/admin/salary"
          className={({ isActive }) => menuClass(isActive)}
          onClick={handleNavClick}
        >
          <DollarSign size={20} />
          <span>Salaries</span>
        </NavLink>

        <NavLink
          to="/admin/leaves"
          className={({ isActive }) => menuClass(isActive)}
          onClick={handleNavClick}
        >
          <FileText size={20} />
          <span>Leaves</span>
        </NavLink>

        <NavLink
          to="/admin/messages"
          className={({ isActive }) => menuClass(isActive)}
          onClick={handleNavClick}
        >
          <MessageSquare size={20} />
          <span>Messages</span>
        </NavLink>
        <div>
          <button
            onClick={() => toggleMenu("blog")}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              location.pathname.includes("/admin/blog")
                ? "text-purple-600 bg-purple-50/30"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <PenBox size={20} />
              <span>Blog</span>
            </div>
            <ChevronDown
              size={16}
              className={`transition-transform duration-300 ${openMenus.blog ? "rotate-180" : ""}`}
            />
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ${openMenus.blog ? "max-h-40 mt-1" : "max-h-0"}`}
          >
            <NavLink
              to="/admin/blog/create"
              className={({ isActive }) => subMenuClass(isActive)}
              onClick={handleNavClick}
            >
              <PlusSquare size={16} />
              <span>Create Blog</span>
            </NavLink>
            <NavLink
              to="/admin/blog/list"
              className={({ isActive }) => subMenuClass(isActive)}
              onClick={handleNavClick}
            >
              <List size={16} />
              <span>Blog List</span>
            </NavLink>
          </div>
        </div>

        <NavLink
          to="/admin/settings"
          className={({ isActive }) => menuClass(isActive)}
          onClick={handleNavClick}
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
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

export default AdminSidebar;
