import axios from 'axios';

const API = axios.create({
  baseURL: 'https://blockpay-backend-6zzj.onrender.com/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const setToken = (token) => {
  localStorage.setItem('blockpay_token', token);
  API.defaults.headers.common['Authorization'] = 'Bearer ' + token;
};

export const getToken = () => localStorage.getItem('blockpay_token');

export const clearToken = () => {
  localStorage.removeItem('blockpay_token');
  delete API.defaults.headers.common['Authorization'];
};

const saved = getToken();
if (saved) API.defaults.headers.common['Authorization'] = 'Bearer ' + saved;

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
};

export const walletAPI = {
  getBalance: () => API.get('/transactions/wallet/balance'),
  deposit: (amount, method) => API.post('/transactions/wallet/deposit', { amount, method }),
};

export const transactionAPI = {
  send: (data) => API.post('/transactions/send', data),
  history: () => API.get('/transactions/history'),
};

export const billAPI = {
  getProviders: (type) => API.get('/bills/providers/' + type),
  pay: (data) => API.post('/bills/pay', data),
  recharge: (data) => API.post('/bills/recharge', data),
};

export default API;
