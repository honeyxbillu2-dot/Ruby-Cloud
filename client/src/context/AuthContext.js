import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiFetch = async (method, path, body, token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ruby_token');
    if (token) {
      apiFetch('GET', '/auth/me', null, token)
        .then(u => setUser({ ...u, isAdmin: u.isAdmin }))
        .catch(() => localStorage.removeItem('ruby_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await apiFetch('POST', '/auth/login', { email, password });
    localStorage.setItem('ruby_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const signup = async (username, email, password) => {
    await apiFetch('POST', '/auth/signup', { username, email, password });
  };

  const logout = () => {
    localStorage.removeItem('ruby_token');
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
