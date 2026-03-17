import { useState } from 'react';
import { transactionAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function SendMoney({ user, setPage }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ toIdentifier: '', amount: '', note: '' });
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const handleSend = async () => {
    if (!form.toIdentifier || !form.amount) return toast.error('Fill all fields');
    if (Number(form.amount) <= 0) return toast.error('Invalid amount');
    setLoading(true);
    try {
      const res = await transactionAPI.send({ ...form, amount: Number(form.amount), pin });
      setResult(res.data.data);
      setStep(3);
      toast.success('Money sent successfully!');
    } catch(e) { toast.error(e.response?.data?.message || 'Transfer failed'); }
    finally { setLoading(false); }
  };

  if (step === 3 && result) return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.successIcon}>✅</div>
        <div style={styles.successTitle}>Transfer Successful!</div>
        <div style={styles.successAmt}>₹{form.amount}</div>
        <div style={styles.infoRow}><span>To</span><span>{form.toIdentifier}</span></div>
        <div style={styles.infoRow}><span>Transaction ID</span><span style={{fontFamily:'monospace',fontSize:11}}>{result.transactionId}</span></div>
        <div style={styles.infoRow}><span>Blockchain Hash</span><span style={{fontFamily:'monospace',fontSize:10,color:'#6C63FF'}}>{result.blockchainTxHash?.slice(0,30)}...</span></div>
        <button style={styles.btn} onClick={() => { setStep(1); setForm({toIdentifier:'',amount:'',note:''}); setResult(null); }}>Send Again</button>
        <button style={{...styles.btn, background:'rgba(108,99,255,0.2)', marginTop:8}} onClick={() => setPage('dashboard')}>Back to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.backBtn} onClick={() => step > 1 ? setStep(step-1) : setPage('dashboard')}>← Back</div>
        <div style={styles.title}>Send Money</div>
        <div style={styles.steps}>
          {['Recipient','Amount & PIN','Done'].map((s,i) => (
            <div key={s} style={{...styles.step, color: step > i ? '#6C63FF' : 'rgba(255,255,255,0.3)'}}>
              <div style={{...styles.stepDot, background: step > i ? '#6C63FF' : 'rgba(255,255,255,0.1)'}}>{i+1}</div>
              {s}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <label style={styles.label}>UPI ID / Username / Phone</label>
            <input style={styles.input} value={form.toIdentifier} onChange={e => set('toIdentifier', e.target.value)} placeholder="e.g. john@blockpay" />
            <button style={styles.btn} onClick={() => { if (!form.toIdentifier) return toast.error('Enter recipient'); setStep(2); }}>Next →</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <label style={styles.label}>Amount (₹)</label>
            <input style={styles.input} type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="Enter amount" />
            <div style={styles.quickAmts}>
              {[100,500,1000,2000].map(a => (
                <button key={a} style={styles.qBtn} onClick={() => set('amount', String(a))}>₹{a}</button>
              ))}
            </div>
            <label style={styles.label}>Note (optional)</label>
            <input style={styles.input} value={form.note} onChange={e => set('note', e.target.value)} placeholder="What is this for?" />
            <label style={styles.label}>Transaction PIN</label>
            <input style={styles.input} type="password" maxLength={6} value={pin} onChange={e => setPin(e.target.value)} placeholder="Enter 6-digit PIN" />
            <button style={styles.btn} onClick={handleSend} disabled={loading}>
              {loading ? 'Sending...' : 'Send ₹' + (form.amount || 0)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0d0d1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: 20 },
  card: { background: '#1a1a2e', borderRadius: 20, padding: 32, width: 420, border: '1px solid rgba(108,99,255,0.3)' },
  backBtn: { color: '#6C63FF', cursor: 'pointer', fontSize: 13, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 800, marginBottom: 24, color: '#fff' },
  steps: { display: 'flex', gap: 24, marginBottom: 28 },
  step: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600 },
  stepDot: { width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 700 },
  label: { color: 'rgba(255,255,255,0.6)', fontSize: 12, display: 'block', marginBottom: 6, letterSpacing: 1 },
  input: { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 14px', color: '#fff', fontSize: 14, boxSizing: 'border-box', outline: 'none', marginBottom: 14 },
  btn: { width: '100%', background: '#6C63FF', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 4 },
  quickAmts: { display: 'flex', gap: 8, marginBottom: 14 },
  qBtn: { flex: 1, background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 10, padding: '8px', color: '#fff', cursor: 'pointer', fontSize: 13 },
  successIcon: { fontSize: 52, textAlign: 'center', marginBottom: 12 },
  successTitle: { fontSize: 22, fontWeight: 800, textAlign: 'center', color: '#00C896', marginBottom: 8 },
  successAmt: { fontSize: 42, fontWeight: 900, textAlign: 'center', marginBottom: 24 },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 13, color: 'rgba(255,255,255,0.7)' },
};