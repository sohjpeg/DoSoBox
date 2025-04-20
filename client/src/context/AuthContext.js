import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Setup axios interceptor for error handling
  useEffect(() => {
    // Add request interceptor for adding auth token
    axios.interceptors.request.use(
      config => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        console.error('Error with request:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for handling token errors
    axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          console.log('Unauthorized request detected, logging out');
          localStorage.removeItem('token');
          setCurrentUser(null);
        }
        return Promise.reject(error);
      }
    );
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          console.log('Fetching user data with token');
          const response = await axios.get('http://localhost:5001/api/users/current');
          console.log('User data received:', response.data);
          setCurrentUser(response.data);
        } catch (error) {
          console.error('Error fetching user data:', error.message);
          if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
          }
          localStorage.removeItem('token');
        }
      } else {
        console.log('No token found, user not authenticated');
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (token) => {
    console.log('Logging in with token:', token ? 'Token received' : 'No token');
    
    localStorage.setItem('token', token);
    
    try {
      // Fetch user details after login
      const response = await axios.get('http://localhost:5001/api/users/current', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('User data after login:', response.data);
      setCurrentUser(response.data);
      return true;
    } catch (error) {
      console.error('Error fetching user data after login:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      return false;
    }
  };

  const logout = () => {
    console.log('Logging out');
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const updateUser = (userData) => {
    console.log('Updating user data:', userData);
    setCurrentUser(userData);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};



