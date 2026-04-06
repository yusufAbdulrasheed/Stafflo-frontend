import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.firstName}!`);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'manager') navigate('/manager');
      else navigate('/staff');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-left-content">
          <h1>Staff<span>MS</span><br />Management<br />Platform</h1>
          <p>A unified platform to manage your workforce — attendance, leaves, tasks, reports and team communication, all in one place.</p>
          <div className="login-features">
            {[
              ['👥', 'Role-Based Access Control'],
              ['🕐', 'Real-Time Clock In / Out'],
              ['📋', 'Task & Leave Management'],
              ['💬', 'Team Chat & Reports'],
            ].map(([icon, label]) => (
              <div className="login-feature" key={label}>
                <div className="login-feature-icon">{icon}</div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="login-right">
        <div className="login-box">
          <h2>Welcome back 👋</h2>
          <p>Sign in to your StaffMS account to continue</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-control" type="email" placeholder="you@company.com"
                value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="form-control" type={showPass ? 'text' : 'password'}
                  placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)} required style={{ paddingRight: '40px' }} />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px', fontSize: '12.5px', color: '#0369a1' }}>
              <strong>Demo Credentials:</strong><br />
              Admin: admin@staffms.com / Admin@123
            </div>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? <><span className="loader" style={{ width: 16, height: 16, borderWidth: 2 }} /> Signing in...</> : 'Sign In →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
