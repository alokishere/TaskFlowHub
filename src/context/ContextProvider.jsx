import React, { createContext, useEffect, useState } from 'react';
import { userAPI } from '../services/api';
import { getUser } from '../utils/auth';

export const AuthContext = createContext();

const ContextProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const currentUser = getUser();
        if (currentUser) {
          const [profileResponse, employeesResponse, statsResponse] = await Promise.all([
            userAPI.getProfile(),
            currentUser.role === 'admin' ? userAPI.getEmployees() : Promise.resolve({ data: { users: [] } }),
            userAPI.getStats()
          ]);

          setUserData({
            currentUser: profileResponse.data.user,
            employees: employeesResponse.data?.users || [],
            stats: statsResponse.data?.taskCounts || { newTask: 0, active: 0, completed: 0, failed: 0 }
          });
        }
      } catch (error) {
        console.error('Error initializing user data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const refreshUserData = async () => {
    try {
      const currentUser = getUser();
      if (currentUser) {
        const profileResponse = await userAPI.getProfile();
        const statsResponse = await userAPI.getStats();

        setUserData(prev => ({
          ...prev,
          currentUser: profileResponse.data.user,
          stats: statsResponse.data?.taskCounts || { newTask: 0, active: 0, completed: 0, failed: 0 }
        }));
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const refreshEmployees = async () => {
    try {
      const response = await userAPI.getEmployees();
      setUserData(prev => ({
        ...prev,
        employees: response.data?.users || []
      }));
    } catch (error) {
      console.error('Error refreshing employees:', error);
    }
  };

  const value = {
    ...userData,
    loading,
    refreshUserData,
    refreshEmployees
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default ContextProvider;