import React, { useEffect, useState } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function StaffAttendance() {
  const [records, setRecords] = useState([]);
  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchData = async () => {
    setLoading(true);
    const [r, t] = await Promise.all([
      API.get('/attendance/my', { params: { month, year } }),
      API.get('/attendance/today'),
    ]);
    setRecords(r.data); setToday(t.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [month, year]);

  const handleClockIn = async () => {
    setClockLoading(true);
    try { const r = await API.post('/attendance/clock-in'); setToday(r.data); toast.success('Clocked in!'); fetchData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setClockLoading(false); }
  };

  const handleClockOut = async () => {
    setClockLoading(true);
    try { const r = await API.post('/attendance/clock-out'); setToday(r.data); toast.success(`Great work! ${r.data.hoursWorked}h logged.`); fetchData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setClockLoading(false); }
  };

  const fmt = (d) => d ? new Date(d).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }) : '—';
  const statusMap = { present: 'success', late: 'warning', absent: 'danger', 'half-day': 'info' };

  const totalDays = records.length;
  const presentDays = records.filter(r => r.status === 'present').length;
  const lateDays = records.filter(r => r.status === 'late').length;
  const totalHours = records.reduce((sum, r) => sum + (r.hoursWorked || 0), 0).toFixed(1);

  return (
    <div>
      <div className="page-header">
        <div><h2>My Attendance</h2><p>Track your clock-in, clock-out and attendance history</p></div>
      </div>

      {/* Clock Controls */}
      <div className="clock-widget mb-24">
        <div className="clock-info">
          <h2 style={{ fontSize: 24 }}>{today ? (today.clockOut ? '✅ Day Complete' : `🟢 In since ${fmt(today.clockIn)}`) : '⚪ Not clocked in'}</h2>
          <p style={{ marginTop: 6 }}>
            {today?.clockIn && `Clock In: ${fmt(today.clockIn)}`}
            {today?.clockOut && `  ·  Clock Out: ${fmt(today.clockOut)}`}
            {today?.hoursWorked > 0 && `  ·  ${today.hoursWorked}h worked`}
          </p>
          {today?.overtime > 0 && <div className="clock-status">Overtime: +{today.overtime}h 🔥</div>}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-success btn-lg" onClick={handleClockIn} disabled={clockLoading || !!today?.clockIn}>🟢 Clock In</button>
          <button className="btn btn-lg" style={{ background: 'rgba(255,255,255,.15)', color: '#fff' }} onClick={handleClockOut} disabled={clockLoading || !today?.clockIn || !!today?.clockOut}>🔴 Clock Out</button>
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="stat-grid mb-24">
        {[
          { label: 'Days Recorded', value: totalDays, icon: '📅', color: 'var(--primary)', bg: 'var(--primary-light)' },
          { label: 'Present Days', value: presentDays, icon: '✅', color: 'var(--success)', bg: '#dcfce7' },
          { label: 'Late Arrivals', value: lateDays, icon: '⏰', color: 'var(--warning)', bg: '#fef9c3' },
          { label: 'Total Hours', value: `${totalHours}h`, icon: '⏱️', color: '#8b5cf6', bg: '#f3e8ff' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><span style={{ fontSize: 22 }}>{s.icon}</span></div>
            <div className="stat-info"><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      {/* History */}
      <div className="card">
        <div className="card-header">
          <h3>📋 Attendance History</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <select className="form-control" style={{ width: 120 }} value={month} onChange={e => setMonth(+e.target.value)}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('en', { month: 'long' })}</option>
              ))}
            </select>
            <select className="form-control" style={{ width: 90 }} value={year} onChange={e => setYear(+e.target.value)}>
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div className="table-wrap">
          {loading ? <div style={{ padding: 40, textAlign: 'center' }}><div className="loader" style={{ margin: '0 auto' }} /></div> : (
            <table className="table">
              <thead><tr><th>Date</th><th>Clock In</th><th>Clock Out</th><th>Hours Worked</th><th>Overtime</th><th>Status</th></tr></thead>
              <tbody>
                {records.map(r => (
                  <tr key={r._id}>
                    <td className="fw-700">{r.date}</td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{fmt(r.clockIn)}</td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{fmt(r.clockOut)}</td>
                    <td className="fw-700">{r.hoursWorked ? `${r.hoursWorked}h` : '—'}</td>
                    <td style={{ color: r.overtime > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>{r.overtime > 0 ? `+${r.overtime}h` : '—'}</td>
                    <td><span className={`badge badge-${statusMap[r.status] || 'secondary'}`}>{r.status}</span></td>
                  </tr>
                ))}
                {records.length === 0 && <tr><td colSpan={6} className="empty-state"><p>No records for this period</p></td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
