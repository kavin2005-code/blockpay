import { useState, useEffect } from 'react';
import { walletAPI, transactionAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Dashboard({ user, onLogout, setPage, darkMode, toggleDark }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmt, setDepositAmt] = useState('');
  const [depositing, setDepositing] = useState(false);

  const loadData = async () => {
    try {
      const [b, t] = await Promise.all([walletAPI.getBalance(), transactionAPI.history()]);
      setBalance(b.data.data.balance);
      setTransactions(t.data.data.transactions.slice(0, 5));
    } catch(e) { console.log(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleDeposit = async () => {
    if (!depositAmt || isNaN(depositAmt)) return toast.error('Enter valid amount');
    setDepositing(true);
    try {
      await walletAPI.deposit(Number(depositAmt), 'UPI');
      toast.success('Added to wallet!');
      setShowDeposit(false);
      setDepositAmt('');
      loadData();
    } catch(e) { toast.error(e.response?.data?.message || 'Deposit failed'); }
    finally { setDepositing(false); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>BlockPay</div>
        {[
          ['⊞','Dashboard','dashboard'],
          ['↗','Send Money','send'],
          ['📋','History','history'],
          ['⚡','Bills','bills'],
          ['⬡','QR Code','qr'],
          ['💰','Request','request'],
          ['🔍','Search','search'],
          ['🔐','Security','security'],
          ['◉','Profile','profile'],
        ].map(([icon, label, pg]) => (
          <div key={pg} style={{...styles.navItem, background: pg === 'dashboard' ? 'rgba(108,99,255,0.2)' : 'transparent'}} onClick={() => setPage(pg)}>
            <span style={styles.navIcon}>{icon}</span><span>{label}</span>
          </div>
        ))}
        <div style={{...styles.navItem, marginTop: 'auto', color: '#FF6B6B'}} onClick={onLogout}>
          <span style={styles.navIcon}>⏻</span><span>Logout</span>
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.topbar}>
          <div>
            <div style={styles.greeting}>Good day 👋</div>
            <div style={styles.username}>{user?.fullName}</div>
          </div>
          <div style={{display:'flex', gap:10, alignItems:'center'}}>
            <button style={styles.themeBtn} onClick={toggleDark}>
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
            <div style={styles.upiTag}>{user?.upiId}</div>
          </div>
        </div>

        <div style={styles.balanceCard}>
          <div style={styles.balanceLabel}>TOTAL BALANCE</div>
          <div style={styles.balanceRow}>
            <div style={styles.balanceAmt}>
              {showBalance ? 'Rs.' + Number(balance).toLocaleString('en-IN') : 'Rs. ******'}
            </div>
            <button style={styles.eyeBtn} onClick={() => setShowBalance(!showBalance)}>
              {showBalance ? 'Hide' : 'Show'}
            </button>
          </div>
          <div style={styles.walletAddr}>{user?.walletAddress}</div>
        </div>

        <div style={styles.actionsRow}>
          {[
            ['↗','Send','#6C63FF','send'],
            ['📋','History','#00C896','history'],
            ['⚡','Bills','#FFB347','bills'],
            ['⬡','QR Code','#00C896','qr'],
            ['💰','Request','#6C63FF','request'],
            ['➕','Add Money','#FF6B6B',null],
          ].map(([icon, label, color, pg]) => (
            <div key={label} style={{...styles.actionCard, borderColor: color}} onClick={() => pg ? setPage(pg) : setShowDeposit(true)}>
              <div style={{...styles.actionIcon, background: color + '33', color}}>{icon}</div>
              <div style={styles.actionLabel}>{label}</div>
            </div>
          ))}
        </div>

        {showDeposit && (
          <div style={styles.depositBox}>
            <div style={styles.depositTitle}>Add Money to Wallet</div>
            <div style={styles.quickAmts}>
              {[500,1000,2000,5000].map(a => (
                <button key={a} style={styles.qBtn} onClick={() => setDepositAmt(String(a))}>Rs.{a}</button>
              ))}
            </div>
            <input style={styles.input} type="number" value={depositAmt} onChange={e => setDepositAmt(e.target.value)} placeholder="Custom amount" />
            <div style={{display:'flex', gap:10, marginTop:12}}>
              <button style={styles.depositBtn} onClick={handleDeposit} disabled={depositing}>
                {depositing ? 'Adding...' : 'Add Money'}
              </button>
              <button style={styles.cancelBtn} onClick={() => setShowDeposit(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionTitle}>Recent Transactions</div>
            <button style={styles.viewAllBtn} onClick={() => setPage('history')}>View All</button>
          </div>
          {loading ? <div style={styles.empty}>Loading...</div> :
           transactions.length === 0 ? <div style={styles.empty}>No transactions yet. Add money to get started!</div> :
           transactions.map((tx, i) => (
            <div key={i} style={styles.txRow}>
              <div style={styles.txIcon}>
                {tx.type === 'DEPOSIT' ? '➕' : tx.type === 'TRANSFER_RECEIVE' ? '↙' : '↗'}
              </div>
              <div style={styles.txInfo}>
                <div style={styles.txDesc}>{tx.description}</div>
                <div style={styles.txDate}>{new Date(tx.createdAt).toLocaleString()}</div>
              </div>
              <div style={{...styles.txAmt, color: tx.type === 'TRANSFER_SEND' ? '#FF6B6B' : '#00C896'}}>
                {tx.type === 'TRANSFER_SEND' ? '-' : '+'}Rs.{tx.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', minHeight: '100vh', background: '#0d0d1a', fontFamily: 'sans-serif', color: '#fff' },
  sidebar: { width: 220, background: '#1a1a2e', padding: 24, display: 'flex', flexDirection: 'column', gap: 4, borderRight: '1px solid rgba(255,255,255,0.06)' },
  logo: { fontSize: 24, fontWeight: 900, color: '#6C63FF', marginBottom: 32 },
  navItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, cursor: 'pointer', fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  navIcon: { fontSize: 18 },
  main: { flex: 1, padding: 32, overflowY: 'auto' },
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  greeting: { color: 'rgba(255,255,255,0.5)', fontSize: 12, letterSpacing: 1 },
  username: { fontSize: 26, fontWeight: 800, marginTop: 4 },
  themeBtn: { background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 10, padding: '6px 14px', color: '#6C63FF', cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  upiTag: { background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 13, color: '#6C63FF' },
  balanceCard: { background: '#1a1a2e', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 20, padding: 28, marginBottom: 24 },
  balanceLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: 2, marginBottom: 8 },
  balanceRow: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 },
  balanceAmt: { fontSize: 42, fontWeight: 900 },
  eyeBtn: { background: 'none', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '4px 10px', color: '#fff', cursor: 'pointer', fontSize: 12 },
  walletAddr: { color: 'rgba(0,200,150,0.7)', fontSize: 11, fontFamily: 'monospace' },
  actionsRow: { display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' },
  actionCard: { flex: 1, minWidth: 80, background: 'rgba(255,255,255,0.04)', border: '1px solid', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' },
  actionIcon: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700 },
  actionLabel: { fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  depositBox: { background: '#1a1a2e', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 16, padding: 24, marginBottom: 24 },
  depositTitle: { fontSize: 16, fontWeight: 700, marginBottom: 16 },
  quickAmts: { display: 'flex', gap: 10, marginBottom: 14 },
  qBtn: { border: '1px solid rgba(108,99,255,0.3)', borderRadius: 10, padding: '8px 16px', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, background: 'rgba(108,99,255,0.15)' },
  input: { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 14px', color: '#fff', fontSize: 14, boxSizing: 'border-box', outline: 'none' },
  depositBtn: { flex: 1, background: '#6C63FF', color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  cancelBtn: { flex: 1, background: 'transparent', color: '#FF6B6B', border: '1px solid #FF6B6B', borderRadius: 10, padding: '12px', fontSize: 14, cursor: 'pointer' },
  section: { marginTop: 8 },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 700 },
  viewAllBtn: { background: 'none', border: 'none', color: '#6C63FF', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  empty: { color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 40 },
  txRow: { display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 16, marginBottom: 10, gap: 14 },
  txIcon: { width: 42, height: 42, background: 'rgba(108,99,255,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 14, fontWeight: 600 },
  txDate: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 },
  txAmt: { fontSize: 16, fontWeight: 700 },
};