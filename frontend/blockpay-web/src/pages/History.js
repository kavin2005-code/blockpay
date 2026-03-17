import { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';

export default function History({ setPage }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    transactionAPI.history()
      .then(r => setTransactions(r.data.data.transactions))
      .catch(e => console.log(e))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? transactions : transactions.filter(t => t.type.includes(filter));

  const typeColor = (type) => {
    if (type === 'DEPOSIT') return '#00C896';
    if (type === 'TRANSFER_SEND') return '#FF6B6B';
    if (type === 'TRANSFER_RECEIVE') return '#00C896';
    return '#FFB347';
  };

  const typeIcon = (type) => {
    if (type === 'DEPOSIT') return '+';
    if (type === 'TRANSFER_SEND') return '-';
    if (type === 'TRANSFER_RECEIVE') return '+';
    return '$';
  };

  return (
    <div style={styles.page}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>BlockPay</div>
        {[['Dashboard','dashboard'],['Send Money','send'],['History','history'],['Bills','bills'],['Profile','profile']].map(([label, pg]) => (
          <div key={pg} style={{...styles.navItem, background: pg === 'history' ? 'rgba(108,99,255,0.2)' : 'transparent'}} onClick={() => setPage(pg)}>
            {label}
          </div>
        ))}
        <div style={{...styles.navItem, marginTop: 'auto', color: '#FF6B6B'}} onClick={() => setPage('dashboard')}>Back</div>
      </div>

      <div style={styles.main}>
        <div style={styles.header}>
          <div style={styles.title}>Transaction History</div>
          <div style={styles.total}>{transactions.length} transactions</div>
        </div>

        <div style={styles.filters}>
          {['ALL','DEPOSIT','TRANSFER','BILL'].map(f => (
            <button key={f} style={{...styles.filterBtn, background: filter === f ? '#6C63FF' : 'rgba(108,99,255,0.15)', border: filter === f ? 'none' : '1px solid rgba(108,99,255,0.3)'}} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>

        {loading ? <div style={styles.empty}>Loading...</div> :
         filtered.length === 0 ? <div style={styles.empty}>No transactions found</div> :
         filtered.map((tx, i) => (
          <div key={i} style={styles.txCard}>
            <div style={{...styles.txBadge, background: typeColor(tx.type) + '22', color: typeColor(tx.type)}}>
              {typeIcon(tx.type)}
            </div>
            <div style={styles.txInfo}>
              <div style={styles.txDesc}>{tx.description}</div>
              <div style={styles.txId}>{tx.transactionId}</div>
              <div style={styles.txDate}>{new Date(tx.createdAt).toLocaleString()}</div>
              {tx.blockchain?.txHash && (
                <div style={styles.txHash}>Block: {tx.blockchain.txHash.slice(0,30)}...</div>
              )}
            </div>
            <div style={styles.txRight}>
              <div style={{...styles.txAmt, color: typeColor(tx.type)}}>
                {tx.type === 'TRANSFER_SEND' ? '-' : '+'}Rs.{tx.amount}
              </div>
              <div style={{...styles.txStatus, color: tx.status === 'COMPLETED' ? '#00C896' : '#FFB347'}}>
                {tx.status}
              </div>
            </div>
          </div>
        ))}
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 800 },
  total: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
  filters: { display: 'flex', gap: 10, marginBottom: 24 },
  filterBtn: { padding: '8px 20px', borderRadius: 20, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  empty: { color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 60, fontSize: 16 },
  txCard: { display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, marginBottom: 12, gap: 16 },
  txBadge: { width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, flexShrink: 0 },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 15, fontWeight: 600, marginBottom: 4 },
  txId: { color: 'rgba(108,99,255,0.8)', fontSize: 11, fontFamily: 'monospace', marginBottom: 2 },
  txDate: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  txHash: { color: 'rgba(0,200,150,0.6)', fontSize: 10, fontFamily: 'monospace', marginTop: 4 },
  txRight: { textAlign: 'right' },
  txAmt: { fontSize: 18, fontWeight: 800, marginBottom: 6 },
  txStatus: { fontSize: 11, fontWeight: 600, letterSpacing: 1 },
};