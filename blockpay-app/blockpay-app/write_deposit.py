f = open('src/screens/DepositScreen.js', 'w', encoding='utf-8', newline='\n')
f.write("""import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { walletAPI } from '../services/api';

export default function DepositScreen({ navigation }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleDeposit = async () => {
    if (!amount) return setError('Enter amount');
    setLoading(true);
    setError('');
    try {
      const res = await walletAPI.deposit(Number(amount), 'UPI');
      setSuccess(res.data.data);
    } catch(e) {
      setError(e.response?.data?.message || 'Deposit failed');
    } finally { setLoading(false); }
  };

  if (success) return (
    <View style={styles.container}>
      <View style={styles.successCard}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successTitle}>Money Added!</Text>
        <Text style={styles.successAmt}>Rs.{amount}</Text>
        <TouchableOpacity style={styles.btn} onPress={() => { setSuccess(null); setAmount(''); }}>
          <Text style={styles.btnText}>Add More</Text>
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
        <Text style={styles.title}>Add Money</Text>
        <View style={{ width: 50 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
          <Text style={styles.label}>Quick Amount</Text>
          <View style={styles.quickAmts}>
            {[500, 1000, 2000, 5000].map(a => (
              <TouchableOpacity key={a} style={[styles.qBtn, amount == a && styles.qBtnActive]} onPress={() => setAmount(String(a))}>
                <Text style={[styles.qBtnText, amount == a && styles.qBtnTextActive]}>Rs.{a}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Custom Amount (Rs.)</Text>
          <TextInput style={styles.input} value={amount} onChangeText={setAmount} placeholder="Enter amount" placeholderTextColor="rgba(255,255,255,0.3)" keyboardType="numeric" />
          <TouchableOpacity style={styles.btn} onPress={handleDeposit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Add Rs.{amount || 0}</Text>}
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
  scroll: { padding: 20 },
  card: { backgroundColor: '#1a1a2e', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(108,99,255,0.3)' },
  errorBox: { backgroundColor: 'rgba(255,107,107,0.15)', borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,107,107,0.3)' },
  errorText: { color: '#FF6B6B', fontSize: 13 },
  label: { color: 'rgba(255,255,255,0.6)', fontSize: 12, letterSpacing: 1, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 14, color: '#fff', fontSize: 14 },
  quickAmts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  qBtn: { backgroundColor: 'rgba(108,99,255,0.15)', borderRadius: 10, padding: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(108,99,255,0.3)' },
  qBtnActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  qBtnText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
  qBtnTextActive: { color: '#fff' },
  btn: { backgroundColor: '#6C63FF', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  outlineBtn: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: 'rgba(108,99,255,0.3)' },
  outlineBtnText: { color: '#6C63FF', fontSize: 15, fontWeight: '600' },
  successCard: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  successIcon: { fontSize: 64, marginBottom: 16 },
  successTitle: { color: '#00C896', fontSize: 28, fontWeight: '800', marginBottom: 8 },
  successAmt: { color: '#fff', fontSize: 48, fontWeight: '900', marginBottom: 32 },
});
""")
f.close()
print('DepositScreen.js done!')
