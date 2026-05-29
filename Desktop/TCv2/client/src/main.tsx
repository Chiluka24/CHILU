import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './styles/index.css';
import { sessionManager } from './lib/sessionManager';

// Global Fetch Interceptor to handle Token Expiration automatically
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  
  // If we receive an unauthorized or forbidden error from our API
  if ((response.status === 401 || response.status === 403) && typeof args[0] === 'string' && args[0].includes('/api/')) {
    // And if it's not a login or register endpoint
    if (!args[0].includes('/api/auth/login') && !args[0].includes('/api/auth/register')) {
      const token = sessionManager.getToken();
      if (token) {
        sessionManager.clearSession();
        // Redirect completely out of the app to clear memory
        window.location.href = '/login';
      }
    }
  }
  return response;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
