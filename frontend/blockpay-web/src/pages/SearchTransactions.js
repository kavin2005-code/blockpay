import { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';

export default function SearchTransactions({ setPage }) {
  const [query, setQuery] = useState('');
  const [all, setAll] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [minAmt, setMinAmt] = useState('');
  const [maxAmt, setMaxAmt] = useState('');

  useEffect(() => {
    transactionAPI.history()
      .then(r => { setAll(r.data.data.transactions); setFiltered(r.data.data.transactions); })
      .catch(e => console.log(e))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let results = all;
    if (query) results = results.filter(t =>
      t.description?.toLowerCase().includes(query.toLowerCase()) ||
      t.transactionId?.toLowerCase().includes(query.toLowerCase()) ||
      t.blockchain?.txHash?.toLowerCase().includes(query.toLowerCase())
    );
    if (typeFilter !== 'ALL') results = results.filter(t => t.type.includes(typeFilter));
    if (dateFrom) results = results.filter(t => new Date(t.createdAt) >= new Date(dateFrom));
    if (dateTo) results = results.filter(t => new Date(t.createdAt) <= new Date(dateTo));
    if (minAmt) results = results.filter(t => t.amount >= Number(minAmt));
    if (maxAmt) results = results.filter(t => t.amount <= Number(maxAmt));
    setFiltered(results);
  }, [query, typeFilter, dateFrom, dateTo, minAmt, maxAmt, all]);

  const totalAmount = filtered.reduce((sum, t) => sum + (t.type === 'TRANSFER_SEND' ? -t.amount : t.amount), 0);

  const typeColor = (type) => {
    if (type === 'DEPOSIT') return '#00C896';
    if (type === 'TRANSFER_SEND') return '#FF6B6B';
    if (type === 'TRANSFER_RECEIVE') return '#00C896';
    return '#FFB347';
  };

  const exportCSV = () => {
    const headers = 'Date,Type,Description,Amount,Transaction ID,Status\n';
    const rows = filtered.map(t =>
      `${new Date(t.createdAt).toLocaleString()},${t.type},${t.description},${t.amount},${t.transactionId},${t.status}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blockpay_transactions.csv';
    a.click();
  };

  return (
    <div style={styles.page}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>BlockPay</div>
        {[['Dashboard','dashboard'],['Send Money','send'],['History','history'],['Bills','bills'],['QR Code','qr'],['Profile','profile']].map(([label, pg]) => (
          <div key={pg} style={{...styles.navItem, background: pg === 'search' ? 'rgba(108,99,255,0.2)' : 'transparent'}} onClick={() => setPage(pg)}>
            {label}
          </div>
        ))}
      </div>

      <div style={styles.main}>
        <div style={styles.header}>
          <div style={styles.title}>Search Transactions</div>
          <button style={styles.exportBtn} onClick={exportCSV}>Export CSV</button>
        </div>

        <div style={styles.searchBar}>
          <span style={styles.searchIcon}>🔍</span>
          <input style={styles.searchInput} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by description, transaction ID, blockchain hash..." />
          {query && <button style={styles.clearBtn} onClick={() => setQuery('')}>✕</button>}
        </div>

        <div style={styles.filters}>
          <div style={styles.filterGroup}>
            <div style={styles.filterLabel}>Type</div>
            <select style={styles.select} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="ALL">All Types</option>
              <option value="DEPOSIT">Deposit</option>
              <option value="TRANSFER">Transfer</option>
              <option value="BILL">Bill Payment</option>
            </select>
          </div>
          <div style={styles.filterGroup}>
            <div style={styles.filterLabel}>From Date</div>
            <input style={styles.dateInput} type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div style={styles.filterGroup}>
            <div style={styles.filterLabel}>To Date</div>
            <input style={styles.dateInput} type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <div style={styles.filterGroup}>
            <div style={styles.filterLabel}>Min Amount</div>
            <input style={styles.amtInput} type="number" value={minAmt} onChange={e => setMinAmt(e.target.value)} placeholder="0" />
          </div>
          <div style={styles.filterGroup}>
            <div style={styles.filterLabel}>Max Amount</div>
            <input style={styles.amtInput} type="number" value={maxAmt} onChange={e => setMaxAmt(e.target.value)} placeholder="99999" />
          </div>
        </div>

        <div style={styles.summary}>
          <div style={styles.summaryItem}>
            <div style={styles.summaryLabel}>Results</div>
            <div style={styles.summaryValue}>{filtered.length}</div>
          </div>
          <div style={styles.summaryItem}>
            <div style={styles.summaryLabel}>Net Amount</div>
            <div style={{...styles.summaryValue, color: totalAmount >= 0 ? '#00C896' : '#FF6B6B'}}>
              {totalAmount >= 0 ? '+' : ''}Rs.{Math.abs(totalAmount).toLocaleString('en-IN')}
            </div>
          </div>
          <div style={styles.summaryItem}>
            <div style={styles.summaryLabel}>Total Transactions</div>
            <div style={styles.summaryValue}>{all.length}</div>
          </div>
        </div>

        {loading ? <div style={styles.empty}>Loading...</div> :
         filtered.length === 0 ? <div style={styles.empty}>No transactions match your search</div> :
         filtered.map((tx, i) => (
          <div key={i} style={styles.txCard}>
            <div style={{...styles.txBadge, background: typeColor(tx.type) + '22', color: typeColor(tx.type)}}>
              {tx.type === 'DEPOSIT' ? '+' : tx.type === 'TRANSFER_SEND' ? '-' : '+'}
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
  exportBtn: { background: 'rgba(0,200,150,0.15)', border: '1px solid rgba(0,200,150,0.3)', borderRadius: 10, padding: '8px 20px', color: '#00C896', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  searchBar: { display: 'flex', alignItems: 'center', background: '#1a1a2e', borderRadius: 14, padding: '4px 16px', border: '1px solid rgba(108,99,255,0.3)', marginBottom: 20, gap: 10 },
  searchIcon: { fontSize: 18 },
  searchInput: { flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 14, padding: '10px 0' },
  clearBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 16 },
  filters: { display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  filterLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: 1 },
  select: { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none' },
  dateInput: { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none' },
  amtInput: { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none', width: 100 },
  summary: { display: 'flex', gap: 16, marginBottom: 24 },
  summaryItem: { background: '#1a1a2e', borderRadius: 14, padding: '16px 24px', border: '1px solid rgba(255,255,255,0.06)' },
  summaryLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: 1, marginBottom: 4 },
  summaryValue: { fontSize: 22, fontWeight: 800 },
  empty: { color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 60, fontSize: 16 },
  txCard: { display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, marginBottom: 10, gap: 16 },
  txBadge: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, flexShrink: 0 },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 14, fontWeight: 600, marginBottom: 4 },
  txId: { color: 'rgba(108,99,255,0.8)', fontSize: 11, fontFamily: 'monospace', marginBottom: 2 },
  txDate: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  txHash: { color: 'rgba(0,200,150,0.6)', fontSize: 10, fontFamily: 'monospace', marginTop: 4 },
  txRight: { textAlign: 'right' },
  txAmt: { fontSize: 18, fontWeight: 800, marginBottom: 6 },
  txStatus: { fontSize: 11, fontWeight: 600, letterSpacing: 1 },
};