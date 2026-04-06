import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/admin/staff', label: 'Staff Management', icon: 'users' },
  { to: '/admin/departments', label: 'Departments', icon: 'building' },
  { to: '/admin/attendance', label: 'Attendance', icon: 'clock' },
  { to: '/admin/leaves', label: 'Leave Requests', icon: 'calendar' },
  { to: '/admin/tasks', label: 'Tasks', icon: 'task' },
  { to: '/admin/reports', label: 'Reports', icon: 'report' },
];

const pageTitles = {
  '/admin': 'Dashboard',
  '/admin/staff': 'Staff Management',
  '/admin/departments': 'Departments',
  '/admin/attendance': 'Attendance',
  '/admin/leaves': 'Leave Requests',
  '/admin/tasks': 'Tasks',
  '/admin/reports': 'Reports',
};

export default function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Admin';

  return (
    <div className="app-layout">
      <Sidebar navItems={navItems} basePath="/admin" />
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-title">
            {title}
            <div className="topbar-subtitle">Admin Panel · {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>
              🛡️ Administrator
            </span>
            <div className="avatar" style={{ background: 'var(--accent)' }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
