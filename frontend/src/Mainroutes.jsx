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
import EditProject from "./pages/admin/EditProject";
import SalaryManagement from "./pages/admin/SalaryManagement";
import LeaveManagement from "./pages/admin/LeaveManagement";
import AdminSettings from "./pages/admin/Settings";
import EmployeeDetails from "./pages/admin/EmployeeDetails";
import ProjectDetails from "./pages/admin/ProjectDetails";
import Messages from "./pages/admin/Messages";
import Reports from "./pages/admin/Reports";

// Employee Pages
import EmployeeDashboard from "./employee/EmployeeDashbord";
import Attendance from "./pages/employee/Attendance";
import MyProjects from "./pages/employee/MyProjects";
import LeaveRequest from "./pages/employee/LeaveRequest";
import Profile from "./pages/employee/Profile";
import EmployeeSettings from "./pages/employee/Settings";
import MyTasks from './pages/employee/MyTasks';
import Documents from './pages/admin/Documents';
import Blog from './pages/admin/Blog';
import BlogList from './pages/admin/BlogList';
import BlogPreview from './pages/admin/BlogPreview';

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

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (token && user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/employee'} />;
  }

  return children;
};

const Mainrouts = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/employees" element={<ProtectedRoute role="admin"><EmployeeList /></ProtectedRoute>} />
      <Route path="/admin/employees/add" element={<ProtectedRoute role="admin"><AddEmployee /></ProtectedRoute>} />
      <Route path="/admin/employees/edit/:id" element={<ProtectedRoute role="admin"><EditEmployee /></ProtectedRoute>} />
      <Route path="/admin/employees/:id" element={<ProtectedRoute role="admin"><EmployeeDetails /></ProtectedRoute>} />
      <Route path="/admin/documents" element={<ProtectedRoute role="admin"><Documents /></ProtectedRoute>} />
      <Route path="/admin/projects" element={<ProtectedRoute role="admin"><Projects /></ProtectedRoute>} />
      <Route path="/admin/projects/add" element={<ProtectedRoute role="admin"><AddProject /></ProtectedRoute>} />
      <Route path="/admin/projects/edit/:id" element={<ProtectedRoute role="admin"><EditProject /></ProtectedRoute>} />
      <Route path="/admin/projects/:id" element={<ProtectedRoute role="admin"><ProjectDetails /></ProtectedRoute>} />
      <Route path="/admin/salary" element={<ProtectedRoute role="admin"><SalaryManagement /></ProtectedRoute>} />
      <Route path="/admin/leaves" element={<ProtectedRoute role="admin"><LeaveManagement /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute role="admin"><AdminSettings /></ProtectedRoute>} />
      <Route path="/admin/blog" element={<ProtectedRoute role="admin"><Navigate to="/admin/blog/create" /></ProtectedRoute>} />
      <Route path="/admin/blog/create" element={<ProtectedRoute role="admin"><Blog /></ProtectedRoute>} />
      <Route path="/admin/blog/list" element={<ProtectedRoute role="admin"><BlogList /></ProtectedRoute>} />
      <Route path="/admin/blog/edit/:id" element={<ProtectedRoute role="admin"><Blog /></ProtectedRoute>} />
      <Route path="/admin/blog/preview/:id" element={<ProtectedRoute role="admin"><BlogPreview /></ProtectedRoute>} />
      <Route path="/admin/messages" element={<ProtectedRoute role="admin"><Messages /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute role="admin"><Reports /></ProtectedRoute>} />

      {/* Employee Routes */}
      <Route path="/employee" element={<ProtectedRoute role="employee"><EmployeeDashboard /></ProtectedRoute>} />
      <Route path="/employee/attendance" element={<ProtectedRoute role="employee"><Attendance /></ProtectedRoute>} />
      <Route path="/employee/projects" element={<ProtectedRoute role="employee"><MyProjects /></ProtectedRoute>} />
      <Route path="/employee/tasks" element={<ProtectedRoute role="employee"><MyTasks /></ProtectedRoute>} />
      <Route path="/employee/leaves" element={<ProtectedRoute role="employee"><LeaveRequest /></ProtectedRoute>} />
      <Route path="/employee/messages" element={<ProtectedRoute role="employee"><Messages /></ProtectedRoute>} />
      <Route path="/employee/profile" element={<ProtectedRoute role="employee"><Profile /></ProtectedRoute>} />
      <Route path="/employee/settings" element={<ProtectedRoute role="employee"><EmployeeSettings /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default Mainrouts;
