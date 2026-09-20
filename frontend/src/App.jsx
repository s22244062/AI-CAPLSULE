import { useState, useEffect } from 'react';
import Landing from './components/Landing.jsx';
import { checkAuth } from './api/auth.js';
import Dashboard from './components/Dashboard.jsx';

function App() {
  const [page, setPage] = useState('loading');

  useEffect(() => {
    const path = window.location.pathname;

    if (path === '/login') {
      window.location.href = '/api/auth/google';
      return;
    }

    if (path === '/dashboard') {
      checkAuth().then((authenticated) => {
        if (authenticated) {
          setPage('dashboard');
        } else {
          window.history.pushState({}, '', '/');
          setPage('landing');
        }
      });
      return;
    }

    setPage('landing');
  }, []);

  function goToLogin() {
    window.history.pushState({}, '', '/login');
    window.location.href = '/api/auth/google';
  }

  if (page === 'loading') {
    return <p>Loading...</p>;
  }

  if (page === 'landing') {
    return <Landing onLogin={goToLogin} />;
  }

  if (page === 'dashboard') {
    return <Dashboard />;
  }

  return null;
}

export default App;
