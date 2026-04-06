import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/staff', label: 'My Dashboard', icon: 'dashboard', end: true },
  { to: '/staff/attendance', label: 'My Attendance', icon: 'clock' },
  { to: '/staff/leave', label: 'Leave', icon: 'calendar' },
  { to: '/staff/tasks', label: 'My Tasks', icon: 'task' },
  { to: '/staff/reports', label: 'Submit Report', icon: 'report' },
  { to: '/staff/chat', label: 'Team Chat', icon: 'chat' },
];

const titles = { '/staff': 'My Dashboard', '/staff/attendance': 'Attendance', '/staff/leave': 'Leave Management', '/staff/tasks': 'My Tasks', '/staff/reports': 'Reports', '/staff/chat': 'Team Chat' };

export default function StaffLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const title = titles[location.pathname] || 'Staff Portal';

  return (
    <div className="app-layout">
      <Sidebar navItems={navItems} />
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-title">
            {title}
            <div className="topbar-subtitle">{user?.department?.name ? `${user.department.name} Department` : 'Staff Portal'} · {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>👤 Staff</span>
            <div className="avatar" style={{ background: 'var(--success)' }}>{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
          </div>
        </header>
        <main className="page-content"><Outlet /></main>
      </div>
    </div>
  );
}
