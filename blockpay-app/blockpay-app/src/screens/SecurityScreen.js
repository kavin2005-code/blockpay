import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import API from '../services/api';

export default function SecurityScreen({ navigation }) {
  const [tab, setTab] = useState('pin');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handlePinChange = async () => {
    if (newPin.length !== 6) return setError('PIN must be 6 digits');
    if (newPin !== confirmPin) return setError('PINs do not match');
    try {
      await API.post('/auth/change-pin', { currentPin, newPin });
      setMsg('PIN changed successfully!');
      setError('');
      setCurrentPin(''); setNewPin(''); setConfirmPin('');
    } catch(e) { setError(e.response?.data?.message || 'Failed'); }
  };

  const handlePassChange = async () => {
    if (newPass.length < 8) return setError('Password must be at least 8 characters');
    if (newPass !== confirmPass) return setError('Passwords do not match');
    try {
      await API.post('/auth/change-password', { currentPassword: currentPass, newPassword: newPass });
      setMsg('Password changed successfully!');
      setError('');
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
    } catch(e) { setError(e.response?.data?.message || 'Failed'); }
  };

  const loginHistory = [
    { device: 'Chrome on Windows', location: 'Coimbatore, IN', time: new Date().toLocaleString(), status: 'Current' },
    { device: 'Expo Go on Android', location: 'Coimbatore, IN', time: new Date(Date.now() - 3600000).toLocaleString(), status: 'Success' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Security</Text>
        <View style={{ width: 50 }} />
      </View>
      <View style={styles.tabs}>
        {[['pin','PIN'],['password','Password'],['history','History']].map(([t, label]) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => { setTab(t); setMsg(''); setError(''); }}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {msg ? <View style={styles.successBox}><Text style={styles.successText}>{msg}</Text></View> : null}
        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

        {tab === 'pin' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Change Transaction PIN</Text>
            <Text style={styles.cardDesc}>6-digit PIN used to authorize transactions</Text>
            <Text style={styles.label}>Current PIN</Text>
            <TextInput style={styles.input} value={currentPin} onChangeText={setCurrentPin} placeholder="Enter current PIN" placeholderTextColor="rgba(255,255,255,0.3)" secureTextEntry keyboardType="numeric" maxLength={6} />
            <Text style={styles.label}>New PIN</Text>
            <TextInput style={styles.input} value={newPin} onChangeText={setNewPin} placeholder="Enter new 6-digit PIN" placeholderTextColor="rgba(255,255,255,0.3)" secureTextEntry keyboardType="numeric" maxLength={6} />
            <View style={styles.pinDots}>
              {[1,2,3,4,5,6].map(i => (
                <View key={i} style={[styles.dot, newPin.length >= i && styles.dotActive]} />
              ))}
            </View>
            <Text style={styles.label}>Confirm New PIN</Text>
            <TextInput style={styles.input} value={confirmPin} onChangeText={setConfirmPin} placeholder="Confirm new PIN" placeholderTextColor="rgba(255,255,255,0.3)" secureTextEntry keyboardType="numeric" maxLength={6} />
            <TouchableOpacity style={styles.btn} onPress={handlePinChange}>
              <Text style={styles.btnText}>Change PIN</Text>
            </TouchableOpacity>
          </View>
        )}

        {tab === 'password' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Change Password</Text>
            <Text style={styles.cardDesc}>Use a strong password with letters and numbers</Text>
            <Text style={styles.label}>Current Password</Text>
            <TextInput style={styles.input} value={currentPass} onChangeText={setCurrentPass} placeholder="Enter current password" placeholderTextColor="rgba(255,255,255,0.3)" secureTextEntry />
            <Text style={styles.label}>New Password</Text>
            <TextInput style={styles.input} value={newPass} onChangeText={setNewPass} placeholder="Min 8 characters" placeholderTextColor="rgba(255,255,255,0.3)" secureTextEntry />
            <View style={styles.strengthBar}>
              <View style={[styles.strengthFill, {
                width: newPass.length === 0 ? '0%' : newPass.length < 6 ? '25%' : newPass.length < 10 ? '60%' : '100%',
                backgroundColor: newPass.length < 6 ? '#FF6B6B' : newPass.length < 10 ? '#FFB347' : '#00C896'
              }]} />
            </View>
            <Text style={styles.strengthLabel}>
              {newPass.length === 0 ? '' : newPass.length < 6 ? 'Weak' : newPass.length < 10 ? 'Medium' : 'Strong'}
            </Text>
            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput style={styles.input} value={confirmPass} onChangeText={setConfirmPass} placeholder="Confirm new password" placeholderTextColor="rgba(255,255,255,0.3)" secureTextEntry />
            <TouchableOpacity style={styles.btn} onPress={handlePassChange}>
              <Text style={styles.btnText}>Change Password</Text>
            </TouchableOpacity>
          </View>
        )}

        {tab === 'history' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Login History</Text>
            {loginHistory.map((h, i) => (
              <View key={i} style={styles.historyRow}>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyDevice}>{h.device}</Text>
                  <Text style={styles.historyLocation}>{h.location}</Text>
                  <Text style={styles.historyTime}>{h.time}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: h.status === 'Current' ? 'rgba(108,99,255,0.2)' : 'rgba(0,200,150,0.2)' }]}>
                  <Text style={[styles.statusText, { color: h.status === 'Current' ? '#6C63FF' : '#00C896' }]}>{h.status}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 50 },
  back: { color: '#6C63FF', fontSize: 16, fontWeight: '600' },
  title: { color: '#fff', fontSize: 20, fontWeight: '800' },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(108,99,255,0.15)', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(108,99,255,0.3)' },
  tabActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  tabText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  scroll: { padding: 16 },
  successBox: { backgroundColor: 'rgba(0,200,150,0.15)', borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(0,200,150,0.3)' },
  successText: { color: '#00C896', fontSize: 13 },
  errorBox: { backgroundColor: 'rgba(255,107,107,0.15)', borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,107,107,0.3)' },
  errorText: { color: '#FF6B6B', fontSize: 13 },
  card: { backgroundColor: '#1a1a2e', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(108,99,255,0.3)' },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  cardDesc: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 8 },
  label: { color: 'rgba(255,255,255,0.6)', fontSize: 12, letterSpacing: 1, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 14, color: '#fff', fontSize: 14 },
  pinDots: { flexDirection: 'row', gap: 8, marginTop: 8 },
  dot: { width: 28, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.1)' },
  dotActive: { backgroundColor: '#6C63FF' },
  strengthBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: 8, overflow: 'hidden' },
  strengthFill: { height: '100%', borderRadius: 2 },
  strengthLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 4 },
  btn: { backgroundColor: '#6C63FF', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  historyInfo: { flex: 1 },
  historyDevice: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 2 },
  historyLocation: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 2 },
  historyTime: { color: 'rgba(255,255,255,0.3)', fontSize: 11 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700' },
});
