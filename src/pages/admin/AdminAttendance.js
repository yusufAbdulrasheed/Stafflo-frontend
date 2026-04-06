import React, { useEffect, useState } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminAttendance() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterDept, setFilterDept] = useState('');

  const fetchRecords = async () => {
    setLoading(true);
    const params = {};
    if (filterDate) params.date = filterDate;
    if (filterDept) params.department = filterDept;
    const [r, s] = await Promise.all([API.get('/attendance/all', { params }), API.get('/attendance/summary')]);
    setRecords(r.data); setSummary(s.data);
    setLoading(false);
  };

  useEffect(() => {
    API.get('/departments').then(r => setDepartments(r.data));
    fetchRecords();
  }, []);

  useEffect(() => { fetchRecords(); }, [filterDate, filterDept]);

  const fmt = (d) => d ? new Date(d).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }) : '—';
  const statusMap = { present: 'success', late: 'warning', absent: 'danger', 'half-day': 'info' };

  return (
    <div>
      <div className="page-header">
        <div><h2>Attendance Tracker</h2><p>Monitor daily clock-in/out for all staff</p></div>
        <button className="btn btn-ghost" onClick={fetchRecords}>↻ Refresh</button>
      </div>

      {summary && (
        <div className="stat-grid" style={{ marginBottom: 20 }}>
          {[
            { label: 'Total Active Staff', value: summary.total, icon: '👥', color: 'var(--primary)', bg: 'var(--primary-light)' },
            { label: 'Present Today', value: summary.presentToday, icon: '✅', color: 'var(--success)', bg: '#dcfce7' },
            { label: 'Late Arrivals', value: summary.lateToday, icon: '⏰', color: 'var(--warning)', bg: '#fef9c3' },
            { label: 'Absent Today', value: summary.absentToday, icon: '❌', color: 'var(--danger)', bg: '#fee2e2' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg }}><span style={{ fontSize: 22 }}>{s.icon}</span></div>
              <div className="stat-info"><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>📋 Attendance Records</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <input type="date" className="form-control" style={{ width: 160 }} value={filterDate} onChange={e => setFilterDate(e.target.value)} />
            <select className="form-control" style={{ width: 180 }} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
        </div>
        <div className="table-wrap">
          {loading ? <div style={{ padding: 40, textAlign: 'center' }}><div className="loader" style={{ margin: '0 auto' }} /></div> : (
            <table className="table">
              <thead><tr><th>Staff</th><th>Department</th><th>Date</th><th>Clock In</th><th>Clock Out</th><th>Hours</th><th>Overtime</th><th>Status</th></tr></thead>
              <tbody>
                {records.map(r => (
                  <tr key={r._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="avatar avatar-sm">{r.user?.firstName?.[0]}{r.user?.lastName?.[0]}</div>
                        <div><div className="fw-700">{r.user?.firstName} {r.user?.lastName}</div><div className="text-muted text-sm">{r.user?.staffId}</div></div>
                      </div>
                    </td>
                    <td className="text-muted">{r.user?.department?.name || '—'}</td>
                    <td className="text-sm">{r.date}</td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>{fmt(r.clockIn)}</td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>{fmt(r.clockOut)}</td>
                    <td style={{ fontWeight: 700 }}>{r.hoursWorked ? `${r.hoursWorked}h` : '—'}</td>
                    <td style={{ color: r.overtime > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>{r.overtime > 0 ? `+${r.overtime}h` : '—'}</td>
                    <td><span className={`badge badge-${statusMap[r.status] || 'secondary'}`}>{r.status}</span></td>
                  </tr>
                ))}
                {records.length === 0 && <tr><td colSpan={8} className="empty-state"><p>No records for this date</p></td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
