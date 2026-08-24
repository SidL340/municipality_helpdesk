import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import KioskHome from './kiosk/KioskHome.jsx';
import ServiceList from './kiosk/ServiceList.jsx';
import TokenSuccess from './kiosk/TokenSuccess.jsx';
import RegisterWard from './kiosk/RegisterWard.jsx';

// Ward Admin Components
import WardLogin from './admin/WardLogin.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import Dashboard from './admin/Dashboard.jsx';
import ManageServices from './admin/ManageServices.jsx';
import ManageDocuments from './admin/ManageDocuments.jsx';
import ManageDesks from './admin/ManageDesks.jsx';
import ManageWardInfo from './admin/ManageWardInfo.jsx';

// Tech Head Components
import TechLogin from './tech/TechLogin.jsx';
import TechLayout from './tech/TechLayout.jsx';
import TechProfile from './tech/TechProfile.jsx';
import WardRequests from './admin/WardRequests.jsx';
import ManageAdmins from './admin/ManageAdmins.jsx';
import SystemDiagnostics from './admin/SystemDiagnostics.jsx';

function WardProtectedRoute({ children }) {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function TechProtectedRoute({ children }) {
  const token = localStorage.getItem('admin_token');
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
  if (!token || user.role !== 'super_tech') {
    return <Navigate to="/tech/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* 1. Citizen Touch Kiosk Public Routes */}
      <Route path="/" element={<KioskHome />} />
      <Route path="/ward/:wardNumber" element={<KioskHome />} />
      <Route path="/services/:categoryId" element={<ServiceList />} />
      <Route path="/token-success" element={<TokenSuccess />} />
      <Route path="/register-ward" element={<RegisterWard />} />

      {/* 2. Dedicated Ward Admin Portal */}
      <Route path="/admin/login" element={<WardLogin />} />
      <Route path="/ward-login" element={<WardLogin />} />
      <Route
        path="/admin/*"
        element={
          <WardProtectedRoute>
            <AdminLayout />
          </WardProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="services" element={<ManageServices />} />
        <Route path="documents" element={<ManageDocuments />} />
        <Route path="desks" element={<ManageDesks />} />
        <Route path="ward-info" element={<ManageWardInfo />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* 3. Dedicated Central Tech Head Portal (Nirmala Tech) */}
      <Route path="/tech/login" element={<TechLogin />} />
      <Route
        path="/tech/*"
        element={
          <TechProtectedRoute>
            <TechLayout />
          </TechProtectedRoute>
        }
      >
        <Route path="requests" element={<WardRequests />} />
        <Route path="users" element={<ManageAdmins />} />
        <Route path="diagnostics" element={<SystemDiagnostics />} />
        <Route path="services" element={<ManageServices />} />
        <Route path="documents" element={<ManageDocuments />} />
        <Route path="profile" element={<TechProfile />} />
        <Route index element={<Navigate to="requests" replace />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
