import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.237.141.83:5000/api/v1';

const API = axios.create({ baseURL: BASE_URL });

API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const setToken = async (token) => await AsyncStorage.setItem('token', token);
export const clearToken = async () => await AsyncStorage.removeItem('token');
export const getToken = async () => await AsyncStorage.getItem('token');

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
};

export const walletAPI = {
  getBalance: () => API.get('/transactions/wallet/balance'),
  deposit: (amount, method) => API.post('/transactions/wallet/deposit', { amount, paymentMethod: method }),
};

export const transactionAPI = {
  history: () => API.get('/transactions/history'),
  send: (data) => API.post('/transactions/send', data),
};

export const billAPI = {
  pay: (data) => API.post('/transactions/bill/pay', data),
  recharge: (data) => API.post('/transactions/recharge', data),
};

export default API;