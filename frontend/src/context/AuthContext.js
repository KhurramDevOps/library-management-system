import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('lms_token');
    const storedUser = localStorage.getItem('lms_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    isLoading,
    login: (nextToken, nextUser) => {
      localStorage.setItem('lms_token', nextToken);
      localStorage.setItem('lms_user', JSON.stringify(nextUser));
      setToken(nextToken);
      setUser(nextUser);
    },
    logout: () => {
      localStorage.removeItem('lms_token');
      localStorage.removeItem('lms_user');
      setToken(null);
      setUser(null);
    },
  }), [user, token, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useLogout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return () => {
    logout();
    navigate('/login');
  };
}
