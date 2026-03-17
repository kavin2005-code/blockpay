import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { walletAPI, transactionAPI, clearToken } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DashboardScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem('blockpay_user');
      if (saved) setUser(JSON.parse(saved));
      const [b, t] = await Promise.all([walletAPI.getBalance(), transactionAPI.history()]);
      setBalance(b.data.data.balance);
      setTransactions(t.data.data.transactions.slice(0, 5));
    } catch(e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleLogout = async () => {
    await clearToken();
    await AsyncStorage.removeItem('blockpay_user');
    navigation.replace('Login');
  };

  const typeColor = (type) => {
    if (type === 'DEPOSIT') return '#00C896';
    if (type === 'TRANSFER_SEND') return '#FF6B6B';
    return '#00C896';
  };

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#6C63FF" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor="#6C63FF" />}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good day 👋</Text>
          <Text style={styles.username}>{user?.fullName}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceAmt}>
            {showBalance ? 'Rs.' + Number(balance).toLocaleString('en-IN') : 'Rs. ****'}
          </Text>
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowBalance(!showBalance)}>
            <Text style={styles.eyeText}>{showBalance ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.upiId}>{user?.upiId}</Text>
      </View>

      <View style={styles.actionsGrid}>
        {[
          ['↗', 'Send', '#6C63FF', 'Send'],
          ['📋', 'History', '#00C896', 'History'],
          ['⚡', 'Bills', '#FFB347', 'Bills'],
          ['➕', 'Add Money', '#FF6B6B', 'Deposit'],
          ['⬡', 'QR Code', '#6C63FF', 'QRCode'],
          ['🔐', 'Security', '#00C896', 'Security'],
        ].map(([icon, label, color, screen]) => (
          <TouchableOpacity key={label} style={styles.actionCard} onPress={() => navigation.navigate(screen)}>
            <View style={[styles.actionIcon, { backgroundColor: color + '33' }]}>
              <Text style={[styles.actionIconText, { color }]}>{icon}</Text>
            </View>
            <Text style={styles.actionLabel}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        {transactions.length === 0 ? (
          <Text style={styles.empty}>No transactions yet</Text>
        ) : transactions.map((tx, i) => (
          <View key={i} style={styles.txRow}>
            <View style={[styles.txIcon, { backgroundColor: typeColor(tx.type) + '22' }]}>
              <Text style={{ fontSize: 18 }}>
                {tx.type === 'DEPOSIT' ? '➕' : tx.type === 'TRANSFER_RECEIVE' ? '↙' : '↗'}
              </Text>
            </View>
            <View style={styles.txInfo}>
              <Text style={styles.txDesc}>{tx.description}</Text>
              <Text style={styles.txDate}>{new Date(tx.createdAt).toLocaleDateString()}</Text>
            </View>
            <Text style={[styles.txAmt, { color: typeColor(tx.type) }]}>
              {tx.type === 'TRANSFER_SEND' ? '-' : '+'}Rs.{tx.amount}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  loadingContainer: { flex: 1, backgroundColor: '#0d0d1a', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 12, fontSize: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 50 },
  greeting: { color: 'rgba(255,255,255,0.5)', fontSize: 12, letterSpacing: 1 },
  username: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 4 },
  logoutBtn: { backgroundColor: 'rgba(255,107,107,0.15)', borderRadius: 10, padding: 8, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(255,107,107,0.3)' },
  logoutText: { color: '#FF6B6B', fontSize: 13, fontWeight: '600' },
  balanceCard: { margin: 20, backgroundColor: '#1a1a2e', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(108,99,255,0.3)' },
  balanceLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: 2, marginBottom: 8 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  balanceAmt: { color: '#fff', fontSize: 36, fontWeight: '900', flex: 1 },
  eyeBtn: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 6, paddingHorizontal: 12 },
  eyeText: { color: '#fff', fontSize: 12 },
  upiId: { color: '#6C63FF', fontSize: 13, fontWeight: '600' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12, marginBottom: 8 },
  actionCard: { width: '30%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  actionIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionIconText: { fontSize: 20 },
  actionLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  section: { margin: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  viewAll: { color: '#6C63FF', fontSize: 13, fontWeight: '600' },
  empty: { color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 32 },
  txRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, marginBottom: 10, gap: 14 },
  txIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  txInfo: { flex: 1 },
  txDesc: { color: '#fff', fontSize: 14, fontWeight: '600' },
  txDate: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 },
  txAmt: { fontSize: 15, fontWeight: '700' },
});