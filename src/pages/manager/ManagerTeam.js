import React, { useEffect, useState } from 'react';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function ManagerTeam() {
  const { user } = useAuth();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const deptId = user?.department?._id || user?.department;
    if (deptId) {
      API.get(`/users/department/${deptId}`)
        .then(r => setTeam(r.data))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const roleColors = { manager: '#8b5cf6', staff: 'var(--primary)', admin: 'var(--danger)' };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>My Team</h2>
          <p>{user?.department?.name || 'Department'} · {team.length} member{team.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-screen" style={{ minHeight: 200 }}><div className="loader" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {team.map(member => (
            <div key={member._id} className="card" style={{ overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(135deg, #f3e8ff, #dbeafe)', padding: '24px 20px 14px', textAlign: 'center' }}>
                <div className="avatar avatar-xl" style={{ background: roleColors[member.role] || 'var(--primary)', margin: '0 auto 10px' }}>
                  {member.firstName?.[0]}{member.lastName?.[0]}
                </div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{member.firstName} {member.lastName}</div>
                <div className="text-muted text-sm">{member.jobTitle || 'Staff Member'}</div>
              </div>
              <div className="card-body" style={{ padding: '14px 20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-muted">Role</span>
                    <span className={`badge badge-${member.role === 'manager' ? 'purple' : 'info'}`}>{member.role}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-muted">Staff ID</span>
                    <code style={{ fontSize: 12, background: 'var(--surface2)', padding: '1px 6px', borderRadius: 4 }}>{member.staffId}</code>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-muted">Email</span>
                    <span style={{ fontSize: 12, fontWeight: 500, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.email}</span>
                  </div>
                  {member.phone && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-muted">Phone</span>
                      <span>{member.phone}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-muted">Leave Balance</span>
                    <span className="fw-700" style={{ color: 'var(--primary)' }}>{member.leaveBalance} days</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {team.length === 0 && (
            <div className="empty-state card" style={{ gridColumn: '1 / -1', padding: 48 }}>
              <p>No team members found in your department</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
