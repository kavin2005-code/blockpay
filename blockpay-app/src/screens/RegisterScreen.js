import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { authAPI, setToken } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const handleRegister = async () => {
    if (!form.fullName || !form.email || !form.password || !form.phone) return setError('Fill all fields');
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.register({
        fullName: form.fullName,
        username: form.username || form.fullName.toLowerCase().replace(' ', ''),
        email: form.email,
        password: form.password,
        phone: { countryCode: '+91', number: form.phone }
      });
      const { accessToken, user } = res.data.data;
      await setToken(accessToken);
      await AsyncStorage.setItem('blockpay_user', JSON.stringify(user));
      navigation.replace('Dashboard');
    } catch(e) {
      setError(e.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.logoBox}>
          <Text style={styles.logo}>BlockPay</Text>
          <Text style={styles.tagline}>Create your account</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Get Started</Text>
          <Text style={styles.subtitle}>Create your BlockPay account</Text>
          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={form.fullName} onChangeText={v => set('fullName', v)} placeholder="Enter your full name" placeholderTextColor="rgba(255,255,255,0.3)" />
          <Text style={styles.label}>Username</Text>
          <TextInput style={styles.input} value={form.username} onChangeText={v => set('username', v)} placeholder="Choose a username" placeholderTextColor="rgba(255,255,255,0.3)" autoCapitalize="none" />
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={form.email} onChangeText={v => set('email', v)} placeholder="Enter your email" placeholderTextColor="rgba(255,255,255,0.3)" keyboardType="email-address" autoCapitalize="none" />
          <Text style={styles.label}>Phone Number</Text>
          <TextInput style={styles.input} value={form.phone} onChangeText={v => set('phone', v)} placeholder="10-digit mobile number" placeholderTextColor="rgba(255,255,255,0.3)" keyboardType="phone-pad" maxLength={10} />
          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} value={form.password} onChangeText={v => set('password', v)} placeholder="Min 8 characters" placeholderTextColor="rgba(255,255,255,0.3)" secureTextEntry />
          <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Already have an account? <Text style={styles.linkBold}>Login</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoBox: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 42, fontWeight: '900', color: '#6C63FF' },
  tagline: { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 4 },
  card: { backgroundColor: '#1a1a2e', borderRadius: 20, padding: 28, borderWidth: 1, borderColor: 'rgba(108,99,255,0.3)' },
  title: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 4 },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 24 },
  errorBox: { backgroundColor: 'rgba(255,107,107,0.15)', borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,107,107,0.3)' },
  errorText: { color: '#FF6B6B', fontSize: 13 },
  label: { color: 'rgba(255,255,255,0.6)', fontSize: 12, letterSpacing: 1, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 14, color: '#fff', fontSize: 14 },
  btn: { backgroundColor: '#6C63FF', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center', marginTop: 20 },
  linkBold: { color: '#6C63FF', fontWeight: '700' },
});