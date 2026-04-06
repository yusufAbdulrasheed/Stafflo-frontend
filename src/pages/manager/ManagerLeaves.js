import React, { useEffect, useState } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const typeColors = { annual: 'info', sick: 'danger', maternity: 'purple', paternity: 'info', emergency: 'warning', unpaid: 'secondary' };
const statusColors = { pending: 'warning', approved: 'success', rejected: 'danger' };

export default function ManagerLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [modal, setModal] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchLeaves = async () => {
    setLoading(true);
    const r = await API.get('/leaves/department');
    setLeaves(r.data);
    setLoading(false);
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleReview = async (status) => {
    setSaving(true);
    try {
      await API.put(`/leaves/${modal._id}/review`, { status, reviewNote });
      toast.success(`Leave ${status}`);
      setModal(null);
      setReviewNote('');
      fetchLeaves();
    } catch { toast.error('Review failed'); }
    finally { setSaving(false); }
  };

  const filtered = filter ? leaves.filter(l => l.status === filter) : leaves;

  return (
    <div>
      <div className="page-header">
        <div><h2>Leave Requests</h2><p>Manage leave applications from your team</p></div>
      </div>

      <div className="card mb-16">
        <div className="card-body" style={{ padding: '12px 20px', display: 'flex', gap: 8 }}>
          {['', 'pending', 'approved', 'rejected'].map(s => (
            <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(s)}>
              {s === '' ? `All (${leaves.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${leaves.filter(l => l.status === s).length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? <div style={{ padding: 40, textAlign: 'center' }}><div className="loader" style={{ margin: '0 auto' }} /></div> : (
            <table className="table">
              <thead><tr><th>Staff</th><th>Type</th><th>Duration</th><th>Reason</th><th>Applied</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="avatar avatar-sm">{l.user?.firstName?.[0]}{l.user?.lastName?.[0]}</div>
                        <div>
                          <div className="fw-700">{l.user?.firstName} {l.user?.lastName}</div>
                          <div className="text-muted text-sm">{l.user?.staffId}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`badge badge-${typeColors[l.leaveType]}`}>{l.leaveType}</span></td>
                    <td>
                      <div className="fw-700">{l.days} days</div>
                      <div className="text-muted text-sm">{new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}</div>
                    </td>
                    <td style={{ maxWidth: 180, fontSize: 12.5 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason}</div>
                    </td>
                    <td className="text-muted text-sm">{new Date(l.createdAt).toLocaleDateString()}</td>
                    <td><span className={`badge badge-${statusColors[l.status]}`}>{l.status}</span></td>
                    <td>
                      {l.status === 'pending'
                        ? <button className="btn btn-primary btn-sm" onClick={() => { setModal(l); setReviewNote(''); }}>Review</button>
                        : <span className="text-muted text-sm">Reviewed</span>}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={7} className="empty-state"><p>No leave requests</p></td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Review Leave Request</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{modal.user?.firstName} {modal.user?.lastName}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                  <div><span className="text-muted">Type: </span><strong>{modal.leaveType}</strong></div>
                  <div><span className="text-muted">Days: </span><strong>{modal.days}</strong></div>
                  <div><span className="text-muted">From: </span><strong>{new Date(modal.startDate).toLocaleDateString()}</strong></div>
                  <div><span className="text-muted">To: </span><strong>{new Date(modal.endDate).toLocaleDateString()}</strong></div>
                </div>
                <div style={{ marginTop: 10, fontSize: 13 }}><span className="text-muted">Reason: </span>{modal.reason}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Review Note</label>
                <textarea className="form-control" value={reviewNote} onChange={e => setReviewNote(e.target.value)} rows={3} placeholder="Optional message for the staff member..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-danger" disabled={saving} onClick={() => handleReview('rejected')}>✗ Reject</button>
              <button className="btn btn-success" disabled={saving} onClick={() => handleReview('approved')}>✓ Approve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
