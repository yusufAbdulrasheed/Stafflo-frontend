import React, { useEffect, useState } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', manager: '' });
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    const [d, u] = await Promise.all([API.get('/departments/stats'), API.get('/users', { params: { role: 'manager' } })]);
    setDepartments(d.data); setManagers(u.data);
  };

  useEffect(() => { fetchAll().finally(() => setLoading(false)); }, []);

  const open = (dept = null) => {
    setEditing(dept);
    setForm(dept ? { name: dept.name, description: dept.description || '', manager: dept.manager?._id || '' } : { name: '', description: '', manager: '' });
    setModal(true);
  };
  const close = () => { setModal(false); setEditing(null); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) { await API.put(`/departments/${editing._id}`, form); toast.success('Department updated'); }
      else { await API.post('/departments', form); toast.success('Department created'); }
      close(); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try { await API.delete(`/departments/${id}`); toast.success('Deleted'); fetchAll(); }
    catch { toast.error('Failed to delete'); }
  };

  const colors = ['#dbeafe', '#dcfce7', '#f3e8ff', '#ffedd5', '#fef9c3', '#cffafe', '#fee2e2'];
  const icons = ['🏗️', '👥', '💰', '📣', '⚙️', '💻', '📊'];

  return (
    <div>
      <div className="page-header">
        <div><h2>Departments</h2><p>Manage company departments and assign managers</p></div>
        <button className="btn btn-primary" onClick={() => open()}>+ New Department</button>
      </div>

      {loading ? <div className="loading-screen" style={{ minHeight: 200 }}><div className="loader" /></div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {departments.map((d, i) => (
            <div key={d._id} className="card" style={{ overflow: 'hidden' }}>
              <div style={{ background: colors[i % colors.length], padding: '20px 20px 14px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <span style={{ fontSize: 32 }}>{icons[i % icons.length]}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{d.name}</div>
                  <code style={{ fontSize: 11, opacity: .7 }}>{d.code}</code>
                </div>
              </div>
              <div className="card-body">
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>{d.description || 'No description'}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: 22 }}>{d.staffCount}</div>
                    <div className="text-muted text-sm">Staff</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{d.manager ? `${d.manager.firstName} ${d.manager.lastName}` : '—'}</div>
                    <div className="text-muted text-sm">Manager</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => open(d)}>Edit</button>
                  <button className="btn btn-sm" style={{ flex: 1, background: '#fee2e2', color: '#991b1b' }} onClick={() => handleDelete(d._id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
          {departments.length === 0 && <div className="empty-state"><p>No departments yet</p></div>}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? 'Edit Department' : 'New Department'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={close}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Department Name <span>*</span></label>
                  <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
                </div>
                <div className="form-group">
                  <label className="form-label">Assign Manager</label>
                  <select className="form-control" value={form.manager} onChange={e => setForm(f => ({ ...f, manager: e.target.value }))}>
                    <option value="">— No Manager —</option>
                    {managers.map(m => <option key={m._id} value={m._id}>{m.firstName} {m.lastName}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={close}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
