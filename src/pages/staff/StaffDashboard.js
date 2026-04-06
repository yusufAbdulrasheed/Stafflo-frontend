import React, { useEffect, useState, useCallback } from 'react';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const priorityColors = { urgent: 'danger', high: 'warning', medium: 'info', low: 'success' };
const leaveColors = { pending: 'warning', approved: 'success', rejected: 'danger' };

export default function StaffDashboard() {
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
    const [s, t] = await Promise.all([API.get('/dashboard/staff'), API.get('/attendance/today')]);
    setStats(s.data); setToday(t.data);
  }, []);

  useEffect(() => { fetchData().finally(() => setLoading(false)); }, [fetchData]);

  const handleClockIn = async () => {
    setClockLoading(true);
    try { const r = await API.post('/attendance/clock-in'); setToday(r.data); toast.success('Clocked in! Have a great day 🎉'); }
    catch (err) { toast.error(err.response?.data?.message || 'Clock in failed'); }
    finally { setClockLoading(false); }
  };

  const handleClockOut = async () => {
    setClockLoading(true);
    try { const r = await API.post('/attendance/clock-out'); setToday(r.data); toast.success(`Clocked out! You worked ${r.data.hoursWorked}h today 💪`); }
    catch (err) { toast.error(err.response?.data?.message || 'Clock out failed'); }
    finally { setClockLoading(false); }
  };

  const fmt = (d) => d ? new Date(d).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }) : null;

  if (loading) return <div className="loading-screen" style={{ minHeight: 300 }}><div className="loader" /></div>;

  return (
    <div>
      {/* Greeting */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>Good {time.getHours() < 12 ? 'morning' : time.getHours() < 17 ? 'afternoon' : 'evening'}, {user?.firstName}! 👋</h2>
        <p className="text-muted">{user?.jobTitle || 'Staff Member'} · {user?.department?.name || 'No Department'}</p>
      </div>

      {/* Clock Widget */}
      <div className="clock-widget mb-24">
        <div className="clock-info">
          <h2>{time.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</h2>
          <p>{time.toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <div className="clock-status">
            {today ? (
              today.clockOut ? `✅ Clocked out at ${fmt(today.clockOut)} · ${today.hoursWorked}h worked`
                : `🟢 Clocked in at ${fmt(today.clockIn)} · ${today.status}`
            ) : '⚪ Not clocked in yet'}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          <button className="btn btn-success btn-lg" onClick={handleClockIn} disabled={clockLoading || !!today?.clockIn} style={{ minWidth: 130 }}>
            {clockLoading ? '...' : '🟢 Clock In'}
          </button>
          <button className="btn btn-lg" style={{ background: 'rgba(255,255,255,.15)', color: '#fff', minWidth: 130 }} onClick={handleClockOut} disabled={clockLoading || !today?.clockIn || !!today?.clockOut}>
            {clockLoading ? '...' : '🔴 Clock Out'}
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stat-grid mb-24">
        {[
          { label: 'Leave Balance', value: `${user?.leaveBalance || 0} days`, icon: '🌴', color: 'var(--primary)', bg: 'var(--primary-light)' },
          { label: 'Pending Tasks', value: stats?.pendingTasks || 0, icon: '📌', color: 'var(--warning)', bg: '#fef9c3' },
          { label: 'Completed Tasks', value: stats?.completedTasks || 0, icon: '✅', color: 'var(--success)', bg: '#dcfce7' },
          { label: 'Department', value: user?.department?.name || '—', icon: '🏢', color: '#8b5cf6', bg: '#f3e8ff' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><span style={{ fontSize: 22 }}>{s.icon}</span></div>
            <div className="stat-info"><div className="stat-value" style={{ color: s.color, fontSize: s.label === 'Department' ? 16 : 26 }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* My Tasks */}
        <div className="card">
          <div className="card-header"><h3>📌 My Tasks</h3><a href="/staff/tasks" className="btn btn-ghost btn-sm">View All</a></div>
          <div style={{ padding: '0 4px' }}>
            {stats?.myTasks?.length === 0 ? <div className="empty-state"><p>No pending tasks</p></div> :
              stats?.myTasks?.map(t => (
                <div key={t._id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span className={`badge badge-${priorityColors[t.priority]}`} style={{ marginTop: 2 }}>{t.priority}</span>
                  <div style={{ flex: 1 }}>
                    <div className="fw-700" style={{ fontSize: 13 }}>{t.title}</div>
                    {t.dueDate && <div className="text-muted text-sm">Due: {new Date(t.dueDate).toLocaleDateString()}</div>}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* My Leaves */}
        <div className="card">
          <div className="card-header"><h3>🗓️ Recent Leaves</h3><a href="/staff/leave" className="btn btn-ghost btn-sm">View All</a></div>
          <div style={{ padding: '0 4px' }}>
            {stats?.myLeaves?.length === 0 ? <div className="empty-state"><p>No leave requests</p></div> :
              stats?.myLeaves?.map(l => (
                <div key={l._id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div className="fw-700" style={{ fontSize: 13, textTransform: 'capitalize' }}>{l.leaveType} Leave</div>
                    <div className="text-muted text-sm">{l.days} days · {new Date(l.startDate).toLocaleDateString()}</div>
                  </div>
                  <span className={`badge badge-${leaveColors[l.status]}`}>{l.status}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
