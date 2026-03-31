import React from 'react';
import AdminSidebar from './AdminSidebar';
import EmployeeSidebar from './EmployeeSidebar';

const Layout = ({ children, role }) => {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      {role === 'admin' ? <AdminSidebar /> : <EmployeeSidebar />}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
