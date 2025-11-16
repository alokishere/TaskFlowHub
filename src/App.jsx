import React, { useEffect, useState } from "react";
import Login from "./components/Auth/Login";
import EmployeeDashboard from "./components/DashBoard/EmployeeDashboard";
import AdminDashboard from "./components/DashBoard/AdminDashboard";
import { authAPI } from "./services/api";
import { validateToken, logout } from "./utils/auth";

const App = () => {
  const [user, setUser] = useState(null);
  const [loggedInUserData, setLoggedInUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const isValid = await validateToken();
        if (isValid) {
          const userData = JSON.parse(localStorage.getItem('user'));
          setUser(userData.role);
          setLoggedInUserData(userData);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleAuth = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      if (response.success) {
        const { user: userData, token } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));

        setUser(userData.role);
        setLoggedInUserData(userData);

        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (error) {
      return { success: false, error: error.error || 'Login failed' };
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {!user ? <Login handleAuth={handleAuth} /> : ""}

      {user === "admin" ? (
        <AdminDashboard changeUser={handleLogout} data={loggedInUserData} />
      ) : user === 'employee' ? (
        <EmployeeDashboard changeUser={handleLogout} data={loggedInUserData} />
      ) : null}
    </>
  );
};

export default App;
