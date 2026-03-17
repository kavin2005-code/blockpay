import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { billAPI } from '../services/api';

export default function BillsScreen({ navigation }) {
  const [tab, setTab] = useState('ELECTRICITY');
  const [provider, setProvider] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const providers = {
    ELECTRICITY: ['BESCOM', 'TNEB', 'MSEB', 'BSES'],
    WATER: ['Municipal Corp', 'BWSSB', 'Chennai Metro'],
    GAS: ['Indane', 'HP Gas', 'Bharat Gas'],
    RECHARGE: ['Airtel', 'Jio', 'BSNL', 'Vi'],
  };

  const handlePay = async () => {
    setLoading(true);
    setError('');
    try {
      let res;
      if (tab === 'RECHARGE') {
        res = await billAPI.recharge({ phone, operator: provider, amount: Number(amount), planType: 'PREPAID' });
      } else {
        res = await billAPI.pay({ billType: tab, provider, accountNumber, amount: Number(amount) });
      }
      setSuccess(res.data.data);
    } catch(e) {
      setError(e.response?.data?.message || 'Payment failed');
    } finally { setLoading(false); }
  };

  if (success) return (
    <View style={styles.container}>
      <View style={styles.successCard}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successTitle}>Bill Paid!</Text>
        <Text style={styles.successAmt}>Rs.{amount}</Text>
        <TouchableOpacity style={styles.btn} onPress={() => { setSuccess(null); setAmount(''); setProvider(''); setAccountNumber(''); setPhone(''); }}>
          <Text style={styles.btnText}>Pay Another</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.outlineBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.outlineBtnText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Bill Payments</Text>
        <View style={{ width: 50 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.tabs}>
          {['ELECTRICITY','WATER','GAS','RECHARGE'].map(t => (
            <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => { setTab(t); setProvider(''); }}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.card}>
          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
          <Text style={styles.label}>Select Provider</Text>
          <View style={styles.providerGrid}>
            {providers[tab].map(p => (
              <TouchableOpacity key={p} style={[styles.providerBtn, provider === p && styles.providerBtnActive]} onPress={() => setProvider(p)}>
                <Text style={[styles.providerText, provider === p && styles.providerTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {tab === 'RECHARGE' ? (
            <>
              <Text style={styles.label}>Mobile Number</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="10-digit number" placeholderTextColor="rgba(255,255,255,0.3)" keyboardType="phone-pad" maxLength={10} />
            </>
          ) : (
            <>
              <Text style={styles.label}>Account Number</Text>
              <TextInput style={styles.input} value={accountNumber} onChangeText={setAccountNumber} placeholder="Enter account number" placeholderTextColor="rgba(255,255,255,0.3)" />
            </>
          )}
          <Text style={styles.label}>Amount (Rs.)</Text>
          <TextInput style={styles.input} value={amount} onChangeText={setAmount} placeholder="Enter amount" placeholderTextColor="rgba(255,255,255,0.3)" keyboardType="numeric" />
          <TouchableOpacity style={styles.btn} onPress={handlePay} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Pay Rs.{amount || 0}</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 50 },
  back: { color: '#6C63FF', fontSize: 16, fontWeight: '600' },
  title: { color: '#fff', fontSize: 20, fontWeight: '800' },
  scroll: { padding: 16 },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(108,99,255,0.15)', borderWidth: 1, borderColor: 'rgba(108,99,255,0.3)' },
  tabActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  tabText: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  card: { backgroundColor: '#1a1a2e', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(108,99,255,0.3)' },
  errorBox: { backgroundColor: 'rgba(255,107,107,0.15)', borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,107,107,0.3)' },
  errorText: { color: '#FF6B6B', fontSize: 13 },
  label: { color: 'rgba(255,255,255,0.6)', fontSize: 12, letterSpacing: 1, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 14, color: '#fff', fontSize: 14 },
  providerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  providerBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  providerBtnActive: { backgroundColor: 'rgba(108,99,255,0.3)', borderColor: '#6C63FF' },
  providerText: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
  providerTextActive: { color: '#fff', fontWeight: '600' },
  btn: { backgroundColor: '#6C63FF', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  outlineBtn: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: 'rgba(108,99,255,0.3)' },
  outlineBtnText: { color: '#6C63FF', fontSize: 15, fontWeight: '600' },
  successCard: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  successIcon: { fontSize: 64, marginBottom: 16 },
  successTitle: { color: '#00C896', fontSize: 28, fontWeight: '800', marginBottom: 8 },
  successAmt: { color: '#fff', fontSize: 48, fontWeight: '900', marginBottom: 32 },
});
