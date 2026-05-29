// Session management with automatic cleanup on tab close
// Tokens stored in sessionStorage (cleared on tab close) with 6-hour expiry

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const SESSION_EXPIRY_KEY = 'sessionExpiry';
const SESSION_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

export const sessionManager = {
  // Set session with automatic expiry
  setSession(token: string, refreshToken?: string) {
    const expiryTime = Date.now() + SESSION_DURATION;
    
    // Use sessionStorage for automatic cleanup on tab close
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString());
    
    if (refreshToken) {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    
    // Also set in localStorage as fallback for refresh
    localStorage.setItem(TOKEN_KEY, token);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  // Get token (checks expiry)
  getToken(): string | null {
    // Try sessionStorage first (cleared on tab close)
    let token = sessionStorage.getItem(TOKEN_KEY);
    const expiryTime = sessionStorage.getItem(SESSION_EXPIRY_KEY);
    
    // If not in sessionStorage, try localStorage (for page refresh)
    if (!token) {
      token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        // Restore to sessionStorage
        const newExpiryTime = Date.now() + SESSION_DURATION;
        sessionStorage.setItem(TOKEN_KEY, token);
        sessionStorage.setItem(SESSION_EXPIRY_KEY, newExpiryTime.toString());
        
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        }
      }
    }
    
    // Check if session expired
    if (expiryTime && Date.now() > parseInt(expiryTime)) {
      this.clearSession();
      return null;
    }
    
    return token;
  },

  // Get refresh token
  getRefreshToken(): string | null {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  // Clear session
  clearSession() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(SESSION_EXPIRY_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  // Check if session is valid
  isSessionValid(): boolean {
    const token = this.getToken();
    return token !== null;
  },

  // Extend session (reset expiry)
  extendSession() {
    const token = this.getToken();
    if (token) {
      const newExpiryTime = Date.now() + SESSION_DURATION;
      sessionStorage.setItem(SESSION_EXPIRY_KEY, newExpiryTime.toString());
    }
  },

  // Get time until session expires (in milliseconds)
  getTimeUntilExpiry(): number {
    const expiryTime = sessionStorage.getItem(SESSION_EXPIRY_KEY);
    if (!expiryTime) return 0;
    
    const remaining = parseInt(expiryTime) - Date.now();
    return Math.max(0, remaining);
  }
};

// Auto-extend session on user activity
let activityTimeout: NodeJS.Timeout;

const resetActivityTimer = () => {
  clearTimeout(activityTimeout);
  
  // Extend session if user is active
  activityTimeout = setTimeout(() => {
    if (sessionManager.isSessionValid()) {
      sessionManager.extendSession();
    }
  }, 5 * 60 * 1000); // Extend after 5 minutes of activity
};

// Listen for user activity
if (typeof window !== 'undefined') {
  ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetActivityTimer, { passive: true });
  });
}

// Check session expiry periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    if (!sessionManager.isSessionValid()) {
      // Session expired - redirect to login
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        sessionManager.clearSession();
        window.location.href = '/login';
      }
    }
  }, 60 * 1000); // Check every minute
}
