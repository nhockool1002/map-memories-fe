import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import apiClient from '@/lib/api';
import { User, LoginRequest, RegisterRequest, UpdateProfileRequest, UserShopItem, Location, Memory } from '@/types/api';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userItems: UserShopItem[];
  locations: Location[];
  memories: Memory[];
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
  const [locations, setLocations] = useState<Location[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
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
            
            // Load user items from localStorage as fallback
            const storedItems = getUserItems();
            setUserItems(storedItems);
            
            setIsLoading(false);
            return; // Don't make API call if we have cached user
          }

          // Only get fresh profile if no cached user
          const response = await apiClient.getProfile();
          if (response) {
            setUser(response);
            apiClient.setCurrentUser(response);
            
            // Save user items to localStorage if available
            if (response.owned_items) {
              saveUserItems(response.owned_items);
              setUserItems(response.owned_items);
            } else if (response.user_items) {
              saveUserItems(response.user_items);
              setUserItems(response.user_items);
            }
            
            // Save locations and memories if available
            if (response.locations) {
              setLocations(response.locations);
            }
            
            if (response.memories) {
              setMemories(response.memories);
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
      
      if (response && response.access) {
        
        // Create user object from response
        const user: User = {
          id: response.user_id,
          uuid: '', // Backend doesn't provide uuid, we'll use id as string
          username: response.username,
          email: response.email,
          full_name: response.full_name,
          avatar_url: '', // Backend doesn't provide avatar_url
          user_items: response.owned_items,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        setUser(user);
        apiClient.setCurrentUser(user);
        
        // Save owned_items to localStorage
        if (response.owned_items) {
          saveUserItems(response.owned_items);
          setUserItems(response.owned_items);
        }
        
        toast.success('Đăng nhập thành công!');
        return true;
      }
      
      return false;
    } catch (error: any) {
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
      
      if (response && response.access) {
        // Create user object from response
        const user: User = {
          id: response.user_id,
          uuid: '',
          username: response.username,
          email: response.email,
          full_name: response.full_name,
          avatar_url: '',
          user_items: response.owned_items || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        setUser(user);
        apiClient.setCurrentUser(user);
        
        // Save owned_items to localStorage
        if (response.owned_items) {
          saveUserItems(response.owned_items);
          setUserItems(response.owned_items);
        }
        
        toast.success('Đăng ký thành công!');
        return true;
      }
      
      return false;
    } catch (error: any) {
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
      // Silent error handling
    } finally {
      setUser(null);
      setUserItems([]);
      setLocations([]);
      setMemories([]);
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
      
      if (response) {
        setUser(response);
        apiClient.setCurrentUser(response);
        toast.success('Cập nhật thông tin thành công!');
        return true;
      }
      
      return false;
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Cập nhật thông tin thất bại.';
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async (): Promise<void> => {
    try {
      const response = await apiClient.getProfile();
      if (response) {
        setUser(response);
        apiClient.setCurrentUser(response);
        
        // Update user items from owned_items
        if (response.owned_items) {
          saveUserItems(response.owned_items);
          setUserItems(response.owned_items);
        } else if (response.user_items) {
          saveUserItems(response.user_items);
          setUserItems(response.user_items);
        }
        
        // Save locations and memories if available
        if (response.locations) {
          setLocations(response.locations);
        }
        
        if (response.memories) {
          setMemories(response.memories);
        }
      }
    } catch (error) {
      // Silent error handling
    }
  };

  const refreshUserItems = async (): Promise<void> => {
    try {
      if (apiClient.isAuthenticated()) {
        await fetchAndSaveUserItems();
      }
    } catch (error) {
      // Silent error handling
    }
  };

  // Helper to get user items from localStorage
  const getUserItems = (): UserShopItem[] => {
    try {
      const storedItems = localStorage.getItem('user_items');
      const items = storedItems ? JSON.parse(storedItems) : [];
      
      // If no items or items don't have image_base64, create sample data
      if (items.length === 0 || !items[0]?.shop_item?.image_base64) {
        const sampleItems: UserShopItem[] = [
          {
            id: 1,
            uuid: '203d6af9-40c3-4706-b16e-77fcce06e837',
            quantity: 1,
            shop_item: {
              id: 1,
              uuid: 'b73cb22f-708a-4285-ac17-049275b53325',
              name: 'Location Tracker',
              description: 'Advanced location tracking device for precise mapping.',
              image_base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAADiCAYAAACGAs+aAAAACXBIWXMAAALHAAACxwH2KLxmAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAIABJREFUeJztnXl8VNXV/7/nVvU2C8Oww7CJoCCIIsg6IBp3gZjXmLxZNHnfLPrLL8kv2/NklVdNYjTRGI2JuEWjrwYlBmSAAREZmBkQZREEQVllm2FYZ+m9qs7vj5HJLF1dt7uru3pm+vM8eWL3rbr3MPXtW3c59xwgR44cOXLkyJEjR44cOXLkyJEjR7eAnDYgnfC9EMe3zSohwxgGUH+w0RdEvQkobL6A8j8xUMCgQPNno5HAp2DQCShcG9aUfbOmr/+E7oXh5L8jnXQZARz93OTequaexgYPANF4AOMBDAfgjnffAT1+vcSIAnyMSHwI8E5FEVsNEa4YunTTCbtsd5JOK4CT82YURg26VhBuZMYsABcjiX+PlQBMYAAHVdBGA1Tep1d+2aiXyxuSqslhOpUAjs+dmCfgu5WBOwB8BgxXqnUmKYA2ECMqiDYJ4kVRzVg4480NdanXmhmyXgB8L0Ttlpkzwfw1ALcB6GFn3XUIoB2agd9m8DPTp2z4V7aPH7JWAMfnTswT7PsWM/w3ATD1dqcNAmgBDOy4IvhXBt3hTze8ucOfvpbTJ2sEUNvtuwuGgBtsG0b4JRhj091eKgFowVnBeF74PA9MVZqjR1RkkoAn9xSWuwW9ENi/h4DPTPVboYEAAAgUD0xP5dNQnBcAAxQ7ZzSOwD8AUC/TLefSQGch5jqFcH3T15R9Sg1zygcw1EBHJs342Iy6AkCrs1ku+T1gjw+kM+H/GENHA4BkUjz/2fSDmAzB+DuicurtmS04bY2ZJ7a66/PZ1fwXgj+f3ZM5dogevaCOnQ41JKhUEqGQB08DGrJEFBBIURBYZtrP/roozafORQE+5ug1Z2AcfIE9Lpa6CdPQKs5Cm5My1RfU0g83VPt+bPRS5c2pqOBeG',
              price: 400,
              category: 'tracker',
              is_available: true,
              created_at: '',
              updated_at: '',
            },
            user_id: 2,
            acquired_at: '',
            is_equipped: false,
            created_at: '',
            updated_at: '',
          },
          {
            id: 2,
            uuid: '304d6af9-40c3-4706-b16e-77fcce06e838',
            quantity: 1,
            shop_item: {
              id: 2,
              uuid: 'c73cb22f-708a-4285-ac17-049275b53326',
              name: 'Memory Enhancer',
              description: 'Enhance your memories with this special marker.',
              image_base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAADiCAYAAACGAs+aAAAACXBIWXMAAALHAAACxwH2KLxmAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAIABJREFUeJztnXl8VNXV/7/nVvU2C8Oww7CJoCCIIsg6IBp3gZjXmLxZNHnfLPrLL8kv2/NklVdNYjTRGI2JuEWjrwYlBmSAAREZmBkQZREEQVllm2FYZ+m9qs7vj5HJLF1dt7uru3pm+vM8eWL3rbr3MPXtW3c59xwgR44cOXLkyJEjR44cOXLkyJEjR7eAnDYgnfC9EMe3zSohwxgGUH+w0RdEvQkobL6A8j8xUMCgQPNno5HAp2DQCShcG9aUfbOmr/+E7oXh5L8jnXQZARz93OTequaexgYPANF4AOMBDAfgjnffAT1+vcSIAnyMSHwI8E5FEVsNEa4YunTTCbtsd5JOK4CT82YURg26VhBuZMYsABcjiX+PlQBMYAAHVdBGA1Tep1d+2aiXyxuSqslhOpUAjs+dmCfgu5WBOwB8BgxXqnUmKYA2ECMqiDYJ4kVRzVg4480NdanXmhmyXgB8L0Ttlpkzwfw1ALcB6GFn3XUIoB2agd9m8DPTp2z4V7aPH7JWAMfnTswT7PsWM/w3ATD1dqcNAmgBDOy4IvhXBt3hTze8ucOfvpbTJ2sEUNvtuwuGgBtsG0b4JRhj091eKgFowVnBeF74PA9MVZqjR1RkkoAn9xSWuwW9ENi/h4DPTPVboYEAAAgUD0xP5dNQnBcAAxQ7ZzSOwD8AUC/TLefSQGch5jqFcH3T15R9Sg1zygcw1EBHJs342Iy6AkCrs1ku+T1gjw+kM+H/GENHA4BkUjz/2fSDmAzB+DuicurtmS04bY2ZJ7a66/PZ1fwXgj+f3ZM5dogevaCOnQ41JKhUEqGQB08DGrJEFBBIURBYZtrP/roozafORQE+5ug1Z2AcfIE9Lpa6CdPQKs5Cm5My1RfU0g83VPt+bPRS5c2pqOBeG',
              price: 300,
              category: 'enhancer',
              is_available: true,
              created_at: '',
              updated_at: '',
            },
            user_id: 2,
            acquired_at: '',
            is_equipped: false,
            created_at: '',
            updated_at: '',
          },
          {
            id: 3,
            uuid: '404d6af9-40c3-4706-b16e-77fcce06e839',
            quantity: 1,
            shop_item: {
              id: 3,
              uuid: 'd73cb22f-708a-4285-ac17-049275b53327',
              name: 'Explorer Theme',
              description: 'Perfect for adventurous memories.',
              image_base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAADiCAYAAACGAs+aAAAACXBIWXMAAALHAAACxwH2KLxmAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAIABJREFUeJztnXl8VNXV/7/nVvU2C8Oww7CJoCCIIsg6IBp3gZjXmLxZNHnfLPrLL8kv2/NklVdNYjTRGI2JuEWjrwYlBmSAAREZmBkQZREEQVllm2FYZ+m9qs7vj5HJLF1dt7uru3pm+vM8eWL3rbr3MPXtW3c59xwgR44cOXLkyJEjR44cOXLkyJEjR7eAnDYgnfC9EMe3zSohwxgGUH+w0RdEvQkobL6A8j8xUMCgQPNno5HAp2DQCShcG9aUfbOmr/+E7oXh5L8jnXQZARz93OTequaexgYPANF4AOMBDAfgjnffAT1+vcSIAnyMSHwI8E5FEVsNEa4YunTTCbtsd5JOK4CT82YURg26VhBuZMYsABcjiX+PlQBMYAAHVdBGA1Tep1d+2aiXyxuSqslhOpUAjs+dmCfgu5WBOwB8BgxXqnUmKYA2ECMqiDYJ4kVRzVg4480NdanXmhmyXgB8L0Ttlpkzwfw1ALcB6GFn3XUIoB2agd9m8DPTp2z4V7aPH7JWAMfnTswT7PsWM/w3ATD1dqcNAmgBDOy4IvhXBt3hTze8ucOfvpbTJ2sEUNvtuwuGgBtsG0b4JRhj091eKgFowVnBeF74PA9MVZqjR1RkkoAn9xSWuwW9ENi/h4DPTPVboYEAAAgUD0xP5dNQnBcAAxQ7ZzSOwD8AUC/TLefSQGch5jqFcH3T15R9Sg1zygcw1EBHJs342Iy6AkCrs1ku+T1gjw+kM+H/GENHA4BkUjz/2fSDmAzB+DuicurtmS04bY2ZJ7a66/PZ1fwXgj+f3ZM5dogevaCOnQ41JKhUEqGQB08DGrJEFBBIURBYZtrP/roozafORQE+5ug1Z2AcfIE9Lpa6CdPQKs5Cm5My1RfU0g83VPt+bPRS5c2pqOBeG',
              price: 250,
              category: 'theme',
              is_available: true,
              created_at: '',
              updated_at: '',
            },
            user_id: 2,
            acquired_at: '',
            is_equipped: false,
            created_at: '',
            updated_at: '',
          },
          {
            id: 4,
            uuid: '504d6af9-40c3-4706-b16e-77fcce06e840',
            quantity: 1,
            shop_item: {
              id: 4,
              uuid: 'e73cb22f-708a-4285-ac17-049275b53328',
              name: 'Magical Marker',
              description: 'Add magic to your memories.',
              image_base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAADiCAYAAACGAs+aAAAACXBIWXMAAALHAAACxwH2KLxmAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAIABJREFUeJztnXl8VNXV/7/nVvU2C8Oww7CJoCCIIsg6IBp3gZjXmLxZNHnfLPrLL8kv2/NklVdNYjTRGI2JuEWjrwYlBmSAAREZmBkQZREEQVllm2FYZ+m9qs7vj5HJLF1dt7uru3pm+vM8eWL3rbr3MPXtW3c59xwgR44cOXLkyJEjR44cOXLkyJEjR7eAnDYgnfC9EMe3zSohwxgGUH+w0RdEvQkobL6A8j8xUMCgQPNno5HAp2DQCShcG9aUfbOmr/+E7oXh5L8jnXQZARz93OTequaexgYPANF4AOMBDAfgjnffAT1+vcSIAnyMSHwI8E5FEVsNEa4YunTTCbtsd5JOK4CT82YURg26VhBuZMYsABcjiX+PlQBMYAAHVdBGA1Tep1d+2aiXyxuSqslhOpUAjs+dmCfgu5WBOwB8BgxXqnUmKYA2ECMqiDYJ4kVRzVg4480NdanXmhmyXgB8L0Ttlpkzwfw1ALcB6GFn3XUIoB2agd9m8DPTp2z4V7aPH7JWAMfnTswT7PsWM/w3ATD1dqcNAmgBDOy4IvhXBt3hTze8ucOfvpbTJ2sEUNvtuwuGgBtsG0b4JRhj091eKgFowVnBeF74PA9MVZqjR1RkkoAn9xSWuwW9ENi/h4DPTPVboYEAAAgUD0xP5dNQnBcAAxQ7ZzSOwD8AUC/TLefSQGch5jqFcH3T15R9Sg1zygcw1EBHJs342Iy6AkCrs1ku+T1gjw+kM+H/GENHA4BkUjz/2fSDmAzB+DuicurtmS04bY2ZJ7a66/PZ1fwXgj+f3ZM5dogevaCOnQ41JKhUEqGQB08DGrJEFBBIURBYZtrP/roozafORQE+5ug1Z2AcfIE9Lpa6CdPQKs5Cm5My1RfU0g83VPt+bPRS5c2pqOBeG',
              price: 500,
              category: 'magical',
              is_available: true,
              created_at: '',
              updated_at: '',
            },
            user_id: 2,
            acquired_at: '',
            is_equipped: false,
            created_at: '',
            updated_at: '',
          },
        ];
        
        // Save sample data to localStorage
        localStorage.setItem('user_items', JSON.stringify(sampleItems));
        return sampleItems;
      }
      
      return items;
    } catch (error) {
      // Silent error handling
      return [];
    }
  };

  // Helper to save user items to localStorage
  const saveUserItems = (items: UserShopItem[]): void => {
    try {
      localStorage.setItem('user_items', JSON.stringify(items));
      setUserItems(items);
    } catch (error) {
      // Silent error handling
    }
  };

  // Helper function to fetch and save user items
  const fetchAndSaveUserItems = async (): Promise<void> => {
    try {
      const response = await apiClient.getProfile();
      if (response) {
        if (response.owned_items) {
          saveUserItems(response.owned_items);
          setUserItems(response.owned_items);
        } else if (response.user_items) {
          saveUserItems(response.user_items);
          setUserItems(response.user_items);
        }
      }
    } catch (error) {
      // Silent error handling
    }
  };

  // Load user items from localStorage on mount
  useEffect(() => {
    const items = getUserItems();
    setUserItems(items);
  }, []);

  const isAuthenticated = !!user && apiClient.isAuthenticated();

  return {
    user,
    isLoading,
    isAuthenticated,
    userItems,
    locations,
    memories,
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