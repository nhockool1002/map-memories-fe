import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import apiClient from '@/lib/api';
import { User, LoginRequest, RegisterRequest, UpdateProfileRequest, UserShopItem } from '@/types/api';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userItems: UserShopItem[];
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  refreshUserItems: () => Promise<void>;
  getUserItems: () => UserShopItem[];
  saveUserItems: (items: UserShopItem[]) => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userItems, setUserItems] = useState<UserShopItem[]>([]);
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
            
            // Load user items from localStorage
            const storedItems = getUserItems();
            setUserItems(storedItems);
            
            setIsLoading(false);
            return; // Don't make API call if we have cached user
          }

          // Only get fresh profile if no cached user
          const response = await apiClient.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
            apiClient.setCurrentUser(response.data);
            
            // Save user items to localStorage if available
            if (response.data.user_items) {
              saveUserItems(response.data.user_items);
            }
          }
        }
      } catch (error) {
        // Token might be expired or invalid
        apiClient.clearCurrentUser();
        setUser(null);
        setUserItems([]);
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
        console.log('Login successful, setting user:', response.data.user);
        setUser(response.data.user);
        apiClient.setCurrentUser(response.data.user);
        
        // Get user profile to fetch user_items
        console.log('Fetching user profile...');
        await fetchAndSaveUserItems();
        console.log('User profile fetched and saved');
        
        toast.success('Đăng nhập thành công!');
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Login error:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        stack: error?.stack
      });
      
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
        
        // Get user profile to fetch user_items
        await fetchAndSaveUserItems();
        
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
      setUserItems([]);
      apiClient.clearCurrentUser();
      localStorage.removeItem('user_items');
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
        await fetchAndSaveUserItems();
      }
    } catch (error) {
      console.error('Refresh profile error:', error);
    }
  };

  const refreshUserItems = async (): Promise<void> => {
    try {
      if (apiClient.isAuthenticated()) {
        await fetchAndSaveUserItems();
      }
    } catch (error) {
      console.error('Refresh user items error:', error);
    }
  };

  // Helper functions for user items
  const getUserItems = (): UserShopItem[] => {
    try {
      const stored = localStorage.getItem('user_items');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveUserItems = (items: UserShopItem[]): void => {
    try {
      localStorage.setItem('user_items', JSON.stringify(items));
      setUserItems(items);
    } catch (error) {
      console.error('Error saving user items:', error);
    }
  };

  // Helper function to fetch and save user items
  const fetchAndSaveUserItems = async (): Promise<void> => {
    try {
      console.log('Calling getProfile API...');
      const response = await apiClient.getProfile();
      console.log('getProfile response:', response);
      if (response.success && response.data) {
        // Update user with profile data
        console.log('Setting user from profile:', response.data);
        setUser(response.data);
        apiClient.setCurrentUser(response.data);
        
        // Save user items to localStorage if available
        if (response.data.user_items) {
          console.log('Saving user items:', response.data.user_items);
          saveUserItems(response.data.user_items);
        } else {
          console.log('No user_items in profile response');
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Load user items from localStorage on mount
  useEffect(() => {
    const items = getUserItems();
    setUserItems(items);
  }, []);

  const isAuthenticated = !!user && apiClient.isAuthenticated();
  
  // Debug log
  console.log('useAuth state:', { 
    user: !!user, 
    apiAuthenticated: apiClient.isAuthenticated(),
    isAuthenticated,
    isLoading 
  });

  return {
    user,
    isLoading,
    isAuthenticated,
    userItems,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
    refreshUserItems,
    getUserItems,
    saveUserItems,
  };
};