import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/manager', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/manager/team', label: 'My Team', icon: 'team' },
  { to: '/manager/tasks', label: 'Task Management', icon: 'task' },
  { to: '/manager/attendance', label: 'Attendance', icon: 'clock' },
  { to: '/manager/leaves', label: 'Leave Requests', icon: 'calendar' },
  { to: '/manager/reports', label: 'Staff Reports', icon: 'report' },
  { to: '/manager/chat', label: 'Team Chat', icon: 'chat' },
];

const titles = {
  '/manager': 'Dashboard',
  '/manager/team': 'My Team',
  '/manager/tasks': 'Task Management',
  '/manager/attendance': 'Team Attendance',
  '/manager/leaves': 'Leave Requests',
  '/manager/reports': 'Staff Reports',
  '/manager/chat': 'Team Chat',
};

export default function ManagerLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const title = titles[location.pathname] || 'Manager Portal';

  return (
    <div className="app-layout">
      <Sidebar navItems={navItems} />
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-title">
            {title}
            <div className="topbar-subtitle">
              {user?.department?.name ? `${user.department.name} Department` : 'Manager Portal'} ·{' '}
              {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, background: '#f3e8ff', color: '#6b21a8', padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>
              🎯 Manager
            </span>
            <div className="avatar" style={{ background: '#8b5cf6' }}>
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
