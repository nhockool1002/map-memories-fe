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
  avatar_url?: string;
  user_items?: UserShopItem[];
  owned_items?: UserShopItem[]; // Add owned_items to match API response
  locations?: Location[];
  memories?: Memory[];
  created_at: string;
  updated_at: string;
}

export interface UserItem {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  item_type: 'memory' | 'location' | 'media';
  item_id: number;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  currency: number;
  owned_items: UserShopItem[];
}

export interface LoginRequest {
  username: string;
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
  marker_item_id?: number; // Add marker_item_id to Location
  image_base64?: string; // Add image_base64 to Location
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
  marker_item_id?: number; // Add marker_item_id support
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
  marker_item_id?: number;
  image_base64?: string; // Add image_base64 to Memory
  user: User;
  location: Location;
  media?: Media[];
  created_at: string;
  updated_at: string;
}

export interface CreateMemoryRequest {
  title: string;
  content: string;
  location_id?: number;
  visit_date?: string;
  is_public?: boolean;
  tags?: string[];
  marker_item_id?: number;
  // For auto-created locations from map clicks
  latitude?: number;
  longitude?: number;
  country?: string;
  city?: string;
}

export interface UpdateMemoryRequest {
  title?: string;
  content?: string;
  visit_date?: string;
  is_public?: boolean;
  tags?: string[];
  marker_item_id?: number;
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

// Shop Item Types
export interface ShopItem {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  image_base64: string;
  price?: number;
  category?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserShopItem {
  id: number;
  uuid: string;
  quantity: number;
  shop_item: ShopItem;
  user_id?: number;
  acquired_at?: string;
  is_equipped?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Memory-Location API Types (New)
export interface MemoryImage {
  id?: number;
  image_base64: string;
  caption?: string;
  order?: number;
  created_at?: string;
}

export interface CreateMemoryLocationRequest {
  // Location fields
  location_name: string;
  location_description?: string;
  latitude: string;
  longitude: string;
  address?: string;
  city?: string;
  country?: string;
  marker_item?: number;
  
  // Memory fields
  title: string;
  content: string;
  visit_date?: string;
  is_public?: boolean;
  tags?: string[];
  
  // Images
  images?: MemoryImage[];
}

export interface UpdateMemoryLocationRequest {
  // Location fields (all optional)
  location_name?: string;
  location_description?: string;
  latitude?: string;
  longitude?: string;
  address?: string;
  city?: string;
  country?: string;
  marker_item?: number;
  
  // Memory fields (all optional)
  title?: string;
  content?: string;
  visit_date?: string;
  is_public?: boolean;
  tags?: string[];
  
  // Images
  images?: MemoryImage[];
}

export interface MemoryLocationResponse {
  id: number;
  user: number;
  location: {
    id: number;
    name: string;
    description: string;
    latitude: string;
    longitude: string;
    address: string;
    city: string;
    country: string;
    marker_item?: number;
    image_base64?: string;
    created_at: string;
    updated_at: string;
  };
  title: string;
  content: string;
  visit_date: string;
  is_public: boolean;
  tags: string[];
  like_count: number;
  is_liked_by_user: boolean;
  image_base64?: string;
  images: MemoryImage[];
  image_count: number;
  created_at: string;
  updated_at: string;
}