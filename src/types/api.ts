// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginationResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// User Types
export interface User {
  id: number;
  uuid: string;
  username: string;
  email: string;
  full_name: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  avatar_url?: string;
}

// Location Types
export interface Location {
  id: number;
  uuid: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  country: string;
  city: string;
  memory_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateLocationRequest {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  country?: string;
  city?: string;
}

export interface UpdateLocationRequest {
  name?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  country?: string;
  city?: string;
}

export interface NearbyLocationRequest {
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
}

// Memory Types
export interface Memory {
  id: number;
  uuid: string;
  title: string;
  content: string;
  visit_date: string;
  is_public: boolean;
  tags: string[];
  like_count: number;
  is_liked: boolean;
  media_count: number;
  user: User;
  location: Location;
  media?: Media[];
  created_at: string;
  updated_at: string;
}

export interface CreateMemoryRequest {
  title: string;
  content: string;
  location_id: number;
  visit_date?: string;
  is_public?: boolean;
  tags?: string[];
}

export interface UpdateMemoryRequest {
  title?: string;
  content?: string;
  visit_date?: string;
  is_public?: boolean;
  tags?: string[];
}

// Media Types
export interface Media {
  id: number;
  uuid: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  media_type: 'image' | 'video';
  display_order: number;
  url: string;
  thumbnail_url?: string;
  created_at: string;
}

export interface UploadMediaRequest {
  memory_id: number;
  file: File;
  display_order?: number;
}

export interface UpdateMediaRequest {
  display_order?: number;
}

// Search and Filter Types
export interface LocationSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  city?: string;
}

export interface MemorySearchParams {
  page?: number;
  limit?: number;
  user_id?: number;
  location_id?: number;
  is_public?: boolean;
  search?: string;
  tags?: string;
  sort_by?: 'created_at' | 'visit_date' | 'title';
  sort_order?: 'asc' | 'desc';
}

export interface MediaSearchParams {
  page?: number;
  limit?: number;
  memory_id?: number;
  media_type?: 'image' | 'video';
}

// Health Check Types
export interface HealthCheckResponse {
  status: string;
  database: string;
}