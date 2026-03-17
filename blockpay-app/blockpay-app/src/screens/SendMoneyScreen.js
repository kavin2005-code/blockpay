import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { transactionAPI } from '../services/api';

export default function SendMoneyScreen({ navigation }) {
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  const handleSend = async () => {
    if (!upiId || !amount || !pin) return setError('Fill all fields');
    setLoading(true);
    setError('');
    try {
      const res = await transactionAPI.send({ recipientUpiId: upiId, amount: Number(amount), description: note || 'Transfer', pin });
      setSuccess(res.data.data);
    } catch(e) {
      setError(e.response?.data?.message || 'Transfer failed');
    } finally { setLoading(false); }
  };

  if (success) return (
    <View style={styles.container}>
      <View style={styles.successCard}>
        <Text style={styles.successIcon}>checkmark</Text>
        <Text style={styles.successTitle}>Money Sent!</Text>
        <Text style={styles.successAmt}>Rs.{amount}</Text>
        <Text style={styles.successTo}>To: {upiId}</Text>
        <TouchableOpacity style={styles.btn} onPress={() => { setSuccess(null); setUpiId(''); setAmount(''); setNote(''); setPin(''); }}>
          <Text style={styles.btnText}>Send Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.outlineBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.outlineBtnText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Send Money</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.card}>
          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
          <Text style={styles.label}>Recipient UPI ID</Text>
          <TextInput style={styles.input} value={upiId} onChangeText={setUpiId} placeholder="username@blockpay" placeholderTextColor="rgba(255,255,255,0.3)" autoCapitalize="none" />
          <Text style={styles.label}>Quick Amount</Text>
          <View style={styles.quickAmts}>
            {[100, 500, 1000, 2000, 5000].map(a => (
              <TouchableOpacity key={a} style={[styles.qBtn, amount == a && styles.qBtnActive]} onPress={() => setAmount(String(a))}>
                <Text style={[styles.qBtnText, amount == a && styles.qBtnTextActive]}>Rs.{a}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Amount (Rs.)</Text>
          <TextInput style={styles.input} value={amount} onChangeText={setAmount} placeholder="Enter amount" placeholderTextColor="rgba(255,255,255,0.3)" keyboardType="numeric" />
          <Text style={styles.label}>Note (Optional)</Text>
          <TextInput style={styles.input} value={note} onChangeText={setNote} placeholder="What is this for?" placeholderTextColor="rgba(255,255,255,0.3)" />
          <Text style={styles.label}>Transaction PIN</Text>
          <TextInput style={styles.input} value={pin} onChangeText={setPin} placeholder="Enter 6-digit PIN" placeholderTextColor="rgba(255,255,255,0.3)" secureTextEntry keyboardType="numeric" maxLength={6} />
          <TouchableOpacity style={styles.btn} onPress={handleSend} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send Rs.{amount || 0}</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  scroll: { flexGrow: 1, padding: 20, paddingTop: 50 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  back: { color: '#6C63FF', fontSize: 16, fontWeight: '600' },
  title: { color: '#fff', fontSize: 20, fontWeight: '800' },
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
  successAmt: { color: '#fff', fontSize: 48, fontWeight: '900', marginBottom: 8 },
  successTo: { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 32 },
});
