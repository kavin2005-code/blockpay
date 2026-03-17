import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { transactionAPI } from '../services/api';

export default function HistoryScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const loadData = async () => {
    try {
      const res = await transactionAPI.history();
      setTransactions(res.data.data.transactions);
    } catch(e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = filter === 'ALL' ? transactions : transactions.filter(t => t.type.includes(filter));

  const typeColor = (type) => {
    if (type === 'DEPOSIT') return '#00C896';
    if (type === 'TRANSFER_SEND') return '#FF6B6B';
    return '#00C896';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>History</Text>
        <View style={{ width: 50 }} />
      </View>
      <View style={styles.filters}>
        {['ALL','DEPOSIT','TRANSFER','BILL'].map(f => (
          <TouchableOpacity key={f} style={[styles.filterBtn, filter === f && styles.filterBtnActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#6C63FF" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor="#6C63FF" />}>
          {filtered.length === 0 ? (
            <Text style={styles.empty}>No transactions found</Text>
          ) : filtered.map((tx, i) => (
            <View key={i} style={styles.txRow}>
              <View style={[styles.txIcon, { backgroundColor: typeColor(tx.type) + '22' }]}>
                <Text style={{ fontSize: 18 }}>{tx.type === 'DEPOSIT' ? '+' : '-'}</Text>
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txDesc}>{tx.description}</Text>
                <Text style={styles.txId}>{tx.transactionId}</Text>
                <Text style={styles.txDate}>{new Date(tx.createdAt).toLocaleString()}</Text>
              </View>
              <View style={styles.txRight}>
                <Text style={[styles.txAmt, { color: typeColor(tx.type) }]}>
                  {tx.type === 'TRANSFER_SEND' ? '-' : '+'}Rs.{tx.amount}
                </Text>
                <Text style={[styles.txStatus, { color: tx.status === 'COMPLETED' ? '#00C896' : '#FFB347' }]}>{tx.status}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 50 },
  back: { color: '#6C63FF', fontSize: 16, fontWeight: '600' },
  title: { color: '#fff', fontSize: 20, fontWeight: '800' },
  filters: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(108,99,255,0.15)', borderWidth: 1, borderColor: 'rgba(108,99,255,0.3)' },
  filterBtnActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  filterText: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  empty: { color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 40 },
  txRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, marginHorizontal: 16, marginBottom: 10, gap: 12 },
  txIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  txInfo: { flex: 1 },
  txDesc: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 2 },
  txId: { color: 'rgba(108,99,255,0.8)', fontSize: 10, marginBottom: 2 },
  txDate: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  txRight: { alignItems: 'flex-end' },
  txAmt: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  txStatus: { fontSize: 10, fontWeight: '600' },
});
