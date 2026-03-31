import React from 'react';
import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";

// Admin Pages
import AdminDashboard from "./admin/AdminDashboard";
import EmployeeList from "./pages/admin/EmployeeList";
import AddEmployee from "./pages/admin/AddEmployee";
import EditEmployee from "./pages/admin/EditEmployee";
import Projects from "./pages/admin/Projects";
import AddProject from "./pages/admin/AddProject";
import SalaryManagement from "./pages/admin/SalaryManagement";
import LeaveManagement from "./pages/admin/LeaveManagement";
import AdminSettings from "./pages/admin/Settings";

// Employee Pages
import EmployeeDashboard from "./employee/EmployeeDashbord";
import Attendance from "./pages/employee/Attendance";
import MyProjects from "./pages/employee/MyProjects";
import LeaveRequest from "./pages/employee/LeaveRequest";
import Profile from "./pages/employee/Profile";
import EmployeeSettings from "./pages/employee/Settings";

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} />;
  }

  return children;
};

const Mainrouts = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/employees" element={<ProtectedRoute role="admin"><EmployeeList /></ProtectedRoute>} />
      <Route path="/admin/employees/add" element={<ProtectedRoute role="admin"><AddEmployee /></ProtectedRoute>} />
      <Route path="/admin/employees/edit/:id" element={<ProtectedRoute role="admin"><EditEmployee /></ProtectedRoute>} />
      <Route path="/admin/projects" element={<ProtectedRoute role="admin"><Projects /></ProtectedRoute>} />
      <Route path="/admin/projects/add" element={<ProtectedRoute role="admin"><AddProject /></ProtectedRoute>} />
      <Route path="/admin/salary" element={<ProtectedRoute role="admin"><SalaryManagement /></ProtectedRoute>} />
      <Route path="/admin/leaves" element={<ProtectedRoute role="admin"><LeaveManagement /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute role="admin"><AdminSettings /></ProtectedRoute>} />

      {/* Employee Routes */}
      <Route path="/employee" element={<ProtectedRoute role="employee"><EmployeeDashboard /></ProtectedRoute>} />
      <Route path="/employee/attendance" element={<ProtectedRoute role="employee"><Attendance /></ProtectedRoute>} />
      <Route path="/employee/projects" element={<ProtectedRoute role="employee"><MyProjects /></ProtectedRoute>} />
      <Route path="/employee/leaves" element={<ProtectedRoute role="employee"><LeaveRequest /></ProtectedRoute>} />
      <Route path="/employee/profile" element={<ProtectedRoute role="employee"><Profile /></ProtectedRoute>} />
      <Route path="/employee/settings" element={<ProtectedRoute role="employee"><EmployeeSettings /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default Mainrouts;
