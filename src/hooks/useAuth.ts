import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

interface AuthHook {
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  verifyToken: () => Promise<boolean>;
  loginWithGoogle?: () => void; // placeholder
  signupWithGoogle?: () => void; // placeholder
}

export const useAuth = (): AuthHook => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      await verifyToken();
      setLoading(false);
    };
    initAuth();
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const { token } = await authService.login(email, password);
      localStorage.setItem('authToken', token);
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error('Login failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Signup function (matches SignupPage)
  const signup = useCallback(async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const { token } = await authService.signup(name, email, password);
      localStorage.setItem('authToken', token);
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error('Signup failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    navigate('/login');
  }, [navigate]);

  // Verify token
  const verifyToken = useCallback(async (): Promise<boolean> => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setIsAuthenticated(false);
      return false;
    }
    try {
      await authService.verifyToken(token);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      console.warn('Invalid token, logging out.');
      logout();
      return false;
    }
  }, [logout]);

  // Placeholder Google login/signup
  const loginWithGoogle = () => {
    alert('Google login not implemented yet.');
  };
  const signupWithGoogle = () => {
    alert('Google signup not implemented yet.');
  };

  return { isAuthenticated, loading, login, signup, logout, verifyToken, loginWithGoogle, signupWithGoogle };
};
