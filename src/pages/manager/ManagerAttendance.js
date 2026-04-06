import React, { useEffect, useState } from 'react';
import API from '../../utils/api';

export default function ManagerAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchRecords = async () => {
    setLoading(true);
    const r = await API.get('/attendance/department', { params: { date } });
    setRecords(r.data);
    setLoading(false);
  };

  useEffect(() => { fetchRecords(); }, [date]);

  const fmt = (d) => d ? new Date(d).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }) : '—';
  const statusMap = { present: 'success', late: 'warning', absent: 'danger', 'half-day': 'info' };

  const presentCount = records.filter(r => r.status === 'present').length;
  const lateCount = records.filter(r => r.status === 'late').length;

  return (
    <div>
      <div className="page-header">
        <div><h2>Team Attendance</h2><p>Monitor your team's daily attendance</p></div>
        <input type="date" className="form-control" style={{ width: 160 }} value={date} onChange={e => setDate(e.target.value)} />
      </div>

      <div className="stat-grid mb-24">
        {[
          { label: 'Total Records', value: records.length, icon: '📋', color: 'var(--primary)', bg: 'var(--primary-light)' },
          { label: 'Present', value: presentCount, icon: '✅', color: 'var(--success)', bg: '#dcfce7' },
          { label: 'Late', value: lateCount, icon: '⏰', color: 'var(--warning)', bg: '#fef9c3' },
          { label: 'Clocked Out', value: records.filter(r => r.clockOut).length, icon: '🔴', color: 'var(--danger)', bg: '#fee2e2' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><span style={{ fontSize: 22 }}>{s.icon}</span></div>
            <div className="stat-info"><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><h3>📋 Attendance for {date}</h3></div>
        <div className="table-wrap">
          {loading ? <div style={{ padding: 40, textAlign: 'center' }}><div className="loader" style={{ margin: '0 auto' }} /></div> : (
            <table className="table">
              <thead><tr><th>Staff</th><th>Clock In</th><th>Clock Out</th><th>Hours</th><th>Overtime</th><th>Status</th></tr></thead>
              <tbody>
                {records.map(r => (
                  <tr key={r._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="avatar avatar-sm">{r.user?.firstName?.[0]}{r.user?.lastName?.[0]}</div>
                        <div>
                          <div className="fw-700">{r.user?.firstName} {r.user?.lastName}</div>
                          <div className="text-muted text-sm">{r.user?.staffId}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>{fmt(r.clockIn)}</td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>{fmt(r.clockOut)}</td>
                    <td className="fw-700">{r.hoursWorked ? `${r.hoursWorked}h` : '—'}</td>
                    <td style={{ color: r.overtime > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>{r.overtime > 0 ? `+${r.overtime}h` : '—'}</td>
                    <td><span className={`badge badge-${statusMap[r.status] || 'secondary'}`}>{r.status}</span></td>
                  </tr>
                ))}
                {records.length === 0 && <tr><td colSpan={6} className="empty-state"><p>No attendance records for this date</p></td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
