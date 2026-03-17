import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

export default function RequestMoney({ user, setPage }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [generated, setGenerated] = useState(false);

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  const paymentLink = `blockpay://pay?to=${user?.upiId}&amount=${amount}&note=${encodeURIComponent(note)}&name=${encodeURIComponent(user?.fullName)}`;

  const qrData = JSON.stringify({
    type: 'PAYMENT_REQUEST',
    to: user?.upiId,
    toWallet: user?.walletAddress,
    toName: user?.fullName,
    amount: Number(amount),
    note,
  });

  const copyLink = () => {
    navigator.clipboard.writeText(paymentLink);
    toast.success('Payment link copied!');
  };

  const shareWhatsApp = () => {
    const msg = `Hi! Please send me Rs.${amount} on BlockPay.\nUPI ID: ${user?.upiId}\nNote: ${note}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  };

  return (
    <div style={styles.page}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>BlockPay</div>
        {[['Dashboard','dashboard'],['Send Money','send'],['History','history'],['Bills','bills'],['QR Code','qr'],['Profile','profile']].map(([label, pg]) => (
          <div key={pg} style={{...styles.navItem, background: pg === 'request' ? 'rgba(108,99,255,0.2)' : 'transparent'}} onClick={() => setPage(pg)}>
            {label}
          </div>
        ))}
      </div>

      <div style={styles.main}>
        <div style={styles.title}>Request Money</div>

        {!generated ? (
          <div style={styles.card}>
            <div style={styles.fieldLabel}>Quick Amounts</div>
            <div style={styles.quickAmts}>
              {quickAmounts.map(a => (
                <button key={a} style={{...styles.qBtn, background: amount == a ? '#6C63FF' : 'rgba(108,99,255,0.15)'}} onClick={() => setAmount(String(a))}>Rs.{a}</button>
              ))}
            </div>

            <div style={styles.fieldLabel}>Custom Amount (Rs.)</div>
            <input style={styles.input} type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount" />

            <div style={styles.fieldLabel}>Note / Reason</div>
            <input style={styles.input} value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Lunch split, Rent, etc." />

            <div style={styles.preview}>
              <div style={styles.previewLabel}>Requesting from</div>
              <div style={styles.previewValue}>{user?.upiId}</div>
              {amount && <div style={styles.previewAmount}>Rs.{Number(amount).toLocaleString('en-IN')}</div>}
            </div>

            <button style={styles.btn} onClick={() => { if (!amount) return toast.error('Enter amount'); setGenerated(true); }}>
              Generate Payment Request
            </button>
          </div>
        ) : (
          <div style={styles.resultArea}>
            <div style={styles.qrCard}>
              <div style={styles.qrTitle}>Scan to Pay</div>
              <div style={styles.qrAmount}>Rs.{Number(amount).toLocaleString('en-IN')}</div>
              {note && <div style={styles.qrNote}>{note}</div>}
              <div style={styles.qrWrapper}>
                <QRCodeSVG value={qrData} size={200} bgColor="#1a1a2e" fgColor="#ffffff" level="H" includeMargin={true} />
              </div>
              <div style={styles.qrUpi}>{user?.upiId}</div>
            </div>

            <div style={styles.shareCard}>
              <div style={styles.shareTitle}>Share Payment Request</div>

              <div style={styles.linkBox}>
                <div style={styles.linkText}>{paymentLink.slice(0, 50)}...</div>
                <button style={styles.copyBtn} onClick={copyLink}>Copy</button>
              </div>

              <div style={styles.shareButtons}>
                <button style={styles.whatsappBtn} onClick={shareWhatsApp}>Share on WhatsApp</button>
              </div>

              <div style={styles.detailsBox}>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>To</span>
                  <span style={styles.detailValue}>{user?.fullName}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>UPI ID</span>
                  <span style={styles.detailValue}>{user?.upiId}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Amount</span>
                  <span style={{...styles.detailValue, color: '#00C896', fontWeight: 700}}>Rs.{Number(amount).toLocaleString('en-IN')}</span>
                </div>
                {note && (
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Note</span>
                    <span style={styles.detailValue}>{note}</span>
                  </div>
                )}
              </div>

              <button style={styles.newBtn} onClick={() => { setGenerated(false); setAmount(''); setNote(''); }}>
                New Request
              </button>
              <button style={{...styles.newBtn, background: 'transparent', border: '1px solid rgba(108,99,255,0.3)', marginTop: 8}} onClick={() => setPage('dashboard')}>
                Back to Dashboard
              </button>
            </div>
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
  card: { background: '#1a1a2e', borderRadius: 20, padding: 28, border: '1px solid rgba(108,99,255,0.3)', maxWidth: 480 },
  fieldLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, letterSpacing: 1, marginBottom: 10, marginTop: 18 },
  quickAmts: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  qBtn: { padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(108,99,255,0.3)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  input: { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 14px', color: '#fff', fontSize: 14, boxSizing: 'border-box', outline: 'none' },
  preview: { background: 'rgba(108,99,255,0.1)', borderRadius: 14, padding: 20, marginTop: 20, marginBottom: 20, textAlign: 'center', border: '1px solid rgba(108,99,255,0.2)' },
  previewLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 },
  previewValue: { color: '#6C63FF', fontSize: 15, fontWeight: 600, marginBottom: 8 },
  previewAmount: { fontSize: 32, fontWeight: 900, color: '#00C896' },
  btn: { width: '100%', background: '#6C63FF', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer' },
  resultArea: { display: 'flex', gap: 24, flexWrap: 'wrap' },
  qrCard: { background: '#1a1a2e', borderRadius: 20, padding: 28, border: '1px solid rgba(108,99,255,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 300 },
  qrTitle: { fontSize: 16, fontWeight: 700, marginBottom: 8 },
  qrAmount: { fontSize: 36, fontWeight: 900, color: '#00C896', marginBottom: 4 },
  qrNote: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 16 },
  qrWrapper: { background: '#1a1a2e', borderRadius: 16, padding: 16, border: '2px solid rgba(108,99,255,0.3)', marginBottom: 16 },
  qrUpi: { color: '#6C63FF', fontSize: 13, fontWeight: 600 },
  shareCard: { background: '#1a1a2e', borderRadius: 20, padding: 28, border: '1px solid rgba(255,255,255,0.06)', flex: 1, minWidth: 300 },
  shareTitle: { fontSize: 16, fontWeight: 700, marginBottom: 20 },
  linkBox: { display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, border: '1px solid rgba(255,255,255,0.08)' },
  linkText: { flex: 1, fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', wordBreak: 'break-all' },
  copyBtn: { background: 'rgba(108,99,255,0.2)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 8, padding: '6px 12px', color: '#6C63FF', cursor: 'pointer', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' },
  shareButtons: { marginBottom: 20 },
  whatsappBtn: { width: '100%', background: '#25D366', color: '#fff', border: 'none', borderRadius: 12, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  detailsBox: { background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16, marginBottom: 16 },
  detailRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13 },
  detailLabel: { color: 'rgba(255,255,255,0.4)' },
  detailValue: { color: '#fff' },
  newBtn: { width: '100%', background: '#6C63FF', color: '#fff', border: 'none', borderRadius: 12, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
};