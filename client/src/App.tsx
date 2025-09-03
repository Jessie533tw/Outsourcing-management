import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout, message } from 'antd';
import { authAPI } from './services/api';
import type { User } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Vendors from './pages/Vendors';
import Materials from './pages/Materials';
import Purchases from './pages/Purchases';
import Progress from './pages/Progress';
import Reports from './pages/Reports';
import AppLayout from './components/Layout/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

const { Content } = Layout;

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.getProfile()
        .then((response: any) => {
          setUser(response.user);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData: User, token: string) => {
    localStorage.setItem('token', token);
    setUser(userData);
    message.success('登入成功！');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    message.success('已成功登出');
  };

  if (loading) {
    return (
      <Layout style={{ height: '100vh' }}>
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div>載入中...</div>
        </Content>
      </Layout>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <AppLayout user={user} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/*"
          element={
            <ProtectedRoute user={user} requiredRoles={['admin', 'manager']}>
              <Projects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendors/*"
          element={
            <ProtectedRoute user={user} requiredRoles={['admin', 'manager']}>
              <Vendors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materials/*"
          element={
            <ProtectedRoute user={user}>
              <Materials />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchases/*"
          element={
            <ProtectedRoute user={user}>
              <Purchases />
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress/*"
          element={
            <ProtectedRoute user={user}>
              <Progress />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/*"
          element={
            <ProtectedRoute user={user}>
              <Reports />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AppLayout>
  );
}

export default App;