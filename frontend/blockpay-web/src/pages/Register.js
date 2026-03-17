import { useState } from 'react';
import { authAPI, setToken } from '../services/api';
import toast from 'react-hot-toast';

export default function Register({ onLogin, goLogin }) {
  const [form, setForm] = useState({ fullName: '', username: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.register(form);
      const { tokens, user } = res.data.data;
      setToken(tokens.accessToken);
      toast.success('Account created! Wallet: ' + user.walletAddress.slice(0,16) + '...');
      onLogin({ user, wallet: { balance: 0 } });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const fields = [
    ['fullName','Full Name','text','Your full name'],
    ['username','Username','text','Choose a username'],
    ['email','Email','email','your@email.com'],
    ['phone','Phone','text','9876543210'],
    ['password','Password','password','Min 8 characters'],
  ];

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>⬡ BlockPay</div>
        <div style={styles.subtitle}>Create Your Wallet</div>
        <form onSubmit={handle}>
          {fields.map(([key, label, type, placeholder]) => (
            <div key={key} style={styles.field}>
              <label style={styles.label}>{label}</label>
              <input style={styles.input} type={type} value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder} />
            </div>
          ))}
          <button style={{...styles.btn, opacity: loading ? 0.7 : 1}} disabled={loading}>
            {loading ? 'Creating...' : 'Create Account + Blockchain Wallet'}
          </button>
        </form>
        <p style={styles.link} onClick={goLogin}>Already have an account? <span style={{color:'#6C63FF'}}>Login</span></p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0d0d1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' },
  card: { background: '#1a1a2e', borderRadius: 20, padding: 40, width: 420, border: '1px solid rgba(108,99,255,0.3)' },
  logo: { fontSize: 36, fontWeight: 900, color: '#6C63FF', textAlign: 'center', marginBottom: 4 },
  subtitle: { color: '#00C896', textAlign: 'center', fontSize: 12, letterSpacing: 2, marginBottom: 24 },
  field: { marginBottom: 14 },
  label: { color: 'rgba(255,255,255,0.6)', fontSize: 12, display: 'block', marginBottom: 6, letterSpacing: 1 },
  input: { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 14px', color: '#fff', fontSize: 14, boxSizing: 'border-box', outline: 'none' },
  btn: { width: '100%', background: 'linear-gradient(135deg, #6C63FF, #00C896)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 8 },
  link: { color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 16, cursor: 'pointer', fontSize: 13 },
};
