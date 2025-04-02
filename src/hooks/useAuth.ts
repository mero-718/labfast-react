import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials, logout, initializeAuth } from '@/store/slices/authSlice';
import { useLoginMutation, useRegisterMutation, LoginRequest } from '@/store/api/apiSlice';
import { RootState } from '@/store/store';
import { toast } from 'react-toastify';

const toastConfig = {
  position: "top-right" as const,
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "light" as const,
};

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login] = useLoginMutation();
  const [register] = useRegisterMutation();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  const handleLogin = useCallback(
    async (credentials: LoginRequest) => {
      try {
        const result = await login(credentials).unwrap();
        dispatch(setCredentials({
          token: result.token,
          user: {
            name: credentials.username,
            email: credentials.username,
            role: 'Admin'
          }
        }));
        toast.success('Login successful!', toastConfig);
        navigate('/dashboard');
      } catch (error: any) {
        const errorMessage = error.data?.detail || 'Login failed. Please try again.';
        toast.error(errorMessage, toastConfig);
        throw error;
      }
    },
    [dispatch, login, navigate]
  );

  const handleRegister = useCallback(
    async (email: string, password: string, username: string) => {
      try {
        const result = await register({ email, password, username }).unwrap();
        dispatch(setCredentials({ 
          token: result.token,
          user: {
            name: username,
            email: email,
            role: 'Admin'
          }
        }));
        toast.success('Registration successful!', toastConfig);
        navigate('/login');
      } catch (error: any) {
        const errorMessage = error.data?.detail || 'Registration failed. Please try again.';
        toast.error(errorMessage, toastConfig);
        throw error;
      }
    },
    [dispatch, register, navigate]
  );

  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);

  return {
    user,
    token,
    isAuthenticated,
    handleLogin,
    handleRegister,
    handleLogout,
  };
}; 