import React, { useEffect, useState } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const typeColors = { daily: 'info', weekly: 'success', monthly: 'purple', incident: 'danger', other: 'secondary' };
const statusColors = { submitted: 'warning', reviewed: 'info', acknowledged: 'success' };

export default function ManagerReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    API.get('/reports/department').then(r => setReports(r.data)).finally(() => setLoading(false));
  }, []);

  const handleAck = async (id) => {
    try {
      await API.put(`/reports/${id}/review`, { status: 'acknowledged' });
      toast.success('Report acknowledged');
      setReports(r => r.map(rep => rep._id === id ? { ...rep, status: 'acknowledged' } : rep));
      setSelected(null);
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h2>Staff Reports</h2><p>View and acknowledge reports from your team</p></div>
      </div>

      <div className="stat-grid mb-24">
        {[
          { label: 'Total Reports', value: reports.length, icon: '📄', color: 'var(--primary)', bg: 'var(--primary-light)' },
          { label: 'New (Unreviewed)', value: reports.filter(r => r.status === 'submitted').length, icon: '🆕', color: 'var(--warning)', bg: '#fef9c3' },
          { label: 'Acknowledged', value: reports.filter(r => r.status === 'acknowledged').length, icon: '✅', color: 'var(--success)', bg: '#dcfce7' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><span style={{ fontSize: 22 }}>{s.icon}</span></div>
            <div className="stat-info"><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? <div style={{ padding: 40, textAlign: 'center' }}><div className="loader" style={{ margin: '0 auto' }} /></div> : (
            <table className="table">
              <thead><tr><th>Title</th><th>Staff</th><th>Type</th><th>Submitted</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r._id}>
                    <td className="fw-700">{r.title}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="avatar avatar-sm">{r.submittedBy?.firstName?.[0]}{r.submittedBy?.lastName?.[0]}</div>
                        {r.submittedBy?.firstName} {r.submittedBy?.lastName}
                      </div>
                    </td>
                    <td><span className={`badge badge-${typeColors[r.reportType]}`}>{r.reportType}</span></td>
                    <td className="text-muted text-sm">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td><span className={`badge badge-${statusColors[r.status]}`}>{r.status}</span></td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => setSelected(r)}>View</button></td>
                  </tr>
                ))}
                {reports.length === 0 && <tr><td colSpan={6} className="empty-state"><p>No reports from your team yet</p></td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{selected.title}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                <span className={`badge badge-${typeColors[selected.reportType]}`}>{selected.reportType}</span>
                <span className="badge badge-secondary">By: {selected.submittedBy?.firstName} {selected.submittedBy?.lastName}</span>
                <span className="badge badge-secondary">{new Date(selected.createdAt).toLocaleString()}</span>
              </div>
              <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '14px 16px', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: 300, overflowY: 'auto' }}>
                {selected.content}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
              {selected.status === 'submitted' && (
                <button className="btn btn-success" onClick={() => handleAck(selected._id)}>✓ Acknowledge</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
