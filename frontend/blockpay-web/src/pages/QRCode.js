import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

export default function QRCodePage({ user, setPage }) {
  const [tab, setTab] = useState('show');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const qrData = JSON.stringify({
    upiId: user?.upiId,
    walletAddress: user?.walletAddress,
    name: user?.fullName,
    amount: amount || null,
    note: note || null,
  });

  const copyUPI = () => {
    navigator.clipboard.writeText(user?.upiId);
    toast.success('UPI ID copied!');
  };

  const copyWallet = () => {
    navigator.clipboard.writeText(user?.walletAddress);
    toast.success('Wallet address copied!');
  };

  return (
    <div style={styles.page}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>BlockPay</div>
        {[['Dashboard','dashboard'],['Send Money','send'],['History','history'],['Bills','bills'],['QR Code','qr'],['Profile','profile']].map(([label, pg]) => (
          <div key={pg} style={{...styles.navItem, background: pg === 'qr' ? 'rgba(108,99,255,0.2)' : 'transparent'}} onClick={() => setPage(pg)}>
            {label}
          </div>
        ))}
      </div>

      <div style={styles.main}>
        <div style={styles.title}>QR Code</div>

        <div style={styles.tabs}>
          <button style={{...styles.tab, background: tab === 'show' ? '#6C63FF' : 'rgba(108,99,255,0.15)'}} onClick={() => setTab('show')}>My QR Code</button>
          <button style={{...styles.tab, background: tab === 'request' ? '#6C63FF' : 'rgba(108,99,255,0.15)'}} onClick={() => setTab('request')}>Request Amount</button>
        </div>

        <div style={styles.content}>
          <div style={styles.qrCard}>
            <div style={styles.qrHeader}>
              <div style={styles.qrName}>{user?.fullName}</div>
              <div style={styles.qrUpi}>{user?.upiId}</div>
            </div>

            {tab === 'request' && (
              <div style={styles.requestForm}>
                <input style={styles.input} type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount (optional)" />
                <input style={styles.input} value={note} onChange={e => setNote(e.target.value)} placeholder="Add note (optional)" />
              </div>
            )}

            <div style={styles.qrWrapper}>
              <QRCodeSVG
                value={qrData}
                size={220}
                bgColor="#1a1a2e"
                fgColor="#ffffff"
                level="H"
                includeMargin={true}
              />
            </div>

            {amount && (
              <div style={styles.amountBadge}>
                Requesting Rs.{Number(amount).toLocaleString('en-IN')}
              </div>
            )}

            <div style={styles.actions}>
              <button style={styles.actionBtn} onClick={copyUPI}>Copy UPI ID</button>
              <button style={styles.actionBtn} onClick={copyWallet}>Copy Wallet</button>
            </div>
          </div>

          <div style={styles.infoCard}>
            <div style={styles.infoTitle}>Payment Details</div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>UPI ID</span>
              <span style={styles.infoValue}>{user?.upiId}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Name</span>
              <span style={styles.infoValue}>{user?.fullName}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Wallet</span>
              <span style={{...styles.infoValue, fontFamily:'monospace', fontSize:11}}>{user?.walletAddress?.slice(0,20)}...</span>
            </div>
            <div style={styles.howTitle}>How to receive payment</div>
            <div style={styles.step}>1. Show this QR code to the sender</div>
            <div style={styles.step}>2. They scan using BlockPay app</div>
            <div style={styles.step}>3. Amount is credited instantly</div>
            <div style={styles.step}>4. Blockchain confirms the transaction</div>
          </div>
        </div>
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
  tab: { padding: '10px 24px', borderRadius: 12, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, border: 'none' },
  content: { display: 'flex', gap: 24, flexWrap: 'wrap' },
  qrCard: { background: '#1a1a2e', borderRadius: 20, padding: 32, border: '1px solid rgba(108,99,255,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 320 },
  qrHeader: { textAlign: 'center', marginBottom: 20 },
  qrName: { fontSize: 20, fontWeight: 800, marginBottom: 4 },
  qrUpi: { color: '#6C63FF', fontSize: 14 },
  requestForm: { width: '100%', marginBottom: 16 },
  input: { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 14px', color: '#fff', fontSize: 14, boxSizing: 'border-box', outline: 'none', marginBottom: 10 },
  qrWrapper: { background: '#1a1a2e', borderRadius: 16, padding: 16, border: '2px solid rgba(108,99,255,0.3)' },
  amountBadge: { background: 'rgba(0,200,150,0.15)', border: '1px solid rgba(0,200,150,0.3)', borderRadius: 20, padding: '6px 20px', color: '#00C896', fontSize: 14, fontWeight: 700, marginTop: 16 },
  actions: { display: 'flex', gap: 10, marginTop: 20, width: '100%' },
  actionBtn: { flex: 1, background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 10, padding: '10px', color: '#6C63FF', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  infoCard: { background: '#1a1a2e', borderRadius: 20, padding: 28, border: '1px solid rgba(255,255,255,0.06)', flex: 1, minWidth: 280 },
  infoTitle: { fontSize: 16, fontWeight: 700, marginBottom: 16 },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 13 },
  infoLabel: { color: 'rgba(255,255,255,0.4)' },
  infoValue: { color: '#fff', fontWeight: 500 },
  howTitle: { fontSize: 14, fontWeight: 700, marginTop: 20, marginBottom: 12, color: '#6C63FF' },
  step: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 8, paddingLeft: 8 },
};

