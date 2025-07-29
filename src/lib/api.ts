import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import {
  ApiResponse,
  PaginationResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  User,
  Location,
  CreateLocationRequest,
  UpdateLocationRequest,
  NearbyLocationRequest,
  LocationSearchParams,
  Memory,
  CreateMemoryRequest,
  UpdateMemoryRequest,
  MemorySearchParams,
  Media,
  MediaSearchParams,
  HealthCheckResponse,
} from '@/types/api';

class ApiClient {
  private client: AxiosInstance;
  private baseURL = 'http://localhost:8222/api/v1';

  constructor() {
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          window.location.href = '/auth/login';
        } else if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else if (error.message) {
          toast.error(error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management
  private getToken(): string | null {
    return Cookies.get('access_token') || null;
  }

  private setToken(token: string): void {
    Cookies.set('access_token', token, { 
      expires: 1, // 1 day
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }

  private clearToken(): void {
    Cookies.remove('access_token');
  }

  // Helper method for making requests
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.request<T>(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Authentication APIs
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<ApiResponse<AuthResponse>>({
      method: 'POST',
      url: '/auth/register',
      data,
    });
    
    if (response.success && response.data?.access_token) {
      this.setToken(response.data.access_token);
    }
    
    return response;
  }

  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<ApiResponse<AuthResponse>>({
      method: 'POST',
      url: '/auth/login',
      data,
    });
    
    if (response.success && response.data?.access_token) {
      this.setToken(response.data.access_token);
    }
    
    return response;
  }

  async logout(): Promise<ApiResponse> {
    try {
      const response = await this.request<ApiResponse>({
        method: 'POST',
        url: '/auth/logout',
      });
      this.clearToken();
      return response;
    } catch (error) {
      this.clearToken();
      throw error;
    }
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>({
      method: 'GET',
      url: '/auth/profile',
    });
  }

  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>({
      method: 'PUT',
      url: '/auth/profile',
      data,
    });
  }

  // Location APIs
  async getLocations(params?: LocationSearchParams): Promise<PaginationResponse<Location>> {
    return this.request<PaginationResponse<Location>>({
      method: 'GET',
      url: '/locations',
      params,
    });
  }

  async getLocationByUuid(uuid: string): Promise<ApiResponse<Location>> {
    return this.request<ApiResponse<Location>>({
      method: 'GET',
      url: `/locations/${uuid}`,
    });
  }

  async searchNearbyLocations(params: NearbyLocationRequest): Promise<ApiResponse<Location[]>> {
    return this.request<ApiResponse<Location[]>>({
      method: 'GET',
      url: '/locations/nearby',
      params,
    });
  }

  async createLocation(data: CreateLocationRequest): Promise<ApiResponse<Location>> {
    return this.request<ApiResponse<Location>>({
      method: 'POST',
      url: '/locations',
      data,
    });
  }

  async updateLocation(uuid: string, data: UpdateLocationRequest): Promise<ApiResponse<Location>> {
    return this.request<ApiResponse<Location>>({
      method: 'PUT',
      url: `/locations/${uuid}`,
      data,
    });
  }

  async getLocationMemories(uuid: string, params?: { page?: number; limit?: number; is_public?: boolean }): Promise<PaginationResponse<Memory>> {
    return this.request<PaginationResponse<Memory>>({
      method: 'GET',
      url: `/locations/${uuid}/memories`,
      params,
    });
  }

  // Memory APIs
  async getMemories(params?: MemorySearchParams): Promise<PaginationResponse<Memory>> {
    return this.request<PaginationResponse<Memory>>({
      method: 'GET',
      url: '/memories',
      params,
    });
  }

  async getMemoryByUuid(uuid: string): Promise<ApiResponse<Memory>> {
    return this.request<ApiResponse<Memory>>({
      method: 'GET',
      url: `/memories/${uuid}`,
    });
  }

  async createMemory(data: CreateMemoryRequest): Promise<ApiResponse<Memory>> {
    return this.request<ApiResponse<Memory>>({
      method: 'POST',
      url: '/memories',
      data,
    });
  }

  async updateMemory(uuid: string, data: UpdateMemoryRequest): Promise<ApiResponse<Memory>> {
    return this.request<ApiResponse<Memory>>({
      method: 'PUT',
      url: `/memories/${uuid}`,
      data,
    });
  }

  async deleteMemory(uuid: string): Promise<ApiResponse> {
    return this.request<ApiResponse>({
      method: 'DELETE',
      url: `/memories/${uuid}`,
    });
  }

  async getMemoryMedia(uuid: string): Promise<ApiResponse<Media[]>> {
    return this.request<ApiResponse<Media[]>>({
      method: 'GET',
      url: `/memories/${uuid}/media`,
    });
  }

  // Media APIs
  async getMedia(params?: MediaSearchParams): Promise<PaginationResponse<Media>> {
    return this.request<PaginationResponse<Media>>({
      method: 'GET',
      url: '/media',
      params,
    });
  }

  async getMediaByUuid(uuid: string): Promise<ApiResponse<Media>> {
    return this.request<ApiResponse<Media>>({
      method: 'GET',
      url: `/media/${uuid}`,
    });
  }

  async uploadMedia(memoryId: number, file: File, displayOrder?: number): Promise<ApiResponse<Media>> {
    const formData = new FormData();
    formData.append('memory_id', memoryId.toString());
    formData.append('file', file);
    if (displayOrder !== undefined) {
      formData.append('display_order', displayOrder.toString());
    }

    return this.request<ApiResponse<Media>>({
      method: 'POST',
      url: '/media/upload',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async updateMedia(uuid: string, data: { display_order?: number }): Promise<ApiResponse<Media>> {
    return this.request<ApiResponse<Media>>({
      method: 'PUT',
      url: `/media/${uuid}`,
      data,
    });
  }

  async deleteMedia(uuid: string): Promise<ApiResponse> {
    return this.request<ApiResponse>({
      method: 'DELETE',
      url: `/media/${uuid}`,
    });
  }

  // Utility method to get media file URL
  getMediaFileUrl(uuid: string): string {
    return `${this.baseURL}/media/${uuid}/file`;
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<HealthCheckResponse>> {
    return this.request<ApiResponse<HealthCheckResponse>>({
      method: 'GET',
      url: '/health',
    });
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Get current user if available
  getCurrentUser(): User | null {
    try {
      const userStr = Cookies.get('current_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  // Set current user
  setCurrentUser(user: User): void {
    Cookies.set('current_user', JSON.stringify(user), {
      expires: 1,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }

  // Clear current user
  clearCurrentUser(): void {
    Cookies.remove('current_user');
  }
}

// Create and export singleton instance
const apiClient = new ApiClient();
export default apiClient;