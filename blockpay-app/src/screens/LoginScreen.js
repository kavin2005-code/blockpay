import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { authAPI, setToken } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) return setError('Fill all fields');
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.login({ email, password });
      const { accessToken, user } = res.data.data;
      await setToken(accessToken);
      await AsyncStorage.setItem('blockpay_user', JSON.stringify(user));
      navigation.replace('Dashboard');
    } catch(e) {
      setError(e.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.logoBox}>
          <Text style={styles.logo}>BlockPay</Text>
          <Text style={styles.tagline}>Blockchain Payments</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to your account</Text>
          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Enter your email" placeholderTextColor="rgba(255,255,255,0.3)" keyboardType="email-address" autoCapitalize="none" />
          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Enter your password" placeholderTextColor="rgba(255,255,255,0.3)" secureTextEntry />
          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Login</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>Don't have an account? <Text style={styles.linkBold}>Register</Text></Text>
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