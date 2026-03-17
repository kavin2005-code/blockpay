import { useState } from 'react';
import { clearToken } from '../services/api';
import toast from 'react-hot-toast';

export default function Profile({ user, setPage, onLogout }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = [
    { label: 'UPI ID', value: user?.upiId, copy: true },
    { label: 'Wallet Address', value: user?.walletAddress, copy: true },
    { label: 'Account Status', value: 'Active' },
    { label: 'KYC Status', value: user?.kyc?.status || 'Pending' },
    { label: 'Email Verified', value: user?.isEmailVerified ? 'Yes' : 'No' },
    { label: 'Phone Verified', value: user?.isPhoneVerified ? 'Yes' : 'No' },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>BlockPay</div>
        {[['Dashboard','dashboard'],['Send Money','send'],['History','history'],['Bills','bills'],['Profile','profile']].map(([label, pg]) => (
          <div key={pg} style={{...styles.navItem, background: pg === 'profile' ? 'rgba(108,99,255,0.2)' : 'transparent'}} onClick={() => setPage(pg)}>
            {label}
          </div>
        ))}
        <div style={{...styles.navItem, marginTop: 'auto', color: '#FF6B6B'}} onClick={onLogout}>Logout</div>
      </div>

      <div style={styles.main}>
        <div style={styles.title}>Profile</div>

        <div style={styles.profileCard}>
          <div style={styles.avatar}>{user?.fullName?.[0]?.toUpperCase()}</div>
          <div style={styles.name}>{user?.fullName}</div>
          <div style={styles.username}>@{user?.username}</div>
          <div style={styles.email}>{user?.email}</div>
          <div style={styles.phone}>{user?.phone?.countryCode} {user?.phone?.number}</div>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Account Details</div>
          {stats.map(({ label, value, copy }) => (
            <div key={label} style={styles.statRow}>
              <div style={styles.statLabel}>{label}</div>
              <div style={styles.statValueRow}>
                <div style={styles.statValue}>{value?.length > 30 ? value.slice(0, 30) + '...' : value}</div>
                {copy && (
                  <button style={styles.copyBtn} onClick={() => copyToClipboard(value)}>
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Security</div>
          <div style={styles.securityCard}>
            <div style={styles.securityItem}>
              <div>
                <div style={styles.secItemTitle}>Transaction PIN</div>
                <div style={styles.secItemDesc}>6-digit PIN for approving transactions</div>
              </div>
              <button style={styles.changeBtn}>Change PIN</button>
            </div>
            <div style={styles.securityItem}>
              <div>
                <div style={styles.secItemTitle}>Password</div>
                <div style={styles.secItemDesc}>Change your login password</div>
              </div>
              <button style={styles.changeBtn}>Change</button>
            </div>
            <div style={styles.securityItem}>
              <div>
                <div style={styles.secItemTitle}>Two Factor Auth</div>
                <div style={styles.secItemDesc}>Add extra security to your account</div>
              </div>
              <button style={{...styles.changeBtn, background: 'rgba(0,200,150,0.15)', color: '#00C896', border: '1px solid rgba(0,200,150,0.3)'}}>Enable</button>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Blockchain Info</div>
          <div style={styles.blockchainCard}>
            <div style={styles.blockRow}>
              <span style={styles.blockLabel}>Network</span>
              <span style={styles.blockValue}>Hardhat Local</span>
            </div>
            <div style={styles.blockRow}>
              <span style={styles.blockLabel}>Contract</span>
              <span style={{...styles.blockValue, fontFamily:'monospace', fontSize:11}}>0x5FbDB2315678afecb367f032d93F642f64180aa3</span>
            </div>
            <div style={styles.blockRow}>
              <span style={styles.blockLabel}>Wallet</span>
              <span style={{...styles.blockValue, fontFamily:'monospace', fontSize:11}}>{user?.walletAddress?.slice(0,20)}...</span>
            </div>
          </div>
        </div>

        <button style={styles.logoutBtn} onClick={onLogout}>Logout from BlockPay</button>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', minHeight: '100vh', background: '#0d0d1a', fontFamily: 'sans-serif', color: '#fff' },
  sidebar: { width: 220, background: '#1a1a2e', padding: 24, display: 'flex', flexDirection: 'column', gap: 4, borderRight: '1px solid rgba(255,255,255,0.06)' },
  logo: { fontSize: 24, fontWeight: 900, color: '#6C63FF', marginBottom: 32 },
  navItem: { padding: '12px 16px', borderRadius: 12, cursor: 'pointer', fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  main: { flex: 1, padding: 32, overflowY: 'auto' },
  title: { fontSize: 26, fontWeight: 800, marginBottom: 24 },
  profileCard: { background: '#1a1a2e', borderRadius: 20, padding: 32, border: '1px solid rgba(108,99,255,0.3)', textAlign: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #6C63FF, #00C896)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900, margin: '0 auto 16px' },
  name: { fontSize: 24, fontWeight: 800, marginBottom: 4 },
  username: { color: '#6C63FF', fontSize: 14, marginBottom: 4 },
  email: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 4 },
  phone: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 700, marginBottom: 14, color: 'rgba(255,255,255,0.8)' },
  statRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '14px 18px', marginBottom: 8, border: '1px solid rgba(255,255,255,0.06)' },
  statLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  statValueRow: { display: 'flex', alignItems: 'center', gap: 10 },
  statValue: { color: '#fff', fontSize: 13, fontWeight: 500 },
  copyBtn: { background: 'rgba(108,99,255,0.2)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 8, padding: '4px 10px', color: '#6C63FF', cursor: 'pointer', fontSize: 11, fontWeight: 600 },
  securityCard: { background: '#1a1a2e', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' },
  securityItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  secItemTitle: { fontSize: 14, fontWeight: 600, marginBottom: 4 },
  secItemDesc: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  changeBtn: { background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 8, padding: '6px 14px', color: '#6C63FF', cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  blockchainCard: { background: '#1a1a2e', borderRadius: 16, padding: 20, border: '1px solid rgba(0,200,150,0.2)' },
  blockRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13 },
  blockLabel: { color: 'rgba(255,255,255,0.4)' },
  blockValue: { color: '#00C896' },
  logoutBtn: { background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 12, padding: '14px 32px', color: '#FF6B6B', cursor: 'pointer', fontSize: 14, fontWeight: 600, marginTop: 8 },
};