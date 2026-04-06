import React, { useEffect, useState, useCallback } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY_FORM = { firstName: '', lastName: '', email: '', password: '', role: 'staff', department: '', phone: '', jobTitle: '', salary: '', dateOfBirth: '', address: '', status: 'active' };

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterDept, setFilterDept] = useState('');

  const fetchStaff = useCallback(async () => {
    const params = {};
    if (search) params.search = search;
    if (filterRole) params.role = filterRole;
    if (filterDept) params.department = filterDept;
    const r = await API.get('/users', { params });
    setStaff(r.data);
  }, [search, filterRole, filterDept]);

  useEffect(() => {
    Promise.all([fetchStaff(), API.get('/departments').then(r => setDepartments(r.data))]).finally(() => setLoading(false));
  }, [fetchStaff]);

  const openCreate = () => { setForm(EMPTY_FORM); setSelected(null); setModal('create'); };
  const openEdit = (s) => { setSelected(s); setForm({ ...s, department: s.department?._id || '', password: '', salary: s.salary || '' }); setModal('edit'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'create') {
        await API.post('/users', form);
        toast.success('Staff created successfully');
      } else {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await API.put(`/users/${selected._id}`, payload);
        toast.success('Staff updated successfully');
      }
      closeModal();
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { setSaving(false); }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this staff member?')) return;
    try { await API.delete(`/users/${id}`); toast.success('Staff deactivated'); fetchStaff(); }
    catch (err) { toast.error('Failed to deactivate'); }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const roleColors = { admin: 'danger', manager: 'purple', staff: 'info' };

  return (
    <div>
      <div className="page-header">
        <div><h2>Staff Management</h2><p>Manage all staff members, roles and department assignments</p></div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add New Staff</button>
      </div>

      {/* Filters */}
      <div className="card mb-24">
        <div className="card-body" style={{ padding: '14px 20px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="form-control" style={{ maxWidth: 240 }} placeholder="🔍 Search name, email, ID..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-control" style={{ maxWidth: 150 }} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
            <option value="">All Roles</option>
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <select className="form-control" style={{ maxWidth: 200 }} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          <span className="text-muted text-sm">{staff.length} result{staff.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? <div style={{ padding: 40, textAlign: 'center' }}><div className="loader" style={{ margin: '0 auto' }} /></div> : (
            <table className="table">
              <thead>
                <tr><th>Staff</th><th>Staff ID</th><th>Role</th><th>Department</th><th>Job Title</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {staff.map(s => (
                  <tr key={s._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar avatar-sm" style={{ background: s.role === 'manager' ? '#8b5cf6' : 'var(--primary)' }}>{s.firstName?.[0]}{s.lastName?.[0]}</div>
                        <div>
                          <div className="fw-700">{s.firstName} {s.lastName}</div>
                          <div className="text-muted text-sm">{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><code style={{ fontSize: 12, background: 'var(--surface2)', padding: '2px 6px', borderRadius: 4 }}>{s.staffId}</code></td>
                    <td><span className={`badge badge-${roleColors[s.role] || 'secondary'}`}>{s.role}</span></td>
                    <td>{s.department?.name || <span className="text-muted">—</span>}</td>
                    <td className="text-muted">{s.jobTitle || '—'}</td>
                    <td><span className={`badge badge-${s.status === 'active' ? 'success' : 'danger'}`}>{s.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>Edit</button>
                        {s.role !== 'admin' && <button className="btn btn-sm" style={{ background: '#fee2e2', color: '#991b1b' }} onClick={() => handleDeactivate(s._id)}>Deactivate</button>}
                      </div>
                    </td>
                  </tr>
                ))}
                {staff.length === 0 && <tr><td colSpan={7} className="empty-state"><p>No staff found</p></td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <h3>{modal === 'create' ? '➕ Add New Staff' : '✏️ Edit Staff'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">First Name <span>*</span></label>
                    <input className="form-control" value={form.firstName} onChange={set('firstName')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name <span>*</span></label>
                    <input className="form-control" value={form.lastName} onChange={set('lastName')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email <span>*</span></label>
                    <input className="form-control" type="email" value={form.email} onChange={set('email')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{modal === 'create' ? 'Password' : 'New Password (leave blank to keep)'} {modal === 'create' && <span>*</span>}</label>
                    <input className="form-control" type="password" value={form.password} onChange={set('password')} required={modal === 'create'} placeholder={modal === 'edit' ? 'Leave blank to keep current' : ''} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role <span>*</span></label>
                    <select className="form-control" value={form.role} onChange={set('role')} required>
                      <option value="staff">Staff</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select className="form-control" value={form.department} onChange={set('department')}>
                      <option value="">— Select Department —</option>
                      {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Job Title</label>
                    <input className="form-control" value={form.jobTitle} onChange={set('jobTitle')} placeholder="e.g. Software Engineer" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-control" value={form.phone} onChange={set('phone')} placeholder="+234..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Salary (₦)</label>
                    <input className="form-control" type="number" value={form.salary} onChange={set('salary')} placeholder="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input className="form-control" type="date" value={form.dateOfBirth ? form.dateOfBirth.split('T')[0] : ''} onChange={set('dateOfBirth')} />
                  </div>
                  {modal === 'edit' && (
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select className="form-control" value={form.status} onChange={set('status')}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea className="form-control" value={form.address} onChange={set('address')} rows={2} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : modal === 'create' ? 'Create Staff' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
