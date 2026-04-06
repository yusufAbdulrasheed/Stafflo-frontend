import React, { useEffect, useState } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    API.get('/reports/all').then(r => setReports(r.data)).finally(() => setLoading(false));
  }, []);

  const handleReview = async (id, status) => {
    try {
      await API.put(`/reports/${id}/review`, { status });
      toast.success('Report acknowledged');
      setReports(r => r.map(rep => rep._id === id ? { ...rep, status } : rep));
      setSelected(null);
    } catch { toast.error('Failed'); }
  };

  const typeColors = { daily: 'info', weekly: 'success', monthly: 'purple', incident: 'danger', other: 'secondary' };
  const statusColors = { submitted: 'warning', reviewed: 'info', acknowledged: 'success' };

  return (
    <div>
      <div className="page-header">
        <div><h2>Staff Reports</h2><p>View all reports submitted by staff members</p></div>
      </div>
      <div className="card">
        <div className="table-wrap">
          {loading ? <div style={{ padding: 40, textAlign: 'center' }}><div className="loader" style={{ margin: '0 auto' }} /></div> : (
            <table className="table">
              <thead><tr><th>Title</th><th>Submitted By</th><th>Department</th><th>Type</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r._id}>
                    <td className="fw-700">{r.title}</td>
                    <td>{r.submittedBy?.firstName} {r.submittedBy?.lastName}</td>
                    <td className="text-muted">{r.submittedBy?.department?.name || '—'}</td>
                    <td><span className={`badge badge-${typeColors[r.reportType]}`}>{r.reportType}</span></td>
                    <td className="text-sm text-muted">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td><span className={`badge badge-${statusColors[r.status]}`}>{r.status}</span></td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => setSelected(r)}>View</button></td>
                  </tr>
                ))}
                {reports.length === 0 && <tr><td colSpan={7} className="empty-state"><p>No reports yet</p></td></tr>}
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
                <span className="badge badge-secondary">{new Date(selected.createdAt).toLocaleDateString()}</span>
              </div>
              <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '14px 16px', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {selected.content}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
              {selected.status === 'submitted' && (
                <button className="btn btn-success" onClick={() => handleReview(selected._id, 'acknowledged')}>✓ Acknowledge</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
