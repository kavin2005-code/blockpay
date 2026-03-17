import { useState } from 'react';
import { billAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Bills({ setPage }) {
  const [tab, setTab] = useState('ELECTRICITY');
  const [form, setForm] = useState({ provider: '', accountNumber: '', amount: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const providers = {
    ELECTRICITY: ['BESCOM', 'TNEB', 'MSEB', 'BSES', 'TATA Power'],
    WATER: ['Municipal Corp', 'BWSSB', 'Chennai Metro Water'],
    GAS: ['Indane', 'HP Gas', 'Bharat Gas'],
    RECHARGE: ['Airtel', 'Jio', 'BSNL', 'Vi'],
  };

  const rechargeAmounts = [19, 49, 99, 149, 199, 299, 399, 499];

  const handlePay = async () => {
    if (tab === 'RECHARGE') {
      if (!form.phone || !form.amount || !form.provider) return toast.error('Fill all fields');
      setLoading(true);
      try {
        const res = await billAPI.recharge({ phone: form.phone, operator: form.provider, amount: Number(form.amount), planType: 'PREPAID' });
        setSuccess(res.data.data);
        toast.success('Recharge successful!');
      } catch(e) { toast.error(e.response?.data?.message || 'Recharge failed'); }
      finally { setLoading(false); }
    } else {
      if (!form.provider || !form.accountNumber || !form.amount) return toast.error('Fill all fields');
      setLoading(true);
      try {
        const res = await billAPI.pay({ billType: tab, provider: form.provider, accountNumber: form.accountNumber, amount: Number(form.amount) });
        setSuccess(res.data.data);
        toast.success('Bill paid successfully!');
      } catch(e) { toast.error(e.response?.data?.message || 'Payment failed'); }
      finally { setLoading(false); }
    }
  };

  if (success) return (
    <div style={styles.page}>
      <div style={styles.successCard}>
        <div style={styles.successIcon}>✅</div>
        <div style={styles.successTitle}>Payment Successful!</div>
        <div style={styles.successAmt}>Rs.{form.amount}</div>
        <div style={styles.infoRow}><span>Service</span><span>{tab}</span></div>
        <div style={styles.infoRow}><span>Provider</span><span>{form.provider}</span></div>
        <div style={styles.infoRow}><span>Transaction ID</span><span style={{fontFamily:'monospace',fontSize:11}}>{success.transactionId}</span></div>
        <button style={styles.btn} onClick={() => { setSuccess(null); setForm({ provider: '', accountNumber: '', amount: '', phone: '' }); }}>Pay Another Bill</button>
        <button style={{...styles.btn, background: 'rgba(108,99,255,0.2)', marginTop: 8}} onClick={() => setPage('dashboard')}>Back to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>BlockPay</div>
        {[['Dashboard','dashboard'],['Send Money','send'],['History','history'],['Bills','bills'],['Profile','profile']].map(([label, pg]) => (
          <div key={pg} style={{...styles.navItem, background: pg === 'bills' ? 'rgba(108,99,255,0.2)' : 'transparent'}} onClick={() => setPage(pg)}>
            {label}
          </div>
        ))}
      </div>

      <div style={styles.main}>
        <div style={styles.title}>Bill Payments</div>

        <div style={styles.tabs}>
          {['ELECTRICITY','WATER','GAS','RECHARGE'].map(t => (
            <button key={t} style={{...styles.tab, background: tab === t ? '#6C63FF' : 'rgba(108,99,255,0.1)', border: tab === t ? 'none' : '1px solid rgba(108,99,255,0.3)'}} onClick={() => { setTab(t); setForm({ provider: '', accountNumber: '', amount: '', phone: '' }); }}>
              {t === 'ELECTRICITY' ? 'Electricity' : t === 'WATER' ? 'Water' : t === 'GAS' ? 'Gas' : 'Recharge'}
            </button>
          ))}
        </div>

        <div style={styles.card}>
          <div style={styles.fieldLabel}>Select Provider</div>
          <div style={styles.providerGrid}>
            {providers[tab].map(p => (
              <div key={p} style={{...styles.providerBtn, background: form.provider === p ? 'rgba(108,99,255,0.3)' : 'rgba(255,255,255,0.04)', border: form.provider === p ? '1px solid #6C63FF' : '1px solid rgba(255,255,255,0.1)'}} onClick={() => set('provider', p)}>
                {p}
              </div>
            ))}
          </div>

          {tab === 'RECHARGE' ? (
            <>
              <div style={styles.fieldLabel}>Mobile Number</div>
              <input style={styles.input} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="Enter 10-digit mobile number" maxLength={10} />
              <div style={styles.fieldLabel}>Select Plan Amount</div>
              <div style={styles.amountGrid}>
                {rechargeAmounts.map(a => (
                  <div key={a} style={{...styles.amountBtn, background: form.amount === String(a) ? '#6C63FF' : 'rgba(255,255,255,0.04)', border: form.amount === String(a) ? 'none' : '1px solid rgba(255,255,255,0.1)'}} onClick={() => set('amount', String(a))}>
                    Rs.{a}
                  </div>
                ))}
              </div>
              <input style={styles.input} type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="Or enter custom amount" />
            </>
          ) : (
            <>
              <div style={styles.fieldLabel}>Account / Consumer Number</div>
              <input style={styles.input} value={form.accountNumber} onChange={e => set('accountNumber', e.target.value)} placeholder="Enter account number" />
              <div style={styles.fieldLabel}>Amount (Rs.)</div>
              <input style={styles.input} type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="Enter bill amount" />
            </>
          )}

          <button style={{...styles.btn, marginTop: 8}} onClick={handlePay} disabled={loading}>
            {loading ? 'Processing...' : 'Pay Rs.' + (form.amount || 0)}
          </button>
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
  tabs: { display: 'flex', gap: 10, marginBottom: 24 },
  tab: { padding: '10px 20px', borderRadius: 12, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  card: { background: '#1a1a2e', borderRadius: 20, padding: 28, border: '1px solid rgba(108,99,255,0.3)', maxWidth: 560 },
  fieldLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, letterSpacing: 1, marginBottom: 10, marginTop: 18 },
  providerGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 },
  providerBtn: { padding: '10px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13, textAlign: 'center', fontWeight: 500 },
  amountGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 },
  amountBtn: { padding: '12px 8px', borderRadius: 10, cursor: 'pointer', fontSize: 13, textAlign: 'center', fontWeight: 600 },
  input: { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 14px', color: '#fff', fontSize: 14, boxSizing: 'border-box', outline: 'none', marginBottom: 4 },
  btn: { width: '100%', background: '#6C63FF', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer' },
  successCard: { margin: 'auto', marginTop: 80, background: '#1a1a2e', borderRadius: 20, padding: 40, width: 420, border: '1px solid rgba(108,99,255,0.3)', textAlign: 'center' },
  successIcon: { fontSize: 52, marginBottom: 12 },
  successTitle: { fontSize: 22, fontWeight: 800, color: '#00C896', marginBottom: 8 },
  successAmt: { fontSize: 42, fontWeight: 900, marginBottom: 24 },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 13, color: 'rgba(255,255,255,0.7)' },
};