import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import EmployeeSidebar from './EmployeeSidebar';
import { Menu, X } from 'lucide-react';

const Layout = ({ children, role }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex bg-gray-50 min-h-screen relative">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {role === 'admin' ? <AdminSidebar onClose={() => setSidebarOpen(false)} /> : <EmployeeSidebar onClose={() => setSidebarOpen(false)} />}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-200">
              <span className="text-white font-black text-sm">S</span>
            </div>
            <h1 className="text-sm font-black text-gray-800 tracking-tight uppercase">SARATHI</h1>
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
