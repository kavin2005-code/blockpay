import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { getToken, clearToken } from './services/api';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SendMoney from './pages/SendMoney';
import History from './pages/History';
import Bills from './pages/Bills';
import Profile from './pages/Profile';
import QRCodePage from './pages/QRCode';
import RequestMoney from './pages/RequestMoney';
import Security from './pages/Security';
import SearchTransactions from './pages/SearchTransactions';

export default function App() {
  const [page, setPage] = useState('login');
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const token = getToken();
    const saved = localStorage.getItem('blockpay_user');
    if (token && saved) {
      try {
        setUser(JSON.parse(saved));
        setPage('dashboard');
      } catch(e) { clearToken(); }
    }
  }, []);

  const handleLogin = ({ user: u, wallet: w }) => {
    setUser(u);
    setWallet(w);
    localStorage.setItem('blockpay_user', JSON.stringify(u));
    setPage('dashboard');
  };

  const handleLogout = () => {
    clearToken();
    localStorage.removeItem('blockpay_user');
    setUser(null);
    setWallet(null);
    setPage('login');
  };

  const renderPage = () => {
    if (!user) {
      if (page === 'register') return <Register onLogin={handleLogin} goLogin={() => setPage('login')} />;
      return <Login onLogin={handleLogin} goRegister={() => setPage('register')} />;
    }
    switch(page) {
      case 'send':     return <SendMoney user={user} setPage={setPage} />;
      case 'history':  return <History setPage={setPage} />;
      case 'bills':    return <Bills setPage={setPage} />;
      case 'profile':  return <Profile user={user} setPage={setPage} onLogout={handleLogout} />;
      case 'qr':       return <QRCodePage user={user} setPage={setPage} />;
      case 'request':  return <RequestMoney user={user} setPage={setPage} />;
      case 'security': return <Security user={user} setPage={setPage} />;
      case 'search':   return <SearchTransactions setPage={setPage} />;
      default:         return <Dashboard user={user} wallet={wallet} onLogout={handleLogout} setPage={setPage} darkMode={darkMode} toggleDark={() => setDarkMode(!darkMode)} />;
    }
  };

  return (
    <div style={{ background: darkMode ? '#0d0d1a' : '#f0f2f8', minHeight: '100vh' }}>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1a2e', color: '#fff', border: '1px solid rgba(108,99,255,0.3)' } }} />
      {renderPage()}
    </div>
  );
}
