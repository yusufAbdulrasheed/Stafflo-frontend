import React, { useEffect, useState, useCallback } from 'react';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const priorityColors = { urgent: 'danger', high: 'warning', medium: 'info', low: 'success' };
const statusColors = { submitted: 'warning', reviewed: 'info', acknowledged: 'success' };

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchData = useCallback(async () => {
    const [s, t] = await Promise.all([
      API.get('/dashboard/manager'),
      API.get('/attendance/today'),
    ]);
    setStats(s.data);
    setToday(t.data);
  }, []);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const handleClockIn = async () => {
    setClockLoading(true);
    try {
      const r = await API.post('/attendance/clock-in');
      setToday(r.data);
      toast.success('Clocked in!');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setClockLoading(false); }
  };

  const handleClockOut = async () => {
    setClockLoading(true);
    try {
      const r = await API.post('/attendance/clock-out');
      setToday(r.data);
      toast.success(`Clocked out! ${r.data.hoursWorked}h today`);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setClockLoading(false); }
  };

  const fmt = (d) => d ? new Date(d).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }) : null;

  if (loading) return <div className="loading-screen" style={{ minHeight: 300 }}><div className="loader" /></div>;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>
          Good {time.getHours() < 12 ? 'morning' : time.getHours() < 17 ? 'afternoon' : 'evening'}, {user?.firstName}! 🎯
        </h2>
        <p className="text-muted">{user?.department?.name || 'Department'} Manager · {user?.jobTitle}</p>
      </div>

      {/* Clock Widget */}
      <div className="clock-widget mb-24" style={{ background: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 50%, #8b5cf6 100%)' }}>
        <div className="clock-info">
          <h2>{time.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</h2>
          <p>{time.toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <div className="clock-status">
            {today
              ? today.clockOut
                ? `✅ Clocked out at ${fmt(today.clockOut)} · ${today.hoursWorked}h worked`
                : `🟢 Clocked in at ${fmt(today.clockIn)}`
              : '⚪ Not clocked in yet'}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          <button className="btn btn-success btn-lg" onClick={handleClockIn} disabled={clockLoading || !!today?.clockIn} style={{ minWidth: 130 }}>
            🟢 Clock In
          </button>
          <button className="btn btn-lg" style={{ background: 'rgba(255,255,255,.15)', color: '#fff', minWidth: 130 }}
            onClick={handleClockOut} disabled={clockLoading || !today?.clockIn || !!today?.clockOut}>
            🔴 Clock Out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid mb-24">
        {[
          { label: 'Team Members', value: stats?.totalTeam || 0, icon: '👥', color: '#8b5cf6', bg: '#f3e8ff' },
          { label: 'Present Today', value: stats?.presentToday || 0, icon: '✅', color: 'var(--success)', bg: '#dcfce7' },
          { label: 'Pending Leaves', value: stats?.pendingLeaves || 0, icon: '📋', color: 'var(--warning)', bg: '#fef9c3' },
          { label: 'Open Tasks', value: stats?.openTasks || 0, icon: '📌', color: 'var(--info)', bg: '#dbeafe' },
          { label: 'New Reports', value: stats?.deptReports?.length || 0, icon: '📄', color: '#f97316', bg: '#ffedd5' },
          { label: 'My Leave Balance', value: `${user?.leaveBalance || 0}d`, icon: '🌴', color: 'var(--primary)', bg: 'var(--primary-light)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><span style={{ fontSize: 22 }}>{s.icon}</span></div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Tasks */}
        <div className="card">
          <div className="card-header">
            <h3>📌 Recent Tasks</h3>
            <a href="/manager/tasks" className="btn btn-ghost btn-sm">Manage</a>
          </div>
          <div>
            {stats?.recentTasks?.length === 0
              ? <div className="empty-state"><p>No tasks yet</p></div>
              : stats?.recentTasks?.map(t => (
                <div key={t._id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className={`badge badge-${priorityColors[t.priority]}`}>{t.priority}</span>
                  <div style={{ flex: 1 }}>
                    <div className="fw-700" style={{ fontSize: 13 }}>{t.title}</div>
                    <div className="text-muted text-sm">→ {t.assignedTo?.firstName} {t.assignedTo?.lastName}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="card">
          <div className="card-header">
            <h3>📄 Staff Reports</h3>
            <a href="/manager/reports" className="btn btn-ghost btn-sm">View All</a>
          </div>
          <div>
            {stats?.deptReports?.length === 0
              ? <div className="empty-state"><p>No new reports</p></div>
              : stats?.deptReports?.map(r => (
                <div key={r._id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div className="fw-700" style={{ fontSize: 13 }}>{r.title}</div>
                    <div className="text-muted text-sm">By {r.submittedBy?.firstName} {r.submittedBy?.lastName}</div>
                  </div>
                  <span className={`badge badge-${statusColors[r.status]}`}>{r.status}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
