import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  phoneNumber?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: any) => Promise<User>;
  registerUser: (userData: any) => Promise<any>;
  logout: () => void;
  updateProfile: (updatedData: any) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for stored credentials on boot
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials: any): Promise<User> => {
    setLoading(true);
    try {
      const response = await api.post('/user/login', credentials);
      const { token, username, role, email, id } = response.data;
      
      const loggedUser: User = { id, username, email, role };
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      
      setToken(token);
      setUser(loggedUser);
      
      return loggedUser;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (userData: any): Promise<any> => {
    try {
      const response = await api.post('/user/register', userData);
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Registration failed. Please try again.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (updatedData: any): Promise<User> => {
    try {
      const response = await api.put('/user/profile', updatedData);
      const { token: newToken, username, role, email, id, phoneNumber } = response.data;
      
      const updatedUser: User = { id, username, email, role, phoneNumber };
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setToken(newToken);
      setUser(updatedUser);
      
      return updatedUser;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Profile update failed. Please try again.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, registerUser, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
