import { useState } from 'react';
import { authAPI, setToken } from '../services/api';
import toast from 'react-hot-toast';

export default function Login({ onLogin, goRegister }) {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const { tokens, user, wallet } = res.data.data;
      setToken(tokens.accessToken);
      toast.success('Welcome back ' + user.fullName + '!');
      onLogin({ user, wallet });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>⬡ BlockPay</div>
        <div style={styles.subtitle}>Blockchain Payments Platform</div>
        <form onSubmit={handle}>
          <div style={styles.field}>
            <label style={styles.label}>Email / Phone / Username</label>
            <input style={styles.input} value={form.identifier} onChange={e => setForm({...form, identifier: e.target.value})} placeholder="Enter identifier" />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Enter password" />
          </div>
          <button style={{...styles.btn, opacity: loading ? 0.7 : 1}} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={styles.link} onClick={goRegister}>Don't have an account? <span style={{color:'#6C63FF'}}>Register</span></p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0d0d1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' },
  card: { background: '#1a1a2e', borderRadius: 20, padding: 40, width: 400, border: '1px solid rgba(108,99,255,0.3)' },
  logo: { fontSize: 42, fontWeight: 900, color: '#6C63FF', textAlign: 'center', marginBottom: 8 },
  subtitle: { color: '#00C896', textAlign: 'center', fontSize: 12, letterSpacing: 2, marginBottom: 32 },
  field: { marginBottom: 16 },
  label: { color: 'rgba(255,255,255,0.6)', fontSize: 12, display: 'block', marginBottom: 6, letterSpacing: 1 },
  input: { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 14px', color: '#fff', fontSize: 14, boxSizing: 'border-box', outline: 'none' },
  btn: { width: '100%', background: '#6C63FF', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 8 },
  link: { color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 20, cursor: 'pointer', fontSize: 13 },
};
