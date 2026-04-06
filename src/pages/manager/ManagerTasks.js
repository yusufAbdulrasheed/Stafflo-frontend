import React, { useEffect, useState } from 'react';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const priorityColors = { urgent: 'danger', high: 'warning', medium: 'info', low: 'success' };
const statusColors = { pending: 'warning', 'in-progress': 'info', completed: 'success', cancelled: 'danger' };

const EMPTY = { title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '' };

export default function ManagerTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('');

  const fetchAll = async () => {
    const deptId = user?.department?._id || user?.department;
    const [t, m] = await Promise.all([
      API.get('/tasks/department'),
      deptId ? API.get(`/users/department/${deptId}`) : Promise.resolve({ data: [] }),
    ]);
    setTasks(t.data);
    setTeam(m.data.filter(m => m._id !== user?._id));
  };

  useEffect(() => { fetchAll().finally(() => setLoading(false)); }, []);

  const openCreate = () => { setForm(EMPTY); setEditing(null); setModal(true); };
  const openEdit = (t) => {
    setEditing(t);
    setForm({
      title: t.title,
      description: t.description || '',
      assignedTo: t.assignedTo?._id || '',
      priority: t.priority,
      dueDate: t.dueDate ? t.dueDate.split('T')[0] : '',
    });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await API.put(`/tasks/${editing._id}`, form);
        toast.success('Task updated');
      } else {
        await API.post('/tasks', form);
        toast.success('Task assigned!');
      }
      setModal(false);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try { await API.delete(`/tasks/${id}`); toast.success('Task deleted'); fetchAll(); }
    catch { toast.error('Failed'); }
  };

  const filtered = filter ? tasks.filter(t => t.status === filter) : tasks;
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div>
      <div className="page-header">
        <div><h2>Task Management</h2><p>Assign and track tasks for your team</p></div>
        <button className="btn btn-primary" onClick={openCreate}>+ Assign Task</button>
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

      <div className="card mb-16">
        <div className="card-body" style={{ padding: '12px 20px', display: 'flex', gap: 8 }}>
          {['', 'pending', 'in-progress', 'completed', 'cancelled'].map(s => (
            <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(s)}>
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? <div style={{ padding: 40, textAlign: 'center' }}><div className="loader" style={{ margin: '0 auto' }} /></div> : (
            <table className="table">
              <thead>
                <tr><th>Task</th><th>Assigned To</th><th>Priority</th><th>Due Date</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t._id}>
                    <td>
                      <div className="fw-700">{t.title}</div>
                      {t.description && <div className="text-muted text-sm" style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</div>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="avatar avatar-sm">{t.assignedTo?.firstName?.[0]}{t.assignedTo?.lastName?.[0]}</div>
                        {t.assignedTo?.firstName} {t.assignedTo?.lastName}
                      </div>
                    </td>
                    <td><span className={`badge badge-${priorityColors[t.priority]}`}>{t.priority}</span></td>
                    <td className="text-sm text-muted">
                      {t.dueDate ? (
                        <span style={{ color: new Date(t.dueDate) < new Date() && t.status !== 'completed' ? 'var(--danger)' : 'inherit' }}>
                          {new Date(t.dueDate).toLocaleDateString()}
                        </span>
                      ) : '—'}
                    </td>
                    <td><span className={`badge badge-${statusColors[t.status]}`}>{t.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(t)}>Edit</button>
                        <button className="btn btn-sm" style={{ background: '#fee2e2', color: '#991b1b' }} onClick={() => handleDelete(t._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="empty-state"><p>No tasks found</p></td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? '✏️ Edit Task' : '📌 Assign New Task'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Task Title <span>*</span></label>
                  <input className="form-control" value={form.title} onChange={set('title')} required placeholder="e.g. Prepare Q2 financial report" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" value={form.description} onChange={set('description')} rows={3} placeholder="Add details about this task..." />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Assign To <span>*</span></label>
                    <select className="form-control" value={form.assignedTo} onChange={set('assignedTo')} required>
                      <option value="">— Select Team Member —</option>
                      {team.map(m => (
                        <option key={m._id} value={m._id}>{m.firstName} {m.lastName} ({m.jobTitle || m.role})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-control" value={form.priority} onChange={set('priority')}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input className="form-control" type="date" value={form.dueDate} onChange={set('dueDate')} min={new Date().toISOString().split('T')[0]} />
                </div>
                {editing && (
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-control" value={form.status || editing.status} onChange={set('status')}>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save Changes' : 'Assign Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
