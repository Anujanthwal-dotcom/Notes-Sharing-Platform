import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import Cookies from 'js-cookie';
import { userService } from '../services/endpoints';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (token: string, admin?: boolean) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!Cookies.get('nb_access_token'));
  const [isAdmin, setIsAdmin] = useState(() => Cookies.get('nb_is_admin') === 'true');

  const fetchUser = useCallback(async () => {
    const token = Cookies.get('nb_access_token');
    const admin = Cookies.get('nb_is_admin') === 'true';
    if (!token || admin) {
      setIsLoading(false);
      return;
    }

    // Try sessionStorage first
    const cached = sessionStorage.getItem('nb_user');
    if (cached) {
      try {
        setUser(JSON.parse(cached));
        setIsLoading(false);
        return;
      } catch { /* fall through to API */ }
    }

    try {
      const res = await userService.getData();
      setUser(res.data);
      sessionStorage.setItem('nb_user', JSON.stringify(res.data));
    } catch {
      Cookies.remove('nb_access_token');
      sessionStorage.removeItem('nb_user');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = (token: string, admin = false) => {
    Cookies.set('nb_access_token', token, { expires: 1 / 24, sameSite: 'Lax' }); // 1 hour
    setIsAuthenticated(true);
    if (admin) {
      Cookies.set('nb_is_admin', 'true', { expires: 1 / 24, sameSite: 'Lax' });
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
      // Fetch user data immediately after login
      fetchUser();
    }
  };

  const logout = () => {
    Cookies.remove('nb_access_token');
    Cookies.remove('nb_is_admin');
    sessionStorage.removeItem('nb_user');
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  const refreshUser = async () => {
    sessionStorage.removeItem('nb_user');
    setIsLoading(true);
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
