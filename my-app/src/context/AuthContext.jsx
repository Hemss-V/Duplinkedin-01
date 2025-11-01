// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/api'; // Import your API functions

// 1. Create the Context
const AuthContext = createContext(null);

// 2. Create the AuthProvider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // To check auth state on load

  // Check for existing token in localStorage when app loads
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      if (token && user) {
        setCurrentUser(JSON.parse(user));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      // Clear bad data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await loginUser({ email, password });
      
      if (response.data && response.data.token) {
        const { token, user } = response.data;
        
        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Update state
        setCurrentUser(user);
        setIsAuthenticated(true);
        
        return { success: true };
      }
      // This case should not be hit if API returns error
      return { success: false, error: 'Invalid response from server.' };
      
    } catch (error) {
      console.error("Login failed:", error);
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (name, email, password, description) => {
    try {
      const response = await registerUser({ name, email, password, description });

      if (response.status === 201) {
        return { success: true };
      }
      
      return { success: false, error: 'Registration failed.' };

    } catch (error) {
      console.error("Registration failed:", error);
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsAuthenticated(false);
    // Redirect to login page (this will happen via ProtectedRoute)
  };

  // Value provided to all child components
  const value = {
    currentUser,
    isAuthenticated,
    loading, // Use this in ProtectedRoute to prevent flicker
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 3. Create the useAuth hook
export const useAuth = () => {
  return useContext(AuthContext);
};