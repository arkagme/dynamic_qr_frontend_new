import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import React, { useState, useEffect } from 'react';

const ProtectedRoute = ({ children }) => {
  const [authStatus, setAuthStatus] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await axios.get(`${API_BASE_URL}/me`, { withCredentials: true });
        setAuthStatus(true);
      } catch (error) {
        setAuthStatus(false);
        alert('Please log in to access this page');
        window.location.href = '/';
      }
    };
    verifyAuth();
  }, []);

  if (authStatus === null) return <div>Loading...</div>;
  return authStatus ? children : null;
};

export default ProtectedRoute
