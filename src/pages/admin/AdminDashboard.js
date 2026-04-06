import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, icon, color, bg }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: bg }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
    </div>
    <div className="stat-info">
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = { pending: 'warning', approved: 'success', rejected: 'danger', active: 'success', inactive: 'danger' };
  return <span className={`badge badge-${map[status] || 'secondary'}`}>{status}</span>;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/dashboard/admin').then(r => setStats(r.data)).catch(() => toast.error('Failed to load stats')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen" style={{ minHeight: 300 }}><div className="loader" /></div>;
  if (!stats) return null;

  return (
    <div>
      {/* Stat Grid */}
      <div className="stat-grid">
        <StatCard label="Total Active Staff" value={stats.totalStaff} icon="👥" color="var(--primary)" bg="var(--primary-light)" />
        <StatCard label="Departments" value={stats.totalDepts} icon="🏢" color="#8b5cf6" bg="#f3e8ff" />
        <StatCard label="Present Today" value={stats.presentToday} icon="✅" color="var(--success)" bg="#dcfce7" />
        <StatCard label="Absent Today" value={Math.max(0, stats.totalStaff - stats.presentToday)} icon="❌" color="var(--danger)" bg="#fee2e2" />
        <StatCard label="Pending Leaves" value={stats.pendingLeaves} icon="📋" color="var(--warning)" bg="#fef9c3" />
        <StatCard label="Open Tasks" value={stats.totalTasks} icon="📌" color="#06b6d4" bg="#cffafe" />
        <StatCard label="Unreviewed Reports" value={stats.pendingReports} icon="📄" color="#f97316" bg="#ffedd5" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Attendance Chart */}
        <div className="card">
          <div className="card-header"><h3>📊 Attendance — Last 7 Days</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.attendanceChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [v, 'Present']} labelFormatter={l => `Date: ${l}`} />
                <Bar dataKey="present" fill="var(--primary)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending Leaves */}
        <div className="card">
          <div className="card-header">
            <h3>🗓️ Pending Leave Requests</h3>
            <a href="/admin/leaves" className="btn btn-ghost btn-sm">View All</a>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {stats.recentLeaves.length === 0 ? (
              <div className="empty-state"><p>No pending leaves</p></div>
            ) : stats.recentLeaves.map(l => (
              <div key={l._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                <div className="avatar avatar-sm">{l.user?.firstName?.[0]}{l.user?.lastName?.[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{l.user?.firstName} {l.user?.lastName}</div>
                  <div className="text-muted text-sm">{l.leaveType} · {l.days} days</div>
                </div>
                <StatusBadge status={l.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Staff */}
      <div className="card">
        <div className="card-header">
          <h3>👤 Recently Added Staff</h3>
          <a href="/admin/staff" className="btn btn-ghost btn-sm">View All</a>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th>Role</th><th>Department</th><th>Joined</th><th>Status</th></tr></thead>
            <tbody>
              {stats.recentStaff.map(s => (
                <tr key={s._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar avatar-sm">{s.firstName?.[0]}{s.lastName?.[0]}</div>
                      <span className="fw-700">{s.firstName} {s.lastName}</span>
                    </div>
                  </td>
                  <td><span className={`badge badge-${s.role === 'admin' ? 'danger' : s.role === 'manager' ? 'purple' : 'info'}`}>{s.role}</span></td>
                  <td>{s.department?.name || '—'}</td>
                  <td className="text-muted text-sm">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td><StatusBadge status="active" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
