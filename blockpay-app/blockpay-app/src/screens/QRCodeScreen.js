import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function QRCodeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('blockpay_user').then(saved => {
      if (saved) setUser(JSON.parse(saved));
    });
  }, []);

  const qrData = JSON.stringify({
    type: 'PAYMENT',
    to: user?.upiId,
    toWallet: user?.walletAddress,
    toName: user?.fullName,
    amount: amount || null,
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>QR Code</Text>
        <View style={{ width: 50 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.name}>{user?.fullName}</Text>
          <Text style={styles.upi}>{user?.upiId}</Text>
          <View style={styles.qrWrapper}>
            {user && <QRCode value={qrData} size={220} backgroundColor="#1a1a2e" color="#ffffff" />}
          </View>
          <Text style={styles.scanText}>Scan to pay</Text>
          <TouchableOpacity style={styles.scanBtn} onPress={() => navigation.navigate('Scanner')}>
            <Text style={styles.scanBtnText}>Scan QR to Pay</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>UPI ID</Text>
            <Text style={styles.infoValue}>{user?.upiId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{user?.fullName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Wallet</Text>
            <Text style={styles.infoValue}>{user?.walletAddress?.slice(0,20)}...</Text>
          </View>
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
  scroll: { padding: 20, alignItems: 'center' },
  card: { backgroundColor: '#1a1a2e', borderRadius: 20, padding: 28, borderWidth: 1, borderColor: 'rgba(108,99,255,0.3)', alignItems: 'center', width: '100%' },
  name: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  upi: { color: '#6C63FF', fontSize: 14, marginBottom: 24 },
  qrWrapper: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 16, borderWidth: 2, borderColor: 'rgba(108,99,255,0.3)', marginBottom: 16 },
  scanText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 16 },
  scanBtn: { backgroundColor: '#6C63FF', borderRadius: 12, padding: 14, paddingHorizontal: 28, marginTop: 8 },
  scanBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  infoCard: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', width: '100%', marginTop: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  infoLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
  infoValue: { color: '#fff', fontSize: 13, fontWeight: '500' },
});
