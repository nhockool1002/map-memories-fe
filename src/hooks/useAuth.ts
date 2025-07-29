import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import apiClient from '@/lib/api';
import { User, LoginRequest, RegisterRequest, UpdateProfileRequest } from '@/types/api';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated and load profile
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (apiClient.isAuthenticated()) {
          // Try to get user from cookies first
          const cachedUser = apiClient.getCurrentUser();
          if (cachedUser) {
            setUser(cachedUser);
          }

          // Verify token and get fresh profile
          const response = await apiClient.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
            apiClient.setCurrentUser(response.data);
          }
        }
      } catch (error) {
        // Token might be expired or invalid
        apiClient.clearCurrentUser();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiClient.login(credentials);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        apiClient.setCurrentUser(response.data.user);
        toast.success('Đăng nhập thành công!');
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error?.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiClient.register(data);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        apiClient.setCurrentUser(response.data.user);
        toast.success('Đăng ký thành công!');
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Register error:', error);
      const message = error?.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      apiClient.clearCurrentUser();
      setIsLoading(false);
      toast.success('Đã đăng xuất thành công');
      router.push('/');
    }
  };

  const updateProfile = async (data: UpdateProfileRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiClient.updateProfile(data);
      
      if (response.success && response.data) {
        setUser(response.data);
        apiClient.setCurrentUser(response.data);
        toast.success('Cập nhật thông tin thành công!');
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Update profile error:', error);
      const message = error?.response?.data?.message || 'Cập nhật thất bại. Vui lòng thử lại.';
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async (): Promise<void> => {
    try {
      if (apiClient.isAuthenticated()) {
        const response = await apiClient.getProfile();
        if (response.success && response.data) {
          setUser(response.data);
          apiClient.setCurrentUser(response.data);
        }
      }
    } catch (error) {
      console.error('Refresh profile error:', error);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user && apiClient.isAuthenticated(),
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
  };
};