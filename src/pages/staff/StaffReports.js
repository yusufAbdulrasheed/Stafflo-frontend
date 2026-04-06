import React, { useEffect, useState } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const typeColors = { daily: 'info', weekly: 'success', monthly: 'purple', incident: 'danger', other: 'secondary' };
const statusColors = { submitted: 'warning', reviewed: 'info', acknowledged: 'success' };

export default function StaffReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', reportType: 'daily' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get('/reports/my').then(r => setReports(r.data)).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const r = await API.post('/reports', form);
      setReports(prev => [r.data, ...prev]);
      toast.success('Report submitted!');
      setModal(false);
      setForm({ title: '', content: '', reportType: 'daily' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h2>My Reports</h2><p>Submit and track your work reports</p></div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Submit Report</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? <div style={{ padding: 40, textAlign: 'center' }}><div className="loader" style={{ margin: '0 auto' }} /></div> : (
            <table className="table">
              <thead><tr><th>Title</th><th>Type</th><th>Date Submitted</th><th>Status</th></tr></thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r._id}>
                    <td className="fw-700">{r.title}</td>
                    <td><span className={`badge badge-${typeColors[r.reportType]}`}>{r.reportType}</span></td>
                    <td className="text-muted text-sm">{new Date(r.createdAt).toLocaleString('en-NG')}</td>
                    <td><span className={`badge badge-${statusColors[r.status]}`}>{r.status}</span></td>
                  </tr>
                ))}
                {reports.length === 0 && <tr><td colSpan={4} className="empty-state"><p>No reports submitted yet</p></td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>📝 Submit Report</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Report Type <span>*</span></label>
                  <select className="form-control" value={form.reportType} onChange={e => setForm(f => ({ ...f, reportType: e.target.value }))}>
                    <option value="daily">Daily Report</option>
                    <option value="weekly">Weekly Report</option>
                    <option value="monthly">Monthly Report</option>
                    <option value="incident">Incident Report</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Title <span>*</span></label>
                  <input className="form-control" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="e.g. Daily Activity Report - April 5" />
                </div>
                <div className="form-group">
                  <label className="form-label">Content <span>*</span></label>
                  <textarea className="form-control" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required rows={8} placeholder="Describe your activities, progress, challenges and plans..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Submitting...' : 'Submit Report'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
