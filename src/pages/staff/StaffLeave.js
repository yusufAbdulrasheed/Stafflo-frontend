import React, { useEffect, useState } from 'react';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function StaffLeave() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ leaveType: 'annual', startDate: '', endDate: '', reason: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get('/leaves/my').then(r => setLeaves(r.data)).finally(() => setLoading(false));
  }, []);

  const calcDays = () => {
    if (!form.startDate || !form.endDate) return 0;
    const diff = new Date(form.endDate) - new Date(form.startDate);
    return Math.max(0, Math.ceil(diff / 86400000) + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(form.endDate) < new Date(form.startDate)) return toast.error('End date must be after start date');
    setSaving(true);
    try {
      const r = await API.post('/leaves', form);
      setLeaves(l => [r.data, ...l]);
      toast.success('Leave application submitted!');
      setModal(false);
      setForm({ leaveType: 'annual', startDate: '', endDate: '', reason: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit'); }
    finally { setSaving(false); }
  };

  const statusColors = { pending: 'warning', approved: 'success', rejected: 'danger' };
  const typeColors = { annual: 'info', sick: 'danger', maternity: 'purple', paternity: 'info', emergency: 'warning', unpaid: 'secondary' };

  return (
    <div>
      <div className="page-header">
        <div><h2>Leave Management</h2><p>Apply for leave and track your leave history</p></div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Apply for Leave</button>
      </div>

      {/* Leave Balance Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Annual Leave Balance', value: `${user?.leaveBalance || 0} days`, icon: '🌴', color: 'var(--primary)', bg: 'var(--primary-light)' },
          { label: 'Pending Applications', value: leaves.filter(l => l.status === 'pending').length, icon: '⏳', color: 'var(--warning)', bg: '#fef9c3' },
          { label: 'Approved Leaves', value: leaves.filter(l => l.status === 'approved').length, icon: '✅', color: 'var(--success)', bg: '#dcfce7' },
          { label: 'Total Applied', value: leaves.length, icon: '📋', color: '#8b5cf6', bg: '#f3e8ff' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><span style={{ fontSize: 22 }}>{s.icon}</span></div>
            <div className="stat-info"><div className="stat-value" style={{ color: s.color, fontSize: 22 }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><h3>📋 My Leave History</h3></div>
        <div className="table-wrap">
          {loading ? <div style={{ padding: 40, textAlign: 'center' }}><div className="loader" style={{ margin: '0 auto' }} /></div> : (
            <table className="table">
              <thead><tr><th>Type</th><th>Duration</th><th>Dates</th><th>Reason</th><th>Status</th><th>Review Note</th></tr></thead>
              <tbody>
                {leaves.map(l => (
                  <tr key={l._id}>
                    <td><span className={`badge badge-${typeColors[l.leaveType]}`}>{l.leaveType}</span></td>
                    <td className="fw-700">{l.days} days</td>
                    <td className="text-sm">{new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}</td>
                    <td style={{ maxWidth: 200 }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12.5 }}>{l.reason}</div></td>
                    <td><span className={`badge badge-${statusColors[l.status]}`}>{l.status}</span></td>
                    <td className="text-muted text-sm">{l.reviewNote || '—'}</td>
                  </tr>
                ))}
                {leaves.length === 0 && <tr><td colSpan={6} className="empty-state"><p>No leave applications yet</p></td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>📝 Apply for Leave</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Leave Type <span>*</span></label>
                  <select className="form-control" value={form.leaveType} onChange={e => setForm(f => ({ ...f, leaveType: e.target.value }))} required>
                    <option value="annual">Annual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="emergency">Emergency Leave</option>
                    <option value="maternity">Maternity Leave</option>
                    <option value="paternity">Paternity Leave</option>
                    <option value="unpaid">Unpaid Leave</option>
                  </select>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Start Date <span>*</span></label>
                    <input className="form-control" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date <span>*</span></label>
                    <input className="form-control" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required min={form.startDate} />
                  </div>
                </div>
                {calcDays() > 0 && (
                  <div style={{ background: 'var(--primary-light)', border: '1px solid var(--primary)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>
                    📅 Duration: {calcDays()} day{calcDays() !== 1 ? 's' : ''}
                    {form.leaveType === 'annual' && ` · Balance after: ${(user?.leaveBalance || 0) - calcDays()} days`}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Reason <span>*</span></label>
                  <textarea className="form-control" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} rows={3} required placeholder="Briefly describe the reason for your leave..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Submitting...' : 'Submit Application'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
