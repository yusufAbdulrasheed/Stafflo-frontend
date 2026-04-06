import React, { useEffect, useState } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const priorityColors = { urgent: 'danger', high: 'warning', medium: 'info', low: 'success' };
const statusColors = { pending: 'warning', 'in-progress': 'info', completed: 'success', cancelled: 'danger' };

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    API.get('/tasks/all').then(r => {
      let data = r.data;
      if (filterStatus) data = data.filter(t => t.status === filterStatus);
      setTasks(data);
    }).finally(() => setLoading(false));
  }, [filterStatus]);

  return (
    <div>
      <div className="page-header">
        <div><h2>All Tasks</h2><p>Overview of all tasks assigned across departments</p></div>
      </div>
      <div className="card mb-24">
        <div className="card-body" style={{ padding: '12px 20px', display: 'flex', gap: 8 }}>
          {['', 'pending', 'in-progress', 'completed', 'cancelled'].map(s => (
            <button key={s} className={`btn ${filterStatus === s ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setFilterStatus(s)}>
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="table-wrap">
          {loading ? <div style={{ padding: 40, textAlign: 'center' }}><div className="loader" style={{ margin: '0 auto' }} /></div> : (
            <table className="table">
              <thead><tr><th>Task</th><th>Assigned To</th><th>Assigned By</th><th>Department</th><th>Priority</th><th>Due Date</th><th>Status</th></tr></thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t._id}>
                    <td><div className="fw-700">{t.title}</div><div className="text-muted text-sm" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</div></td>
                    <td>{t.assignedTo?.firstName} {t.assignedTo?.lastName}</td>
                    <td className="text-muted">{t.assignedBy?.firstName} {t.assignedBy?.lastName}</td>
                    <td className="text-muted">{t.department?.name || '—'}</td>
                    <td><span className={`badge badge-${priorityColors[t.priority]}`}>{t.priority}</span></td>
                    <td className="text-sm text-muted">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</td>
                    <td><span className={`badge badge-${statusColors[t.status]}`}>{t.status}</span></td>
                  </tr>
                ))}
                {tasks.length === 0 && <tr><td colSpan={7} className="empty-state"><p>No tasks found</p></td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
