import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Mainrouts from './Mainroutes';
import { clearAuthSession, getTokenExpiryAt } from './services/api';

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const expiryAt = getTokenExpiryAt();
    if (!expiryAt) {
      return undefined;
    }

    const timeLeft = expiryAt - Date.now();
    if (timeLeft <= 0) {
      clearAuthSession();
      if (location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      clearAuthSession();
      navigate('/login', { replace: true });
    }, timeLeft);

    return () => window.clearTimeout(timeoutId);
  }, [location.pathname, navigate]);

  return (
    <div>
      <Mainrouts/>
    </div>
  )
}

export default App
