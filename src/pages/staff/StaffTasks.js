import React, { useEffect, useState } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const priorityColors = { urgent: 'danger', high: 'warning', medium: 'info', low: 'success' };
const statusColors = { pending: 'warning', 'in-progress': 'info', completed: 'success', cancelled: 'danger' };

export default function StaffTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    API.get('/tasks/my').then(r => setTasks(r.data)).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      const r = await API.put(`/tasks/${id}/status`, { status });
      setTasks(t => t.map(task => task._id === id ? r.data : task));
      toast.success(status === 'completed' ? '🎉 Task completed!' : 'Status updated');
    } catch { toast.error('Failed to update'); }
    finally { setUpdating(null); }
  };

  const filtered = filter ? tasks.filter(t => t.status === filter) : tasks;

  const isOverdue = (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed';

  return (
    <div>
      <div className="page-header">
        <div><h2>My Tasks</h2><p>Tasks assigned to you by your manager</p></div>
      </div>

      <div className="stat-grid mb-24">
        {[
          { label: 'Total Tasks', value: tasks.length, icon: '📋', color: 'var(--primary)', bg: 'var(--primary-light)' },
          { label: 'Pending', value: tasks.filter(t => t.status === 'pending').length, icon: '⏳', color: 'var(--warning)', bg: '#fef9c3' },
          { label: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, icon: '🔄', color: 'var(--info)', bg: '#dbeafe' },
          { label: 'Completed', value: tasks.filter(t => t.status === 'completed').length, icon: '✅', color: 'var(--success)', bg: '#dcfce7' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><span style={{ fontSize: 22 }}>{s.icon}</span></div>
            <div className="stat-info"><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="card mb-24">
        <div className="card-body" style={{ padding: '12px 20px', display: 'flex', gap: 8 }}>
          {['', 'pending', 'in-progress', 'completed'].map(s => (
            <button key={s} className={`btn ${filter === s ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setFilter(s)}>
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div style={{ padding: 40, textAlign: 'center' }}><div className="loader" style={{ margin: '0 auto' }} /></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(t => (
            <div key={t._id} className="card" style={{ border: isOverdue(t) ? '1.5px solid var(--danger)' : undefined }}>
              <div style={{ padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <span className="fw-700" style={{ fontSize: 15 }}>{t.title}</span>
                    <span className={`badge badge-${priorityColors[t.priority]}`}>{t.priority}</span>
                    {isOverdue(t) && <span className="badge badge-danger">⚠️ Overdue</span>}
                  </div>
                  {t.description && <p className="text-muted text-sm" style={{ marginBottom: 8 }}>{t.description}</p>}
                  <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>Assigned by: {t.assignedBy?.firstName} {t.assignedBy?.lastName}</span>
                    {t.dueDate && <span>Due: {new Date(t.dueDate).toLocaleDateString()}</span>}
                    {t.completedAt && <span>✅ Completed: {new Date(t.completedAt).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                  <span className={`badge badge-${statusColors[t.status]}`}>{t.status}</span>
                  {t.status !== 'completed' && t.status !== 'cancelled' && (
                    <select className="form-control" style={{ width: 140, padding: '5px 10px', fontSize: 12 }}
                      value={t.status} disabled={updating === t._id}
                      onChange={e => updateStatus(t._id, e.target.value)}>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="empty-state card"><p>No tasks found</p></div>}
        </div>
      )}
    </div>
  );
}
