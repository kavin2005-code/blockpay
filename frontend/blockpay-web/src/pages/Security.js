import { useState } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

export default function Security({ user, setPage }) {
  const [tab, setTab] = useState('pin');
  const [pinForm, setPinForm] = useState({ currentPin: '', newPin: '', confirmPin: '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const setPin = (k, v) => setPinForm(f => ({...f, [k]: v}));
  const setPass = (k, v) => setPassForm(f => ({...f, [k]: v}));

  const handlePinChange = async () => {
    if (!pinForm.newPin || pinForm.newPin.length !== 6) return toast.error('PIN must be 6 digits');
    if (pinForm.newPin !== pinForm.confirmPin) return toast.error('PINs do not match');
    setLoading(true);
    try {
      await API.post('/auth/change-pin', { currentPin: pinForm.currentPin, newPin: pinForm.newPin });
      toast.success('PIN changed successfully!');
      setPinForm({ currentPin: '', newPin: '', confirmPin: '' });
    } catch(e) { toast.error(e.response?.data?.message || 'Failed to change PIN'); }
    finally { setLoading(false); }
  };

  const handlePasswordChange = async () => {
    if (!passForm.newPassword || passForm.newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    if (passForm.newPassword !== passForm.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await API.post('/auth/change-password', { currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success('Password changed successfully!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch(e) { toast.error(e.response?.data?.message || 'Failed to change password'); }
    finally { setLoading(false); }
  };

  const loginHistory = [
    { device: 'Chrome on Windows', location: 'Coimbatore, IN', time: new Date().toLocaleString(), status: 'Current' },
    { device: 'Firefox on Windows', location: 'Coimbatore, IN', time: new Date(Date.now() - 86400000).toLocaleString(), status: 'Success' },
    { device: 'Chrome on Mobile', location: 'Chennai, IN', time: new Date(Date.now() - 172800000).toLocaleString(), status: 'Success' },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>BlockPay</div>
        {[['Dashboard','dashboard'],['Send Money','send'],['History','history'],['Bills','bills'],['QR Code','qr'],['Profile','profile']].map(([label, pg]) => (
          <div key={pg} style={{...styles.navItem, background: pg === 'security' ? 'rgba(108,99,255,0.2)' : 'transparent'}} onClick={() => setPage(pg)}>
            {label}
          </div>
        ))}
      </div>

      <div style={styles.main}>
        <div style={styles.title}>Security Settings</div>

        <div style={styles.tabs}>
          {[['pin','Transaction PIN'],['password','Password'],['history','Login History']].map(([t, label]) => (
            <button key={t} style={{...styles.tab, background: tab === t ? '#6C63FF' : 'rgba(108,99,255,0.15)', border: tab === t ? 'none' : '1px solid rgba(108,99,255,0.3)'}} onClick={() => setTab(t)}>{label}</button>
          ))}
        </div>

        {tab === 'pin' && (
          <div style={styles.card}>
            <div style={styles.cardIcon}>🔐</div>
            <div style={styles.cardTitle}>Change Transaction PIN</div>
            <div style={styles.cardDesc}>Your 6-digit PIN is used to authorize all transactions</div>

            <div style={styles.fieldLabel}>Current PIN</div>
            <input style={styles.input} type="password" maxLength={6} value={pinForm.currentPin} onChange={e => setPin('currentPin', e.target.value)} placeholder="Enter current 6-digit PIN" />

            <div style={styles.fieldLabel}>New PIN</div>
            <input style={styles.input} type="password" maxLength={6} value={pinForm.newPin} onChange={e => setPin('newPin', e.target.value)} placeholder="Enter new 6-digit PIN" />

            <div style={styles.pinStrength}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{...styles.pinDot, background: pinForm.newPin.length >= i ? '#6C63FF' : 'rgba(255,255,255,0.1)'}} />
              ))}
            </div>

            <div style={styles.fieldLabel}>Confirm New PIN</div>
            <input style={styles.input} type="password" maxLength={6} value={pinForm.confirmPin} onChange={e => setPin('confirmPin', e.target.value)} placeholder="Confirm new 6-digit PIN" />

            {pinForm.confirmPin && pinForm.newPin !== pinForm.confirmPin && (
              <div style={styles.errorText}>PINs do not match</div>
            )}

            <button style={styles.btn} onClick={handlePinChange} disabled={loading}>
              {loading ? 'Changing...' : 'Change PIN'}
            </button>

            <div style={styles.tipBox}>
              <div style={styles.tipTitle}>PIN Tips</div>
              <div style={styles.tip}>• Never share your PIN with anyone</div>
              <div style={styles.tip}>• Avoid using birthdays or simple sequences</div>
              <div style={styles.tip}>• Change your PIN regularly</div>
            </div>
          </div>
        )}

        {tab === 'password' && (
          <div style={styles.card}>
            <div style={styles.cardIcon}>🔑</div>
            <div style={styles.cardTitle}>Change Password</div>
            <div style={styles.cardDesc}>Use a strong password with letters, numbers and symbols</div>

            <div style={styles.fieldLabel}>Current Password</div>
            <input style={styles.input} type="password" value={passForm.currentPassword} onChange={e => setPass('currentPassword', e.target.value)} placeholder="Enter current password" />

            <div style={styles.fieldLabel}>New Password</div>
            <input style={styles.input} type="password" value={passForm.newPassword} onChange={e => setPass('newPassword', e.target.value)} placeholder="Min 8 characters" />

            <div style={styles.strengthBar}>
              <div style={{
                ...styles.strengthFill,
                width: passForm.newPassword.length === 0 ? '0%' : passForm.newPassword.length < 6 ? '25%' : passForm.newPassword.length < 8 ? '50%' : passForm.newPassword.length < 12 ? '75%' : '100%',
                background: passForm.newPassword.length < 6 ? '#FF6B6B' : passForm.newPassword.length < 10 ? '#FFB347' : '#00C896'
              }} />
            </div>
            <div style={styles.strengthLabel}>
              {passForm.newPassword.length === 0 ? '' : passForm.newPassword.length < 6 ? 'Weak' : passForm.newPassword.length < 10 ? 'Medium' : 'Strong'}
            </div>

            <div style={styles.fieldLabel}>Confirm New Password</div>
            <input style={styles.input} type="password" value={passForm.confirmPassword} onChange={e => setPass('confirmPassword', e.target.value)} placeholder="Confirm new password" />

            {passForm.confirmPassword && passForm.newPassword !== passForm.confirmPassword && (
              <div style={styles.errorText}>Passwords do not match</div>
            )}

            <button style={styles.btn} onClick={handlePasswordChange} disabled={loading}>
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        )}

        {tab === 'history' && (
          <div style={styles.historyCard}>
            <div style={styles.cardTitle}>Login History</div>
            <div style={styles.cardDesc}>Recent login activity on your account</div>
            {loginHistory.map((h, i) => (
              <div key={i} style={styles.historyRow}>
                <div style={styles.historyIcon}>💻</div>
                <div style={styles.historyInfo}>
                  <div style={styles.historyDevice}>{h.device}</div>
                  <div style={styles.historyLocation}>{h.location}</div>
                  <div style={styles.historyTime}>{h.time}</div>
                </div>
                <div style={{...styles.historyStatus, color: h.status === 'Current' ? '#6C63FF' : '#00C896', background: h.status === 'Current' ? 'rgba(108,99,255,0.15)' : 'rgba(0,200,150,0.15)'}}>
                  {h.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', minHeight: '100vh', background: '#0d0d1a', fontFamily: 'sans-serif', color: '#fff' },
  sidebar: { width: 220, background: '#1a1a2e', padding: 24, display: 'flex', flexDirection: 'column', gap: 4, borderRight: '1px solid rgba(255,255,255,0.06)' },
  logo: { fontSize: 24, fontWeight: 900, color: '#6C63FF', marginBottom: 32 },
  navItem: { padding: '12px 16px', borderRadius: 12, cursor: 'pointer', fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  main: { flex: 1, padding: 32 },
  title: { fontSize: 26, fontWeight: 800, marginBottom: 24 },
  tabs: { display: 'flex', gap: 10, marginBottom: 28 },
  tab: { padding: '10px 20px', borderRadius: 12, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  card: { background: '#1a1a2e', borderRadius: 20, padding: 32, border: '1px solid rgba(108,99,255,0.3)', maxWidth: 480 },
  cardIcon: { fontSize: 36, marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: 800, marginBottom: 6 },
  cardDesc: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 24 },
  fieldLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, letterSpacing: 1, marginBottom: 8, marginTop: 16 },
  input: { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 14px', color: '#fff', fontSize: 14, boxSizing: 'border-box', outline: 'none' },
  pinStrength: { display: 'flex', gap: 8, marginTop: 10, marginBottom: 4 },
  pinDot: { width: 32, height: 6, borderRadius: 3, transition: 'all 0.2s' },
  strengthBar: { height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: 8, overflow: 'hidden' },
  strengthFill: { height: '100%', borderRadius: 2, transition: 'all 0.3s' },
  strengthLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4, marginBottom: 4 },
  errorText: { color: '#FF6B6B', fontSize: 12, marginTop: 6 },
  btn: { width: '100%', background: '#6C63FF', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 20 },
  tipBox: { background: 'rgba(108,99,255,0.08)', borderRadius: 12, padding: 16, marginTop: 20, border: '1px solid rgba(108,99,255,0.15)' },
  tipTitle: { fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#6C63FF' },
  tip: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 },
  historyCard: { background: '#1a1a2e', borderRadius: 20, padding: 28, border: '1px solid rgba(255,255,255,0.06)', maxWidth: 560 },
  historyRow: { display: 'flex', alignItems: 'center', gap: 14, padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  historyIcon: { fontSize: 28 },
  historyInfo: { flex: 1 },
  historyDevice: { fontSize: 14, fontWeight: 600, marginBottom: 2 },
  historyLocation: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 2 },
  historyTime: { fontSize: 11, color: 'rgba(255,255,255,0.3)' },
  historyStatus: { padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 },
};