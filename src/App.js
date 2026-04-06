import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStaff from './pages/admin/AdminStaff';
import AdminDepartments from './pages/admin/AdminDepartments';
import AdminAttendance from './pages/admin/AdminAttendance';
import AdminLeaves from './pages/admin/AdminLeaves';
import AdminTasks from './pages/admin/AdminTasks';
import AdminReports from './pages/admin/AdminReports';

import StaffLayout from './pages/staff/StaffLayout';
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffAttendance from './pages/staff/StaffAttendance';
import StaffLeave from './pages/staff/StaffLeave';
import StaffTasks from './pages/staff/StaffTasks';
import StaffReports from './pages/staff/StaffReports';
import StaffChat from './pages/staff/StaffChat';

import ManagerLayout from './pages/manager/ManagerLayout';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManagerTeam from './pages/manager/ManagerTeam';
import ManagerTasks from './pages/manager/ManagerTasks';
import ManagerAttendance from './pages/manager/ManagerAttendance';
import ManagerReports from './pages/manager/ManagerReports';
import ManagerLeaves from './pages/manager/ManagerLeaves';
import ManagerChat from './pages/manager/ManagerChat';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="loader" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'manager') return <Navigate to="/manager" replace />;
    return <Navigate to="/staff" replace />;
  }
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'manager') return <Navigate to="/manager" replace />;
  return <Navigate to="/staff" replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RoleRedirect />} />

      {/* Admin */}
      <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminLayout /></PrivateRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="staff" element={<AdminStaff />} />
        <Route path="departments" element={<AdminDepartments />} />
        <Route path="attendance" element={<AdminAttendance />} />
        <Route path="leaves" element={<AdminLeaves />} />
        <Route path="tasks" element={<AdminTasks />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>

      {/* Staff */}
      <Route path="/staff" element={<PrivateRoute roles={['staff']}><StaffLayout /></PrivateRoute>}>
        <Route index element={<StaffDashboard />} />
        <Route path="attendance" element={<StaffAttendance />} />
        <Route path="leave" element={<StaffLeave />} />
        <Route path="tasks" element={<StaffTasks />} />
        <Route path="reports" element={<StaffReports />} />
        <Route path="chat" element={<StaffChat />} />
      </Route>

      {/* Manager */}
      <Route path="/manager" element={<PrivateRoute roles={['manager']}><ManagerLayout /></PrivateRoute>}>
        <Route index element={<ManagerDashboard />} />
        <Route path="team" element={<ManagerTeam />} />
        <Route path="tasks" element={<ManagerTasks />} />
        <Route path="attendance" element={<ManagerAttendance />} />
        <Route path="reports" element={<ManagerReports />} />
        <Route path="leaves" element={<ManagerLeaves />} />
        <Route path="chat" element={<ManagerChat />} />
      </Route>

      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  );
}
